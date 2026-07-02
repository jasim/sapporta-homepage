---
title: "Agent Data Console Recipes"
description:
  "Copyable patterns for inspecting tables, answering questions, changing rows,
  and calling app routes."
---

Use these patterns after selecting the target app and fixing any auth failures.
For protected apps, start with
[Agent Access](/docs/tools-and-operations/agent-access/). For the operating
model, see [Agent Data Console](/docs/tools-and-operations/agent-data-console/).

## Inspect a table before writing

```bash
pnpm exec sapporta tables show products
pnpm exec sapporta tables sample products --limit 10 --fields id,sku,name,price
```

`tables show` gives schema, metadata, relationships, and column behavior.
`tables sample` gives real ids and values so you can resolve foreign keys
instead of guessing them.

## Create one row

```bash
pnpm exec sapporta rows insert customers \
  --data '{"name":"Acme Co","email":"ops@example.com"}'
```

Omit generated columns such as `id`, `created_at`, and `updated_at`. In
auth-enabled apps, also omit trusted scope columns such as `workspace_id`,
`workspaceId`, `scoped_to_user_id`, and `scopedToUserId`.

## Create parent and child rows in one transaction

```bash
pnpm exec sapporta rows insert orders --data '{
  "customer_id": 7,
  "status": "draft",
  "$details": {
    "table": "order_items",
    "fk": "order_id",
    "rows": [
      { "product_id": 11, "quantity": 3, "unit_price": 29.99 }
    ]
  }
}'
```

Sapporta inserts the parent, reads its primary key, backfills the child
foreign-key column, and inserts the detail rows in one transaction. If any row
fails validation, the transaction rolls back. Do not include the parent
foreign-key column in the detail rows.

## Update and delete ordinary rows

```bash
pnpm exec sapporta rows update customers 7 \
  --data '{"email":"billing@example.com"}'

pnpm exec sapporta rows delete customers 7
```

Both commands operate inside row visibility. A row outside the active
workspace/user boundary behaves like a missing row.

## Filter a table through HTTP

```bash
curl -fsS -G \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  --data-urlencode "filter[status][eq]=sent" \
  --data-urlencode "filter[due_date][lte]=2026-06-30" \
  --data-urlencode "sort=-due_date" \
  --data-urlencode "page=1" \
  --data-urlencode "limit=50" \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/tables/invoices"
```

Malformed filters return `400`. Fix the filter shape, column name, operator, or
value before retrying; do not drop the filter to make the request succeed. See
[Reference](/docs/reference/) for the filter syntax.

## Call a report route

```bash
pnpm exec sapporta describe "GET /api/reports/trial-balance"

curl -fsS \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/reports/trial-balance?asOfDate=2026-06-30"
```

Reports are app-owned routes. Use `describe` to inspect the route shape, then
call the endpoint with the documented query or JSON body.

## Call a custom product endpoint

```bash
pnpm exec sapporta describe "POST /api/invoices/123/void"

curl -fsS \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"reason":"duplicate"}' \
  "${SAPPORTA_API_URL}/api/invoices/123/void"
```

The CLI does not directly invoke arbitrary user-defined endpoints. It can
discover them through OpenAPI; use `curl`, a typed client, or another HTTP
client to run the route.

## Use structured output in scripts

```bash
pnpm exec sapporta tables --output-format json
pnpm exec sapporta rows get customers 7 --output-format json
```

You can also set `SAPPORTA_OUTPUT_FORMAT=json` for a script that runs multiple
commands.

## Use SQL as a fallback

```bash
pnpm exec sapporta db exec-sql \
  "SELECT id, name FROM customers ORDER BY id DESC LIMIT 10"

pnpm exec sapporta db exec-sql \
  --input-body-json '{"sql":"SELECT id, name FROM customers","limit":50}'
```

For risky maintenance SQL, check the statement first:

```bash
pnpm exec sapporta db exec-sql \
  --input-body-json '{"sql":"DELETE FROM customers WHERE id = 7","dryRun":true}'
```

SQL writes bypass normal table save hooks, default handling, ownership stamping,
route-edge authorization helpers, and scoped row helpers. Use them only after
report routes, table queries, row commands, and product endpoints are ruled out.
