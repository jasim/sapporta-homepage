---
title: "Show a table as a tree"
description:
  "Declare a self-referencing table as a tree so the table page, API, and CLI
  show each row under its parent and each search match under its ancestors."
---

A table whose rows name a parent row of the same table forms a tree: a chart of
accounts, a category hierarchy, an organization chart. `meta.tree` declares that
shape. As soon as a table declares it, the table page shows the rows as one
indented list under one header, and a search shows each match under its
ancestors.

## Declare the parent column

The parent column is a nullable foreign key to the table's own primary key. A
top-level row leaves it empty:

```ts
// packages/api/schema/accounts.ts
import {
  integer,
  sqliteTable,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";
import { bool, sapportaTable, text } from "@sapporta/server/table";

export const accountsTable = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace_id: text("workspace_id").notNull(),
  name: text("name").notNull(),
  parent_id: integer("parent_id").references(
    (): AnySQLiteColumn => accountsTable.id,
  ),
  archived: bool("archived").notNull().default(false),
});

export const accounts = sapportaTable({
  drizzle: accountsTable,
  meta: {
    label: "Accounts",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["name"],
    search: { self: ["name"] },
    tree: { parentColumn: "parent_id" },
  },
});

export default accounts;
```

The `(): AnySQLiteColumn` return type lets TypeScript accept a column that
refers to the table it belongs to. `parent_id` has no `.notNull()`, so a row
without a parent is a top-level row.

Sapporta checks the declaration when the application loads. `parentColumn` must
be a nullable, single-column foreign key to the same table's primary key,
declared with Drizzle `.references()` or a `meta.references` rule. The column
that shows the hierarchy must be visible, and the table cannot also list itself
in `meta.children`. A violation stops the boot with the table and column in the
message.

Generate, review, and apply the migration as for any table change:

```bash
SAPPORTA_DATA_DIR=data pnpm --filter ./packages/api db:generate --name add_accounts
SAPPORTA_DATA_DIR=data pnpm --filter ./packages/api db:migrate
```

Changing only `meta.tree` changes no storage and needs no migration.
[Schema changes and migrations](/docs/guides/model-data/schema-changes-and-migrations/)
covers reviewing the generated SQL.

## Choose the tree options

`parentColumn` is the only required field. The others have defaults:

| Field             | Default                       | Sets                                                      |
| ----------------- | ----------------------------- | --------------------------------------------------------- |
| `column`          | first `rowLabelColumns` entry | the column that shows the indentation and chevrons        |
| `defaultExpanded` | `true`                        | whether rows start expanded                               |
| `matchContext`    | `"ancestors-and-descendants"` | what a search or filter keeps besides the rows that match |
| `rootOrder`       | none                          | the order of the top-level rows, by one column's values   |
| `path`            | none                          | the `treePath()` field that pickers draw as a row's path  |

With `"ancestors-and-descendants"`, a search for a parent account shows the
account with its whole subtree. `"ancestors"` keeps only the path from the top
to each match:

```ts
tree: {
  parentColumn: "parent_id",
  defaultExpanded: false,
  matchContext: "ancestors",
},
```

The browser receives the resolved declaration as `TableSchema.tree`.

### Order the top-level rows

Siblings follow the table's `defaultSort` at every depth. The top-level rows of
a chart of accounts usually have an order of their own, such as Asset,
Liability, Equity, Revenue, Expense, which no column sorts into. `rootOrder`
names a column and lists its values in that order:

```ts
defaultSort: asc(accountsTable.name),
tree: {
  parentColumn: "parent_id",
  rootOrder: {
    column: "account_type",
    values: ["Asset", "Liability", "Equity", "Revenue", "Expense"],
  },
},
```

Top-level rows whose value is not listed come after the listed ones. Rows with
the same value, and every row below the top level, follow `defaultSort`. The
table page and the table's pickers use this order, so both show the tree the
same way. A sort that the person picks on the table page replaces `rootOrder`
and `defaultSort`. Sapporta checks at boot that `column` is a column of the
table and that `values` is not empty.

## Work with the tree on the table page

Open `/tables/accounts`. The page shows every account in one list. The name
column indents each account by its depth and shows a chevron on accounts with
children. The other columns stay aligned across all depths. Without a sort, the
top-level rows follow `rootOrder` and every depth follows `defaultSort`. A sort
orders the siblings at every depth.

- **Expand and collapse.** Click a chevron, or press Space on the name cell.
- **Add a child.** Right-click an account and choose **Add child row**. The page
  adds a draft under that account with `parent_id` filled in and opens the name
  editor. Leaving the draft saves it like any new row; a draft left untouched is
  removed.
- **Search and filter.** A search or filter shows each match under its
  ancestors, so a match deep in the tree appears in place. The header shows the
  number of matches, such as "3 matches". Ancestors that do not match themselves
  are drawn in a muted color.

The page loads the whole tree in one request of up to 1,000 rows, so it shows no
pager. When the table holds more rows than that, a notice above the grid says
the tree may be missing rows, and a row whose parent is not loaded appears at
the top level. Search or filter to reach the other rows.

Entries in the table's `meta.children` appear as row links, because expanding a
row shows its child rows of the same table. CSV export writes the rows that
match the current search and filters as a flat list.

## Read the tree through the API and CLI

A list read on a tree table accepts `tree`. With a filter or search, it returns
each match with its ancestors, and with `ancestors-and-descendants` also its
subtree:

```http
GET /api/tables/accounts?q=federal&tree=ancestors-and-descendants&limit=1000
```

The response `meta.tree` carries `matchCount`, the rows that match themselves,
and `contextIds`, the ancestors present only because a descendant matched. The
walk applies row scope at every step, so it never returns or passes through a
row the caller cannot read.

