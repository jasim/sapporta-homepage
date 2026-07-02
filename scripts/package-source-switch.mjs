#!/usr/bin/env node
import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const CONFIG_FILE = ".package-source-switch.json";
const DEPENDENCY_KEYS = new Set([
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
  "overrides",
  "resolutions",
]);
const IGNORED_DIRS = new Set([
  ".git",
  ".astro",
  ".vite",
  "data",
  "dist",
  "node_modules",
]);
const TEXT_EXTENSIONS = new Set([
  ".css",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
]);

const rootDir = process.cwd();
const command = process.argv[2] ?? "help";

switch (command) {
  case "status":
    await showStatus();
    break;
  case "update-npm":
    await updateNpmVersions();
    break;
  case "use:npm":
    await switchSources("npm");
    break;
  case "use:local":
    await switchSources("local");
    break;
  case "help":
  case "--help":
  case "-h":
    printHelp();
    break;
  default:
    throw new Error(`Unknown command "${command}". Run with --help.`);
}

async function showStatus() {
  const manifests = await readManifestFiles();
  const config = await readConfigIfPresent();
  const linkLocations = findLinkLocations(manifests);
  const configuredLocations = config?.locations ?? [];
  const packageNames = new Set([
    ...linkLocations.map((location) => location.packageName),
    ...Object.keys(config?.packages ?? {}),
  ]);

  console.log(`Config: ${CONFIG_FILE} ${config ? "present" : "missing"}`);
  console.log(`Package manifests: ${manifests.length}`);
  console.log(`Current link:// entries: ${linkLocations.length}`);

  if (configuredLocations.length > 0) {
    const counts = { local: 0, npm: 0, other: 0, missing: 0 };
    for (const location of configuredLocations) {
      const manifest = manifests.find((item) => item.file === location.file);
      if (!manifest) {
        counts.missing += 1;
        continue;
      }
      const current = getPath(manifest.json, location.path);
      const source = getConfiguredPackage(config, location.packageName);
      if (current === source.local) counts.local += 1;
      else if (current === source.npm) counts.npm += 1;
      else if (current === undefined) counts.missing += 1;
      else counts.other += 1;
    }
    console.log(
      `Configured entries: ${configuredLocations.length} ` +
        `(local ${counts.local}, npm ${counts.npm}, other ${counts.other}, missing ${counts.missing})`,
    );
  }

  if (packageNames.size > 0) {
    const references = await findNonManifestReferences([...packageNames]);
    console.log(`Non-manifest package references: ${references.length}`);
    for (const reference of references.slice(0, 40)) {
      console.log(`  ${reference.file}:${reference.line}: ${reference.match}`);
    }
    if (references.length > 40) {
      console.log(`  ... ${references.length - 40} more`);
    }
  }
}

async function updateNpmVersions() {
  const manifests = await readManifestFiles();
  const existingConfig = (await readConfigIfPresent()) ?? emptyConfig();
  const linkLocations = findLinkLocations(manifests);

  if (linkLocations.length > 0) {
    existingConfig.locations = linkLocations.map(
      ({ value: _value, ...rest }) => rest,
    );
    for (const location of linkLocations) {
      existingConfig.packages[location.packageName] = {
        local: location.value,
        npm: existingConfig.packages[location.packageName]?.npm ?? "",
      };
    }
  } else if (existingConfig.locations.length === 0) {
    throw new Error(
      `No link:// entries found and ${CONFIG_FILE} has no stored locations.`,
    );
  }

  const packageNames = Object.keys(existingConfig.packages).sort();
  if (packageNames.length === 0) {
    throw new Error("No packages to update.");
  }

  for (const packageName of packageNames) {
    const latest = await fetchLatestVersion(packageName);
    existingConfig.packages[packageName].npm = latest;
    console.log(`${packageName}: ${latest}`);
  }

  existingConfig.updatedAt = new Date().toISOString();
  await writeConfig(existingConfig);
  console.log(`Wrote ${CONFIG_FILE}`);
}

async function switchSources(target) {
  const config = await readRequiredConfig();
  const manifests = await readManifestFiles();
  const changedFiles = new Set();

  for (const location of config.locations) {
    const manifest = manifests.find((item) => item.file === location.file);
    if (!manifest) {
      throw new Error(`Stored manifest no longer exists: ${location.file}`);
    }
    const source = getConfiguredPackage(config, location.packageName);
    const value = source[target];
    if (!value) {
      throw new Error(
        `Missing ${target} source for ${location.packageName}. Run update-npm first.`,
      );
    }
    setPath(manifest.json, location.path, value);
    changedFiles.add(location.file);
  }

  for (const manifest of manifests) {
    if (!changedFiles.has(manifest.file)) continue;
    await writeJsonFile(path.join(rootDir, manifest.file), manifest.json);
  }

  config.mode = target;
  config.updatedAt = new Date().toISOString();
  await writeConfig(config);
  console.log(
    `Switched ${changedFiles.size} package.json file(s) to ${target}.`,
  );
}

async function readManifestFiles() {
  const files = [];
  await walk(rootDir, async (file) => {
    if (path.basename(file) !== "package.json") return;
    const relativeFile = path.relative(rootDir, file);
    const json = JSON.parse(await readFile(file, "utf8"));
    files.push({ file: normalizePath(relativeFile), json });
  });
  return files.sort((a, b) => a.file.localeCompare(b.file));
}

async function walk(dir, onFile) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      await walk(absolute, onFile);
      continue;
    }
    if (entry.isFile()) await onFile(absolute);
  }
}

