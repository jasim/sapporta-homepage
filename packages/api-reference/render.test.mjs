import assert from "node:assert/strict";
import test from "node:test";

import {
  SPLIT_THRESHOLD,
  bucketSymbols,
  referenceUrl,
  renderEntryPages,
  renderIndex,
  renderSymbolIndex,
  shouldSplit,
} from "./render.mjs";

const ORIGIN = "https://sapporta.test";

const symbol = (name, kind, extra = {}) => ({
  name,
  kind,
  summary: `${name} summary.`,
  signatures: [`${kind} ${name} {}`],
  ...extra,
});

const entry = (specifier, symbols, reexports = [], isRoot = false) => ({
  specifier,
  subpath: isRoot ? "." : `./${specifier.split("/").pop()}`,
  isRoot,
  kind: "symbols",
  symbols,
  reexports,
});

const types = (count) =>
  Array.from({ length: count }, (_, i) => symbol(`T${i}`, "type"));

const pkg = { name: "@sapporta/server", version: "0.5.0" };

test("symbols group into stable buckets, and empty buckets are dropped", () => {
  const buckets = bucketSymbols([
    symbol("ColumnMeta", "interface"),
    symbol("TableRow", "type"),
    symbol("sapportaTable", "function"),
    symbol("AppPage", "component"),
  ]);

  // Bucket order is fixed rather than first-seen, so adding an export rewrites
  // one page instead of re-partitioning its neighbours. A component sits with
  // the functions: a reader looking one up wants to know how to call it.
  assert.deepEqual(
    buckets.map((bucket) => [bucket.name, bucket.symbols.map((s) => s.name)]),
    [
      ["types", ["ColumnMeta", "TableRow"]],
      ["functions", ["sapportaTable", "AppPage"]],
    ],
  );
});

test("an entry point splits only past the threshold", () => {
  const at = entry("@sapporta/server", types(SPLIT_THRESHOLD), [], true);
  const past = entry("@sapporta/server", types(SPLIT_THRESHOLD + 1), [], true);

  assert.equal(shouldSplit(at), false);
  assert.equal(shouldSplit(past), true);
});

test("a small entry point renders one page carrying its signatures", () => {
  const pages = renderEntryPages(
    entry("@sapporta/server/table", [symbol("ColumnMeta", "interface")]),
    pkg,
    ORIGIN,
  );

  assert.equal(pages.length, 1);
  assert.equal(pages[0].slug, "server/table");
  assert.match(pages[0].content, /interface ColumnMeta \{\}/);
  // The version must travel with the page: a reader may be on an older install.
  assert.match(pages[0].content, /0\.5\.0/);
});

test("a split entry point yields an overview plus one page per bucket", () => {
  const symbols = [
    ...types(SPLIT_THRESHOLD),
    ...Array.from({ length: 5 }, (_, i) => symbol(`f${i}`, "function")),
  ];
  const pages = renderEntryPages(
    entry("@sapporta/server", symbols, [], true),
    pkg,
    ORIGIN,
  );

  assert.deepEqual(
    pages.map((page) => page.slug),
    ["server/index", "server/index-types", "server/index-functions"],
  );
  // The overview routes rather than carrying signatures — the whole point of
  // splitting is that reading it costs an agent little.
  assert.doesNotMatch(pages[0].content, /```ts/);
  assert.ok(
    pages[0].content.includes(referenceUrl(ORIGIN, "server/index-types")),
    "the overview must link the bucket page it routes to",
  );
  assert.match(pages[1].content, /type T0 \{\}/);
  // Each bucket page links to the others, so a reader landing on one can move.
  assert.ok(
    pages[1].content.includes(referenceUrl(ORIGIN, "server/index-functions")),
    "a bucket page must link its sibling buckets",
  );
});

test("root re-exports collapse to one pointer per narrower specifier", () => {
  const pages = renderEntryPages(
    entry(
      "@sapporta/frontend",
      [symbol("useThemeStore", "function")],
      [
        { name: "AppShell", from: "@sapporta/frontend/layout" },
        { name: "AppPage", from: "@sapporta/frontend/layout" },
        { name: "useAuth", from: "@sapporta/frontend/auth" },
      ],
      true,
    ),
    { name: "@sapporta/frontend", version: "0.5.0" },
    ORIGIN,
  );
  const content = pages[0].content;

  // What the root publishes itself keeps its declaration; what a subpath
  // publishes becomes one line naming the specifier to import from.
  assert.match(content, /function useThemeStore \{\}/);
  assert.match(content, /^- `@sapporta\/frontend\/auth` — useAuth$/m);
  assert.match(content, /^- `@sapporta\/frontend\/layout` — AppPage, AppShell$/m);
});

test("assets produce no page", () => {
  // A stylesheet has no symbols; rendering it would publish an empty page for
  // the index to link at.
  assert.deepEqual(
    renderEntryPages(
      { specifier: "@sapporta/ui/index.css", kind: "asset", symbols: [], reexports: [] },
      { name: "@sapporta/ui", version: "0.2.12" },
      ORIGIN,
    ),
    [],
  );
});

test("the index links documented entry points and lists assets without one", () => {
  const surface = {
    packages: [
      {
        ...pkg,
        entryPoints: [
          entry("@sapporta/server", [symbol("A", "type")], [], true),
          {
            specifier: "@sapporta/server/style.css",
            kind: "asset",
            symbols: [],
            reexports: [],
          },
        ],
      },
    ],
  };
  const index = renderIndex(surface, ORIGIN);

  assert.ok(
    index.includes(`[@sapporta/server](${referenceUrl(ORIGIN, "server/index")})`),
    "the index must link each documented entry point at its page URL",
  );
  // The stylesheet has no page, so it is named without a link to follow.
  assert.match(index, /^- `@sapporta\/server\/style\.css` — stylesheet/m);
});

test("the symbol index maps a name to its specifiers, narrowest first", () => {
  const surface = {
    packages: [
      {
        name: "@sapporta/ui",
        version: "0.2.12",
        entryPoints: [
          entry("@sapporta/ui", [], [{ name: "Badge", from: "@sapporta/ui/badge" }], true),
          entry("@sapporta/ui/badge", [symbol("Badge", "component")]),
        ],
      },
    ],
  };
  const index = renderSymbolIndex(surface, ORIGIN);

  // A name published by both a barrel and a subpath must lead with the subpath:
  // guessing the import path is the cost this index exists to remove.
  assert.match(index, /^- `Badge` — @sapporta\/ui\/badge, @sapporta\/ui$/m);
});
