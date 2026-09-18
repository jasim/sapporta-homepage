---
title: "Styling"
description:
  "Style grid sizing and public row, cell, level, selection, and editing states."
---

This guide shows application styling recipes. The stable selector inventory
lives in the
[Grid DOM state contract](/grid/reference/dom-and-styling-contract/).

Import the package stylesheet once:

```ts
import "@sapporta/grid/index.css";
```

Then put the grid inside a container with stable dimensions:

```tsx
<div className="task-grid-shell">
  <GridRuntimeProvider runtime={runtime}>
    <GridLevel path={rootPath("tasks")} />
  </GridRuntimeProvider>
</div>
```

```css
.task-grid-shell {
  block-size: min(42rem, 80vh);
  border: 1px solid var(--rule);
  min-inline-size: 0;
}
```

Stable dimensions matter because focus rings, editors, hover state, and loading
state should not resize the page around the user.

## Choose the states your Grid uses

Styling follows the interaction config. If the grid does not enable active rows,
row selection, or cell range selection, GridCore will not render those states.

```ts
createGridRuntime({
  schema,
  dataSource,
  interaction: CELL_GRID_WITH_ACTIVE_ROW,
});
```

Common choices:

| Goal                                        | Interaction shape                         |
| ------------------------------------------- | ----------------------------------------- |
| Spreadsheet focus and editing               | Active cell                               |
| Spreadsheet range selection                 | Active cell + cell selection              |
| Highlight the row under the active cell     | Active cell + active row                  |
| Bulk actions on checked rows                | Active cell or row cursor + row selection |
| Master-detail panel that follows navigation | Active row + selected rows that follow it |

See
[Interaction configuration and presets](/grid/reference/interactions/configuration-and-presets/)
for the available interaction models and keyboard behavior.

## Put a class on the Grid

For a direct GridCore composition, put the class on a wrapper or supply it
through your grid chrome:

```tsx
<div className="projectGrid">
  <GridRuntimeProvider runtime={runtime}>
    <GridLevel path={rootPath("projects")} />
  </GridRuntimeProvider>
</div>
```

For Sapporta framework table-grid root styling, see
[the framework table-grid reference](/docs/reference/frontend/tgrid/).

## Highlight the current row

GridCore marks the current row with `data-row-active="true"`:

```css
.projectGrid [data-grid-part="row"][data-row-active="true"] {
  background: #eef4ff;
}

.projectGrid [data-grid-part="row"][data-row-active="true"]::before {
  background: #2563eb;
  content: "";
  inset-block: 0;
  inset-inline-start: 0;
  pointer-events: none;
  position: absolute;
  width: 2px;
}
```

## Style selected rows

GridCore marks selected rows with `data-row-selected="true"`:

```css
.projectGrid [data-grid-part="row"][data-row-selected="true"] {
  background: #eef4ff;
}

.projectGrid
  [data-grid-part="row"][data-row-active="true"][data-row-selected="true"] {
  background: #dbeafe;
}
```

Use `aria-selected="true"` for accessibility-aware selectors when that is more
appropriate, but prefer `data-row-selected` for visual chrome.

## Style the active cell

GridCore marks the active cell with `data-cell-status="focus"`:

```css
.projectGrid [data-grid-part="cell"][data-cell-status="focus"] {
  background: white;
  box-shadow: inset 0 0 0 2px #2563eb;
  z-index: 3;
}
```

## Style cell range selection

Cells in the selected range are marked with `data-cell-status="in-selection"`:

```css
.projectGrid [data-grid-part="cell"][data-cell-status="in-selection"] {
  background: #eaf1ff;
}
```

When focus moves to another nested level, the inactive level root has
`data-active="false"`. Use that root state when inactive cell chrome should look
different:

```css
.projectGrid
  [data-grid-part="root"][data-active="false"]
  [data-grid-part="cell"][data-cell-status="focus"] {
  background: #f3f4f6;
  box-shadow: inset 0 0 0 1px #9ca3af;
}
```

## Style editing

