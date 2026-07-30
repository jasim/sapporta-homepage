---
title: "Grid interaction and selection"
description:
  "Choose Grid keyboard, active-row, activation, and selection semantics before
  implementing custom commands or detail regions."
---

The interaction preset decides what arrow keys, Enter, double-click, and
selection mean before a custom cell handles them. Presets configure interaction;
the application still renders any side panel or master-detail layout.

| Preset                                      | Primary use                                      |
| ------------------------------------------- | ------------------------------------------------ |
| `CELL_EDITING_GRID`                         | Spreadsheet-style entry                          |
| `CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION`  | Cell editing plus bulk row actions               |
| `CELL_PRIMARY_WITH_SIDE_PANEL_ROW`          | Detail follows the cell cursor                   |
| `CELL_PRIMARY_WITH_SELECTED_SIDE_PANEL_ROW` | Detail stays on a selected row                   |
| `ROW_PRIMARY_MASTER_DETAIL`                 | Row navigation and hierarchy                     |
| `ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION` | Row navigation plus Enter or double-click action |
| `ROW_MULTISELECT_LIST`                      | Command-oriented bulk work                       |

Cell selection owns focus, ranges, copy, and editing. Row selection identifies
records for a panel or bulk operation. The active row identifies one current
record. These states may point at the same row, but they are not synonyms.

React code reads runtime-backed state through hooks:

```tsx
import { useActiveRow, useSelectedRowIds, type GridPath } from "@sapporta/grid";

function RowContext({ path }: { path: GridPath }) {
  const active = useActiveRow(path);
  const selected = useSelectedRowIds(path);

  return (
    <span>{active ? `${selected.length} selected` : "No active row"}</span>
  );
}
```

Use the active row for a detail region that follows navigation. Use a
`rowActivated` event for a repeatable command: pressing Enter on the same row
twice should run the command twice even though active-row state did not change.

Interaction state does not change persistence or authorization. A selected ID,
active row, hidden column, or fixed client filter grants no server authority.

## Related documentation

- [Grid-first record workflows](/docs/guides/generated-surfaces/grid-first-record-workflows/)
- [Low-level TGrid sessions](/docs/guides/generated-surfaces/low-level-tgrid-sessions/)
- [Interactions](/grid/reference/interactions/)
- [Keyboard and selection](/grid/guides/keyboard-and-selection/)
