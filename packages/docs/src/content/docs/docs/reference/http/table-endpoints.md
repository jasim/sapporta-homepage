---
title: "Table endpoints"
description:
  "Look up generated table routes, envelopes, statuses, lookup, count, and
  export."
---

## Identity

Generated HTTP routes under `/api/tables/<table>`.

## Contract

- `GET /api/tables/<table>` returns `{ data: row[], meta }`.
- `GET /api/tables/<table>/<id>` returns `{ data: row }`.
- `POST /api/tables/<table>` accepts one row, many rows, or supported `$details`
  input and returns 201.
- `PUT` and `DELETE /api/tables/<table>/<id>` return `{ data: row }`.
- `GET .../_lookup`, `GET .../_count`, and `GET .../export.csv` expose lookup,
  child-count, and CSV surfaces.
- Insert and patch schemas expose only caller-controlled fields. Generated
  primary keys, auth scope fields, `apiWritable: false` columns, and references
  with `apiSettable: false` are absent from OpenAPI and generated client types.
- Generated handlers apply current abilities, API write policy, row visibility,
  trusted values, visible-reference checks, structural parsing, application
  issues, and immutable-table policy.
- Request-time write policy rejects server-owned fields even when a caller
  bypasses generated clients. Authoritative structural parsing runs after auth
  has supplied required trusted values and immediately before the Drizzle write.
- Request and response objects use public SQL column names. Insert parsing
  permits omission for defaulted or nullable fields; patch omission leaves a
  field unchanged.

## Direct endpoint discovery

Inspect the mounted operation before composing a raw request:

```bash
pnpm exec sapporta endpoints show "GET /api/tables/tasks"
pnpm exec sapporta endpoints show "PUT /api/tables/tasks/{id}"
```

Use the discovered method, path, request shape, auth boundary, and response
schema. Generated row updates use `PUT /api/tables/<table>/<id>`, not `PATCH`.
The discovered request schema describes caller-supplied values. It is not the
trusted write schema used after auth preparation.

## Related documentation

- [Generated table APIs](/docs/guides/generated-surfaces/generated-table-apis/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
