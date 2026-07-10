---
title: "BaseGrid"
description: "Look up standalone identity, schema, runtime, React, expansion, and phantom-row APIs."
---

## Identity
`@sapporta/grid/grid` and the root `@sapporta/grid` export surface.
This reference is organized in the order you normally build a BaseGrid:

1. define identity and paths
2. define schema and columns
3. choose ColumnPreset or raw columns
4. provide a data source
5. create a runtime
6. render with React
7. read and write through the runtime
8. configure interactions

For a tutorial, read [BASEGRID-GUIDE.md](./basegrid-guide/). For detailed
keyboard and selection behavior, read
[BASEGRID-INTERACTIONS.md](./basegrid-interactions/). For row and cell
selection styling, read [BASEGRID-STYLING.md](./basegrid-styling/).

## Import Surface

BaseGrid runtime and React primitives are exported from `@sapporta/grid`.
ColumnPreset helpers are exported from `@sapporta/grid/column-preset`.

```ts
import {
  GridCopyContextMenu,
  GridLevel,
  GridRuntimeProvider,
  createGridRuntime,
  inMemoryGridDataSource,
  rootPath,
  useGridRuntimeEffect,
  useActiveCell,
  useActiveCellForPath,
  useActiveRow,
  useCellSelection,
  useLevelSourceState,
  useRowInteractionSnapshot,
  useSelectedRowIds,
  useSelectedRows,
  rowInteractionStatusFor,
  type GridSchema,
  type GridCopyColumn,
  type GridColumnCopyBehavior,
  type RowInteractionSnapshot,
  type TreeNode,
} from "@sapporta/grid";
import { columnPreset, text } from "@sapporta/grid/column-preset";
```

Do not use Sapporta framework table-grid APIs when you are building a BaseGrid
from scratch. Those APIs adapt Sapporta table schemas and table row APIs onto
BaseGrid; this reference covers the lower-level primitives.

## Identity API

BaseGrid uses stable logical identifiers rather than array indexes.

```ts
type ColId = string;
type RowKey = string;
type GridPath = Brand<string, "GridPath">;
type RowId = Brand<string, "RowId">;
type Coord = { rowId: RowId; colId: ColId };
type CellCursor = { path: GridPath; rowId: RowId; colId: ColId };
```

### `rootPath`

```ts
function rootPath(rootLevelName: string): GridPath;
```

Creates the root path for a level.

```ts
const projectsPath = rootPath("projects");
```

### `childPath`

```ts
function childPath(
  parent: GridPath,
  parentRowKey: RowKey,
  childKey: string,
): GridPath;
```

Creates the path for a child level under a parent row.

```ts
const tasksPath = childPath(rootPath("projects"), "project-1", "tasks");
```

### `makeRowId`

```ts
function makeRowId(path: GridPath, rowKey: RowKey): RowId;
```

Creates the row id used by focus, selection, and displayed-row lookups.

```ts
const rowId = makeRowId(rootPath("projects"), "project-1");
```

### Path Helpers

```ts
function decomposePath(path: GridPath): PathDecomposition;
function trailingEdge(path: GridPath): {
  parentPath: GridPath;
  parentRowKey: RowKey;
  childLevelName: string;
} | null;
function parseChildPath(
  parent: GridPath,
  child: GridPath,
): { rowKey: RowKey; childKey: string } | null;
function pathOfRowId(id: RowId): GridPath;
function rowKeyOfRowId(id: RowId): RowKey;
function coordsEqual(a: Coord, b: Coord): boolean;
function cursorEqual(a: CellCursor | null, b: CellCursor | null): boolean;
```

Use these helpers instead of parsing path strings yourself.

## Schema API

The schema is static. It defines level names, columns, child level names, and
level options.

```ts
type GridSchema = {
  levels: Record<string, LevelSchema>;
  rootLevel: string;
};

type LevelSchema = {
  name: string;
  columns: ColumnSchema[];
  options: LevelOptions;
  childLevels: string[];
};
```

