---
title: "Interactions"
description: "Configure cell-grid or row-list behavior, observe the active row, handle row activation, and use level-scoped selection."
---

Interaction configuration is fixed for the lifetime of a `GridRuntime`. The
configuration separates keyboard focus, cell selection, active-row context,
and row-operation selection.

## Interaction modes

`cell-grid` uses a cell cursor. Arrow keys move between cells and Shift+Arrow
can extend a rectangular cell range. Editing is available in this mode.

`row-list` uses a row cursor. Arrow keys move between selectable rows and may
extend row selection. It has no active cell or cell range.

```ts
type GridInteractionConfig =
  | CellGridInteractionConfig
  | RowListInteractionConfig;

type CellGridInteractionConfig = {
  readonly mode: "cell-grid";
  readonly activeCell: {
    readonly kind: "enabled";
    readonly keyboard: ActiveCellKeyboardConfig;
  };
  readonly selectedCells:
    | { readonly kind: "none" }
    | { readonly kind: "range" };
  readonly activeRow:
    | { readonly kind: "none" }
    | {
        readonly kind: "from-active-cell";
        readonly activation?: RowActivationConfig;
      };
  readonly selectedRows: SelectedRowsConfig;
};

type RowListInteractionConfig = {
  readonly mode: "row-list";
  readonly activeCell: { readonly kind: "none" };
  readonly selectedCells: { readonly kind: "none" };
  readonly activeRow: {
    readonly kind: "from-row-cursor";
    readonly keyboard: ActiveRowKeyboardConfig;
    readonly activation?: RowActivationConfig;
  };
  readonly selectedRows: SelectedRowsConfig;
};
```

Pass the configuration during construction:

```ts
const runtime = createGridRuntime({
  schema,
  dataSource,
  interaction: CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION,
});
```

`runtime.interaction` contains the normalized immutable configuration.

## Active-row state

The active row carries application context. It is separate from selected rows,
which identify operation targets.

```ts
const active = runtime.activeRow();

if (active?.row.kind === "data") {
  renderPreview(active.row.columns);
}

const unsubscribe = runtime.subscribeActiveRow(() => {
  renderPreview(runtime.activeRow()?.row.columns ?? null);
});
```

`runtime.activeRow()` resolves the global cursor across all registered paths.
It returns `{ row, level }` or `null`. The snapshot is identity-stable until
the active path, row identity, displayed row value, or level registration
changes. The subscription follows both cursor movement and changes to the
active row's displayed values.

`runtime.level(path).activeRow()` remains the path-local cursor projection and
returns `RowCursor | null`. When focus moves to a child path, the root level's
active row becomes `null` while `runtime.activeRow()` resolves the child row.

React components use `useGridActiveRow(runtime)`. A component inside
`GridRuntimeProvider` may call `useGridActiveRow()` without an argument. The
hook is already external-store-backed React state; copying it into `useState`
creates a second source of truth.

## Row activation

Active-row changes are state. Row activation is a repeatable semantic event.
Configure the input gestures on `activeRow.activation`, then react through the
runtime event:

```ts
type RowActivationConfig = {
  readonly startsOn: readonly ("enter" | "click" | "doubleClick")[];
};

const interaction = {
  ...ROW_PRIMARY_MASTER_DETAIL,
  activeRow: {
    ...ROW_PRIMARY_MASTER_DETAIL.activeRow,
    keyboard: {
      ...ROW_PRIMARY_MASTER_DETAIL.activeRow.keyboard,
      expansion: "left-right",
    },
    activation: { startsOn: ["enter", "doubleClick"] },
  },
} satisfies GridInteractionConfig;

const unsubscribe = runtime.on(
  "rowActivated",
  ({ activeRow, trigger }) => openRecord(activeRow.row, trigger),
);
```

The event contains the resolved `GridActiveRow` and a normalized trigger:

```ts
type RowActivationTrigger =
  | { readonly kind: "keyboard"; readonly gesture: "enter" }
  | {
      readonly kind: "pointer";
      readonly gesture: "click" | "doubleClick";
    };
```

