---
title: "Keyboard And Selection"
description:
  "Choose Sapporta Grid interaction presets for editing, active rows, range
  selection, and row selection."
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
      interaction: CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION,
      childLevels: [],
      columns: [
        rowSelectionColumn(),
        text({ id: "title", name: "Title", edit: "default" }),
      ],
    },
  },
};
```

Let the preset own focus, active row, and selection rules. Custom cells should
use the runtime state instead of creating a second keyboard model in component
state.

Cell selection and row selection are separate concepts. A cell range is a
rectangular selection inside one rendered level. Row selection identifies rows
for commands such as delete, export, bulk edit, or opening a side panel. Choose
the preset first, then add columns or toolbar actions that use the selected row
state.
