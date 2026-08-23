import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import docsSidebar from "../packages/docs/sidebar.mjs";
import { INDEX_SLUG, OUTPUT_FILE, buildDocsIndex } from "./generate-docs-index.mjs";

test("the committed documentation index matches the sidebar", async () => {
  const committed = await readFile(OUTPUT_FILE, "utf8");
  assert.equal(
    committed,
    await buildDocsIndex(),
    "the documentation index is stale; run `pnpm generate:docs-index` and commit the result",
  );
});

test("the documentation index links to every sidebar page once", async () => {
  const page = await buildDocsIndex();
  const linked = [...page.matchAll(/^\s*- \[[^\]]+\]\((\/[^)]*)\)$/gm)].map((match) =>
    match[1].replace(/^\/+|\/+$/g, ""),
  );

  assert.deepEqual(
    linked,
    collectSidebarTargets(docsSidebar),
    "the documentation index and the sidebar list different pages",
  );
});

/** Every page the sidebar points at, in sidebar order, as a bare path. */
function collectSidebarTargets(items) {
  return items.flatMap((item) => {
    if (item.items) return collectSidebarTargets(item.items);
    if (item.slug) return item.slug === INDEX_SLUG ? [] : [item.slug];
    return item.link ? [item.link.replace(/^\/+|\/+$/g, "")] : [];
  });
}
