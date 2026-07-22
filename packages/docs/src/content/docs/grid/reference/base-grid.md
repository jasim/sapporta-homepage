---
title: "BaseGrid"
description: "Look up standalone identity, schema, runtime, level, React, row-operation, and advanced APIs."
---

BaseGrid runtime and React primitives are exported from `@sapporta/grid`.
Column builders are exported from `@sapporta/grid/column-preset`. Advanced
cursor and controller composition is exported from `@sapporta/grid/advanced`.

## Runtime structure

`createGridRuntime()` returns a `GridRuntime`. The runtime contains grid-wide
state. Each registered path has a `GridLevelRuntime` for path-local state and
commands.

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

Schema and interaction values are immutable snapshots. Create a new runtime
when either configuration changes.

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

The interaction configuration chooses the Enter, click, or double-click
gestures that can emit this event. See
[Interactions](/grid/reference/interactions/) for precedence and validation
rules.

## Identity

Every source row provides a stable `rowKey`. A `GridPath` identifies one
rendered level. A `RowId` combines the path, displayed row kind, and row key.

```ts
type ColId = string;
type RowKey = string;
type GridPath = Brand<string, "GridPath">;
type RowId = Brand<string, "RowId">;
type Coord = { readonly rowId: RowId; readonly colId: ColId };

function rootPath(rootLevelName: string): GridPath;
function childPath(
  parent: GridPath,
  parentRowKey: RowKey,
  childLevelName: string,
): GridPath;
function makeRowId(path: GridPath, rowKey: RowKey): RowId;
function pathOfRowId(id: RowId): GridPath;
function rowKeyOfRowId(id: RowId): RowKey;
```

Use these helpers instead of constructing or parsing path and row-id strings.
Row keys may contain `.`, `#`, and `%`; the identity helpers escape them.

## Schema and rows

```ts
type GridSchema = {
  readonly levels: Readonly<Record<string, LevelSchema>>;
  readonly rootLevel: string;
};

type LevelSchema = {
  readonly name: string;
  readonly columns: readonly ColumnSchema[];
  readonly rowHeaderColumn:
    | { readonly column: ColId }
    | "empty-selectable-cell"
    | "none";
  readonly options: LevelOptions;
  readonly childLevels: readonly string[];
};

type TreeNode = {
  readonly rowKey: RowKey;
  readonly levelName: string;
  readonly columns: Readonly<Record<ColId, unknown>>;
  readonly rollup?: Readonly<Record<ColId, unknown>>;
  readonly children?: Readonly<Record<string, TreeNode | readonly TreeNode[]>>;
  readonly childFooterRows?: Readonly<Record<string, readonly FooterRow[]>>;
  readonly kind?: "opening" | "closing" | "subtotal";
};
```

`TreeNode.rowKey` is required. The schema no longer derives row identity from a
column or array index.

```ts
const schema = {
  rootLevel: "projects",
  levels: {
    projects: {
      name: "projects",
      rowHeaderColumn: "none",
      columns: projectColumns,
      options: {},
      childLevels: ["tasks"],
    },
    tasks: {
      name: "tasks",
      rowHeaderColumn: "none",
      columns: taskColumns,
      options: {},
      childLevels: [],
    },
  },
} satisfies GridSchema;

const tree = [
  {
    rowKey: "project-1",
    levelName: "projects",
    columns: { name: "Migration" },
  },
] satisfies TreeNode[];
```

Runtime row reads return the `LevelRow` discriminated union. Branch on
`row.kind` before using kind-specific fields. The union includes `data`,
`rollup`, `opening`, `closing`, `subtotal`, `footer`, and `phantom` rows.

## Construction and React lifecycle

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

React screens create and dispose the runtime with `useGridRuntimeEffect()`:

```tsx
const runtime = useGridRuntimeEffect(
  () => createGridRuntime({ schema, dataSource }),
  [schema, dataSource],
);

if (!runtime) return null;

return (
  <GridRuntimeProvider runtime={runtime}>
    <GridCopyContextMenu>
      <GridLevel path={runtime.root.path} />
    </GridCopyContextMenu>
  </GridRuntimeProvider>
);
```

Outside React, call `runtime.dispose()` from the owner's cleanup path. Repeated
calls are safe.

## GridLevelRuntime

Resolve a level once, then use its path-bound reads, subscriptions, and
commands.

