---
title: "Data Sources"
description:
  "Choose an in-memory or remote data source for Sapporta Grid and keep server
  authorization outside the browser grid."
---

Use `inMemoryGridDataSource()` when rows already live in browser state or when
you are building a local prototype:

```ts
const dataSource = inMemoryGridDataSource({
  schema,
  tree,
  levels: {
    tasks: { sortMode: "client", filterMode: "none" },
  },
});
```

This source is useful for demos, import review screens, local drafts, and tests.
It is not an authorization boundary.

For server data, connect the runtime to endpoints you own. The grid can keep row
identity, focus, editing, nested paths, and displayed row snapshots stable, but
your server still owns access control, validation, persistence, and conflict
handling.

## Data source contract

A grid data source answers level requests and returns rows for the requested
path. For nested data, resolving a child level starts from the parent row path
and row key.

Design the backend around the same questions:

- Which level is being requested?
- Which parent path and parent row does it belong to?
- Which filters, sort, and page should apply?
- Which user is allowed to read or write those rows?

Do not put authorization in hidden columns, fixed filters, or row keys. Treat
those as UI state. Enforce access on the server endpoint that reads and writes
the data.
