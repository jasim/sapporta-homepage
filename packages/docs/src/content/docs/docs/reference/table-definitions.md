---
title: "Table Definitions"
description:
  "Lookup table metadata, column factories, column metadata, relationships,
  children, and migrations."
---

## Table definitions

Schema files live in `packages/api/schema/`. Each table module should export the
raw Drizzle table and the Sapporta wrapper:

```ts
export const ordersTable = sqliteTable("orders", { ... });

export const orders = sapportaTable({
  drizzle: ordersTable,
  meta: {
    label: "Orders",
    rowScope: "workspaceUserScoped",
    rowLabelColumns: ["order_number"],
  },
});
```

Use the raw Drizzle export for `.references()` and TypeScript row types:

```ts
type Order = typeof ordersTable.$inferSelect;
type OrderInsert = typeof ordersTable.$inferInsert;
```

### Table metadata

| Field             | Shape                                                          | Use                                                                               |
| ----------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `label`           | `string`                                                       | Human label in generated screens.                                                 |
| `rowScope`        | `"workspaceUserScoped" \| "workspaceGlobal" \| "systemGlobal"` | Row ownership model for auth-aware APIs.                                          |
| `rowLabelColumns` | `string[]`                                                     | Columns joined to label rows in lookups and reference displays.                   |
| `selects`         | `{ type: "select"; column: string; options: string[] }[]`      | Dropdown values for controlled text columns.                                      |
| `immutable`       | `boolean`                                                      | Prevent update/delete on append-only tables.                                      |
| `validation`      | `z.ZodObject`                                                  | Optional override for the schema inferred from Drizzle.                           |
| `search`          | `{ columns: string[] }`                                        | Enables `q=<term>` on list APIs and table toolbars.                               |
| `references`      | `Record<string, ReferenceRule>`                                | Fallback for logical references not expressible with Drizzle `.references()`.     |
| `defaultSort`     | Drizzle order expression                                       | Server-side default order when callers omit `sort`.                               |
| `children`        | `ChildMeta[]`                                                  | Parent-to-child nested rows, child counts, and master-detail insertion.           |
| `columns`         | `Record<string, ColumnMeta>`                                   | Labels, visibility, widths, text display, numeric display hints, and editability. |

`rowScope` defaults to `workspaceUserScoped`, but declare it explicitly in
application tables. Scope columns are server-managed. Do not accept
`workspace_id`, `workspaceId`, `scoped_to_user_id`, or `scopedToUserId` from
client payloads.

| `rowScope`            | Required columns                    |
| --------------------- | ----------------------------------- |
| `workspaceUserScoped` | `workspace_id`, `scoped_to_user_id` |
| `workspaceGlobal`     | `workspace_id`                      |
| `systemGlobal`        | none                                |

### Column factories

Import semantic column factories from `@sapporta/server/table`.

| Factory                   | SQLite storage                 | Runtime value        | Notes                                |
| ------------------------- | ------------------------------ | -------------------- | ------------------------------------ |
| `text("name")`            | `TEXT`                         | `string`             | Free text, codes, enum strings.      |
| `number("qty")`           | `REAL`                         | `number`             | General numeric measures.            |
| `money("amount")`         | `REAL`                         | `number`             | Currency-formatted number.           |
| `percentage("rate")`      | `REAL`                         | `number`             | Percent-formatted number.            |
| `bool("active")`          | `INTEGER 0/1`                  | `boolean`            | Parses filters as `true` or `false`. |
| `date("due_date")`        | `TEXT`, `YYYY-MM-DD`           | `Temporal.PlainDate` | Calendar dates.                      |
| `timestamp("created_at")` | `TEXT`, `YYYY-MM-DDTHH:mm:ssZ` | `Temporal.Instant`   | Points in time.                      |

Use raw Drizzle `integer("id").primaryKey({ autoIncrement: true })` for integer
primary keys and raw `integer()` columns for foreign keys.

Money columns are stored as SQLite `REAL`, not text. They sort, filter, compare,
and aggregate as numbers; currency display comes from
`displayFormat: "currency"` stamped by `money()`. There is no separate
`type: "money"` column metadata field.

Date and timestamp factories parse values to Temporal types after the API
boundary. Use `Temporal.PlainDate` for dates and `Temporal.Instant` for
timestamps in application code; do not use `Date`, `dayjs`, or `date-fns` for
Sapporta schema date/time parsing or arithmetic.

### Column metadata

`meta.columns` is keyed by SQL column name. Common options are:

| Option                          | Use                                                                          |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `label`                         | Override the generated field or grid label.                                  |
| `visuallyHidden`                | Hide system/helper columns from generated screens.                           |
| `clientEditable`                | Set `false` for fields clients must not edit through generated APIs.         |
| `width`, `minWidth`, `maxWidth` | Grid sizing hints in approximate character count.                            |
| `textDisplay`                   | `"multiLine"` or `"markdown"` for long text editing/display.                 |
| `additive`                      | Set `false` for nullable numeric columns where `null` is distinct from zero. |
| `colorRule`                     | `"positive"`, `"negative"`, or `"signed"` for money/number ink.              |
| `zeroDisplay`                   | `"blank"` or `"dot"` for numeric zero display.                               |
| `strong`                        | Medium-weight numeric display for answer columns.                            |
| `notes`                         | Domain meaning, units, formulas, or conventions.                             |

### Relationships and children

Foreign keys give source-to-target navigation:

```ts
customer_id: integer("customer_id")
  .notNull()
  .references(() => customersTable.id),
```

Name ordinary foreign-key columns after the referenced table role, usually
`<singular_target>_id`, such as `customer_id` or `order_id`. For
self-referential keys, Drizzle needs an explicit return type annotation:

```ts
import { type AnySQLiteColumn } from "drizzle-orm/sqlite-core";

parent_id: integer("parent_id").references(
  (): AnySQLiteColumn => accountsTable.id,
),
```

Declare `children` on the referenced table when users need target-to-source
navigation:

```ts
children: [
  {
    table: "order_items",
    foreignKey: "order_id",
    label: "Line Items",
    columns: ["product", "quantity", "unit_price"],
    defaultSort: "id",
  },
],
```

Use `onDelete: "cascade"` on detail rows that are owned by their parent.

### Migrations

Sapporta uses Drizzle Kit migrations directly. The server checks migration
readiness at boot; it does not run migrations for you.

```bash
pnpm --filter ./packages/api db:generate --name add_orders
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
```

After changing table code, generate SQL, review it, migrate, start the server,
then verify:

```bash
pnpm exec sapporta tables show orders
```
