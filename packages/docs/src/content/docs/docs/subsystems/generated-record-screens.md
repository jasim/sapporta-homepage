---
title: "Generated Record Screens"
description:
  "Use generated table screens, forms, filters, child rows, import/export, and
  record inspection."
---

## Use table screens

Open a table screen when you want to work with ordinary records directly from
the running application. Sapporta generates a standard table route for each
schema table, so operators can browse rows without a custom screen and builders
can validate that table definitions, labels, relationships, and permissions are
working as intended.

The table screen is backed by the same table APIs your custom screens use:

- `GET /api/tables/<table>` lists records with search, filters, sort, and
  pagination.
- `POST /api/tables/<table>` creates records.
- `PUT /api/tables/<table>/<id>` updates records.
- `DELETE /api/tables/<table>/<id>` deletes records.
- `GET /api/tables/<table>/export.csv` exports records as CSV.
- `GET /api/tables/<table>/_lookup` resolves foreign-key labels for lookup
  fields.

For the full route inventory, envelopes, filter grammar, lookup, count, export,
and `$details` create shape, see
[Generated Table APIs](/docs/subsystems/generated-table-apis/).

Use the generated screen for the common operational loop: find a record, review
its fields, make a small correction, copy selected cells or ranges, export the
current result set, or follow an expandable relationship to child rows. If a
table declares child relationships in its metadata, the grid can show those
related rows under the parent record. This is useful for invoices with lines,
orders with items, journal entries with detail rows, and similar parent-child
data.

Each generated grid has a right-click copy menu for the active cell selection.
`Copy` writes the selected cell or range as CSV text. `Copy with headers` adds
stable data headers based on column ids. Plain columns copy one raw clipboard
column. Select, foreign-key, and lookup columns copy both the stored value and
the label, so a selected `account_id` column can produce
`account_id,account_id_label`.

For custom record-heavy workflows, use the generated table route as the baseline
and move to TGrid only when the workflow needs custom columns, nested levels,
row selection, custom save behavior, or a toolbar that does more than the
default table page. TGrid still uses Sapporta's table row APIs by default, so
you keep the standard filtering, lookup, export, and auth behavior unless you
explicitly provide another row client.

Use standalone Sapporta Grid only when the grid is not backed by Sapporta table
APIs. In that mode your screen owns its row source, persistence, filters,
pagination, export behavior, and backend transport. Start with
[Sapporta Grid Docs](/grid/docs/) when you need that package directly.

## Create records

Choose **New record** from a table screen to use the generated form. The form is
built from the table schema, so field behavior follows the column definitions:

- Text columns render as text inputs or text areas when the column uses a longer
  text display.
- Number, money, and percentage columns render as numeric inputs.
- Boolean columns render as checkboxes.
- Date and timestamp columns render as date-aware inputs and save canonical
  values.
- Select columns render their declared options.
- Foreign-key columns use lookup controls when the target table can provide
  search and display labels; otherwise the form falls back to an id input.

Sapporta keeps system-managed fields out of the generated form. A generated
primary key with a default is omitted, visually hidden columns are omitted,
columns marked `clientEditable: false` are omitted, and protected ownership
fields such as `workspace_id`, `workspaceId`, `scoped_to_user_id`, and
`scopedToUserId` are omitted. In auth-enabled apps, the server stamps trusted
ownership values during create instead of accepting them from the browser.

The generated form starts editable fields as blank values and submits only
fields with a value. This lets database defaults and server-managed values do
their job. Required fields without defaults are marked in the form, and write
validation failures return field-level errors when the server can provide them.

Use the table screen for quick single-record entry. Use the CLI or API when you
need repeatable data setup, bulk inserts, scripted validation, or records
created from another system.

```bash
pnpm exec sapporta rows create customers \
  --values '{"name":"Acme Co","email":"ops@example.com"}'
```

When a record references another table, resolve the foreign key first instead of
guessing an id:

```bash
pnpm exec sapporta tables sample customers
pnpm exec sapporta rows create orders \
  --values '{"customer_id":7,"status":"draft"}'
```

## Create parent and child records together

For a parent record with detail rows, create both sides in one transaction
through the row insert path. Put the parent fields at the top level and add a
`$details` object with the child table name, the child foreign-key column, and
the child rows.

```bash
pnpm exec sapporta rows create orders --values '{
  "customer_id": 7,
  "status": "draft",
  "$details": {
    "table": "order_items",
    "fk": "order_id",
    "rows": [
      { "product_id": 11, "quantity": 3, "unit_price": 29.99 },
      { "product_id": 12, "quantity": 1, "unit_price": 49.99 }
    ]
  }
}'
```

The server inserts the parent, reads its primary key, backfills `order_id` on
each detail row, and inserts the details in the same transaction. If any row
fails validation, the transaction rolls back.

Do not include the parent foreign-key column in the detail rows. Sapporta sets
it from the newly created parent record:

```json
{
  "product_id": 11,
  "quantity": 3,
  "unit_price": 29.99
}
```

