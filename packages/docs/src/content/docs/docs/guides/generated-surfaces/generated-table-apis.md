---
title: "Generated table APIs"
description:
  "Use generated row routes and identify when an app-owned endpoint is required."
---

This page uses the generated HTTP and CLI surfaces for ordinary record work. You
will inspect a mounted route, list and update tasks, read the response
envelopes, and identify the point where a custom endpoint becomes appropriate.
These routes can power generated screens, scripts, integrations, and
agent-driven data work without a second CRUD implementation.

```text
Use the generated tasks API to list open tasks and raise one task's priority. Inspect the mounted routes first, and keep workspace fields server-controlled.
```

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
contain client-editable domain values only. They omit `workspace_id`,
`scoped_to_user_id`, and other trusted values because the server derives row
scope from the authenticated request.

Generated request bodies preserve each column's semantic JSON value.
Select-backed text stays a string, numbers and booleans stay JSON primitives,
foreign keys retain the target primary-key type, and dates and timestamps use
canonical strings. Parse Temporal values only at a declared application
boundary.

Lookup, count, and CSV export apply the same row-access predicates as the list
route. A project lookup therefore returns only visible projects:

```json
{
  "entries": [{ "value": 1, "label": "Website Relaunch" }]
}
```

<!--
Screenshot brief
Suggested asset: generated-table-api-cli-round-trip.png
Setup: Run the migrated task app with one open task. Execute endpoints show for the task update route, then the rows list and rows update commands above.
Frame: Capture the mounted PUT route plus the list and successful priority update output in one terminal. Hide tokens and unrelated environment values.
Visible proof: The route uses PUT, the list returns only open tasks, and the updated row has priority high without a submitted workspace field.
Alt text: Terminal showing generated task endpoint discovery followed by a scoped list and update.
-->

## Know when CRUD is no longer the operation

Generated routes fit one-table record operations. Completing a task may need to
update `tasks`, insert an immutable `task_events` row, and return a
domain-specific result in one transaction. That is one app-owned endpoint with a
shared ts-rest contract, not two client-coordinated CRUD calls.

The task app now has a programmatic surface that matches its generated UI and
row boundary. Use it for ordinary record reads and writes. Move to an app-owned
endpoint when the operation spans tables, coordinates external effects, or needs
a domain response shape. The next guide makes generated queries bookmarkable and
deterministic.

## Related reference

- [Table endpoints](/docs/reference/http/table-endpoints/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