When an editor is open, the cell is marked with `data-cell-status="editing"`:

```css
.projectGrid [data-grid-part="cell"][data-cell-status="editing"] {
  background: white;
  box-shadow: inset 0 0 0 2px #16a34a;
  z-index: 3;
}
```

Editing state should usually take precedence over range selection for the same
cell.

## Style hover and phantom rows

Hover is for discoverability. Keep it lower priority than active or selected row
states:

```css
.projectGrid
  [data-grid-part="row"]:not([data-row-selected="true"]):not(
    [data-row-active="true"]
  ):hover {
  background: #f7f7f7;
}
```

Phantom rows are rows created by insertion flows before they are saved:

```css
.projectGrid [data-grid-part="row"][data-row-kind="phantom"] {
  background: #fff7ed;
}
```

Do not recreate focus, selection, or active-row state in CSS classes managed
outside the runtime. The DOM data attributes already follow the configured
interaction preset.

## Tune the preset's spacing

The ColumnPreset chrome sets `--grid-*` values on each level element. The values
below read a `--sap-grid-*` variable first, so an application sets them once on
`:root` or on any ancestor of the grid:

```css
:root {
  --sap-grid-cell-padding: 0 14px;
  --sap-grid-header-cell-padding: 0 14px;
  --sap-grid-header-font-weight: 600;
  --sap-grid-row-header-column-width: 48px;
  --sap-grid-nested-row-header-column-width: 36px;
  --sap-grid-nested-cell-min-height: 44px;
}
```

| Variable                                    | Default                    | Sets                                  |
| ------------------------------------------- | -------------------------- | ------------------------------------- |
| `--sap-grid-cell-padding`                   | `0 10px`                   | Body cell padding                     |
| `--sap-grid-header-cell-padding`            | `0 10px`                   | Header cell padding                   |
| `--sap-grid-header-font-weight`             | `760`                      | Header text weight                    |
| `--sap-grid-header-letter-spacing`          | `var(--tracking-sap-head)` | Header letter spacing                 |
| `--sap-grid-row-header-column-width`        | `40px`                     | Row header column on the root level   |
| `--sap-grid-nested-row-header-column-width` | `30px`                     | Row header column on nested levels    |
| `--sap-grid-nested-cell-min-height`         | `31px`                     | Minimum cell height on nested levels  |
| `--sap-grid-nested-indent`                  | `58px`                     | Indent of the first nested level      |
| `--sap-grid-nested-indent-deep`             | `46px`                     | Indent of every level below that      |
| `--sap-grid-tree-indent`                    | `18px`                     | Indent of each depth in a tree column |

Font sizes and root-level row and header heights come from the `text-sap-body`,
`text-sap-label`, `h-sap-row`, and `h-sap-header` tiers; see
[Theme tokens and scales](/docs/reference/frontend/theme-tokens-and-scales/).
Column widths come from `columnSizing.minWidths` on the chrome; see
[ColumnPreset](/grid/reference/column-preset/#preset-chrome-and-column-sizing).
Other `--grid-*` values are set per level by the application's own CSS.

A [tree column](/grid/guides/hierarchical-grids/#tree-data) reads three more
values, which inherit from any ancestor of the grid: `--grid-tree-gap` (`2px`)
between the chevron and the content, `--grid-tree-chevron-size` (`20px`) for the
chevron and its placeholder, and `--grid-tree-context-color` for rows present
only as the ancestor of a filter match. The preset draws those rows in
`var(--sap-fg-muted)`:

```css
.accountsGrid {
  --sap-grid-tree-indent: 24px;
  --grid-tree-context-color: var(--sap-fg-subtle);
}

.accountsGrid [data-grid-part="row"][data-tree-depth="0"] {
  font-weight: 600;
}
```

`withTreeColumn(column, { indentStep: "24px" })` sets the indent of one column.

## Verify

Typecheck the example and exercise its visible loading, ready, interaction, and
failure states. Use only public `@sapporta/grid` export paths.

Continue with the
[Grid DOM state contract](/grid/reference/dom-and-styling-contract/).
