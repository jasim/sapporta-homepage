---
title: "GridRuntime"
description:
  "Look up grid-wide state, construction, events, lifecycle, and row operations."
---

`createGridRuntime()` returns a `GridRuntime`. The runtime contains grid-wide
state. Each registered path has a `GridLevelRuntime` for path-local state and
commands.

## Runtime structure

```ts
type GridRuntime = {
  readonly schema: GridSchema;
  readonly interaction: GridInteractionConfig;
  readonly root: GridLevelRuntime;

  level(path: GridPath): GridLevelRuntime;
  registeredLevels(): readonly GridLevelRuntime[];
  subscribeLevels(listener: () => void): () => void;
  activeRow(): GridActiveRow | null;
  subscribeActiveRow(listener: () => void): () => void;
  schemaAt(path: GridPath): LevelSchema;

  readonly rowOperations: GridRowOperations;
  on<E extends keyof GridEvents>(
    event: E,
    listener: (payload: GridEvents[E]) => void,
  ): () => void;
  dispose(): void;
};
```

`runtime.root` is registered during construction. `runtime.level(path)` returns
the current registration for an expanded or retained child path. It throws when
the path is not registered. Collapsing a row hides its child levels and retains
their resources. `runtime.registeredLevels()` therefore includes retained
collapsed levels.

Schema and interaction values are immutable snapshots. Create a new runtime when
either configuration changes.

`activeRow()` resolves the one global cursor to its current live level and
displayed row. `GridActiveRow` contains `{ row, level }`. Its snapshot identity
remains stable across unchanged reads. `subscribeActiveRow()` wakes when the
cursor changes, the active row disappears, or its displayed values change.

Row activation is a runtime event rather than a state snapshot:

```ts
runtime.on("rowActivated", ({ activeRow, trigger }) => {
  if (activeRow.row.kind === "data") {
    openRecord(activeRow.row.columns.id, trigger);
  }
});
```

The interaction configuration chooses the Enter, click, or double-click gestures
that can emit this event. See
[Active rows and row activation](/grid/reference/interactions/active-row-and-activation/)
for precedence and validation rules.

## Construction and lifecycle

```ts
type RuntimeArgs = {
  readonly schema: GridSchema;
  readonly dataSource: GridDataSource;
  readonly interaction?: GridInteractionConfig;
  readonly phantoms?: PhantomChannel;
  readonly phantomRows?: PhantomRowsConfig;
  readonly onLoadedRowsBoundary?: (
    event: LoadedRowsBoundaryEvent,
  ) => Promise<SourceLoadResult> | false;
  readonly on?: {
    readonly [E in keyof GridEvents]?: (payload: GridEvents[E]) => void;
  };
  readonly onObserverError?: (error: unknown) => void;
};

function createGridRuntime(args: RuntimeArgs): GridRuntime;
```

Outside React, call `runtime.dispose()` from the owner's cleanup path. Repeated
calls are safe. React screens should use
[`useGridRuntimeEffect()`](/grid/reference/grid-core/react-api/) instead.

## Cross-path row operations

Stored selection remains path-local. Commands that intentionally span the
expanded hierarchy use `runtime.rowOperations`. Explicit row selection wins per
path. Cell-selected rows provide the fallback for `targets()`.

```ts
type GridRowOperations = {
  targets(): readonly RowOperationTarget[];
  selectedDataTargets(): readonly RowOperationTarget<"data">[];
  remove(
    targets: readonly RowOperationTarget<"data">[],
  ): Promise<RowRemovalResult>;
};

const result = await runtime.rowOperations.remove(
  runtime.rowOperations.selectedDataTargets(),
);

if (result.kind === "partial") {
  console.error(result.failed, result.error);
}
```

`runtime.rowOperations.targets()` returns current operation targets in
registered-level order. Deletion runs child-first and preserves a valid cursor
landing. A partial result contains removed, failed, and unattempted targets.

## Related documentation

- [GridLevelRuntime](/grid/reference/grid-core/level-runtime/)
- [Row selection](/grid/reference/interactions/row-selection/)
- [GridCore React APIs](/grid/reference/grid-core/react-api/)
