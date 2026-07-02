---
title: "Choose APIs And Tools"
description:
  "Pick generated table APIs, CLI data commands, reports, custom endpoints,
  typed clients, or SQL fallback."
---

Sapporta apps expose several API and tooling surfaces. Start by discovering the
running app, then choose the narrowest tool that matches the work.

```bash
pnpm exec sapporta describe
pnpm exec sapporta describe "GET /api/tables/customers"
pnpm exec sapporta tables show customers
```

`describe` reads the live OpenAPI document from `/api/openapi.json`, so it sees
table routes, metadata routes, SQL tooling, report routes, and custom workflow
routes your app exposes. That live discovery surface is also part of Sapporta's
[LLM-assisted engineering](/docs/tools-and-operations/llm-assisted-engineering/)
review loop.

For protected non-browser access, start with
[Agent Access](/docs/tools-and-operations/agent-access/). For the full discovery
and data-work loop, use
[Agent Data Console](/docs/tools-and-operations/agent-data-console/) and
[Agent Data Console Recipes](/docs/tools-and-operations/agent-data-console-recipes/).

## Choose the right surface

| Need                                                                             | Prefer                                                                                             |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Browse, correct, filter, or export row-level data                                | Table screens, [Generated Table APIs](/docs/subsystems/generated-table-apis/), or CLI row commands |
| Repeatable seed data or one ordinary row change                                  | `pnpm exec sapporta rows ...`                                                                      |
| Business action, state transition, transaction, file upload, or external service | [Custom API Endpoints](/docs/subsystems/custom-api-endpoints/)                                     |
| Summary, ledger, statement, aging, or operational rollup                         | A route-based report                                                                               |
| Frontend product call to your app's route                                        | [Typed API Clients](/docs/subsystems/typed-api-clients/) over a shared contract                    |
| Discover the deployed contract or debug a missing route                          | [API Discovery And OpenAPI](/docs/subsystems/openapi-and-discovery/)                               |
| Debugging an edge case no endpoint can answer                                    | Read-only SQL fallback                                                                             |

Use table APIs for ordinary row CRUD, lookup, count, and export. Use a custom
endpoint when the action has product meaning beyond editing a row. Use a report
route for business questions that should be repeatable.

## OpenAPI discovery

Every running app publishes its live OpenAPI document at:

```txt
GET /api/openapi.json
```

Use `describe` for a human-readable view:

```bash
pnpm exec sapporta describe
pnpm exec sapporta describe "GET /api/tables/customers"
pnpm exec sapporta describe "POST /api/invoices/123/void"
```

For route selectors, raw OpenAPI access, protected discovery, and missing-route
debugging, see
[API Discovery And OpenAPI](/docs/subsystems/openapi-and-discovery/).

## Credentials for protected apps

By default, the CLI calls `http://localhost:3000`. Point it at another app with
`SAPPORTA_API_URL` or `--api-url`.

Protected apps need an agent token for CLI, coding agent, CI, script, report,
and custom endpoint calls:

```bash
export SAPPORTA_API_URL="https://app.example.com"
export SAPPORTA_API_TOKEN="spat_..."

pnpm exec sapporta describe
pnpm exec sapporta tables
```

The token belongs to one user and one workspace. Ordinary data requests do not
send a workspace id; the current browser session or agent token selects the
trusted row boundary. See
[Agent Access](/docs/tools-and-operations/agent-access/) for token creation,
workspace scope, and auth-error recovery.

## Generated table APIs

Generated table APIs cover ordinary row-level work:

- `GET /api/tables/<table>` lists records with search, filters, sort, and
  pagination.
- `POST /api/tables/<table>` creates records.
- `PUT /api/tables/<table>/<id>` updates records.
- `DELETE /api/tables/<table>/<id>` deletes records.
- `GET /api/tables/<table>/_lookup` resolves foreign-key labels.
- `GET /api/tables/<table>/export.csv` exports the current result set.

Those routes apply the current session or agent token's row visibility. For the
full route inventory, envelopes, lookup/count/export behavior, and `$details`
create shape, see
[Generated Table APIs](/docs/subsystems/generated-table-apis/).

## Filters and table queries

Table list and export routes use strict query parameters:

```txt
filter[col][op]=value
q=search
sort=created_at,-id
page=1
limit=50
```

Use `curl -fsS -G` with `--data-urlencode` for bracketed filter keys:

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

Malformed filters return `400`. Fix the query; do not retry by dropping the
filter. See [Reference](/docs/reference/) for the filter syntax.

## CLI data commands

Use the project-local command form:

```bash
pnpm exec sapporta ...
```

Discovery commands:

```bash
pnpm exec sapporta describe
pnpm exec sapporta tables
pnpm exec sapporta tables show customers
pnpm exec sapporta tables sample customers --limit 10 --fields id,name,email
```

Row commands call the same table APIs as the app, so validation, defaults,
trusted workspace/user fields, visible foreign-key checks, and row-access checks
still run:

```bash
pnpm exec sapporta rows insert customers \
  --data '{"name":"Acme Co","email":"ops@example.com"}'

pnpm exec sapporta rows update customers 7 \
  --data '{"email":"billing@example.com"}'

pnpm exec sapporta rows delete customers 7
```

Omit server-managed fields such as `id`, `created_at`, and `updated_at`. In
auth-enabled projects, also omit `workspace_id`, `workspaceId`,
`scoped_to_user_id`, and `scopedToUserId`.

For the recommended operating loop and copyable task recipes, see
[Agent Data Console](/docs/tools-and-operations/agent-data-console/) and
[Agent Data Console Recipes](/docs/tools-and-operations/agent-data-console-recipes/).

## Reports and custom endpoints

Reports are app-owned routes. Use `describe` to inspect the route shape, then
call the endpoint with `curl`, a typed client, or another HTTP client:

```bash
pnpm exec sapporta describe "GET /api/reports/trial-balance"

curl -fsS \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/reports/trial-balance?asOfDate=2026-06-30"
```

Custom product endpoints follow the same pattern. The CLI can discover them, but
it does not directly invoke arbitrary user-defined endpoints:

```bash
pnpm exec sapporta describe "POST /api/invoices/123/void"

curl -fsS \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"reason":"duplicate"}' \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/invoices/123/void"
```

Use [Custom API Endpoints](/docs/subsystems/custom-api-endpoints/) for endpoint
design and [Create Reports](/docs/subsystems/reports/) for report route
patterns.

## Typed clients

Frontend product code should call custom app routes through typed clients over
shared contracts. That keeps request and response shapes checked against the
same contract the backend registers and OpenAPI exposes.

Use direct `curl` or generic HTTP clients for scripts, CI, integration checks,
and data-console work. Use
[Typed API Clients](/docs/subsystems/typed-api-clients/) for browser app code.

## Use SQL as a fallback

Use direct SQL only when no report route, table query, row command, or custom
endpoint fits. `sapporta db exec-sql` calls `POST /api/meta/sql` on the running
app.

Read-only inspection is the normal SQL use case:

```bash
pnpm exec sapporta db exec-sql \
  "SELECT id, name FROM customers ORDER BY id DESC LIMIT 10"
```

SQL writes bypass forms, table save behavior, validation hooks, trusted
workspace/user fields, and row-scoped helpers. Use them only for explicit
maintenance work when safer surfaces do not apply.

SQL inspection is not proof of what a workspace user can see through row-scoped
APIs. A raw query can show rows that a table route, report route, or custom
workflow correctly hides after applying ability and row-security predicates.
When raw SQL is needed in application code, keep it in a store module and
preserve the same visible base rows before composing aggregates or joins.
