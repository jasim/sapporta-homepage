---
title: "Summary rows and footers"
description: "Render rollups, boundary rows, subtotals, and scoped footers."
---

Use source-provided row kinds for derived, boundary, and footer output. These
rows belong to the displayed snapshot rather than the runtime's local insertion
state.

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

```ts
const tree: TreeNode[] = [
  {
    rowKey: "cash",
    levelName: "accounts",
    columns: { id: "cash", name: "Cash" },
    rollup: { amount: 1200 },
    children: {
      entries: [
        {
          rowKey: "entry-1",
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
    rowKey: "assets-total",
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

## Verify

Typecheck the example and exercise its visible loading, ready, interaction, and
failure states. Use only public `@sapporta/grid` export paths.

Use
[Phantom rows and inserts](/grid/guides/advanced-rows/phantom-rows-and-inserts/)
when the row represents an unsaved insertion rather than source-provided summary
output.
