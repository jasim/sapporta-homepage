---
title: "Generated table APIs"
description:
  "Use generated CRUD routes for ordinary record work and identify when an
  app-owned operation is required."
---

Every registered table receives one HTTP surface for ordinary record work. The
generated screens, CLI, scripts, and integrations use the same row-safe
operations.

## Inspect before calling

List, get, create, update, and delete live under
`/api/tables/<table>`. Inspect the mounted operation before composing direct
HTTP:

```bash
pnpm exec sapporta endpoints show "GET /api/tables/tasks"
pnpm exec sapporta endpoints show "PUT /api/tables/tasks/{id}"
```

Discovery shows method, path, request, and declared responses; it does not prove
the application authorization boundary. Generated updates use `PUT`, not
`PATCH`, while accepting a patch-shaped subset of writable fields.

For routine data work, use the CLI and resolve IDs from visible results:

```bash
pnpm exec sapporta rows list tasks --where '{"status":{"eq":"open"}}'
pnpm exec sapporta rows update tasks "$TASK_ID" --values '{"priority":"high"}'
```

The equivalent list route is:

```http
GET /api/tables/tasks?filter[status][eq]=open
```

List responses contain rows and pagination metadata. Single-row reads and
writes return `{ "data": row }`.

## Send only caller-owned values

Create and update bodies contain API-writable domain values. They omit
default-generated primary keys, managed scope fields, `apiWritable: false`
columns, and references with `apiSettable: false`. Client-assigned primary keys
remain writable when the table permits them.

Create a parent first, take its key from the `201` response, and use that key for
child foreign keys. Do not assume a fresh database starts at ID `1`.

Generated request bodies preserve semantic JSON values. Numbers and booleans
stay primitives, foreign keys retain the target key type, and dates and
timestamps use canonical strings. Row security merges trusted scope and
server-authored values, verifies reference visibility, then the save pipeline
parses, canonicalizes, validates, and writes.

Once the caller has action permission, a generated single-row read, update, or
delete uses the same `404 ROW_NOT_FOUND` for a missing row and a row hidden by
scope. Possessing an ID is not authority.

## Continue with specialized generated operations

- [Generated lookups and CSV export](/docs/guides/generated-surfaces/generated-lookups-and-csv-export/)
  covers picker search, selected-ID rehydration, and streaming exports.
- [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
  covers filtered totals and bounded one-column groups without loading rows.
- [Filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)
  owns the strict list/export query grammar.

## Know when CRUD is no longer the operation

Generated routes fit one-table record operations. Completing a task may need to
update `tasks`, append a `task_events` row, and return one domain result in a
transaction. That is one app-owned endpoint, not two client-coordinated CRUD
calls.

Use generated routes while the operation means “read or change this table.”
Use an app-owned endpoint when it has its own name, transaction, external
effect, or response.

## Related reference

- [Table endpoints](/docs/reference/http/table-endpoints/)
- [Generated and client values](/docs/reference/schema/semantic-values/generated-and-client-values/)
- [OpenAPI and endpoint discovery](/docs/guides/discovery/openapi-and-endpoint-discovery/)
- [Row-safe custom endpoints and reports](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
