---
title: "Generated table APIs"
description:
  "Use generated row routes and identify when an app-owned endpoint is required."
---

Every registered table receives one HTTP surface for ordinary record work. The
generated screens, CLI, scripts, and integrations can all use that same surface.

## Inspect before calling

Every registered table receives list, get, create, update, delete, lookup,
count, and export routes under `/api/tables/<table>`. Inspect the mounted
contract before composing a direct HTTP request:

```bash
pnpm exec sapporta endpoints show "GET /api/tables/tasks"
pnpm exec sapporta endpoints show "GET /api/tables/{tableName}/_count"
pnpm exec sapporta endpoints show "PUT /api/tables/tasks/{id}"
```

The command shows the actual method, path, query or body shape, and declared
responses. It does not describe the application authorization boundary. Read the
route registration and security policy, then prove protected behavior with
negative authorization tests. Generated updates use `PUT`, not `PATCH`, while
accepting a patch-shaped subset of writable fields.

For routine data work, the CLI handles authentication and the response envelope.
Set `TASK_ID` from a create or list response before updating:

```bash
pnpm exec sapporta rows list tasks --where '{"status":{"eq":"open"}}'
pnpm exec sapporta rows update tasks "$TASK_ID" --values '{"priority":"high"}'
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
keys, system-managed scope fields, `apiWritable: false` columns, and references
with `apiSettable: false`. Client-assigned primary keys remain writable when the
table definition permits them. A timestamp default does not make that column
API-owned by itself; declare `apiWritable: false` when direct callers must not
set it.

Create a parent first, take its key from the `201` response, and use that value
for child foreign keys. Do not assume a fresh database starts at ID `1`. Read
the created child back through the list or single-row HTTP endpoint and verify
the server-authored values that matter to the workflow.

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
    {
      "value": 1,
      "label": "Website Relaunch",
      "meta": { "id": 1, "name": "Website Relaunch" }
    }
  ]
}
```

The lookup `value` remains a number or string to match the target primary key.
`meta` contains visible fields from the source row and is not invariantly empty.

## Count without loading rows

The generated count route answers a filtered total over one table:

```http
GET /api/tables/tasks/_count?filter[status][neq]=completed
```

```json
{ "data": { "kind": "total", "count": 8 } }
```

Add `group_by`, `order`, and `limit` for a bounded group list:

```http
GET /api/tables/tasks/_count?filter[status][neq]=completed&group_by=project_id&order=desc&limit=10
```

The result uses `{ kind: "grouped", groups: [...] }`, and each group retains the
column's JSON type. The operation uses the generated `read` ability and the same
row predicate as list; it does not load complete rows or accept table search.

Use this route for ad hoc totals and one-column groups. If “pending,” “active,”
or another business term already belongs to a report, call that report instead
of inventing a filter at the client. A grouped foreign key returns keys, so
resolve labels through the target table's separately authorized lookup route.
The [count guide](/docs/guides/generated-surfaces/count-visible-rows/) covers
CLI usage, bounds, ordering, null groups, and app-owned server calls.

For an append-only history table, generated reads remain ordinary list queries:

```http
GET /api/tables/task_events?filter[task_id][eq]=42&sort=-occurred_at
```

That request is independent of any tutorial fixture. It asks for the visible
events for one returned task key, newest first. Event creation should use the
app-owned workflow that changes current state and records history together.

## Know when CRUD is no longer the operation

Generated routes fit one-table record operations. Completing a task may need to
update `tasks`, insert an immutable `task_events` row, and return a
domain-specific result in one transaction. That is one app-owned endpoint with a
shared ts-rest contract, not two client-coordinated CRUD calls.

Use generated routes while the operation still means “read or change this
table.” Use an app-owned endpoint when the operation has its own name,
transaction, external effect, or response.

Once the caller has action permission, a generated single-row read, update, or
delete uses the same `404 ROW_NOT_FOUND` result for a missing row and a row
hidden by its row predicate. Possessing an ID is not authority to read or change
it. The
[security guide](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
owns the full authorization and row-scope model.

## Related reference

- [Table endpoints](/docs/reference/http/table-endpoints/)
- [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
- [OpenAPI and endpoint discovery](/docs/guides/discovery/openapi-and-endpoint-discovery/)