The public type names are `RowActivationGesture`, `RowActivationConfig`,
`RowActivationTrigger`, `GridPointerInput`, `GridActiveRow`, and
`GridRowActivatedEvent`. `GridPointerInput` is the renderer-neutral pointer
shape used before the runtime accepts a gesture as a semantic activation. The
emitted trigger intentionally retains the gesture kind and omits raw pointer
modifiers.

Activation first moves the configured cursor to the row. The event fires only
when the row resolves as the runtime's active row. Activating the same row
twice emits two events. Listener count does not change interaction policy.

Pointer activation accepts an unmodified primary-button gesture. Alt, Control,
Meta, Shift, or a non-primary button suppresses the semantic activation. A
focusable structural row may activate even when it is not row-selectable, so
consumers must branch on `activeRow.row.kind` before treating columns as a
persisted record.

Interaction validation enforces these invariants:

- activation gestures are unique;
- `click` and `doubleClick` cannot both activate rows;
- row-list Enter cannot own both row activation and hierarchy expansion; and
- in cell-grid mode, editing and configured cell activation take precedence
  over row activation for the same gesture.

`RuntimeArgs.on.rowActivated` installs a listener before the root source is
acquired. `runtime.on("rowActivated", listener)` adds and removes listeners
during the runtime lifetime.

## Row selection

```ts
type SelectedRowsConfig =
  | { readonly kind: "none" }
  | {
      readonly kind: "enabled";
      readonly mode: "single" | "range" | "multi";
      readonly sync:
        | { readonly kind: "follows-active-row" }
        | { readonly kind: "independent" };
      readonly keyboard: {
        readonly space: "toggle-active-row" | "ignore";
      };
    };
```

`follows-active-row` derives the effective selection from the active row. It is
a read-only projection. `independent` stores a path-local row selection that
can differ from the active row.

```ts
type RowSelection =
  | { readonly kind: "single"; readonly rowId: RowId }
  | {
      readonly kind: "range";
      readonly anchor: RowId;
      readonly head: RowId;
    }
  | { readonly kind: "set"; readonly rowIds: ReadonlySet<RowId> }
  | null;
```

Read and change row state through a `GridLevelRuntime`:

```ts
const level = runtime.root;
const rowId = makeRowId(level.path, "task-1");

level.activeRow();
level.selectedRows();
level.selectedRowIds();
level.rowInteractionSnapshot();

level.selectRow(rowId);
level.toggleRowSelection(rowId);
level.extendRowSelectionTo(rowId);
level.clearRowSelection();
```

Selection commands normalize row ids against the current displayed rows and
the configured selection mode. Non-selectable and stale rows are removed.

## Subscriptions

Level subscriptions correspond to distinct read models:

```ts
level.subscribeActiveRow(() => {
  renderInspector(level.activeRow());
});

level.subscribeSelectedRows(() => {
  persistSelection(level.selectedRows());
});

level.subscribeSelectedRowIds(() => {
  updateCount(level.selectedRowIds().length);
});

level.subscribeRowInteractionSnapshot(() => {
  updateRowChrome(level.rowInteractionSnapshot());
});
```

`subscribeSelectedRows()` observes the configured selection value.
`subscribeSelectedRowIds()` also observes displayed-order changes that alter
the projected ids. `subscribeRowInteractionSnapshot()` is designed for row
decoration.

React components use the corresponding hooks:

```ts
useActiveCell();
useActiveCellForPath(path);
useCellSelection(path);
useActiveRow(path);
useSelectedRows(path);
useSelectedRowIds(path);
useRowInteractionSnapshot(path);
```

## Row selection chrome

`rowSelectionColumn()` creates a normal `ColumnSchema` that reads path-local
row status and invokes the level selection commands.

```ts
import { rowSelectionColumn, text } from "@sapporta/grid/column-preset";

const columns = [
  rowSelectionColumn(),
  text({ id: "title", name: "Title", edit: "default" }),
];
```