function findLinkLocations(manifests) {
  const locations = [];
  for (const manifest of manifests) {
    collectLinkLocations(manifest.json, [], manifest.file, locations);
  }
  return locations.sort((a, b) =>
    `${a.file}:${a.path.join(".")}`.localeCompare(
      `${b.file}:${b.path.join(".")}`,
    ),
  );
}

function collectLinkLocations(value, segments, file, locations) {
  if (typeof value === "string") {
    if (value.startsWith("link://")) {
      locations.push({
        file,
        path: segments,
        packageName: inferPackageName(segments),
        value,
      });
    }
    return;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return;

  for (const [key, child] of Object.entries(value)) {
    const parentKey = segments.at(-1);
    const isDependencyMap = DEPENDENCY_KEYS.has(parentKey);
    const isPnpmOverride =
      parentKey === "overrides" && segments.at(-2) === "pnpm";
    if (
      typeof child === "string" &&
      child.startsWith("link://") &&
      (isDependencyMap || isPnpmOverride)
    ) {
      locations.push({
        file,
        path: [...segments, key],
        packageName: inferPackageName([...segments, key]),
        value: child,
      });
      continue;
    }
    collectLinkLocations(child, [...segments, key], file, locations);
  }
}

function inferPackageName(segments) {
  const key = segments.at(-1);
  if (!key)
    throw new Error(
      `Cannot infer package name from path ${segments.join(".")}`,
    );
  if (key.startsWith("@")) {
    const [, scope, name] = key.match(/^@([^/]+)\/([^@>]+).*$/) ?? [];
    if (scope && name) return `@${scope}/${name}`;
  }
  return key
    .replace(/@[^@]*$/, "")
    .split(">")
    .at(-1);
}

async function findNonManifestReferences(packageNames) {
  const references = [];
  const packagePattern = new RegExp(
    packageNames.map((name) => escapeRegExp(name)).join("|"),
  );

  await walk(rootDir, async (file) => {
    const relativeFile = normalizePath(path.relative(rootDir, file));
    if (relativeFile === CONFIG_FILE) return;
    if (path.basename(file) === "package.json") return;
    if (relativeFile === "pnpm-lock.yaml") return;
    if (!TEXT_EXTENSIONS.has(path.extname(file))) return;

    const lines = (await readFile(file, "utf8")).split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      const match = line.match(packagePattern);
      if (!match) continue;
      references.push({
        file: relativeFile,
        line: index + 1,
        match: match[0],
      });
    }
  });

  return references;
}

async function fetchLatestVersion(packageName) {
  const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
  const response = await fetch(url, {
    headers: { accept: "application/vnd.npm.install-v1+json" },
  });
  if (!response.ok) {
    throw new Error(
      `Could not fetch ${packageName} from npm registry: ${response.status} ${response.statusText}`,
    );
  }
  const body = await response.json();
  const latest = body?.["dist-tags"]?.latest;
  if (!latest)
    throw new Error(
      `npm registry response for ${packageName} had no latest tag.`,
    );
  return latest;
}

async function readConfigIfPresent() {
  const file = path.join(rootDir, CONFIG_FILE);
  if (!existsSync(file)) return undefined;
  return JSON.parse(await readFile(file, "utf8"));
}

async function readRequiredConfig() {
  const config = await readConfigIfPresent();
  if (!config) {
    throw new Error(
      `Missing ${CONFIG_FILE}. Run "pnpm package-sources:update-npm" first.`,
    );
  }
  return config;
}

function emptyConfig() {
  return {
    version: 1,
    mode: "local",
    packages: {},
    locations: [],
    updatedAt: null,
  };
}

function getConfiguredPackage(config, packageName) {
  const source = config.packages?.[packageName];
  if (!source) throw new Error(`Missing stored source for ${packageName}.`);
  return source;
}

async function writeConfig(config) {
  await writeJsonFile(path.join(rootDir, CONFIG_FILE), config);
}

async function writeJsonFile(file, value) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

function getPath(object, segments) {
  let current = object;
  for (const segment of segments) {
    if (!current || typeof current !== "object") return undefined;
    current = current[segment];
  }
  return current;
}

function setPath(object, segments, value) {
  const last = segments.at(-1);
  if (!last) throw new Error("Cannot set an empty path.");
  const parent = segments.slice(0, -1).reduce((current, segment) => {
    if (!current?.[segment] || typeof current[segment] !== "object") {
      throw new Error(`Missing path segment ${segments.join(".")}`);
    }
    return current[segment];
  }, object);
  parent[last] = value;
}

function normalizePath(file) {
  return file.split(path.sep).join("/");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function printHelp() {
  console.log(`Usage: pnpm package-sources <command>

Commands:
  status      Show stored sources, current package.json state, and code references.
  update-npm  Capture current link:// sources and refresh stored npm latest versions.
  use:npm     Rewrite stored package.json locations to stored npm versions.
  use:local   Rewrite stored package.json locations to stored link:// versions.

State file:
  ${CONFIG_FILE} is gitignored and stores both local link paths and npm versions.

Notes:
  The direct node command is the recovery path when pnpm refuses to run scripts
  before install:
    node scripts/package-source-switch.mjs use:local

  pnpm shortcuts can also be forced with:
    pnpm_config_verify_deps_before_run=false pnpm package-sources:status

  After switching sources, run pnpm install to refresh pnpm-lock.yaml and node_modules.`);
}
