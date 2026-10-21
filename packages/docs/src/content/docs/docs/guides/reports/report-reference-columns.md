---
title: "Name table rows in report cells"
description:
  "Declare which table row a report column names, send the rows' computed
  values with the report, and draw the cells with the table's label slot."
---

Many report columns show the name of a table row, such as the account of each
ledger line. A `reference` on the column says which row each cell names. The
report grid then draws those cells with the referenced table's label slot, the
same drawing that grids and pickers use for that table. For example, an
application whose account label slot shows the parent path beside the name gets
the same drawing in every report that names accounts.
[Show rows with their captions and display slots](/docs/guides/generated-surfaces/row-captions-and-display-slots/)
describes label slots.

## Declare a reference column

The cell's value stays the label text, chosen by the report's SQL. The row's id
goes in another column of the same level, usually visually hidden, and
`reference.idColumn` names that column:

```ts
import type { GridDataset } from "@sapporta/shared/grid-dataset";

type LedgerLine = {
  id: number;
  account_id: number;
  account_name: string;
  amount: number;
};

export function ledgerDataset(lines: readonly LedgerLine[]): GridDataset {
  return {
    name: "ledger",
    label: "Ledger",
    rootLevel: "line",
    levels: {
      line: {
        columns: [
          {
            id: "account_id",
            label: "Account ID",
            kind: "number",
            visuallyHidden: true,
          },
          {
            id: "account",
            label: "Account",
            kind: "text",
            reference: { table: "accounts", idColumn: "account_id" },
          },
          {
            id: "amount",
            label: "Amount",
            kind: "number",
            displayFormat: "currency",
          },
        ],
        childLevels: [],
      },
    },
    nodes: lines.map((line) => ({
      rowKey: String(line.id),
      levelName: "line",
      columns: {
        account_id: line.account_id,
        account: line.account_name,
        amount: line.amount,
      },
    })),
  };
}
```

`reference.table` is the SQL name of the referenced table. `idColumn` must be a
column of the same level. `ReportGridDataset` refuses a dataset whose `idColumn`
is missing from its level, and `gridDatasetReferenceProblems(dataset)` reports
the same problem in a mapper test:

```ts
import { gridDatasetReferenceProblems } from "@sapporta/shared/grid-dataset";

expect(gridDatasetReferenceProblems(ledgerDataset(lines))).toEqual([]);
```

## Send computed values with the report

A label slot that reads computed fields needs their values for every row the
report names. `attachReferenceComputed()` computes them on the server, once per
referenced table, and returns the dataset with `computed` set:

```ts
import { attachReferenceComputed } from "@sapporta/server";
import { accounts } from "../schema/accounts.js";

const dataset = ledgerDataset(await loadVisibleLedgerLines(db, auth));
return c.json(
  await attachReferenceComputed(dataset, {
    db,
    auth,
    tables: [accounts],
    names: { accounts: ["parentPath"] },
  }),
  200,
);
```

For each table that a `reference` column names, the helper collects the ids
from every level, node, child row, and footer row of the dataset. It then runs
`computeFields()` once for the table's `rowCaption`, when the caption is a
computed field, and for the fields that `names` lists for the table. `names`
usually lists the `needs` of the table's label slot. `tables` takes the table
definitions, as a list or as the application's table catalog; a referenced table
missing from it is an error.

`computeFields()` does not check that the request may read the ids it is given.
Call `attachReferenceComputed()` only on a dataset built from the report's own
scoped reads, such as rows read through `scopedRows()` or SQL filtered by
`ownedRows()`; see
[Scoped report data](/docs/guides/reports/scoped-report-data/).

Without the helper, the grid requests the values itself, one lookup per table
after the report arrives. The captions then appear one request later.

## Draw the report

`ReportGridDataset` draws reference columns with no further code:

1. Before the cells are drawn, it stores the dataset's `computed` values.
2. It requests the values that the label slots still need, in one lookup per
   table for every row of the report. The lookup applies the table's row scope,
   so a row the user cannot read is drawn with its label alone.
3. It draws each reference cell through the table's label slot, on the `"cell"`
   surface in compact density.

A reference cell is drawn like other grid cells: Sapporta's default shows the
label alone, with no caption. The table's label slot decides whether the cell
shows more, such as the parent path. A cell with an empty id or an empty label
is drawn as plain text.

Column links still apply. A link on the column wraps the reference drawing, so
the cell keeps its drill-through link. The report grid holds its own row store,
so `invalidateRows()` refreshes its values after a write.

## Override one reference column

A `renderCell` override for the column receives the reference drawing as
`defaultContent`, and the column's link still wraps the override's output:

```tsx
import {
  ReportGridDataset,
  type ReportCellRenderers,
} from "@sapporta/frontend/report";

const renderCell: ReportCellRenderers = {
  line: {
    account: ({ defaultContent }) => (
      <span className="font-medium">{defaultContent}</span>
    ),
  },
};

<ReportGridDataset dataset={dataset} renderCell={renderCell} />;
```

Keep `renderCell` at module level or in `useMemo`; a new object rebuilds the
grid.

## Put the path in the report's SQL instead

A report can also put the parent path into its own rows, as an ordinary column.
`treePathRelation()` gives the paths of a tree table's rows as a member of a
`with recursive` list, with the same paths and row scope as the `treePath()`
computed field:

```ts
import { sql } from "drizzle-orm";
import { treePathRelation } from "@sapporta/server";

const paths = treePathRelation(accounts, auth);
const rows = db.all<{ id: number; name: string; parent_path: string | null }>(
  sql`with recursive ${paths}
      select a.id, a.name, p.parent_path
      from accounts a
      join tree_paths p on p.id = a.id`,
);
```

The path is then a value of the dataset, such as a visible "Parent" column, and
it is drawn the same way in every application. A `reference` column, on the
other hand, is drawn by the application's label slot, so it follows the rest of
the application.
[Computed fields and row captions](/docs/guides/model-data/computed-fields-and-row-captions/#read-tree-paths-in-raw-sql)
describes the relation's columns.

## Related documentation

- [GridDataset](/docs/reference/reports/grid-dataset/#reference-columns)
- [Scoped report helpers](/docs/reference/reports/scoped-report-helpers/#attachreferencecomputed)
- [Report datasets and formatting](/docs/guides/reports/report-datasets-and-formatting/)
- [Show rows with their captions and display slots](/docs/guides/generated-surfaces/row-captions-and-display-slots/)
- [Computed fields and row captions](/docs/guides/model-data/computed-fields-and-row-captions/)