Declare the relationship in the parent table's `meta.children` so Sapporta knows
which detail rows belong under the parent. For a browser workflow that needs
guided parent-child entry, build a custom screen or product endpoint that
submits the same shape to the table API or wraps the operation in
domain-specific validation.

## Filter and search records

Table screens keep query state in the URL, and the API accepts the same query
parameters. This makes filtered views shareable and makes export predictable.

Use `q=<term>` for cross-column search. Search only works when the table schema
declares `meta.search.columns`; if search is not configured, the API returns
`400` instead of guessing which columns to search.

Use `filter[col][op]=value` for typed filters. Every filter must include an
operator:

| Operator                 | Use it for                                           | Example                        |
| ------------------------ | ---------------------------------------------------- | ------------------------------ |
| `eq`, `neq`              | exact equality or inequality                         | `filter[status][eq]=paid`      |
| `gt`, `gte`, `lt`, `lte` | numbers, dates, timestamps, and other ordered values | `filter[amount][gte]=100`      |
| `in`, `nin`              | comma-separated membership                           | `filter[id][in]=1,2,3`         |
| `contains`               | text contains a substring                            | `filter[name][contains]=cash`  |
| `startswith`             | text begins with a value                             | `filter[code][startswith]=EXP` |
| `endswith`               | text ends with a value                               | `filter[name][endswith]=Inc`   |
| `is`                     | null checks                                          | `filter[parent_id][is]=null`   |

Combine filters, search, sort, and pagination in one request:

```bash
curl "$SAPPORTA_API_URL/api/tables/invoices?q=acme&filter[status][eq]=sent&filter[due_date][lte]=2026-06-30&sort=-due_date&page=1&limit=50"
```

Sort with `sort=column` for ascending or `sort=-column` for descending. Use a
comma-separated list for secondary sorts. Pagination is 1-based with `page` and
`limit`; the default limit is 50 and the maximum limit is 1000.

The query grammar is strict by design. Unknown columns, misspelled filter names,
missing operators, unsupported operators such as `like`, invalid dates, invalid
booleans, empty `in` values, and bad pagination values return `400` with a
structured error code. Treat that as a caller bug. Do not catch the error and
retry without the filter, because that can accidentally expose or export a much
larger result set.

When you need wildcard-style text matching, use `contains`, `startswith`, or
`endswith`. Sapporta escapes `%` and `_` in those values so user-entered text
matches literally. If you need custom SQL pattern behavior, put it behind an app
endpoint or report route instead of the generic table list endpoint.

For direct HTTP examples with `curl -G --data-urlencode`, use the focused
[Generated Table APIs](/docs/subsystems/generated-table-apis/) guide.

## Import, export, and inspect data

Use the UI when a human is exploring or correcting a small number of records.
Use the CLI when you are developing, seeding, validating, or inspecting a
running app. Use the API when another system or a custom workflow needs to call
Sapporta directly.

For inspection, start with discovery:

```bash
pnpm exec sapporta endpoints list
pnpm exec sapporta tables list
pnpm exec sapporta tables show invoices
pnpm exec sapporta tables sample invoices
```

`sapporta endpoints list` reads the running app's OpenAPI document.
`sapporta tables show` shows table metadata, columns, relationships, and
constraints. `sapporta tables sample` gives you a quick look at real rows before
you insert related data or write a filter.

For export, use the table screen's CSV export action or call the export URL
directly:

```bash
curl -fsS \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  "$SAPPORTA_API_URL/api/tables/invoices/export.csv?filter[status][eq]=sent" \
  -o invoices.csv
```

CSV export uses the same row visibility, filters, search, and sort rules as the
table list path. In auth-enabled apps, the current browser session or agent
token determines which workspace and rows are visible.

For import or seed data, prefer row commands over raw SQL:

```bash
pnpm exec sapporta rows create products --values '[
  { "sku": "WIDGET", "name": "Widget", "price": 29.99 },
  { "sku": "GADGET", "name": "Gadget", "price": 49.99 }
]'
```

The row command calls the normal table create API, so validation, default
handling, row ownership, and save behavior still run. If your source data is
CSV, convert it to the JSON shape your table expects or build a project endpoint
that performs the import with explicit validation and error reporting.

Raw SQL is a fallback for questions or maintenance tasks that cannot be answered
through a report route, table query, row command, or app endpoint. It bypasses
normal row helpers and should not be the default way to create or update
application records.

Use this rule of thumb:

| Situation                                           | Best tool                                                              |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| Browse, search, correct, or export records manually | Table screen                                                           |
| Enter one ordinary record                           | Generated form                                                         |
| Create parent and child rows atomically             | CLI row insert with `$details`, API, or a custom workflow              |
| Seed or import repeatable data                      | CLI row insert or a custom import endpoint                             |
| Integrate another system                            | Table API or app-specific API                                          |
| Answer a business question                          | Report route first, table API second, read-only SQL only as a fallback |
| Debug schema, columns, lookups, and sample rows     | `sapporta endpoints list/show`, `sapporta tables show`, `sapporta tables sample` |