### `LevelOptions`

```ts
type LevelOptions = {
  rowKey?: (node: TreeNode, localIdx: number) => RowKey;
  defaultCollapsed?: boolean;
  allowPhantoms?: boolean;
};
```

`rowKey` should return a stable id for each sibling row. If you omit it, the
default row key is the local array index. Prefer a real row id whenever rows can
be sorted, filtered, inserted, deleted, or refreshed.

```ts
const schema: GridSchema = {
  rootLevel: "projects",
  levels: {
    projects: {
      name: "projects",
      columns: projectColumns,
      childLevels: ["tasks"],
      options: { rowKey: (node) => String(node.columns.id) },
    },
    tasks: {
      name: "tasks",
      columns: taskColumns,
      childLevels: [],
      options: { rowKey: (node) => String(node.columns.id) },
    },
  },
};
```

## Row Data API

Data sources publish `TreeNode` values. Displayed rows are derived from those
nodes.

```ts
type TreeNode = {
  levelName: string;
  columns: Record<ColId, unknown>;
  rollup?: Record<ColId, unknown>;
  children?: Record<string, TreeNode | TreeNode[]>;
  childFooterRows?: Record<string, FooterRow[]>;
  kind?: "opening" | "closing" | "subtotal";
};

type FooterRow = {
  rowKey: RowKey;
  columns: Record<ColId, unknown>;
};

type PhantomRow = {
  rowKey: RowKey;
  columns: Record<ColId, unknown>;
};
```

Runtime reads return `LevelRow`, not raw `TreeNode`.

```ts
type LevelRow =
  | {
      kind: "data";
      id: RowId;
      columns: Record<ColId, unknown>;
      source: TreeNode;
      hasChildren: boolean;
      rowSelectable: boolean;
    }
  | {
      kind: "rollup";
      id: RowId;
      columns: Record<ColId, unknown>;
      source: TreeNode;
      rowSelectable: boolean;
    }
  | {
      kind: "opening" | "closing" | "subtotal";
      id: RowId;
      columns: Record<ColId, unknown>;
      source: TreeNode;
      rowSelectable: boolean;
    }
  | {
      kind: "footer";
      id: RowId;
      columns: Record<ColId, unknown>;
      source: FooterRow;
      rowSelectable: boolean;
    }
  | {
      kind: "phantom";
      id: RowId;
      columns: Record<ColId, unknown>;
      source: PhantomRow;
      rowSelectable: boolean;
    };
```

Branch on `row.kind` in renderers and host UI. Interaction code should use
capability helpers.

```ts
function capabilitiesFor(kind: LevelRowKind): RowCapabilities;
function capabilitiesOf(row: LevelRow): RowCapabilities;
```

## Column API

BaseGrid renders `ColumnSchema`.

```ts
type GridCopyColumn<TRow = LevelRow> = {
  header: string;
  valueAt: (row: TRow, rowIndex: number) => unknown;
};

type GridColumnCopyBehavior = (context: {
  path: GridPath;
  column: ColumnSchema;
  rows: readonly LevelRow[];
}) => readonly GridCopyColumn[] | Promise<readonly GridCopyColumn[]>;

type ColumnSchema = {
  id: ColId;
  name: string;
  renderCell: (props: CellRenderProps) => ReactNode;
  compare?: (a: unknown, b: unknown) => number;
  edit?: CellEditBehavior;
  activation?: CellActivation;
  copy?: GridColumnCopyBehavior;
  meta?: unknown;
};

type CellRenderProps = {
  value: unknown;
  row: LevelRow;
  column: ColumnSchema;
  path: GridPath;
  activation: CellRenderActivation | null;
};

type CellEditorStart =
  | { trigger: "type"; typedSeed: string }
  | { trigger: "enter" | "f2" | "doubleClick" };

type CellEditorProps = {
  editStart: CellEditorStart;
  value: unknown;
  row: LevelRow;
  column: ColumnSchema;
  path: GridPath;
  anchor: HTMLElement;
  commit: (newValue: unknown, commit?: CommitTarget) => void;
  cancel: () => void;
};

type CellEditGesture = "enter" | "f2" | "type" | "doubleClick";

type CellEditBehavior = {
  editor: ComponentType<CellEditorProps>;
  startsOn: readonly CellEditGesture[];
};

type CellActivationGesture = "enter" | "space" | "click" | "doubleClick";

type CellActivation = {
  startsOn: readonly CellActivationGesture[];
  describe: string | ((ctx: CellActivationContext) => CellActivationState);
  run: (ctx: CellActivationContext) => void | Promise<void>;
};
```

