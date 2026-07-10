---
title: "Generated Table APIs"
description:
  "Use generated table REST routes for list, read, create, update, delete,
  lookup, count, and export behavior."
---

Sapporta gives each table a REST API under `/api/tables/<table>`. Use these
table APIs for ordinary row-level work: browse, filter, create, update, delete,
lookup, count, and export.

Use a custom app endpoint when the action has business meaning beyond row CRUD,
such as voiding an invoice, importing a statement, posting a journal, or calling
an external service.

```txt
schema table + meta
        |
        v
table routes -> OpenAPI -> CLI endpoint discovery / frontend screens / curl
        |
        v
row-scoped reads and writes
```

## From table metadata to routes

A table definition has two parts:

```ts
// packages/api/schema/customers.ts
import { sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { table, text, timestamp } from "@sapporta/server/table";
import { Temporal } from "@sapporta/shared/temporal";

export const customersTable = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace_id: text("workspace_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  created_at: timestamp("created_at")
    .$defaultFn(() => Temporal.Now.instant())
    .notNull(),
});

export const customers = sapportaTable({
  drizzle: customersTable,
  meta: {
    label: "Customers",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["name"],
    search: { columns: ["name", "email"] },
  },
});
```

The Drizzle table describes the stored row: columns, types, primary keys,
foreign keys, and defaults. Sapporta metadata describes how builders and users
work with the row: labels, search, select values, child relationships,
validation, row scope, lookup labels, forms, and table screens.

## Table route inventory

Every table gets these routes:

| Operation     | Route                                | Use it for                                                                             |
| ------------- | ------------------------------------ | -------------------------------------------------------------------------------------- |
| List rows     | `GET /api/tables/<table>`            | Search, filters, sort, and pagination. Returns `{ data, meta }`.                       |
| Get row       | `GET /api/tables/<table>/<id>`       | Read one visible row. Returns `{ data: row }`.                                         |
| Create row(s) | `POST /api/tables/<table>`           | Create one row, many rows, or a parent with `$details`. Returns `201` with `{ data }`. |
| Update row    | `PUT /api/tables/<table>/<id>`       | Patch one visible row with a partial object. Returns `{ data: row }`.                  |
| Delete row    | `DELETE /api/tables/<table>/<id>`    | Delete one visible row. Returns `{ data: deletedRow }`.                                |
| Export CSV    | `GET /api/tables/<table>/export.csv` | Export the same visible, filtered, searched, sorted row set as CSV.                    |
| Lookup labels | `GET /api/tables/<table>/_lookup`    | Resolve typed lookup entries for foreign-key controls.                                 |
| Child counts  | `GET /api/tables/<table>/_count`     | Count child rows grouped by a parent foreign-key column.                               |

Table responses are envelopes; do not treat them as bare arrays. Row, count, and
mutation routes use `body.data`; lookup routes use `body.entries`.

```json
{
  "data": [{ "id": 7, "name": "Acme Co" }],
  "meta": { "page": 1, "pages": 1, "total": 1, "limit": 50 }
}
```

## List query grammar

The list route accepts `q`, `filter[col][op]`, `sort`, `page`, and `limit`. The
export route accepts the same query shape except pagination.

Use `curl -G --data-urlencode` for bracketed filter keys:

```bash
curl -fsS -G \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  --data-urlencode "q=acme" \
  --data-urlencode "filter[status][eq]=active" \
  --data-urlencode "filter[balance][gte]=100" \
  --data-urlencode "sort=-created_at,name" \
  --data-urlencode "page=1" \
  --data-urlencode "limit=50" \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/tables/customers"
```

Every filter must name an operator:

| Operator                 | Meaning                                  | Example                               |
| ------------------------ | ---------------------------------------- | ------------------------------------- |
| `eq`, `neq`              | Equal / not equal                        | `filter[status][eq]=active`           |
| `gt`, `gte`, `lt`, `lte` | Ordered comparison                       | `filter[amount][gte]=100`             |
| `in`, `nin`              | Comma-separated membership               | `filter[id][in]=1,2,3`                |
| `contains`               | Text contains substring                  | `filter[name][contains]=cash`         |
| `startswith`             | Text starts with value                   | `filter[code][startswith]=EXP`        |
| `endswith`               | Text ends with value                     | `filter[email][endswith]=example.com` |
| `is`                     | Null check; value is `null` or `notnull` | `filter[parent_id][is]=null`          |

