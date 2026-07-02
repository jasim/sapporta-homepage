---
title: "Advanced Rows"
description:
  "Use Sapporta Grid row kinds for rollups, subtotals, footers, and unsaved
  insert rows."
---

Sapporta Grid renders more than ordinary data rows. The displayed row model can
include rollup rows, bracket rows, footer rows, and phantom rows for local
inserts. Use these when the grid is a working surface with nested calculations
or draft rows.

## Row kinds

Every rendered row has a `kind`. The grid uses that kind to decide editing,
selection, and keyboard capability. Your renderers and CSS can use it for
display.

| Kind       | Source            | Use it for                                               |
| ---------- | ----------------- | -------------------------------------------------------- |
| `data`     | `TreeNode`        | Ordinary source rows.                                    |
| `rollup`   | `TreeNode.rollup` | A derived summary row attached to a source row.          |
| `opening`  | `TreeNode.kind`   | Opening balance or section-start rows.                   |
| `closing`  | `TreeNode.kind`   | Closing balance or section-end rows.                     |
| `subtotal` | `TreeNode.kind`   | Intermediate subtotal rows.                              |
| `footer`   | `FooterRow`       | Level footers or child-level footers under a parent row. |
| `phantom`  | `PhantomRow`      | Unsaved insert rows owned by the runtime.                |

```ts
const tree: TreeNode[] = [
  {
    levelName: "accounts",
    columns: { id: "cash", name: "Cash" },
    rollup: { amount: 1200 },
    children: {
      entries: [
        {
          levelName: "entries",
          columns: { id: "entry-1", memo: "Deposit", amount: 1200 },
        },
      ],
    },
    childFooterRows: {
      entries: [
        {
          rowKey: "entries-total",
          columns: { memo: "Total", amount: 1200 },
        },
      ],
    },
  },
  {
    levelName: "accounts",
    kind: "subtotal",
    columns: { id: "assets-total", name: "Assets total", amount: 1200 },
  },
];
```

## Footers

Use level footers when the summary belongs to the whole level. Use
`childFooterRows` when the summary belongs to a specific parent row's child
level. Footer row keys only need to be stable inside their footer scope.

Footers are display rows. Treat them as read-only summary output unless your
workflow has a specific editing rule for them.

## Phantom rows

Phantom rows represent local insert state. They are separate from source data,
so the data source does not see them until the runtime commits a nonblank
phantom into a real source row.

A phantom can be:

- `editing` while the user is filling in a draft row
- `saving` while the create request is in flight
- `failed` when create failed and the draft should remain visible with an error

Keep phantom validation and persistence in the source or save path. The grid
keeps the draft row visible and stable; your host code decides when a draft is
blank, how to create the authoritative row, and how to show failure text.