Constraints that belong to the screen go in `fixed[col][op]` conditions. Every
returned row satisfies them, including the ancestors and descendants around a
match. This read never brings back an archived parent or child of a matching
account:

```http
GET /api/tables/accounts?q=taxes&tree=ancestors&fixed[archived][eq]=false
```

The CLI takes the same options:

```bash
pnpm exec sapporta rows list accounts --q taxes --tree ancestors \
  --fixed '{"archived":{"eq":false}}'
```

[Query syntax](/docs/reference/http/query-syntax/#keep-tree-matches-in-context)
lists the parameters, the response fields, and the `no_tree_config` error.

## Adjust a tree in a custom grid

A `defineTGrid()` level follows the table's declared tree. Its `tree` option
overrides single fields, or `false` shows the table as a flat, paged list:

```ts
import { defineTGrid } from "@sapporta/frontend";
import type { TableSchema } from "@sapporta/shared/contracts";
import { mintFilterId } from "@sapporta/shared/filter";

export function accountsGridDefinition(table: TableSchema) {
  return defineTGrid({
    rootLevel: "accounts",
    levels: {
      accounts: {
        table,
        childLevels: [],
        tree: { defaultExpanded: false },
        query: {
          fixedFilters: [
            {
              id: mintFilterId("archived", "eq"),
              column: "archived",
              op: "eq",
              value: "false",
            },
          ],
        },
      },
    },
  });
}
```

The level sends its `fixedFilters` as `fixed` conditions, so a search keeps only
unarchived ancestors and descendants. A custom page built from the table hooks
reads `session.levelInfoById[level].pagination`, which is `"all"` for a tree
level, and `useTableLevelPager()` reports one page.
[TGrid definitions, sessions, and queries](/docs/reference/frontend/tgrid/definitions-sessions-and-queries/#tree-levels)
lists every tree option.

## Match a tree in an application endpoint

`scopedRows().treeMatch()` runs the same walk for an application route. It
returns a `where` for an ordinary scoped read, with the match count and the
context row ids:

```ts
import { asc, eq, like } from "drizzle-orm";

const rows = scopedRows(c.get("db"), auth, accounts);
const match = await rows.treeMatch({
  fixed: eq(accountsTable.archived, false),
  match: like(accountsTable.name, "%tax%"),
  matchContext: "ancestors",
});
const result = await rows.page({
  where: match.where,
  orderBy: asc(accountsTable.name),
  limit: 1000,
});
```

[Scoped CRUD and bounded reads](/docs/reference/server/row-scoped-data/scoped-crud-and-bounded-reads/#match-a-tree-with-its-context)
describes the inputs and the result.

## Show each row's parent path

`treePath()` gives each row of a tree table the labels of its ancestors, such as
"Expenses > Kitchen", as a computed field. Name it in `tree.path` so the table's
pickers draw it, and in `meta.rowCaption` so other screens, such as the record
sheet and flat lists, show it under each account's name:

```ts
meta: {
  rowLabelColumns: ["name"],
  tree: { parentColumn: "parent_id", path: "parentPath" },
  rowCaption: "parentPath",
},
computed: { parentPath: treePath({ separator: " > " }) },
```

The separator is declared once, in `treePath()`. The grids, the SQL relation
from `treePathRelation()` and the pickers all show the path the field gives, so
an application uses one separator everywhere. `tree.path` must name a field made
with `treePath()`; Sapporta checks it at boot.

[Computed fields and row captions](/docs/guides/model-data/computed-fields-and-row-captions/#give-a-tree-table-a-parent-path)
describes the field.

## Pick a row from the tree

A `LookupPicker` over a tree table draws the table as a tree. It is the picker
of a foreign-key field that refers to the table, including the table's own
parent column, and of `useTableLookup("accounts")` in a custom form:

- **Opened with nothing typed**, the picker shows the table as an indented tree,
  in the table's order. Every row that passes the picker's narrowing can be
  picked. Its ancestors that do not pass are shown greyed, only to place it, and
  cannot be picked. A branch with nothing to pick in it is left out. For
  example, a picker narrowed to asset accounts shows the Assets branch only.
- **With `notUnder`**, such as when choosing an account's parent, the account
  being edited is shown where it sits, greyed and marked "(being edited)", or
  the picker's `labels.editing`, and the rows below it are left out.
- **Typing searches** the table on the server, as for any lookup, and lists the
  matches flat, each after its parent path, such as "Assets > Bank Accounts >
  Savings". With `useTableLookup(table, narrowing, { search: "client" })`, it
  searches the tree the picker holds instead: every match, in tree order.
- **The chosen row** shows its parent path before its name, inside the field.

The arrow keys move through the rows at every depth and skip the greyed rows.
The tree is read whole from the server, so every row that passes is shown,
however many there are. A table with more than 5,000 such rows cannot be shown
as a tree: the picker says so and offers the search instead.

Use the tree picker wherever a person chooses a row by where it sits, such as a
parent account, a category, or a folder. Pass `tree={false}` to `LookupPicker`
for the flat search list, such as for a picker that only ever searches by code.
[Pick from a tree](/docs/guides/application-code/custom-forms-and-validation/#pick-from-a-tree)
shows the narrowing and `notUnder` in a form.

## Related documentation

- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
- [Relationships and lookup behavior](/docs/guides/model-data/relationships-and-lookup-behavior/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [TGrid definitions, sessions, and queries](/docs/reference/frontend/tgrid/definitions-sessions-and-queries/)
- [Hierarchical grids](/grid/guides/hierarchical-grids/#tree-data)
- [Show report rows as a tree](/docs/guides/reports/report-datasets-and-formatting/#show-rows-that-name-a-parent-as-one-tree)
