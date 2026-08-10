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

## REST sources

`restLevelSource()` and `restGridDataSource()` separate mutable query state from
request construction:

- `rowQuery` stores mutable page, page-size, sort, and filter values.
- `buildRowsRequest` adds fixed filters, parent-row constraints, or transport
  defaults before a fetch runs.
- `sourceOwnedRowQuery(initial)` keeps query state inside a level source.
- `hostBackedRowQuery(state)` adapts application-owned query state to the same
  source command contract.

Use source-owned query state for embedded levels and child levels without
visible controls. Use host-backed query state when toolbar controls, URL state,
exports, and row loading must read the same query store.

Remote endpoints remain responsible for authorization, validation, persistence,
and conflict handling.

## Related documentation

- [Data sources guide](/grid/guides/data-sources/)
- [Data-source contracts and state](/grid/reference/data-sources/contracts-and-state/)
- [Data-source writes and reconciliation](/grid/reference/data-sources/writes-and-reconciliation/)