Set the level's `rowHeaderColumn` to `{ column: selectorColumnId }` when
row-header behavior should be attached to that column. Use
`"empty-selectable-cell"` for a separate row header or `"none"` when the level
has no row header.

## Cross-path operation targets

Stored selection remains path-local. Commands that intentionally span the
expanded hierarchy use `runtime.rowOperations`:

```ts
const selected = runtime.rowOperations.selectedDataTargets();
const result = await runtime.rowOperations.remove(selected);

if (result.kind === "partial") {
  showError(result.failed.rowKey, result.error);
}
```

`runtime.rowOperations.targets()` uses explicit row selection when present on a
path and falls back to rows covered by cell selection. It returns current
operation targets in registered-level order.

## Cursor and controller access

Raw cursor and controller APIs are advanced composition surfaces. Import them
from `@sapporta/grid/advanced`:

```ts
import { controllerFor, cursorManagerFor } from "@sapporta/grid/advanced";

const level = runtime.root;
const rowId = makeRowId(level.path, "task-1");
const cursors = cursorManagerFor(runtime);

cursors.moveCellCursorTo({ path: level.path, rowId, colId: "title" });
cursors.extendCellSelectionTo({ path: level.path, rowId, colId: "status" });
cursors.clearCellRange(level.path);

const controller = controllerFor(runtime, level.path);
controller.startEdit({ rowId, colId: "title" }, "f2");
controller.cancelEdit();
```

`cursorManagerFor(runtime)` returns one identity-stable facade per runtime.
`controllerFor(runtime, path)` returns one facade for the current level
registration. Commands throw after the runtime or registration is disposed.

## Presets

The exported presets are ordinary `GridInteractionConfig` values:

| Preset | Mode | Cell selection | Active row | Selected rows |
| --- | --- | --- | --- | --- |
| `CELL_EDITING_GRID` | cell-grid | range | none | none |
| `CELL_EDITING_NO_SELECTION_GRID` | cell-grid | none | none | none |
| `CELL_GRID_WITH_ACTIVE_ROW` | cell-grid | range | active cell | none |
| `CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION` | cell-grid | range | active cell | independent multi |
| `CELL_PRIMARY_WITH_SIDE_PANEL_ROW` | cell-grid | range | active cell | follows active row |
| `CELL_PRIMARY_WITH_SELECTED_SIDE_PANEL_ROW` | cell-grid | range | active cell | independent single |
| `ROW_PRIMARY_MASTER_DETAIL` | row-list | none | row cursor | follows active row |
| `ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION` | row-list | none | row cursor; Enter and double-click activate | follows active row |
| `ROW_MULTISELECT_LIST` | row-list | none | row cursor | independent multi |

Use `satisfies GridInteractionConfig` for custom configurations:

```ts
const interaction = {
  mode: "row-list",
  activeCell: { kind: "none" },
  selectedCells: { kind: "none" },
  activeRow: {
    kind: "from-row-cursor",
    keyboard: {
      arrows: "move-active-row",
      shiftArrows: "extend-selected-rows",
      expansion: "left-right-enter",
    },
  },
  selectedRows: {
    kind: "enabled",
    mode: "range",
    sync: { kind: "independent" },
    keyboard: { space: "toggle-active-row" },
  },
} satisfies GridInteractionConfig;
```

## Styling contract

Grid rows expose interaction state through data attributes. Use the attributes
for chrome rather than reading controller state from each cell:

```html
<div
  data-grid-part="row"
  data-row-active="true"
  data-row-selected="true"
  data-row-kind="data"
></div>
```

See [DOM and styling contract](/grid/reference/dom-and-styling-contract/) for
the complete attribute surface.

## Related documentation

- [BaseGrid](/grid/reference/base-grid/)
- [Keyboard and selection](/grid/guides/keyboard-and-selection/)
- [ColumnPreset](/grid/reference/column-preset/)