### Raw Column Example

```tsx
import type { ColumnSchema } from "@sapporta/grid";

const statusColumn: ColumnSchema = {
  id: "status",
  name: "Status",
  renderCell: ({ value }) => (
    <span data-status={String(value)}>{String(value ?? "")}</span>
  ),
  compare: (a, b) => String(a ?? "").localeCompare(String(b ?? "")),
};
```

### Copy Behavior

`GridCopyContextMenu` uses `ColumnSchema.copy` when a selected cell or range
includes that column. If the column does not provide copy behavior, BaseGrid
copies `row.columns[column.id]` and uses `column.id` as the clipboard header.

```ts
const personColumn: ColumnSchema = {
  id: "person_id",
  name: "Person",
  renderCell: ({ row }) => String(row.columns.person_name ?? ""),
  copy: () => [
    {
      header: "person_id",
      valueAt: (row) => row.columns.person_id,
    },
    {
      header: "person_name",
      valueAt: (row) => row.columns.person_name,
    },
  ],
};
```

One visible grid column can contribute one or more `GridCopyColumn` values. A
copy behavior may return a promise, so lookup-backed columns can load labels
before the clipboard text is serialized.

### Raw Editor Example

```tsx
import { useState } from "react";
import type { CellEditorProps, ColumnSchema } from "@sapporta/grid";

function TextEditor(props: CellEditorProps) {
  const initialValue =
    props.editStart.trigger === "type"
      ? props.editStart.typedSeed
      : String(props.value ?? "");
  const [value, setValue] = useState(initialValue);

  return (
    <input
      autoFocus
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => props.commit(value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") props.commit(value, "down");
        if (event.key === "Escape") props.cancel();
      }}
    />
  );
}

const titleColumn: ColumnSchema = {
  id: "title",
  name: "Title",
  renderCell: ({ value }) => String(value ?? ""),
  edit: {
    editor: TextEditor,
    startsOn: ["enter", "f2", "type", "doubleClick"],
  },
};
```

## ColumnPreset API

ColumnPreset helpers return ordinary `ColumnSchema` values. They are the
recommended starting point for most BaseGrid columns.

### Constructors

```ts
function identifier<TMeta = unknown>(
  options: ColumnPresetOptions<TMeta>,
): ColumnSchema;
function text<TMeta = unknown>(options: TextColumnOptions<TMeta>): ColumnSchema;
function number<TMeta = unknown>(
  options: NumberColumnOptions<TMeta>,
): ColumnSchema;
function currency<TMeta = unknown>(
  options: NumberColumnOptions<TMeta>,
): ColumnSchema;
function percentage<TMeta = unknown>(
  options: NumberColumnOptions<TMeta>,
): ColumnSchema;
function date<TMeta = unknown>(
  options: ColumnPresetOptions<TMeta>,
): ColumnSchema;
function boolean<TMeta = unknown>(
  options: ColumnPresetOptions<TMeta>,
): ColumnSchema;
function select<TMeta = unknown>(
  options: SelectColumnOptions<TMeta>,
): ColumnSchema;
function lookupValue<TMeta = unknown>(
  options: LookupColumnOptions<TMeta>,
): ColumnSchema;
function foreignKey<TMeta = unknown>(
  options: LookupColumnOptions<TMeta>,
): ColumnSchema;
function column<TMeta = unknown>(
  options: ColumnPresetOptions<TMeta>,
): ColumnSchema;
```

