---
title: "In-memory and REST data sources"
description:
  "Configure the built-in local and remote data-source factories and query
  ownership."
---

Use the in-memory source for browser-owned rows, examples, and tests. Use the
REST helpers when application endpoints own remote rows and persistence.

## In-memory source

```ts
const dataSource = inMemoryGridDataSource({
  schema,
  tree: [
    {
      rowKey: "project-1",
      levelName: "projects",
      columns: { name: "Migration" },
    },
  ],
  levels: {
    projects: {
      sortMode: "client",
      filterMode: "none",
      paginationMode: "none",
    },
  },
});
```

The in-memory source is not an authorization boundary.

On a tree level, a client filter (`filterMode: "client"` with `compileFilter`)
keeps each match's ancestors and, by default, its descendants, and publishes the
ancestors that do not match as `treeContextRowKeys`. The level option
`treeMatchContext: "ancestors"` keeps only the ancestors. A client sort orders
the siblings at every depth.

`filterTreeSourceNodes()` applies the same rule for a custom source:

```ts
const { nodes, contextRowKeys, matchCount } = filterTreeSourceNodes(
  allNodes,
  (columns) => String(columns.name).includes("Tax"),
  { parentKeyField: "parent_id", matchContext: "ancestors" },
);
```

It returns `TreeFilterResult`: the kept nodes in input order, the context row
keys, and the number of rows that match themselves. A parent key that names no
row, or a parent loop, ends the walk. `TreeMatchContext` is
`"ancestors" | "ancestors-and-descendants"`.

## REST sources

`restLevelSource()` and `restGridDataSource()` separate mutable query state from
request construction:

- `rowQuery` stores mutable page, page-size, sort, and filter values.
- `buildRowsRequest` adds fixed filters, parent-row constraints, or transport
  defaults before a fetch runs.
- `fetchPage` returns
  `{ nodes, totalCount?, footerRows?, treeContextRowKeys? }`. A tree level's
  endpoint sets `treeContextRowKeys` when it returns a filtered tree.
- `sourceOwnedRowQuery(initial)` keeps query state inside a level source.
- `hostBackedRowQuery(state)` adapts application query state to the same source
  command contract.

Use source-owned query state for embedded levels and child levels without
visible controls. Use host-backed query state when toolbar controls, URL state,
exports, and row loading must read the same query store.

Remote endpoints remain responsible for authorization, validation, persistence,
and conflict handling.

## Related documentation

- [Data sources guide](/grid/guides/data-sources/)
- [Data-source contracts and state](/grid/reference/data-sources/contracts-and-state/)
- [Data-source writes and reconciliation](/grid/reference/data-sources/writes-and-reconciliation/)
