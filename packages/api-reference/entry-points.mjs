import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";

// The published surface, in the order the reference presents it: shared value
// helpers first, then the server, then the browser packages.
export const SAPPORTA_PACKAGES = [
  "@sapporta/shared",
  "@sapporta/server",
  "@sapporta/honest",
  "@sapporta/grid",
  "@sapporta/frontend",
  "@sapporta/ui",
];

/**
 * Turn one package manifest into the entry points its `exports` map publishes.
 *
 * Every subpath becomes an entry: those with a `types` condition carry symbols
 * and get a generated page; the rest (today, `./index.css`) are assets and are
 * listed without one. `./package.json` is deliberately skipped — it exists so
 * consumers can resolve the package, not as part of the API.
 */
export function entryPointsFromManifest(manifest, packageDir) {
  if (!manifest?.name) throw new Error("Package manifest has no name");
  if (!manifest.exports) {
    throw new Error(`${manifest.name} publishes no exports map`);
  }

  const entries = [];
  for (const [subpath, condition] of Object.entries(manifest.exports)) {
    if (subpath === "./package.json") continue;

    const specifier =
      subpath === "." ? manifest.name : `${manifest.name}${subpath.slice(1)}`;
    const types =
      typeof condition === "object" && condition !== null
        ? condition.types
        : undefined;

    entries.push({
      package: manifest.name,
      version: manifest.version,
      subpath,
      specifier,
      isRoot: subpath === ".",
      kind: types ? "symbols" : "asset",
      typesFile: types ? path.join(packageDir, types) : undefined,
      assetFile:
        !types && typeof condition === "object" && condition !== null
          ? condition.default
          : undefined,
    });
  }

  if (entries.length === 0) {
    throw new Error(`${manifest.name} publishes no documentable subpaths`);
  }
  return entries;
}

/**
 * Slug for a specifier's generated page, relative to the reference root.
 *
 * `@sapporta/server` -> `server/index`, `@sapporta/server/table` -> `server/table`.
 * Split pages append a `-<group>` suffix to this stem.
 */
export function pageSlugFor(specifier) {
  const withoutScope = specifier.replace(/^@sapporta\//, "");
  const [packageSlug, ...rest] = withoutScope.split("/");
  return rest.length === 0
    ? `${packageSlug}/index`
    : `${packageSlug}/${rest.join("/")}`;
}

/** Resolve every Sapporta package installed beside this generator. */
export function resolveInstalledPackages(
  packageNames = SAPPORTA_PACKAGES,
  fromUrl = import.meta.url,
) {
  const require = createRequire(fromUrl);
  return packageNames.map((name) => {
    let manifestPath;
    try {
      manifestPath = require.resolve(`${name}/package.json`);
    } catch (error) {
      throw new Error(
        `${name} is not installed beside the API reference generator. ` +
          `Add it to packages/api-reference/package.json.`,
        { cause: error },
      );
    }
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const packageDir = path.dirname(manifestPath);
    return {
      name,
      version: manifest.version,
      packageDir,
      entryPoints: entryPointsFromManifest(manifest, packageDir),
    };
  });
}