### Common Options

```ts
type ColumnPresetOptions<TMeta = unknown> = {
  kind?: ColumnPresetKind;
  id: ColId;
  name: string;
  align?: "left" | "right" | "center";
  width?: ColumnWidth;
  edit?:
    | "default"
    | "none"
    | {
        editor?: "default" | ComponentType<CellEditorProps>;
        startsOn?: readonly CellEditGesture[];
      };
  activation?: CellActivation;
  sortable?: boolean;
  format?: (value: unknown) => string;
  parse?: (value: string, props: CellEditorProps) => unknown;
  compare?: (a: unknown, b: unknown) => number;
  renderCell?: (props: CellRenderProps) => ReactNode;
  copy?: GridColumnCopyBehavior;
  meta?: TMeta;
};
```

### Widths

```ts
type ColumnWidth =
  | "compact"
  | "content"
  | "fill"
  | "numeric"
  | "date"
  | "enum"
  | "foreignKey"
  | { min?: number; ideal?: number; max?: number }
  | { track: string };
```

### Select Columns

```ts
const status = select({
  id: "status",
  name: "Status",
  edit: "default",
  width: "enum",
  options: [
    { value: "todo", label: "To do" },
    { value: "doing", label: "Doing" },
    { value: "done", label: "Done" },
  ],
});
```

### Number Columns

```ts
const estimate = number({
  id: "estimate",
  name: "Estimate",
  edit: "default",
  width: "numeric",
  zeroDisplay: "blank",
});

const variance = currency({
  id: "variance",
  name: "Variance",
  colorRule: "signed",
});
```

### Custom Formatting

```ts
const duration = number({
  id: "durationMinutes",
  name: "Duration",
  format: (value) => `${Number(value ?? 0)} min`,
  parse: (value) => Number(value.replace("min", "").trim()),
});
```

### Row Selection Column

```ts
function rowSelectionColumn(options?: RowSelectionColumnOptions): ColumnSchema;

type RowSelectionColumnOptions = {
  id?: ColId;
  name?: string;
  width?: ColumnWidth;
  header?: "checkbox" | "blank";
};
```

`rowSelectionColumn()` renders checkbox chrome on top of the runtime's row
selection APIs.

```ts
const columns = [
  rowSelectionColumn(),
  text({ id: "title", name: "Title", edit: "default" }),
];
```

### ColumnPreset Helpers

```ts
function preset(column: ColumnSchema): ColumnPreset | undefined;
function meta<TMeta = unknown>(column: ColumnSchema): TMeta | undefined;
function kind(column: ColumnSchema): ColumnPresetKind | undefined;
function width(column: ColumnSchema): ColumnWidth | undefined;
function parse(
  column: ColumnSchema,
): ((value: string, props: CellEditorProps) => unknown) | undefined;
function lookupCapabilities(
  column: ColumnSchema,
): LookupCapabilities | undefined;
function trackForColumn(column: ColumnSchema): string;
function templateColumns(columns: readonly ColumnSchema[]): string;
```

Use `templateColumns` when you build custom chrome that must align with the
grid's column widths.

```tsx
const style = {
  display: "grid",
  gridTemplateColumns: templateColumns(schema.levels.tasks.columns),
};
```

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

## Runtime Construction

