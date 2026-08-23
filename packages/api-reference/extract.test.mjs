import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

import { packageNameFromFile, resolveDeclarationFirst } from "./extract.mjs";

const require = createRequire(import.meta.url);
const ts = require("typescript");

test("the owning package is read from the last node_modules segment", () => {
  assert.equal(
    packageNameFromFile("/app/node_modules/drizzle-orm/index.d.ts"),
    "drizzle-orm",
  );
  assert.equal(
    packageNameFromFile("/app/node_modules/@sapporta/server/dist/index.d.ts"),
    "@sapporta/server",
  );
  // pnpm nests the real package under a hashed store directory, so only the
  // last node_modules segment names the owner.
  assert.equal(
    packageNameFromFile(
      "/app/node_modules/.pnpm/zod@4.4.3/node_modules/zod/index.d.ts",
    ),
    "zod",
  );
  assert.equal(packageNameFromFile("/repo/packages/core/src/index.ts"), undefined);
});

test("relative imports resolve to a declaration, directory barrels included", () => {
  // The bundled packages emit types to `query/index.d.ts` and code to
  // `query.js`. Default resolution stops at the JavaScript file and contributes
  // no types, so everything behind `export * from './query'` disappears.
  const present = new Set([
    "/pkg/dist/table/query/index.d.ts",
    "/pkg/dist/table/other.d.ts",
    "/pkg/dist/table/both.d.ts",
    "/pkg/dist/table/both/index.d.ts",
  ]);
  const resolve = (specifier) =>
    resolveDeclarationFirst(specifier, "/pkg/dist/table/index.d.ts", ts, {
      fileExists: (file) => present.has(file),
    });

  assert.equal(resolve("./query"), "/pkg/dist/table/query/index.d.ts");
  assert.equal(resolve("./other"), "/pkg/dist/table/other.d.ts");
  // A file and a directory of the same name: the file wins, as it does for a
  // consumer importing the specifier.
  assert.equal(resolve("./both"), "/pkg/dist/table/both.d.ts");
  // Bare specifiers are left to normal resolution, and an unresolvable relative
  // import falls through rather than guessing a path.
  assert.equal(resolve("zod"), undefined);
  assert.equal(resolve("./missing"), undefined);
});
