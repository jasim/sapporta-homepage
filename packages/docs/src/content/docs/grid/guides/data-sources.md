---
title: "Data sources"
description: "Connect local, remote, and custom sources while keeping query and write ownership explicit."
---

Use `inMemoryGridDataSource()` when rows already live in browser state or when
you are building a local prototype:

```ts
const dataSource = inMemoryGridDataSource({
  schema,
  tree,
  levels: {
    tasks: {
      sortMode: "client",
      filterMode: "none",
      paginationMode: "none",
    },
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

A grid data source answers level requests and returns a `LevelDataSource` for
the requested path. For nested data, resolving a child level starts from the
parent row path and row key.

Each level source publishes `LevelSourceState`. Its `snapshot` is display data
only:

```ts
type LevelSnapshot = {
  nodes: readonly TreeNode[];
  footerRows?: readonly FooterRow[];
};

type LevelSourceState =
  | { status: "initialLoading"; snapshot: LevelSnapshot }
  | { status: "ready"; snapshot: LevelSnapshot }
  | {
      status: "refreshing";
      snapshot: LevelSnapshot;
      previous: LevelSnapshot;
    }
  | { status: "initialError"; snapshot: LevelSnapshot; error: Error }
  | {
      status: "refreshError";
      snapshot: LevelSnapshot;
      previous: LevelSnapshot;
      error: Error;
    };
```

The source or host shapes rows before publication. The core runtime renders the
published nodes as-is and does not run a second filter, sort, or page stage over
them. Loading and error state lives in `LevelSourceState`, not in the snapshot.

Query behavior is optional. A source can expose sort, filter, and refetch
capabilities through `source.query`. These commands return
`Promise<SourceLoadResult>` and resolve after the source has published the
resulting state. Pagination is not a core runtime command. A source can keep
page state in its own query storage and publish a new snapshot after a page
turn.

Write behavior is also optional. A source with no `write` capability is
readonly. A writable source implements cell updates, batch changes, row
creation, row removal, and reconcile events. Hosts call path-local methods such
as `level.writeCell()`, `level.applyChanges()`, `level.createRow()`, and
`level.removeRow()`. These methods validate the current registration and keep
mutation events centralized.

The source read facade is available as `level.data`. Query capabilities remain
source-owned:

```ts
const level = runtime.root;

await level.data.query?.sort?.set([{ colId: "dueDate", direction: "asc" }]);
await level.data.query?.filter?.set({ status: "open" });
await level.data.query?.refetch?.();
```

## REST helper concepts

`restLevelSource` separates mutable query state from request construction:

- `rowQuery` stores page, page size, sort, and filter values.
- `buildRowsRequest` adds fixed filters, parent-row constraints, or transport
  defaults before `fetchPage` runs.
- `sourceOwnedRowQuery(initial)` keeps query state inside a level source.
- `hostBackedRowQuery(state)` adapts a host store to the same source contract.

Use source-owned query state for child levels and embedded grids without visible
controls. Use host-backed query state when toolbar controls, URL state, export
links, and row fetches must share the same query values.

Design the backend around the same questions:

- Which level is being requested?
- Which parent path and parent row does it belong to?
- Which filters, sort, and page should apply?
- Which user is allowed to read or write those rows?

Do not put authorization in hidden columns, fixed filters, or row keys. Treat
those as UI state. Enforce access on the server endpoint that reads and writes
the data.
## Verify
Typecheck the example and exercise its visible loading, ready, interaction, and failure states. Use only public `@sapporta/grid` export paths.
Continue with [Grid Reference](/grid/reference/).