`createGridRuntime` creates a live object with subscriptions and disposable
resources. If you create a runtime for a React screen, call
`useGridRuntimeEffect(() => createGridRuntime(...), deps)` and render the grid
after the hook returns a runtime. See
[Build a Custom Grid Screen](./basegrid-guide/#build-a-custom-grid-screen)
for the recommended screen shape.

```ts
type RuntimeArgs = {
  schema: GridSchema;
  dataSource: GridDataSource;
  interaction?: GridInteractionConfig;
  initialPhantomsByPath?: Map<GridPath, PhantomRow[]>;
  phantomRows?: PhantomRowsConfig;
  onLoadedRowsBoundary?: (
    event: LoadedRowsBoundaryEvent,
  ) => Promise<SourceLoadResult> | false;
  on?: { [E in keyof GridEvents]?: (payload: GridEvents[E]) => void };
};

function createGridRuntime(args: RuntimeArgs): GridRuntime;

type LoadedRowsBoundaryEvent =
  | {
      kind: "cell";
      loadPath: GridPath;
      direction: "before" | "after";
      origin: CellCursor;
      colPolicy: "preserve" | "first" | "last";
      extend: boolean;
    }
  | {
      kind: "row";
      loadPath: GridPath;
      direction: "before" | "after";
      origin: RowCursor;
      extend: boolean;
    };
```

Outside React:

```ts
const runtime = createGridRuntime({
  schema,
  dataSource,
  interaction: CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION,
  on: {
    mutationCommitted(event) {
      console.log(event.kind);
    },
    levelStatusChanged({ path, status }) {
      console.log(path, status);
    },
  },
});
```

Dispose runtimes you create outside React:

```ts
const runtime = createGridRuntime({ schema, dataSource });

try {
  await runtime.sourceFor(rootPath("projects")).query?.refetch?.();
} finally {
  runtime.dispose();
}
```

### `useGridRuntimeEffect`

```ts
function useGridRuntimeEffect(
  create: () => GridRuntime,
  deps: readonly unknown[],
): GridRuntime | null;
```

Creates a React-owned runtime after commit and disposes it from effect cleanup.
The dependency list controls runtime replacement. Render `null` or loading UI
until the hook returns a runtime that matches the current dependencies.

## Runtime API

```ts
type GridRuntime = {
  schema: GridSchema;
  schemaTopology: SchemaTopology;
  interaction: GridInteractionConfig;
  coordinator: GridCoordinatorPublic;
  cursorManager: CursorManager;
  phantoms: PhantomChannel;

  registeredPaths(): GridPath[];
  subscribeRegistry(fn: () => void): () => void;

  schemaAt(path: GridPath): LevelSchema;
  snapshotFor(path: GridPath): LevelSnapshot;
  sourceStateFor(path: GridPath): LevelSourceState;
  sourceFor(path: GridPath): RuntimeLevelDataSource;
  controllerFor(path: GridPath): GridControllerPublic;
  materializedChildren(parentPath: GridPath, rowId: RowId): GridPath[];

  displayedRowsFor(path: GridPath): DisplayedRows;
  displayedRowSequenceFor(path: GridPath): DisplayedRowSequence;
  displayedRowFor(path: GridPath, rowId: RowId): LevelRow | undefined;
  subscribeDisplayedRowSequence(path: GridPath, fn: () => void): () => void;
  subscribeDisplayedRow(
    path: GridPath,
    rowId: RowId,
    fn: () => void,
  ): () => void;
  invalidateDisplayedRows(
    path: GridPath,
    reason: DisplayedRowsInvalidationReason,
  ): void;

  writeCell(path: GridPath, coord: Coord, value: unknown): void;
  applyChanges(path: GridPath, changes: CellChange[]): void;
  createRow(
    path: GridPath,
    node: TreeNode,
    atIndex?: number,
  ): Promise<CreateNodeResult>;
  removeRow(path: GridPath, rowKey: RowKey): Promise<void>;
  commitPhantomRow(
    path: GridPath,
    rowKey: RowKey,
    atIndex?: number,
  ): Promise<CreateNodeResult>;
  requestLoadedRowsBoundary(event: LoadedRowsBoundaryEvent): boolean;

  on: GridEmitter["on"];
  dispose(): void;
};
```

### Displayed Rows

```ts
const path = rootPath("projects");
const rows = runtime.displayedRowsFor(path);

for (const row of rows.rows) {
  console.log(row.id, row.kind, row.columns);
}
```

Use `displayedRowSequenceFor` when you only need ordered row refs:

```ts
const sequence = runtime.displayedRowSequenceFor(path);
const ids = sequence.rows.map((row) => row.id);
```

### Writes

```ts
const path = rootPath("projects");
const rowId = makeRowId(path, "project-1");

runtime.writeCell(path, { rowId, colId: "status" }, "done");

runtime.applyChanges(path, [
  { rowKey: "project-1", colId: "status", value: "done" },
  { rowKey: "project-1", colId: "completedAt", value: "2026-06-01" },
]);

await runtime.createRow(path, {
  levelName: "projects",
  columns: { id: "project-2", name: "Migration", status: "active" },
});

await runtime.removeRow(path, "project-2");
```

Write methods throw if the source for that path is readonly.

## Runtime Events

```ts
type GridEvents = {
  mutationCommitted: MutationCommittedEvent;
  cellSelectionChanged: {
    path: GridPath;
    selection: CellSelectionState | null;
  };
  rowSelectionChanged: {
    path: GridPath;
    selection: RowSelection;
  };
  cellReconciled: {
    path: GridPath;
    event: ReconcileEvent;
  };
  levelStatusChanged: {
    path: GridPath;
    status: LevelStatus;
    error?: Error;
  };
  phantomRowCommitted: {
    path: GridPath;
    rowKey: RowKey;
    node: TreeNode;
    atIndex: number;
  };
  phantomRowCreateFailed: { path: GridPath; rowKey: RowKey; reason: string };
};
```

Subscribe either at construction:

```ts
const runtime = createGridRuntime({
  schema,
  dataSource,
  on: {
    mutationCommitted(event) {
      audit(event);
    },
  },
});
```

or later:

```ts
const unsubscribe = runtime.on("cellReconciled", ({ event }) => {
  if (event.kind === "rejected") showSaveError(event.reason);
});
```

## React API

### `GridRuntimeProvider`

```tsx
function GridRuntimeProvider({
  runtime,
  children,
}: {
  runtime: GridRuntime;
  children: ReactNode;
}): JSX.Element;
```

Provides the runtime to BaseGrid React components and hooks.

```tsx
const runtime = useGridRuntimeEffect(
  () => createGridRuntime({ schema, dataSource }),
  [dataSource],
);

if (!runtime) return null;

return (
  <GridRuntimeProvider runtime={runtime}>
    <GridLevel path={rootPath(schema.rootLevel)} />
  </GridRuntimeProvider>
);
```

### `useGridRuntime`

```ts
function useGridRuntime(): GridRuntime;
```

Reads the runtime from context.

```tsx
function RefreshButton({ path }: { path: GridPath }) {
  const runtime = useGridRuntime();
  return (
    <button onClick={() => void runtime.sourceFor(path).query?.refetch?.()}>
      Refresh
    </button>
  );
}
```

### `GridLevel`

```tsx
function GridLevel({
  path,
  chrome,
  presentation,
}: {
  path: GridPath;
  chrome?: GridLevelChrome;
  presentation?: GridPresentation;
}): JSX.Element;

type GridLevelChrome = {
  renderHeader?: (ctx: GridChromeContext) => ReactNode;
  renderStatus?: (ctx: GridStatusContext) => ReactNode;
  renderEmpty?: (ctx: GridEmptyContext) => ReactNode;
  levelContainerClassName?: (ctx: GridChromeContext) => string | undefined;
  levelContainerStyle?: (ctx: GridChromeContext) => CSSProperties | undefined;
};

type GridChromeContext = {
  path: GridPath;
  levelName: string;
  presentation: GridPresentation;
  schema: ColumnSchema[];
};

type GridStatusContext = GridChromeContext & {
  state: LevelSourceState;
  retry?: () => Promise<SourceLoadResult>;
};

type GridEmptyContext = GridChromeContext & {
  state: Extract<LevelSourceState, { status: "ready" }>;
  phantomCount: number;
};
```

`GridLevel` renders a level and recursively mounts child levels under expanded
rows.

```tsx
<GridLevel
  path={rootPath("projects")}
  chrome={{
    renderHeader: ({ levelName }) => (
      <div data-grid-part="header">{levelName}</div>
    ),
    renderStatus: ({ state, retry }) =>
      state.status === "initialError" || state.status === "refreshError" ? (
        <button onClick={() => void retry?.()}>{state.error.message}</button>
      ) : null,
    renderEmpty: ({ levelName }) => <p>No {levelName} rows</p>,
  }}
/>
```

### React Store Hooks

```ts
function useLevelSnapshot(path: GridPath): LevelSnapshot;
function useLevelSourceState(path: GridPath): LevelSourceState;
function usePhantoms(path: GridPath): PhantomRow[];
function useDisplayedRowSequence(path: GridPath): DisplayedRowSequence;
function useDisplayedRow(path: GridPath, rowId: RowId): LevelRow;
function useActiveCell(): CellCursor | null;
function useActiveCellForPath(path: GridPath): Coord | null;
function useCellSelection(path: GridPath): CellSelectionState | null;
function useActiveRow(path: GridPath): RowCursor | null;
function useSelectedRows(path: GridPath): RowSelection;
function useSelectedRowIds(path: GridPath): readonly RowId[];
function useRowInteractionSnapshot(path: GridPath): RowInteractionSnapshot;
```

Example:

```tsx
function LevelStatus({ path }: { path: GridPath }) {
  const state = useLevelSourceState(path);
  return <span>{state.status}</span>;
}
```

Host components that sit next to a `GridLevel` should use these hooks instead
of subscribing to runtime internals directly:

```tsx
function TaskInspector({ path }: { path: GridPath }) {
  const activeCellInGrid = useActiveCell();
  const activeCell = useActiveCellForPath(path);
  const cellSelection = useCellSelection(path);
  const activeRow = useActiveRow(path);
  const selectedRows = useSelectedRows(path);
  const selectedRowIds = useSelectedRowIds(path);

  return (
    <aside>
      <p>Active row: {activeRow?.rowId ?? "none"}</p>
      <p>Active cell: {activeCell?.colId ?? "none"}</p>
      <p>Grid cursor path: {activeCellInGrid?.path ?? "none"}</p>
      <p>
        Cell range:{" "}
        {cellSelection
          ? `${cellSelection.anchor.rowId}:${cellSelection.anchor.colId} to ${cellSelection.head.rowId}:${cellSelection.head.colId}`
          : "none"}
      </p>
      <p>Selected row shape: {selectedRows?.kind ?? "none"}</p>
      <p>Selected rows: {selectedRowIds.length}</p>
    </aside>
  );
}
```

## Interaction API

The full interaction reference lives in
[BASEGRID-INTERACTIONS.md](./basegrid-interactions/). This section lists the
runtime-facing surface most BaseGrid screens use.

### Runtime Reads

```ts
runtime.activeRowFor(path); // RowCursor | null
runtime.selectedRowsFor(path); // RowSelection
runtime.selectedRowIds(path); // readonly RowId[]
runtime.rowInteractionSnapshotFor(path); // RowInteractionSnapshot

rowInteractionStatusFor(rowId, runtime.rowInteractionSnapshotFor(path));
// RowInteractionStatus: "idle" | "selected" | "cursor" | "cursor-selected"
```

### Subscriptions

```ts
runtime.subscribeActiveRow(path, callback);
runtime.subscribeSelectedRows(path, callback);
runtime.subscribeSelectedRowIds(path, callback);
runtime.subscribeRowInteractionSnapshot(path, callback);
```

### Commands

```ts
runtime.rowInteraction.setRowCursor({ path, rowId });
runtime.rowInteraction.clearRowCursor();
runtime.rowInteraction.selectRow(path, rowId);
runtime.rowInteraction.setRowSelection(path, selection);
runtime.rowInteraction.toggleRowSelection(path, rowId);
runtime.rowInteraction.extendRowSelectionTo(path, rowId);
runtime.rowInteraction.extendRowSelectionToCursor({ path, rowId });
runtime.rowInteraction.clearRowSelection(path);
```

### Presets

```ts
CELL_EDITING_GRID;
CELL_EDITING_NO_SELECTION_GRID;
CELL_GRID_WITH_ACTIVE_ROW;
CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION;
CELL_PRIMARY_WITH_SIDE_PANEL_ROW;
CELL_PRIMARY_WITH_SELECTED_SIDE_PANEL_ROW;
ROW_PRIMARY_MASTER_DETAIL;
ROW_MULTISELECT_LIST;
```

Pass a preset to `createGridRuntime`.

```ts
const runtime = createGridRuntime({
  schema,
  dataSource,
  interaction: ROW_MULTISELECT_LIST,
});
```

## Expansion API

Expansion lives on `runtime.coordinator`.

```ts
runtime.coordinator.toggleExpand(path, rowId);
```

Expansion resolves child data sources before it updates the expansion set.
`runtime.materializedChildren(path, rowId)` returns registered child paths in
schema order.

```ts
const projectPath = rootPath("projects");
const projectRowId = makeRowId(projectPath, "project-1");

runtime.coordinator.toggleExpand(projectPath, projectRowId);

const childPaths = runtime.materializedChildren(projectPath, projectRowId);
```

## Phantoms API

Phantoms are author-state rows layered into displayed rows. They are not stored
inside a data source until committed.

```ts
const runtime = createGridRuntime({
  schema,
  dataSource,
  initialPhantomsByPath: new Map([
    [
      rootPath("projects"),
      [{ rowKey: "draft-1", columns: { name: "New project" } }],
    ],
  ]),
});

await runtime.commitPhantomRow(rootPath("projects"), "draft-1");
```

`commitPhantomRow` inserts the phantom through the source's `createNode`,
removes the phantom from the phantom channel, and emits `phantomRowCommitted`.
If creation fails, the runtime emits `phantomRowCreateFailed` and leaves the
phantom available for retry.

## Styling and DOM Contract

BaseGrid renders stable data attributes for host styling.

Common attributes:

- `data-grid-part="root"` on a level root
- `data-grid-part="body"` on a level body
- `data-grid-path` on a level root
- `data-grid-depth` on a level root
- `data-active="true" | "false"` on a level root
- `data-row-active="true"` on active row elements
- `data-row-selected="true"` on selected row elements
- `data-row-interaction-status` on row elements
- `data-row-selectable` on row elements

Example:

```css
[data-grid-part="root"][data-active="false"] {
  opacity: 0.72;
}

[data-grid-part="row"][data-row-active="true"] {
  background: #eef4ff;
}

[data-grid-part="row"][data-row-selected="true"] {
  font-weight: 520;
}
```

ColumnPreset width helpers are useful when writing custom headers or toolbars:

```tsx
import { templateColumns } from "@sapporta/grid/column-preset";

function CustomHeader({ schema }: { schema: ColumnSchema[] }) {
  return (
    <div
      data-grid-part="header"
      style={{
        display: "grid",
        gridTemplateColumns: templateColumns(schema),
      }}
    >
      {schema.map((column) => (
        <div key={column.id}>{column.name}</div>
      ))}
    </div>
  );
}
```

## Construction Checklist

For a new BaseGrid, build in this order:

1. Define your `TreeNode` shape and stable row keys.
2. Create `ColumnSchema[]`, preferably with ColumnPreset helpers first.
3. Create a `GridSchema` with root and child levels.
4. Start with `inMemoryGridDataSource` or implement `GridDataSource`.
5. In React, call `useGridRuntimeEffect(() => createGridRuntime(...), deps)`
   and render after it returns a runtime.
6. Render `<GridRuntimeProvider>` and `<GridLevel path={rootPath(...)} />` from
   a view that receives the live grid.
7. Add runtime event handlers for saves, reconciliation, and status changes.
8. Add interaction config, row selection columns, and host UI.
9. Move to a custom data source when persistence or server-managed query state
   is needed.
## Related documentation
[Grid reference overview](/grid/reference/)
