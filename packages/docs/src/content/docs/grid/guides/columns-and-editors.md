---
title: "Columns and editors"
description:
  "Build columns with ColumnPreset and add raw renderers or editors when needed."
---

Column presets cover the common editable cells first:

```ts
import {
  boolean,
  currency,
  date,
  number,
  percentage,
  rowSelectionColumn,
  select,
  text,
} from "@sapporta/grid/column-preset";

const columns = [
  rowSelectionColumn(),
  text({ id: "title", name: "Title", edit: "default", width: "fill" }),
  select({
    id: "status",
    name: "Status",
    edit: "default",
    options: [
      { value: "todo", label: "To do" },
      { value: "doing", label: "Doing" },
      { value: "done", label: "Done" },
    ],
  }),
  number({ id: "quantity", name: "Qty", edit: "default" }),
  currency({ id: "amount", name: "Amount" }),
  percentage({ id: "margin", name: "Margin" }),
  date({ id: "due", name: "Due" }),
  boolean({ id: "blocked", name: "Blocked", edit: "default" }),
];
```

Use presets when the cell is mostly standard and the product value is in the
data, not in the renderer. They provide parsing, formatting, editing behavior,
width defaults, and ordinary display chrome.

Number, currency, and percentage presets keep raw text while an editor is open
and parse it at commit. Intermediate values such as `-` or `12.` remain visible.
The generic numeric grammar accepts commas and surrounding whitespace, produces
finite numbers, treats empty input as a `null` candidate, and preserves invalid
text for the host save boundary.

The select preset opens a searchable inline combobox. Typing filters option
labels and does not create a new value. Object options preserve exact value
identity with `Object.is`, so `1` and `"1"` can coexist. A commit always uses
the chosen option's original value.

The column preset import path is singular: `@sapporta/grid/column-preset`.

| Helper               | Use it for                                                                    |
| -------------------- | ----------------------------------------------------------------------------- |
| `identifier`         | Stable ids or row keys that should be visible but rarely edited.              |
| `text`               | Short or long text cells.                                                     |
| `number`             | Plain numeric values.                                                         |
| `currency`           | Money-like numeric values with currency formatting.                           |
| `percentage`         | Ratio or percentage values.                                                   |
| `date`               | Date strings with date-aware formatting and editing.                          |
| `boolean`            | True/false values.                                                            |
| `select`             | Searchable fixed options with exact string, number, or object value identity. |
| `foreignKey`         | Stored ids that should use lookup behavior.                                   |
| `lookupValue`        | Display-only lookup labels supplied by the host.                              |
| `rowSelectionColumn` | Checkbox selection when row operations are part of the interaction model.     |
| `column`             | A lower-level escape hatch for a custom renderer or editor contract.          |

Use a raw column only when the cell needs a fully custom renderer, editor,
parser, comparator, or activation contract. Otherwise, prefer a preset and
replace only the renderer or behavior that is product-specific.

A `renderCell` override receives `defaultContent`: the cell the preset would
have rendered on its own, formatting and truncation included. Wrap it to
decorate the built-in cell, or ignore it to replace the cell outright. Grid
cells show no tooltip by default; to add one, wrap `defaultContent` in
`CellTooltip`:

```tsx
import { CellTooltip, text } from "@sapporta/grid/column-preset";

text({
  id: "title",
  name: "Title",
  renderCell: ({ defaultContent, row }) => (
    <CellTooltip content={String(row.columns.summary ?? "")}>
      {defaultContent}
    </CellTooltip>
  ),
});
```

An empty `content` renders the cell without a tooltip, so a tooltip can be
shown on the rows that need one and left off elsewhere.

Copy is column behavior too. Plain columns copy their raw value by default,
while select and lookup-style presets can contribute both a stored value and a
label. Use [Copying Grid Data](/grid/guides/copying-grid-data/) when a column
needs a different clipboard contract.

Move to a custom column when the cell has workflow behavior:

- an action button
- a computed value
- a status badge with product-specific states
- an editor that calls domain code
- a cell activation that opens a panel or dialog

Keep custom cells narrow. Let the grid own focus and editing state; let the cell
own only its product rendering and any activation action.

## Verify

Typecheck the example and exercise its visible loading, ready, interaction, and
failure states. Use only public `@sapporta/grid` export paths. Continue with
[ColumnPreset](/grid/reference/column-preset/).
