---
title: "Agent Data Console"
description:
  "Use the Sapporta CLI and APIs to discover, inspect, query, and safely change
  app data."
---

The Sapporta CLI is a console over the selected running app. It reads the live
API shape, inspects generated table metadata, samples rows, and runs built-in
row or SQL commands against the same server your users call from the browser.

For protected apps, set up
[Agent Access](/docs/tools-and-operations/agent-access/) first.

## Discovery before action

Every Sapporta app exposes its current API shape at:

```txt
GET /api/openapi.json
```

`pnpm exec sapporta describe` reads that live OpenAPI document and is the first
human-readable discovery step:

```bash
pnpm exec sapporta describe
pnpm exec sapporta describe "GET /api/tables/customers"
pnpm exec sapporta describe "POST /api/invoices/123/void"
```

The document includes generated table APIs, metadata routes, SQL tooling, report
routes, and mounted custom app endpoints. Most CLI data commands talk to the
selected running app, not directly to local files.

Use this operating loop:

```txt
target app -> authenticate -> describe API -> inspect tables -> sample rows
           -> choose report/table/row/custom endpoint -> execute -> verify
```

## Core discovery commands

```bash
pnpm exec sapporta describe
pnpm exec sapporta describe "GET /api/tables/customers"
pnpm exec sapporta describe "POST /api/invoices/123/void"

pnpm exec sapporta tables
pnpm exec sapporta tables show customers
pnpm exec sapporta tables indexes customers
pnpm exec sapporta tables sample customers --limit 10 --fields id,name,email
```

| Command          | Use                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------- |
| `describe`       | Find route paths, methods, request schemas, response schemas, and mounted app APIs. |
| `tables`         | See table names registered by the running app.                                      |
| `tables show`    | Inspect columns, constraints, metadata, relationships, and row shape.               |
| `tables indexes` | Check indexes before diagnosing query performance or uniqueness.                    |
| `tables sample`  | See real values and resolve foreign keys before writes.                             |

## Choose the right operation

Use the highest-level surface that fits the work:

| Need                                                                                      | Prefer                                         |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Business questions, balances, ledgers, summaries, or rollups                              | Report routes                                  |
| Row-level questions that fit search, filters, sort, and pagination                        | Table list APIs                                |
| Ordinary table mutations                                                                  | `pnpm exec sapporta rows insert/update/delete` |
| Domain actions such as voiding, importing, approving, reserving, or multi-table workflows | Custom product endpoints                       |
| Inspection or maintenance with no report, table query, row command, or endpoint           | SQL fallback                                   |

Report routes and custom product endpoints are app-owned HTTP routes. The CLI
can inspect them with `describe`, but it does not directly invoke arbitrary
user-defined endpoints. Call those routes with `curl`, a typed client, or
another HTTP client.

## Row safety model

Generated table APIs apply row visibility for list, get, create, update, delete,
lookup, count, and export. Row commands use those same server routes, so
validation, defaults, trusted row ownership stamping, visible foreign-key
checks, and route authorization still run.

In auth-enabled apps, omit these system-managed fields:

```txt
workspace_id
workspaceId
scoped_to_user_id
scopedToUserId
```

The current browser session or agent token supplies trusted scope values.
Foreign keys should be resolved from visible rows, not guessed. A route
permission check does not widen row visibility; data authority still determines
the row predicate. Generated routes return `404` for rows outside the active
boundary on get, update, and delete.

## Query tables through HTTP

Generated table list APIs support filters, search, sort, and pagination:

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

Malformed filters return `400` and should be fixed at the caller. Do not retry
by dropping the filter, because that can accidentally read or export a much
larger result set. For the full grammar, see [Reference](/docs/reference/).

## Call report and custom routes

Reports are normal app routes. Discover the route first, then call it with the
documented query or body shape:

```bash
pnpm exec sapporta describe "GET /api/reports/trial-balance"

curl -fsS \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/reports/trial-balance?asOfDate=2026-06-30"
```

Custom product endpoints follow the same pattern:

```bash
pnpm exec sapporta describe "POST /api/invoices/123/void"

curl -fsS \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"reason":"duplicate"}' \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/invoices/123/void"
```

## Use SQL as a fallback

Use SQL only when no report route, table query, row command, or custom endpoint
fits. Read-only inspection is the normal case:

```bash
pnpm exec sapporta db exec-sql \
  "SELECT id, name FROM customers ORDER BY id DESC LIMIT 10"
```

SQL writes bypass table save behavior, validation hooks, default handling,
ownership stamping, route-edge ability helpers, and scoped row helpers. Use SQL
writes only for explicit maintenance tasks after safer surfaces are ruled out,
and prefer `dryRun` when checking risky statements.

For task-specific command patterns, see
[Agent Data Console Recipes](/docs/tools-and-operations/agent-data-console-recipes/).
