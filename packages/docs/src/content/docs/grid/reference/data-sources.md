---
title: "Data sources"
description: "Look up grid and level source contracts, runtime read facades, query capabilities, writes, and lifecycle."
---

Data-source types and factories are exported from `@sapporta/grid`.

## GridDataSource

A `GridDataSource` acquires the root source and resolves one source for each
materialized child path.

```ts
type GridDataSource = {
  rootSource(): LevelDataSource;
  resolveChild(
    parentPath: GridPath,
    parentRowKey: RowKey,
    childLevelName: string,
  ): LevelDataSource;
  dispose(): void;
};
```

The runtime calls `rootSource()` during construction. It calls
`resolveChild()` the first time a row expands. Collapse retains the resolved
source for reuse. `runtime.dispose()` disposes every level source and then the
grid source.

## Source state

```ts
type LevelSnapshot = {
  readonly nodes: readonly TreeNode[];
  readonly footerRows?: readonly FooterRow[];
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

Snapshots contain display-ready rows. Every `TreeNode` includes its own stable
`rowKey`. The runtime renders source order and does not apply a second sort,
filter, or page stage.

## LevelDataSource

```ts
type LevelDataSource = {
  state(): LevelSourceState;
  subscribe(listener: () => void): () => void;
  dispose(): void;
  query?: LevelQueryCapabilities;
  write?: WriteCapability;
};
```

A source without `write` is readonly. Query capabilities are optional and
awaitable:

```ts
type LevelQueryCapabilities = {
  sort?: {
    current(): readonly SortDescriptor[] | undefined;
    set(sort: readonly SortDescriptor[] | undefined): Promise<SourceLoadResult>;
  };
  filter?: {
    current(): unknown;
    set(filter: unknown): Promise<SourceLoadResult>;
  };
  refetch?: () => Promise<SourceLoadResult>;
};

type SourceLoadResult =
  | { kind: "ready"; state: Extract<LevelSourceState, { status: "ready" }> }
  | {
      kind: "error";
      state: Extract<
        LevelSourceState,
        { status: "initialError" | "refreshError" }
      >;
    }
  | { kind: "unchanged"; state: LevelSourceState }
  | { kind: "superseded" }
  | { kind: "disposed" };
```

The promise resolves after the source publishes its resulting state.
Pagination remains a source or host concern.

## RuntimeLevelDataSource

`GridLevelRuntime.data` exposes source reads, queries, and reconcile events. It
does not expose raw writes.

```ts
type RuntimeLevelDataSource = {
  state(): LevelSourceState;
  subscribe(listener: () => void): () => void;
  readonly query?: LevelQueryCapabilities;
  readonly canWrite: boolean;
  onReconcile(listener: (event: ReconcileEvent) => void): () => void;
};

const level = runtime.root;
const state = level.data.state();

await level.data.query?.sort?.set([{ colId: "dueDate", direction: "asc" }]);
await level.data.query?.filter?.set({ status: "open" });
await level.data.query?.refetch?.();
```

React components can adapt the facade with `useSyncExternalStore()`:

```tsx
const level = useGridRuntime().level(path);
const state = useSyncExternalStore(
  level.data.subscribe,
  level.data.state,
  level.data.state,
);
```

Use `level.data.subscribe()` directly in non-React hosts.

## Writes through GridLevelRuntime

`WriteCapability` is implemented by the source and consumed by the runtime:

```ts
type WriteCapability = {
  setCell(rowKey: RowKey, colId: ColId, value: unknown): void;
  applyChanges(changes: readonly CellChange[]): void;
  createNode(node: TreeNode, atIndex?: number): Promise<CreateNodeResult>;
  removeNode(rowKey: RowKey): void | Promise<void>;
  onReconcile(listener: (event: ReconcileEvent) => void): () => void;
  canAppendRow?: () => boolean;
};
```

Application code writes through the level runtime:

```ts
const level = runtime.root;
const rowId = makeRowId(level.path, "project-1");

level.writeCell({ rowId, colId: "status" }, "done");
level.applyChanges([
  { rowKey: "project-1", colId: "status", value: "done" },
]);
await level.createRow({
  rowKey: "project-2",
  levelName: level.schema.name,
  columns: { name: "Migration" },
});
await level.removeRow("project-2");
```

These commands validate the current level registration, require a writable
source, and emit runtime mutation events.

## Reconciliation

```ts
type ReconcileEvent =
  | { kind: "agreed"; rowKey: RowKey; colId: ColId; value: unknown }
  | {
      kind: "diverged";
      rowKey: RowKey;
      colId: ColId;
      optimisticValue: unknown;
      authoritativeValue: unknown;
      priorValue: unknown;
    }
  | {
      kind: "rejected";
      rowKey: RowKey;
      colId: ColId;
      optimisticValue: unknown;
      reason: string;
      priorValue: unknown;
    };
```

```ts
const unsubscribe = runtime.root.data.onReconcile((event) => {
  if (event.kind === "rejected") showSaveError(event.reason);
});
```

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

Use the in-memory source for local data, examples, and tests. It is not an
authorization boundary.

## REST helpers

`restGridDataSource()` creates a grid source for remote data. Its level-source
configuration uses:

- `rowQuery` for mutable page, page-size, sort, and filter state.
- `buildRowsRequest` for fixed constraints and parent-row context.
- `sourceOwnedRowQuery(initial)` for source-local query state.
- `hostBackedRowQuery(state)` for application-owned query state.

Remote endpoints remain responsible for authorization, validation,
persistence, and conflict handling.

## Related documentation

- [BaseGrid](/grid/reference/base-grid/)
- [REST helpers](/grid/reference/rest-helpers/)
