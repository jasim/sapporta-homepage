---
title: "Grid DOM state contract"
description:
  "Look up stable row, cell, and level attributes and visual precedence."
---

## Identity

`@sapporta/grid/index.css` and public DOM state attributes. GridCore renders
grid mechanics and stable DOM state. It does not own product visuals. Style
rows, cells, nested levels, and editing state with `data-grid-part`,
`data-row-*`, and `data-cell-*` selectors.

This page enumerates the stable DOM attributes application CSS may target. For
complete selectors and styling recipes, use the
[Styling guide](/grid/guides/styling/).

## Styling Contract

### Row Attributes

```html
<div
  data-grid-part="row"
  data-row-kind="data"
  data-row-active="true"
  data-row-selected="true"
  data-row-interaction-status="cursor-selected"
  data-row-selectable="true"
  aria-selected="true"
/>
```

| Attribute                     | Meaning                                              |
| ----------------------------- | ---------------------------------------------------- |
| `data-grid-part="row"`        | Identifies a body row.                               |
| `data-row-kind`               | Row kind, such as `data` or `phantom`.               |
| `data-row-active="true"`      | This row is the current row.                         |
| `data-row-selected="true"`    | This row is in the effective row selection.          |
| `data-row-interaction-status` | Combined row cursor and row selection status.        |
| `data-row-selectable`         | Whether row-operation selection can target this row. |
| `aria-selected="true"`        | Present when the row is selected.                    |

Prefer `data-row-active` and `data-row-selected` for styling. Use
`data-row-interaction-status` only when one combined status value is genuinely
more convenient.

Rows of a [tree level](/grid/guides/hierarchical-grids/#tree-data) carry their
position in the tree:

| Attribute                  | Meaning                                                                   |
| -------------------------- | ------------------------------------------------------------------------- |
| `data-tree-depth`          | Depth in the tree, with top-level rows at `0`.                            |
| `data-tree-context="true"` | The row is present only because a descendant matched the source's filter. |
| `aria-level`               | Depth plus one.                                                           |
| `aria-expanded`            | Whether the row is expanded; present only on rows with children.          |
| `aria-setsize`             | Number of siblings, including the row.                                    |
| `aria-posinset`            | One-based position among its siblings.                                    |

### Cell Attributes

```html
<div
  role="gridcell"
  data-grid-part="cell"
  data-cell-status="focus"
  data-col-id="name"
/>
```

| Attribute                         | Meaning                       |
| --------------------------------- | ----------------------------- |
| `data-grid-part="cell"`           | Identifies a body cell.       |
| `data-cell-status="focus"`        | The active cell.              |
| `data-cell-status="in-selection"` | A cell in the selected range. |
| `data-cell-status="editing"`      | A cell with an open editor.   |
| `data-col-id`                     | Column id.                    |

### Level Attributes

```html
<div
  data-grid-part="root"
  data-grid-path="projects"
  data-grid-depth="0"
  data-active="true"
/>
```

| Attribute               | Meaning                                    |
| ----------------------- | ------------------------------------------ |
| `data-grid-part="root"` | Identifies a grid level root.              |
| `data-grid-path`        | Stable logical path for this level.        |
| `data-grid-depth`       | Nesting depth, with root at `0`.           |
| `data-active`           | Whether this level owns the active cursor. |

### Part Hooks

Inside cells and levels, `data-grid-part` names the parts application CSS can
target:

| Part                                                 | Element                                                                                               |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `expand-cell`                                        | A cell that holds a child-level expansion control.                                                    |
| `expand-chevron`                                     | The expand or collapse button of a row that can expand.                                               |
| `expand-placeholder`                                 | The chevron's space on a row that cannot expand, such as a footer, subtotal, opening, or closing row. |
| `expand-content`                                     | The cell content beside the chevron or placeholder.                                                   |
| `tree-cell`                                          | The tree column's frame, indented by the row's depth.                                                 |
| `tree-chevron`                                       | The expand or collapse button of a tree row with children.                                            |
| `tree-placeholder`                                   | The chevron's space on a tree row without children.                                                   |
| `tree-content`                                       | The cell content beside the chevron or placeholder.                                                   |
| `text-cell`                                          | The value of a ColumnPreset text cell.                                                                |
| `selection-summary`                                  | The row that shows a sum under each selected numeric column.                                          |
| `selection-summary-content`                          | One column's summary.                                                                                 |
| `selection-summary-label`, `selection-summary-value` | The summary's label (`Sum`) and its value.                                                            |
| `level-status`, `level-status-text`                  | A level's loading or error band and its message.                                                      |
| `level-empty`                                        | The empty state of a level with no rows.                                                              |

`expand-placeholder` keeps the chevron's width, so cell content lines up across
rows that can and cannot expand. `tree-placeholder` does the same in a tree
column. `tree-cell` also carries `data-tree-depth`, and on a row that can expand
`data-expandable="true"` and `data-expanded`.

## Precedence

When multiple rules can apply, order application CSS from broad to specific:

1. base row and phantom row
2. hover row
3. selected row
4. active row
5. active + selected row
6. cell range
7. active cell
8. editing cell

The Sapporta preset follows the same visual order with low-specificity
selectors, so normal application selectors such as
`.projectGrid [data-grid-part="row"][data-row-active="true"]` override it.

## Related documentation

- [Styling](/grid/guides/styling/)
- [Interaction configuration and presets](/grid/reference/interactions/configuration-and-presets/)
- [Grid reference overview](/grid/reference/)
