---
title: "Columns And Editors"
description:
  "Use Sapporta Grid column presets for common editable cells and replace them
  when a product workflow needs custom rendering."
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

The column preset import path is singular:
`@sapporta/grid/column-preset`.

| Helper               | Use it for                                                                    |
| -------------------- | ----------------------------------------------------------------------------- |
| `identifier`         | Stable ids or row keys that should be visible but rarely edited.              |
| `text`               | Short or long text cells.                                                     |
| `number`             | Plain numeric values.                                                         |
| `currency`           | Money-like numeric values with currency formatting.                           |
| `percentage`         | Ratio or percentage values.                                                   |
| `date`               | Date strings with date-aware formatting and editing.                          |
| `boolean`            | True/false values.                                                            |
| `select`             | Enum-like values with a fixed option list.                                    |
| `foreignKey`         | Stored ids that should use lookup behavior.                                   |
| `lookupValue`        | Display-only lookup labels supplied by the host.                              |
| `rowSelectionColumn` | Checkbox selection when row operations are part of the interaction model.     |
| `column`             | A lower-level escape hatch for a custom renderer or editor contract.          |

Use a raw column only when the cell needs a fully custom renderer, editor,
parser, comparator, or activation contract. Otherwise, prefer a preset and
replace only the renderer or behavior that is product-specific.

Move to a custom column when the cell has workflow behavior:

- an action button
- a computed value
- a status badge with product-specific states
- an editor that calls domain code
- a cell activation that opens a panel or dialog

Keep custom cells narrow. Let the grid own focus and editing state; let the cell
own only its product rendering and any activation action.