```ts
type GridLevelRuntime = {
  readonly path: GridPath;
  readonly schema: LevelSchema;
  readonly data: RuntimeLevelDataSource;

  displayedRows(): DisplayedRows;
  displayedRowSequence(): DisplayedRowSequence;
  displayedRow(rowId: RowId): LevelRow | undefined;
  dataRowTarget(rowId: RowId): RowOperationTarget<"data"> | undefined;
  subscribeDisplayedRowSequence(listener: () => void): () => void;
  subscribeDisplayedRow(rowId: RowId, listener: () => void): () => void;

  activeRow(): RowCursor | null;
  selectedRows(): RowSelection;
  selectedRowIds(): readonly RowId[];
  rowInteractionSnapshot(): RowInteractionSnapshot;
  subscribeActiveRow(listener: () => void): () => void;
  subscribeSelectedRows(listener: () => void): () => void;
  subscribeSelectedRowIds(listener: () => void): () => void;
  subscribeRowInteractionSnapshot(listener: () => void): () => void;

  selectRow(rowId: RowId): void;
  setRowSelection(selection: RowSelection): void;
  toggleRowSelection(rowId: RowId): void;
  extendRowSelectionTo(rowId: RowId): void;
  clearRowSelection(): void;

  isExpanded(rowId: RowId): boolean;
  subscribeExpansion(listener: () => void): () => void;
  expand(rowId: RowId): void;
  collapse(rowId: RowId): void;
  toggleExpand(rowId: RowId): void;

  writeCell(coord: Coord, value: unknown): void;
  applyChanges(changes: readonly CellChange[]): void;
  createRow(node: TreeNode, atIndex?: number): Promise<CreateNodeResult>;
  removeRow(rowKey: RowKey): Promise<void>;

  readonly drafts: {
    get(): readonly PhantomRow[];
    subscribe(listener: () => void): () => void;
    add(rowKey: RowKey, columns?: Readonly<Record<ColId, unknown>>): void;
    remove(rowKey: RowKey): void;
    setCell(rowKey: RowKey, colId: ColId, value: unknown): void;
    commit(rowKey: RowKey, atIndex?: number): Promise<CreateNodeResult>;
  };
};
```

Dynamic reads, commands, and subscriptions are guarded by the level's
registration lifetime. Static fields remain readable after unregistration.

```ts
const level = runtime.root;
const rowId = makeRowId(level.path, "project-1");

level.writeCell({ rowId, colId: "status" }, "done");
level.applyChanges([
  { rowKey: "project-1", colId: "status", value: "done" },
  { rowKey: "project-1", colId: "owner", value: "user-7" },
]);

await level.createRow({
  rowKey: "project-2",
  levelName: "projects",
  columns: { name: "New project" },
});
await level.removeRow("project-2");
```

## Cross-path row operations

`runtime.rowOperations` builds validated targets from registered levels.
Explicit row selection wins per path. Cell-selected rows provide the fallback
for `targets()`.

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

Deletion runs child-first and preserves a valid cursor landing. A partial
result contains removed, failed, and unattempted targets.

## Data access

`level.data` is the read and query facade for the level source. Runtime writes
remain on `GridLevelRuntime` so validation, reconciliation, and host events use
one boundary.

```ts
const level = runtime.root;
const state = level.data.state();
const unsubscribe = level.data.subscribe(() => console.log(level.data.state()));

await level.data.query?.sort?.set([{ colId: "name", direction: "asc" }]);
await level.data.query?.filter?.set({ archived: false });
await level.data.query?.refetch?.();
```

## Advanced composition

The root package omits raw controllers, cursor managers, and renderer internals.
Import supported composition helpers from `@sapporta/grid/advanced`:

```ts
import {
  cellActivationFor,
  controllerFor,
  cursorManagerFor,
  materializedChildren,
} from "@sapporta/grid/advanced";

const cursors = cursorManagerFor(runtime);
cursors.moveCellCursorTo({
  path: runtime.root.path,
  rowId: makeRowId(runtime.root.path, "project-1"),
  colId: "name",
});

const controller = controllerFor(runtime, runtime.root.path);
controller.startEdit(
  { rowId: makeRowId(runtime.root.path, "project-1"), colId: "name" },
  "f2",
);
```

Advanced helpers are lifetime-checked facades. They do not expose the private
runtime kernel.

## React hooks

`GridRuntimeProvider` supplies the runtime to `GridLevel` and the public hooks.
Common hooks include:

```ts
useGridRuntime();
useGridActiveRow(runtime?);
useLevelSnapshot(path);
useDisplayedRowSequence(path);
useDisplayedRow(path, rowId);
useActiveCell();
useActiveCellForPath(path);
useCellSelection(path);
useActiveRow(path);
useSelectedRows(path);
useSelectedRowIds(path);
useRowInteractionSnapshot(path);
```

Use hooks in React components. Use `GridLevelRuntime` subscriptions in
non-React hosts and custom stores.

`useGridActiveRow()` reads the provider runtime. Passing a runtime argument
allows a component outside that provider to observe it. The hook returns
`GridActiveRow | null` and updates for both active identity and displayed-value
changes.

## Related documentation

- [Data sources](/grid/reference/data-sources/)
- [Interactions](/grid/reference/interactions/)
- [ColumnPreset](/grid/reference/column-preset/)
- [DOM and styling contract](/grid/reference/dom-and-styling-contract/)
