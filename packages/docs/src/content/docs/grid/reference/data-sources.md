---
title: "Data sources"
description: "Look up source snapshots, states, load/write results, reconciliation, and lifecycle."
---

## Identity
Data-source exports from `@sapporta/grid/grid`.
## Data Source API

The runtime talks to `GridDataSource`, which creates one `LevelDataSource` per
path.

```ts
type GridDataSource = {
  rootSource: () => LevelDataSource;
  resolveChild: (
    parentPath: GridPath,
    parentRowKey: RowKey,
    childLevelName: string,
  ) => LevelDataSource;
  dispose: () => void;
};
```

### Level Snapshots

```ts
type LevelSnapshot = {
  nodes: readonly TreeNode[];
  footerRows?: readonly FooterRow[];
};
```

Snapshots contain display-ready rows and optional footer rows. The runtime
renders `nodes` as published. It does not read sort, filter, page, or lifecycle
status from the snapshot.

### Source State

```ts
type LevelStatus =
  | "initialLoading"
  | "ready"
  | "refreshing"
  | "initialError"
  | "refreshError";

type LevelSourceState =
  | { status: "initialLoading"; snapshot: LevelSnapshot }
  | { status: "ready"; snapshot: LevelSnapshot }
  | {
      status: "refreshing";
      snapshot: LevelSnapshot;
      previous: LevelSnapshot;
    }
  | {
      status: "initialError";
      snapshot: LevelSnapshot;
      error: Error;
    }
  | {
      status: "refreshError";
      snapshot: LevelSnapshot;
      previous: LevelSnapshot;
      error: Error;
    };
```

Use `useLevelSourceState(path)` or `runtime.sourceStateFor(path)` when host UI
needs loading, refresh, or error state. Use `useLevelSnapshot(path)` when it only
needs the current display rows.

### Load Results

```ts
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

Query and refetch commands are awaitable. Their promises resolve after the
source publishes the state visible through `state()` and subscriptions. The
result describes the source load only. It does not describe React rendering,
focus, scroll, URL state, or host workflows that run after the load.

### Level Sources

```ts
type SortQueryCapability = {
  current(): readonly SortDescriptor[] | undefined;
  set(sort: readonly SortDescriptor[] | undefined): Promise<SourceLoadResult>;
};

type FilterQueryCapability<TFilter = unknown> = {
  current(): TFilter | undefined;
  set(filter: TFilter | undefined): Promise<SourceLoadResult>;
};

type LevelQueryCapabilities = {
  sort?: SortQueryCapability;
  filter?: FilterQueryCapability<unknown>;
  refetch?: () => Promise<SourceLoadResult>;
};

type CellChange = { rowKey: RowKey; colId: ColId; value: unknown };

type CreateNodeResult = {
  node: TreeNode;
  atIndex: number;
};

type WriteCapability = {
  setCell(rowKey: RowKey, colId: ColId, value: unknown): void;
  applyChanges(changes: readonly CellChange[]): void;
  createNode(node: TreeNode, atIndex?: number): Promise<CreateNodeResult>;
  removeNode(rowKey: RowKey): void | Promise<void>;
  onReconcile(fn: (event: ReconcileEvent) => void): () => void;
  canAppendRow?: () => boolean;
};

type LevelDataSource = {
  state(): LevelSourceState;
  subscribe(fn: () => void): () => void;
  dispose(): void;
  query?: LevelQueryCapabilities;
  write?: WriteCapability;
};
```

Sources expose capabilities instead of readonly/writable subtypes. A source with
no `write` capability is readonly. The runtime hides write verbs behind runtime
methods, so app code normally calls `runtime.writeCell`,
`runtime.applyChanges`, `runtime.createRow`, and `runtime.removeRow`. Query
capabilities stay visible on `runtime.sourceFor(path)`:

```ts
const source = runtime.sourceFor(rootPath("projects"));

await source.query?.sort?.set([{ colId: "dueDate", direction: "asc" }]);
await source.query?.filter?.set({ status: "open" });
await source.query?.refetch?.();
```

Pagination is not a core runtime command. A source or host can keep page state
inside its query capability and publish a new display-ready snapshot when that
state changes.

### REST Source Helpers

`restLevelSource` and `restGridDataSource` use four query concepts:

- `rowQuery` stores mutable page, page-size, sort, and filter values.
- `buildRowsRequest` adds fixed constraints before a fetch runs.
- `sourceOwnedRowQuery(initial)` stores query state inside a source.
- `hostBackedRowQuery(state)` adapts application-owned query state to the same
  source command contract.

Use `sourceOwnedRowQuery` for embedded levels and child levels without visible
controls. Use `hostBackedRowQuery` when toolbar controls, URL state, exports,
and row loading must read the same query store.

### Reconcile Events

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

Use reconcile events to report save conflicts, authoritative corrections, or
rejected optimistic writes.

## In-Memory Data Source

```ts
function inMemoryGridDataSource<F = unknown>(
  opts: InMemoryGridDataSourceOpts<F>,
): GridDataSource;

type InMemoryGridDataSourceOpts<F = unknown> = {
  schema: GridSchema;
  tree: TreeNode[];
  levels: { [levelName: string]: InMemoryLevelOpts<F> };
};

type InMemoryLevelOpts<F = unknown> = {
  sortMode: "client" | "none";
  filterMode: "client" | "none";
  paginationMode: "client" | "none";
  initialSort?: SortDescriptor[];
  initialFilter?: F;
  initialPage?: number;
  initialPageSize?: number;
  aggregator?: InMemoryAggregator;
  compileFilter?: (filter: F | undefined) => RowPredicate | undefined;
};
```

Example:

```ts
const dataSource = inMemoryGridDataSource({
  schema,
  tree,
  levels: {
    projects: {
      sortMode: "client",
      filterMode: "none",
      paginationMode: "none",
    },
    tasks: {
      sortMode: "client",
      filterMode: "none",
      paginationMode: "none",
    },
  },
});
```

Use this source for local data, tests, demos, or as a reference implementation
for custom sources.
## Related documentation
[Grid reference overview](/grid/reference/)
