import assert from "node:assert/strict";
import test from "node:test";

import { entryPointsFromManifest, pageSlugFor } from "./entry-points.mjs";

const manifest = {
  name: "@sapporta/frontend",
  version: "0.5.0",
  exports: {
    ".": { types: "./dist/index.d.ts", default: "./dist/index.js" },
    "./layout": { types: "./dist/layout.d.ts", default: "./dist/layout.js" },
    "./index.css": {
      "sapporta:source": "./src/index.css",
      default: "./dist/index.css",
    },
    "./package.json": "./package.json",
  },
};

test("the exports map is the documented surface", () => {
  const entries = entryPointsFromManifest(manifest, "/pkg");

  assert.deepEqual(
    entries.map((entry) => [
      entry.specifier,
      entry.kind,
      entry.isRoot,
      entry.typesFile,
    ]),
    [
      // The root is flagged so its re-exports can be folded onto the subpaths.
      ["@sapporta/frontend", "symbols", true, "/pkg/dist/index.d.ts"],
      ["@sapporta/frontend/layout", "symbols", false, "/pkg/dist/layout.d.ts"],
      // No `types` condition: a stylesheet is listed, not documented.
      ["@sapporta/frontend/index.css", "asset", false, undefined],
      // `./package.json` is published so consumers can resolve the package,
      // not as part of the API, so it earns no entry at all.
    ],
  );
});

test("a package without an exports map is refused", () => {
  assert.throws(
    () => entryPointsFromManifest({ name: "@sapporta/x", version: "1" }, "/pkg"),
    /publishes no exports map/,
  );
});

test("page slugs keep root barrels and subpaths apart", () => {
  // Without the `index` stem the root barrel and a `./server` subpath of some
  // other package would collide on one page.
  assert.equal(pageSlugFor("@sapporta/server"), "server/index");
  assert.equal(pageSlugFor("@sapporta/server/table"), "server/table");
  assert.equal(
    pageSlugFor("@sapporta/server/cli/commands"),
    "server/cli/commands",
  );
});
