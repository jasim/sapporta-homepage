---
title: "Data Modeling"
description:
  "Define schema files, table metadata, relationships, children, labels, search,
  row ownership, and migrations."
---

## Define tables

Sapporta apps model data in TypeScript. Each table lives in
`packages/api/schema/` and usually exports two things:

- A raw Drizzle table, such as `productsTable`, that owns SQL columns,
  constraints, indexes, and foreign keys.
- A Sapporta `sapportaTable()` wrapper, such as `products`, that owns product-facing
  metadata for labels, lookups, editing, search, relationships, and row
  ownership.

Start with the shape users will recognize in the product. Use plural SQL table
names, snake_case column names, and a human label for the generated UI.

```ts
import { sqliteTable, integer } from "drizzle-orm/sqlite-core";
import {
  sapportaTable,
  text,
  money,
  bool,
  timestamp,
} from "@sapporta/server/table";
import { Temporal } from "@sapporta/shared/temporal";

export const productsTable = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace_id: text("workspace_id").notNull(),
  scoped_to_user_id: text("scoped_to_user_id").notNull(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  unit_cost: money("unit_cost"),
  active: bool("active").notNull().default(true),
  created_at: timestamp("created_at")
    .$defaultFn(() => Temporal.Now.instant())
    .notNull(),
  updated_at: timestamp("updated_at")
    .$defaultFn(() => Temporal.Now.instant())
    .notNull(),
});

export const products = sapportaTable({
  drizzle: productsTable,
  meta: {
    label: "Products",
    rowScope: "workspaceUserScoped",
    rowLabelColumns: ["name"],
    search: { columns: ["name", "sku"] },
    columns: {
      workspace_id: { visuallyHidden: true },
      scoped_to_user_id: { visuallyHidden: true },
      unit_cost: {
        additive: false,
        notes: "Cost per unit from supplier, excluding tax",
      },
    },
  },
});
```

`rowLabelColumns` is required. It tells Sapporta how to name a row in lookup
fields and reference displays. Pick short, stable columns such as `name`,
`code`, `sku`, or `title`; multiple columns are joined with spaces. The
`_lookup` route uses these labels for id-to-label maps; see
[Generated Table APIs](/docs/subsystems/generated-table-apis/).

Use Drizzle constraints for the database facts:

- `.notNull()` for required values.
- `.unique()` or a `uniqueIndex()` for business identifiers.
- `.default(value)` for simple defaults.
- `.$defaultFn(() => Temporal.Now.instant())` for timestamps set in application
  code.

For TypeScript row types, derive from the Drizzle table instead of hand-writing
parallel interfaces:

```ts
type Product = typeof productsTable.$inferSelect;
type ProductInsert = typeof productsTable.$inferInsert;
```

## Choose column types

Use Sapporta column factories from `@sapporta/server/table` for application
values. They choose the SQLite storage and stamp semantic metadata that the API,
grid, forms, filters, and formatters can reuse.

| Factory                   | Use for                           | Runtime shape                |
| ------------------------- | --------------------------------- | ---------------------------- |
| `text("name")`            | names, notes, codes, enum strings | `string`                     |
| `number("weight")`        | numeric measurements              | `number`                     |
| `money("price")`          | currency amounts                  | `number`, currency-formatted |
| `percentage("tax_rate")`  | rates and percentages             | `number`, percent-formatted  |
| `bool("active")`          | true/false flags                  | `boolean`                    |
| `date("ordered_on")`      | calendar dates                    | `Temporal.PlainDate`         |
| `timestamp("created_at")` | instants in time                  | `Temporal.Instant`           |

Use raw Drizzle `integer()` for primary keys and foreign keys. Relationships are
identifiers, not domain values, so they do not need Sapporta semantic
formatting.

For fixed option sets, store a `text()` column and declare a select in metadata:

```ts
// Given status: text("status").notNull() in productsTable
const productStatusOptions = ["draft", "active", "discontinued"];

export const products = sapportaTable({
  drizzle: productsTable,
  meta: {
    label: "Products",
    rowScope: "workspaceUserScoped",
    rowLabelColumns: ["name"],
    selects: [
      { type: "select", column: "status", options: productStatusOptions },
    ],
  },
});
```

Use a select when the allowed values are small and controlled by the
application. If users need to maintain the list, model it as a separate
reference table and point to it with a foreign key.

Be deliberate with nullable numbers. Additive values that may be summed,
averaged, or totaled should be `.notNull().default(0)`. If `null` has a real
meaning that is different from zero, leave it nullable and mark it as
non-additive in column metadata:

```ts
reorder_level: number("reorder_level"),
```

```ts
columns: {
  reorder_level: {
    additive: false,
    notes: "Optional stock threshold. Null means no threshold is set.",
  },
},
```

## Connect tables

Model many-to-one relationships with Drizzle foreign keys. Import the raw
Drizzle table from the target schema file, not the Sapporta wrapper.

```ts
import { sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { table, text, number, timestamp } from "@sapporta/server/table";
import { Temporal } from "@sapporta/shared/temporal";
import { productsTable } from "./products.js";

export const stockMovementsTable = sqliteTable("stock_movements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace_id: text("workspace_id").notNull(),
  scoped_to_user_id: text("scoped_to_user_id").notNull(),
  product_id: integer("product_id")
    .notNull()
    .references(() => productsTable.id),
  direction: text("direction").notNull(),
  quantity: number("quantity").notNull().default(0),
  memo: text("memo"),
  created_at: timestamp("created_at")
    .$defaultFn(() => Temporal.Now.instant())
    .notNull(),
  updated_at: timestamp("updated_at")
    .$defaultFn(() => Temporal.Now.instant())
    .notNull(),
});

export const stockMovements = sapportaTable({
  drizzle: stockMovementsTable,
  meta: {
    label: "Stock Movements",
    rowScope: "workspaceUserScoped",
    rowLabelColumns: ["memo"],
    selects: [{ type: "select", column: "direction", options: ["in", "out"] }],
    columns: {
      workspace_id: { visuallyHidden: true },
      scoped_to_user_id: { visuallyHidden: true },
      memo: { textDisplay: "multiLine" },
    },
  },
});
```

The foreign key gives Sapporta source-to-target behavior:
`stock_movements.product_id` can render as a product lookup and drill up to the
product row. In auth-enabled apps, the submitted foreign-key value must point to
a row visible in the active auth boundary. A valid primary key from another
workspace or another user's user-scoped rows is rejected by generated table
routes and scoped helpers.

For target-to-source behavior, add `children` to the parent table. Sapporta
keeps this explicit so you can choose which inbound relationships matter to
users.

```ts
export const products = sapportaTable({
  drizzle: productsTable,
  meta: {
    label: "Products",
    rowScope: "workspaceUserScoped",
    rowLabelColumns: ["name"],
    children: [
      {
        table: "stock_movements",
        foreignKey: "product_id",
        label: "Movement History",
        columns: ["direction", "quantity", "memo"],
        defaultSort: "-created_at",
      },
    ],
  },
});
```

Use `onDelete: "cascade"` on detail rows that are owned by a parent, such as
order lines owned by an order:

```ts
order_id: integer("order_id")
  .notNull()
  .references(() => ordersTable.id, { onDelete: "cascade" }),
```

If a relationship cannot be expressed as a Drizzle `.references()` call, use
`meta.references` as a fallback. Prefer real Drizzle foreign keys when the
database can enforce them.

Declared children also shape child counts and master-detail create payloads. See
[Generated Table APIs](/docs/subsystems/generated-table-apis/) for the
`$details` request shape.

## Shape the editing experience

The `meta.columns` map lets you tune generated table screens without changing
storage. Keep metadata close to the schema so the editing experience travels
with the model.

```ts
columns: {
  workspace_id: { visuallyHidden: true },
  scoped_to_user_id: { visuallyHidden: true },
  name: { label: "Product Name", minWidth: 24 },
  sku: { label: "SKU", width: 14 },
  description: { textDisplay: "multiLine", maxWidth: 60 },
  unit_cost: {
    additive: false,
    notes: "Cost per unit from supplier, excluding tax",
  },
  margin: { colorRule: "signed", zeroDisplay: "dot", strong: true },
  external_id: { clientEditable: false },
},
```

Common editing metadata:

- `label` changes the field or column label.
- `visuallyHidden` hides system fields from grids and drawers. `created_at` and
  `updated_at` are hidden by default unless you override them.
- `clientEditable: false` keeps generated table APIs and forms from accepting
  edits for a field.
- `width`, `minWidth`, and `maxWidth` tune grid sizing.
- `textDisplay: "multiLine"` is for long plain text such as notes, descriptions,
  addresses, and memos.
- `textDisplay: "markdown"` is only for user-authored formatted content.
- `notes` records domain meaning, units, conventions, or formulas.
- `colorRule`, `zeroDisplay`, and `strong` help numeric result columns read
  correctly in grids.

