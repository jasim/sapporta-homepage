---
title: "Query tasks through the generated API"
description:
  "Discover, query, and update task rows through the same generated routes used
  by the UI."
---

The generated screens from the previous page are clients of mounted table
routes. This page uses those routes directly and explains their envelopes,
strict query grammar, semantic values, and row boundary. You will discover the
task operations, list open tasks, update one priority, and inspect a rejected
filter. These calls support scripts, integrations, agent data work, and custom
screens that still perform ordinary single-table CRUD.

```text
Show me how to discover the generated tasks API, list open tasks, raise one task's priority, and confirm an invalid filter fails safely.
```

## Discover the mounted operations

Generated table operations live under `/api/tables/<table>`. Inspect the live
contract before constructing a direct request:

```bash
pnpm exec sapporta endpoints show "GET /api/tables/tasks"
pnpm exec sapporta endpoints show "PUT /api/tables/tasks/{id}"
```

The output shows the actual method, mounted path, authentication boundary, query
or body shape, and declared responses. The discovery step also prevents a common
mistake: generated row updates use `PUT`, not `PATCH`.

For a protected local app, use the authenticated Sapporta CLI, an authenticated
browser session, or a scoped API token. The examples below use the project-local
CLI form for record operations and show the equivalent HTTP exchange.

## List open tasks

Use the generated row command for a routine filtered read:

```bash
pnpm exec sapporta rows list tasks \
  --where '{"status":{"eq":"open"}}'
```

The equivalent HTTP request uses the strict `filter[column][operator]=value`
grammar:

```http
GET /api/tables/tasks?filter[status][eq]=open&page=1&limit=25
```

`curl --get` keeps the bracketed query readable and URL-encodes it correctly:

```bash
curl --get 'http://localhost:3000/api/tables/tasks' \
  -H 'Authorization: Bearer <token>' \
  --data-urlencode 'filter[status][eq]=open' \
  --data-urlencode 'page=1' \
  --data-urlencode 'limit=25'
```

List routes return rows and pagination metadata rather than a bare array:

```json
{
  "data": [
    {
      "id": 1,
      "project_id": 1,
      "title": "Publish launch checklist",
      "description": "Prepare the release list",
      "status": "open",
      "priority": "medium",
      "due_date": "2026-08-01"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 25, "pages": 1 }
}
```

Filters, search, sort, lookup, count, and export all run inside the same
row-visibility predicate. Product filters such as `status=open` narrow the rows
already visible to the request. Clients do not add a workspace filter or submit
workspace, owner, role, or scope fields.

Semantic values retain their JSON types. Select-backed status and priority are
strings. `project_id` remains a number because the target primary key is a
number. `due_date` is a canonical `YYYY-MM-DD` wire string; domain code parses
it into `Temporal.PlainDate` only at a declared application boundary.

## Update one visible row

Update the task through the CLI:

```bash
pnpm exec sapporta rows update tasks 1 \
  --values '{"priority":"high"}'
```

The corresponding HTTP exchange is:

```http
PUT /api/tables/tasks/1
Content-Type: application/json

{ "priority": "high" }
```

```json
{
  "data": {
    "id": 1,
    "project_id": 1,
    "title": "Publish launch checklist",
    "description": "Prepare the release list",
    "status": "open",
    "priority": "high",
    "due_date": "2026-08-01"
  }
}
```

The route applies the update to `id = 1` and the request's row predicate in the
same SQL write. A missing row and a row invisible to the caller both use the
same not-found result, so the endpoint does not disclose whether an inaccessible
identifier exists.

Refresh `/tables/tasks` after the command. The generated grid reads the same
route and shows the high priority immediately.

<!--
Screenshot brief
Suggested asset: getting-started-task-api-round-trip.png
Setup: Run the app with Publish launch checklist in open status. Execute both endpoints show commands, the filtered rows list, and the priority update.
Frame: Capture the discovered GET and PUT operations plus the successful list and update output in one wide terminal. Hide tokens and unrelated environment values.
Visible proof: Discovery precedes the calls, the list contains only open tasks, the update uses PUT, and the returned task has high priority without a client-supplied scope field.
Alt text: Terminal showing task endpoint discovery followed by a filtered generated-table query and PUT update.
-->

## Treat rejected queries as caller errors

The generated query parser rejects unknown columns, unsupported operators,
malformed semantic values, invalid pagination, and incomplete filter shapes. For
example, this request omits the operator bracket:

```http
GET /api/tables/tasks?filter[status]=open
```

It returns HTTP 400 with a structured error body:

```json
{
  "error": "Filter \"filter[status]\" must use filter[col][op]=value syntax",
  "code": "unknown_filter_shape"
}
```

The caller must correct the query. Retrying after silently dropping the bad
predicate can turn a bounded worklist or export into a much larger read.

<!--
Screenshot brief
Suggested asset: getting-started-task-api-invalid-filter.png
Setup: Send the invalid filter request from an authenticated browser Network panel, an API client, or curl with a valid token.
Frame: Capture the request URL, HTTP 400 status, and the complete JSON error body. Redact authentication material.
Visible proof: The missing operator produces unknown_filter_shape and does not fall back to an unfiltered task list.
Alt text: Generated task API returning a structured 400 response for an invalid filter shape.
-->

Ordinary task reads and edits now have one programmatic surface shared with the
generated UI. Its envelopes, semantic values, strict filters, and row boundary
are predictable after endpoint discovery. A later tutorial step will use an
app-owned endpoint when completing a task must update the task and append
history atomically. First, continue to
[Use the task app](/docs/getting-started/use-the-task-app/) to load a stable
dataset and exercise the complete generated surface. The
[generated table API guide](/docs/guides/generated-surfaces/generated-table-apis/),
[table endpoint reference](/docs/reference/http/table-endpoints/), and
[query syntax reference](/docs/reference/http/query-syntax/) cover the remaining
generated operations.
