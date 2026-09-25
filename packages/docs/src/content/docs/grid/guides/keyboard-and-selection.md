---
title: "Keyboard and selection"
description:
  "Choose cell-grid or row-list interactions and configure focus, ranges, and
  row selection."
---

Sapporta Grid treats keyboard behavior as runtime configuration. Choose the
interaction model that matches the surface before you customize individual
cells.

Common presets include:

| Preset                                      | Use it for                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| `CELL_EDITING_GRID`                         | Editable spreadsheet behavior with cell focus and range selection.         |
| `CELL_EDITING_NO_SELECTION_GRID`            | Editable cells without range selection.                                    |
| `CELL_GRID_WITH_ACTIVE_ROW`                 | Editable cells with active-row highlighting.                               |
| `CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION`  | Editable cells with independent bulk row selection.                        |
| `CELL_PRIMARY_WITH_SIDE_PANEL_ROW`          | Editable cells with a detail panel following the cursor row.               |
| `CELL_PRIMARY_WITH_SELECTED_SIDE_PANEL_ROW` | Editable cells with an independently pinned detail row.                    |
| `ROW_PRIMARY_MASTER_DETAIL`                 | Row-first master/detail lists.                                             |
| `ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION` | Row-first master/detail lists where Enter and double-click run one action. |
| `ROW_MULTISELECT_LIST`                      | Multi-select row lists.                                                    |

Add a selection column when row selection is part of the workflow:

```ts
import { CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION } from "@sapporta/grid";
import { rowSelectionColumn, text } from "@sapporta/grid/column-preset";

const schema = {
  rootLevel: "tasks",
  levels: {
    tasks: {
      name: "tasks",
      rowHeaderColumn: { column: "__row_selection" },
      childLevels: [],
      columns: [
        rowSelectionColumn(),
        text({ id: "title", name: "Title", edit: "default" }),
      ],
      options: {},
    },
  },
};

const runtime = createGridRuntime({
  schema,
  dataSource,
  interaction: CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION,
});
```

Let the preset own focus, active row, and selection rules. Custom cells should
use the runtime state instead of creating a second keyboard model in component
state.

Cell selection and row selection are separate concepts. A cell range is a
rectangular selection inside one rendered level. Row selection identifies rows
for commands such as delete, export, bulk edit, or opening a side panel. Choose
the preset first, then add columns or toolbar actions that use the selected row
state.

Active-row state is separate from both selection types. It identifies one
current row for a preview or related-record surface. Read the grid-wide value
with `useGridActiveRow()` or `runtime.activeRow()`. Use a configured
`rowActivated` event for repeatable actions such as opening an edit route.

In a row list, `activeRow.keyboard.expansion: "enabled"` makes Space toggle the
active row's expansion, Right expand it, and Left collapse it.
`ROW_PRIMARY_MASTER_DETAIL` enables expansion and leaves Enter unassigned.
`ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION` also assigns Enter and double-click
to row activation. Shift+Space is reserved for row selection.

`ROW_MULTISELECT_LIST` keeps an independent multi-row selection. Shift+Space
toggles the active row and Shift+Up or Shift+Down extends the selection. With
the mouse, a click moves the row cursor, Shift-click selects the range from the
row cursor to the clicked row, and Cmd-click or Ctrl-click adds or removes one
row. See
[Row selection](/grid/reference/interactions/row-selection/#pointer-gestures)
for the rules in other configurations.

On a [tree level](/grid/guides/hierarchical-grids/#tree-data) the same keys
follow the tree. Right expands a collapsed row or moves to its first child. Left
collapses an expanded row or moves to its parent. Space toggles, and a row
without children ignores Right and Space. In a cell grid, Space on the tree
column toggles the row, and Enter toggles it when the tree cell is not editable.

Grid copy uses the active cell or cell range. It does not read row selection.
Keep row selection for row operations such as delete, export, bulk edit, or
side-panel workflows.

## Verify

Typecheck the example and exercise its visible loading, ready, interaction, and
failure states. Use only public `@sapporta/grid` export paths.

Continue with
[Interaction configuration and presets](/grid/reference/interactions/configuration-and-presets/).
