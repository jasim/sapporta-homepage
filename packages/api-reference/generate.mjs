import { createRequire } from "node:module";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { resolveInstalledPackages } from "./entry-points.mjs";
import { extractSurface } from "./extract.mjs";
import { renderAll } from "./render.mjs";

const require = createRequire(import.meta.url);

export const OUTPUT_DIR = fileURLToPath(
  new URL("../docs/src/generated/api-reference/", import.meta.url),
);

const DEFAULT_ORIGIN = "https://sapporta.com";

function originFromEnv(env = process.env) {
  const origin = env.SAPPORTA_DOCS_ORIGIN ?? DEFAULT_ORIGIN;
  return origin.replace(/\/+$/, "");
}

/** Build the full file set without touching disk. */
export function buildFiles({ origin = originFromEnv() } = {}) {
  const ts = require("typescript");
  const packages = resolveInstalledPackages();
  const surface = extractSurface(packages, ts);
  return { files: renderAll(surface, origin), surface, typescript: ts.version };
}

async function readExistingFiles(directory) {
  const existing = new Map();
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true, recursive: true });
  } catch (error) {
    if (error?.code === "ENOENT") return existing;
    throw error;
  }

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const absolute = join(entry.parentPath ?? entry.path, entry.name);
    const slug = relative(directory, absolute).replace(/\.md$/, "");
    existing.set(slug, await readFile(absolute, "utf8"));
  }
  return existing;
}

function diffSummary(files, existing) {
  const generated = new Map(files.map((file) => [file.slug, file.content]));
  const added = [...generated.keys()].filter((slug) => !existing.has(slug));
  const removed = [...existing.keys()].filter((slug) => !generated.has(slug));
  const changed = [...generated.keys()].filter(
    (slug) => existing.has(slug) && existing.get(slug) !== generated.get(slug),
  );
  return { added, removed, changed };
}

async function writeFiles(files, directory) {
  await rm(directory, { recursive: true, force: true });
  for (const file of files) {
    const target = join(directory, `${file.slug}.md`);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, file.content, "utf8");
  }
}

async function main(argv = process.argv.slice(2)) {
  const checkOnly = argv.includes("--check");

  const { files, surface, typescript } = buildFiles();
  const symbolCount = surface.packages.reduce(
    (total, pkg) =>
      total +
      pkg.entryPoints.reduce((sum, entry) => sum + entry.symbols.length, 0),
    0,
  );

  if (checkOnly) {
    const existing = await readExistingFiles(OUTPUT_DIR);
    const { added, removed, changed } = diffSummary(files, existing);
    if (added.length + removed.length + changed.length === 0) {
      console.log(
        `API reference is current: ${files.length} pages, ${symbolCount} symbols.`,
      );
      return;
    }

    console.error("The generated API reference is out of date.");
    for (const [label, slugs] of [
      ["missing", added],
      ["stale", changed],
      ["orphaned", removed],
    ]) {
      if (slugs.length > 0) {
        console.error(`  ${label}: ${slugs.slice(0, 12).join(", ")}`);
        if (slugs.length > 12) console.error(`    …and ${slugs.length - 12} more`);
      }
    }
    console.error(
      "\nRun `pnpm --filter ./packages/api-reference generate` and commit the result.",
    );
    process.exitCode = 1;
    return;
  }

  await writeFiles(files, OUTPUT_DIR);
  console.log(
    `Generated ${files.length} API reference pages ` +
      `(${symbolCount} symbols, TypeScript ${typescript}) into ` +
      `${relative(process.cwd(), OUTPUT_DIR)}`,
  );
  for (const pkg of surface.packages) {
    console.log(`  ${pkg.name}@${pkg.version}`);
  }
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  try {
    await main();
  } catch (error) {
    console.error(`Failed to generate the API reference: ${error.message}`);
    if (error.cause instanceof Error) console.error(`Cause: ${error.cause.message}`);
    process.exitCode = 1;
  }
}

export { main, diffSummary, originFromEnv };
