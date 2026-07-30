---
title: "Interaction configuration and presets"
description:
  "Choose cell-grid or row-list behavior and configure keyboard, cell, and row
  state."
---

Choose the interaction model before customizing individual cells. The normalized
configuration is immutable for the lifetime of the runtime.

## Interaction modes

`cell-grid` uses a cell cursor. Arrow keys move between cells and Shift+Arrow
can extend a rectangular cell range. Editing is available in this mode.

`row-list` uses a row cursor. Arrow keys move between selectable rows and may
extend row selection. It has no active cell or cell range.

```ts
type GridInteractionConfig =
  CellGridInteractionConfig | RowListInteractionConfig;

type CellGridInteractionConfig = {
  readonly mode: "cell-grid";
  readonly activeCell: {
    readonly kind: "enabled";
    readonly keyboard: ActiveCellKeyboardConfig;
  };
  readonly selectedCells:
    { readonly kind: "none" } | { readonly kind: "range" };
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

## Presets

The exported presets are ordinary `GridInteractionConfig` values:

| Preset                                      | Mode      | Cell selection | Active row                                  | Selected rows      |
| ------------------------------------------- | --------- | -------------- | ------------------------------------------- | ------------------ |
| `CELL_EDITING_GRID`                         | cell-grid | range          | none                                        | none               |
| `CELL_EDITING_NO_SELECTION_GRID`            | cell-grid | none           | none                                        | none               |
| `CELL_GRID_WITH_ACTIVE_ROW`                 | cell-grid | range          | active cell                                 | none               |
| `CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION`  | cell-grid | range          | active cell                                 | independent multi  |
| `CELL_PRIMARY_WITH_SIDE_PANEL_ROW`          | cell-grid | range          | active cell                                 | follows active row |
| `CELL_PRIMARY_WITH_SELECTED_SIDE_PANEL_ROW` | cell-grid | range          | active cell                                 | independent single |
| `ROW_PRIMARY_MASTER_DETAIL`                 | row-list  | none           | row cursor                                  | follows active row |
| `ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION` | row-list  | none           | row cursor; Enter and double-click activate | follows active row |
| `ROW_MULTISELECT_LIST`                      | row-list  | none           | row cursor                                  | independent multi  |

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

## Related documentation

- [Keyboard and selection](/grid/guides/keyboard-and-selection/)
- [Active rows and row activation](/grid/reference/interactions/active-row-and-activation/)
- [Row selection](/grid/reference/interactions/row-selection/)
