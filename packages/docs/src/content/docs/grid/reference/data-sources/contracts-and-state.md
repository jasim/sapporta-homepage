---
title: "Data-source contracts and state"
description:
  "Look up GridDataSource, LevelDataSource, snapshots, query capabilities, and
  lifecycle."
---

Use these contracts when implementing a custom source or adapting an application
store to GridCore.

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

The runtime calls `rootSource()` during construction. It calls `resolveChild()`
the first time a row expands. Collapse retains the resolved source for reuse.
`runtime.dispose()` disposes every level source and then the grid source.

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

The promise resolves after the source publishes its resulting state. Pagination
remains a source or host concern.

## Related documentation

- [Schema, rows, paths, and identity](/grid/reference/grid-core/schema-rows-and-identity/)
- [Runtime data access](/grid/reference/data-sources/runtime-data-access/)
- [Hierarchical grids](/grid/guides/hierarchical-grids/)