Multiple filters are combined with `AND`. Search uses `q=<term>`, requires
`meta.search.columns`, and also combines with filters using `AND`. Empty or
whitespace-only `q` is ignored.

Sort with a comma-separated `sort` value. A leading `-` means descending:

```text
sort=-created_at,name
```

Pagination is 1-based. `limit` defaults to `50` and must be between `1` and
`1000`:

```text
page=2&limit=25
```

The query grammar is strict. Unknown columns, unknown operators, missing
operators, bad values, and invalid pagination return structured `400` errors.
Sapporta does not silently drop malformed filters.

```json
{
  "error": "Unknown filter operator \"like\" on column \"name\"",
  "code": "unknown_op"
}
```

Common query error codes include `unknown_filter_shape`, `unknown_column`,
`unknown_op`, `op_not_applicable`, `bad_value`, `bad_limit`, `bad_page`,
`no_search_config`, and `unknown_search_column`.

## Create, update, and delete

Create one row by posting a JSON object:

```bash
curl -fsS \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme Co","email":"ops@example.com"}' \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/tables/customers"
```

Create several rows by posting a JSON array:

```json
[
  { "sku": "WIDGET", "name": "Widget", "price": 29.99 },
  { "sku": "GADGET", "name": "Gadget", "price": 49.99 }
]
```

For a declared parent-child relationship, create the parent and detail rows in
one transaction with `$details`:

```json
{
  "customer_id": 7,
  "status": "draft",
  "$details": {
    "table": "order_items",
    "fk": "order_id",
    "rows": [{ "product_id": 11, "quantity": 3, "unit_price": 29.99 }]
  }
}
```

The server inserts the parent, reads the new primary key, backfills the detail
foreign key, and inserts the child rows in the same transaction.

Update uses `PUT /api/tables/<table>/<id>` with a partial row object:

```bash
curl -fsS \
  -X PUT \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"email":"billing@example.com"}' \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/tables/customers/7"
```

Delete returns the deleted row envelope:

```bash
curl -fsS \
  -X DELETE \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/tables/customers/7"
```

Clients must omit server-managed fields such as `id`, `created_at`,
`updated_at`, `workspace_id`, `workspaceId`, `scoped_to_user_id`, and
`scopedToUserId`. In auth-enabled apps, the server derives trusted workspace and
user fields from the session or agent token.

## Lookup, count, and export

`_lookup` resolves row IDs to human labels from `rowLabelColumns`. The response
keeps string and numeric IDs typed, so clients should read `entries` instead of
turning the result into an object map:

```bash
curl -fsS -G \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  --data-urlencode "ids=7,8,9" \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/tables/customers/_lookup"
```

```json
{
  "entries": [
    { "value": 7, "label": "Acme Co" },
    { "value": 8, "label": "Northwind" }
  ]
}
```

You can also search lookups with `q` and cap results with `limit`:

```bash
curl -fsS -G \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  --data-urlencode "q=acme" \
  --data-urlencode "limit=10" \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/tables/customers/_lookup"
```

Search responses use the same `{ "entries": [...] }` envelope.

`_count` counts visible rows grouped by a parent foreign-key column:

```bash
curl -fsS -G \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  --data-urlencode "group_by=customer_id" \
  --data-urlencode "ids=7,8,9" \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/tables/orders/_count"
```

```json
{
  "data": {
    "7": 3,
    "8": 1
  }
}
```

`export.csv` uses the same row visibility, filters, search, and sort as the list
route:

```bash
curl -fsS -G \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  --data-urlencode "filter[status][eq]=sent" \
  --data-urlencode "sort=-due_date" \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/tables/invoices/export.csv" \
  -o invoices.csv
```

## Auth-aware behavior

Table routes under `/api/tables/*` resolve auth on the server and use row-scoped
helpers for list, get, create, update, delete, lookup, count, and export.

A browser session or bearer token selects the user and workspace boundary.
Ordinary clients should not pass workspace IDs or user-scope IDs. For protected
apps, call the API with the session cookie from the browser or an agent token:

```bash
curl -fsS \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/tables/customers"
```

Rows outside the active boundary behave like missing rows for get, update, and
delete. Foreign keys are validated against rows visible in the same boundary,
not just by primary-key existence.

For the full row-scope model, see
[Control Access](/docs/subsystems/authorization/).
