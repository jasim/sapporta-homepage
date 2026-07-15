---
title: "Interactions"
description: "Configure cell-grid or row-list behavior and use level-scoped selection with advanced cursor composition."
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
    | { readonly kind: "from-active-cell" };
  readonly selectedRows: SelectedRowsConfig;
};

type RowListInteractionConfig = {
  readonly mode: "row-list";
  readonly activeCell: { readonly kind: "none" };
  readonly selectedCells: { readonly kind: "none" };
  readonly activeRow: {
    readonly kind: "from-row-cursor";
    readonly keyboard: ActiveRowKeyboardConfig;
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
