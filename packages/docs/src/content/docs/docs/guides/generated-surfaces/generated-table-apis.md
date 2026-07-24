---
title: "Generated table APIs"
description:
  "Use generated row routes and identify when an app-owned endpoint is required."
---

Every registered table receives one HTTP surface for ordinary record work. The
generated screens, CLI, scripts, and integrations can all use that same
surface.

## Inspect before calling

Every registered table receives list, get, create, update, delete, lookup,
count, and export routes under `/api/tables/<table>`. Inspect the mounted
contract before composing a direct HTTP request:

```bash
pnpm exec sapporta endpoints show "GET /api/tables/tasks"
pnpm exec sapporta endpoints show "PUT /api/tables/tasks/{id}"
```

The command shows the actual method, path, auth boundary, request shape, and
declared responses. Generated updates use `PUT`, not `PATCH`.

For routine data work, the CLI handles authentication and the response envelope:

```bash
pnpm exec sapporta rows list tasks --where '{"status":{"eq":"open"}}'
pnpm exec sapporta rows update tasks 1 --values '{"priority":"high"}'
```

The equivalent list request is:

```http
GET /api/tables/tasks?filter[status][eq]=open
```

Its response is an object with rows and pagination metadata:

```json
{
  "data": [
    {
      "id": 1,
      "project_id": 1,
      "title": "Publish launch checklist",
      "status": "open",
      "priority": "high",
      "due_date": "2026-08-01"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 50, "pages": 1 }
}
```

Single-row reads and writes return `{ "data": row }`. Create and update bodies
contain API-writable domain values only. They omit default-generated primary
keys, `workspace_id`, `scoped_to_user_id`, `apiWritable: false` columns, and
server-authored references because the server derives or supplies those values.
Client-assigned primary keys remain writable when the table definition permits
them.
Generated OpenAPI and clients expose the same caller-controlled field set, and
request-time policy rejects prohibited fields when a caller bypasses them.

Generated request bodies preserve each column's semantic JSON value.
Select-backed text stays a string, numbers and booleans stay JSON primitives,
foreign keys retain the target primary-key type, and dates and timestamps use
canonical strings. Parse Temporal values only at a declared application
boundary.

The request schema is not the final insert shape. Row security first merges
trusted workspace, user-scope, and server-authored values and verifies reference
visibility. The save pipeline then performs authoritative structural parsing,
canonicalizes date and timestamp values, runs the table's top-level `validate()`
callback, and writes the parsed output. This order lets a required scope field
remain absent from the public body without weakening write validation.

Lookup, count, and CSV export apply the same row-access predicates as the list
route. A project lookup therefore returns only visible projects:

```json
{
  "entries": [
    { "value": 1, "label": "Website Relaunch", "meta": {} }
  ]
}
```


## Know when CRUD is no longer the operation

Generated routes fit one-table record operations. Completing a task may need to
update `tasks`, insert an immutable `task_events` row, and return a
domain-specific result in one transaction. That is one app-owned endpoint with a
shared ts-rest contract, not two client-coordinated CRUD calls.

Use generated routes while the operation still means “read or change this
table.” Use an app-owned endpoint when the operation has its own name,
transaction, external effect, or response.

## Related reference

- [Table endpoints](/docs/reference/http/table-endpoints/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