Set `immutable: true` on append-only tables where rows should not be updated or
deleted after creation, such as journal entries, stock movements, audit logs, or
posted documents.

```ts
meta: {
  label: "Stock Movements",
  rowScope: "workspaceUserScoped",
  rowLabelColumns: ["memo"],
  immutable: true,
}
```

Most validation comes from the Drizzle declaration: required fields, nullable
fields, defaults, unique constraints, and foreign keys. Sapporta also supports a
`validation` metadata field for cases where you need a custom Zod object, but
use the schema declaration first whenever it can express the rule.

## Make tables searchable

Declare `meta.search` when a table should accept the `q` query parameter on its
list endpoint and show a search input in the generated UI.

```ts
meta: {
  label: "Products",
  rowScope: "workspaceUserScoped",
  rowLabelColumns: ["name"],
  search: { columns: ["name", "sku"] },
}
```

Search combines with filters in table API requests. See
[Generated Table APIs](/docs/subsystems/generated-table-apis/) for the list
query grammar.

`GET /api/tables/products?q=bolt` matches rows where any declared search column
contains the term. Search combines with ordinary filters, so it narrows the
current result set instead of replacing filters.

Choose fields a person would type:

- Good: `name`, `title`, `description`, `notes`, `sku`, `email`, `reference`.
- Avoid: primary keys, foreign keys, numbers, booleans, timestamps, and most
  select columns.

Keep the list short. Each column adds another `LIKE` predicate to the query. Two
to four columns is usually enough.

Search columns and row labels solve different problems:

- `rowLabelColumns` names one row when it appears inside another row's lookup
  field.
- `search.columns` finds rows in a list.

Often they overlap, but they do not have to be identical. A product can be
labeled by `name` while also searchable by `name` and `sku`.

## Protect ownership fields

Auth-aware tables must declare their row ownership model with `meta.rowScope`.
Declare it explicitly, even though Sapporta defaults omitted values to the
strictest option, `workspaceUserScoped`. Missing metadata should be treated as a
thing to fix, not as a design shortcut. For the request-time behavior behind
these scopes, see [Control Access](/docs/subsystems/authorization/).

| Question                                                    | Choose                | Required columns                    |
| ----------------------------------------------------------- | --------------------- | ----------------------------------- |
| Should every workspace see the same rows?                   | `systemGlobal`        | none                                |
| Should everyone in one workspace see the same rows?         | `workspaceGlobal`     | `workspace_id`                      |
| Should only one user inside a workspace see or own the row? | `workspaceUserScoped` | `workspace_id`, `scoped_to_user_id` |

Scope columns are system-managed. Do not ask clients to submit them, do not mark
them editable, and do not filter or stamp them by hand in custom code. Hide them
in generated screens:

```ts
meta: {
  label: "Products",
  rowScope: "workspaceUserScoped",
  rowLabelColumns: ["name"],
  columns: {
    workspace_id: { visuallyHidden: true },
    scoped_to_user_id: { visuallyHidden: true },
  },
}
```

`visuallyHidden` only affects generated UI display. The columns remain real
server-managed data columns, and generated APIs still reject client attempts to
set or patch them.

Use the narrowest scope that matches the product:

- User-specific drafts, private notes, personal saved views, and individual
  ledger data usually belong in `workspaceUserScoped`.
- Shared customers, products, warehouses, tags, and project records usually
  belong in `workspaceGlobal`.
- Seeded tax codes, country lists, or platform-defined reference rows may be
  `systemGlobal`.

For an invoice workflow, a common split is `workspaceUserScoped` for `invoices`
and `invoice_lines`, `workspaceGlobal` for `customers` and `products`, and
`systemGlobal` for `countries` or standard `tax_rates`.

## Run migrations

Schema files are source code. Migrations are generated SQL that you commit.

```text
schema files -> drizzle-kit generate -> committed SQL migrations -> drizzle-kit migrate
```

After changing files under `packages/api/schema/`, run the API package migration
workflow:

```bash
pnpm --filter ./packages/api db:generate --name add_products
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
```

Review the generated SQL before committing it, especially after renames. The
server validates table definitions when it starts, but it does not run
migrations for you.

For a new or changed table, a practical loop is:

1. Edit the schema file.
2. Generate and review the migration.
3. Apply the migration locally.
4. Start the app so Sapporta validates metadata, row scopes, references, search
   columns, and nullable numeric rules.
5. Inspect the table with `pnpm exec sapporta tables show <table_name>`.
