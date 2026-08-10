---
title: "Metadata and SQL endpoints"
description:
  "Look up framework metadata routes and privileged SQL HTTP surfaces."
---

## Identity

Framework routes registered under `/api/meta`, including the privileged
`POST /api/meta/sql` escape hatch.

## Contract

- `GET /api/meta/info` returns project identity.
- `GET /api/meta/tables` returns `{ tables: TableSchema[] }`.
- `GET /api/meta/tables/<name>` returns one `TableSchema`.
- A serialized `TableSchema` contains `name`, `label`, `immutable`, `columns`,
  `children`, optional `rowLinks`, `rowLabelColumns`, optional `rowCount`, and
  `searchable`.
- Serialized columns contain public SQL names, labels, semantic kinds,
  structural facts, references, select options, and supported presentation
  hints. Children contain their table, foreign key, label, columns, default
  sort, and optional width.
- Every serialized table column has a semantic `kind`. Select options come from
  the column's Drizzle enum declaration, and `apiWritable` is included when the
  table definition declares an API write restriction.
- Browser table code parses the metadata response with the shared `TableSchema`
  Zod contract before using it for display, filter, form-draft, or grid-patch
  behavior.
- The response is a presentation/schema projection. It does not contain row
  scope, abilities, request authority, validation callbacks, authoring
  references, or the recursive search plan. `searchable` is only a capability
  flag.
- `POST /api/meta/sql` returns rows for read statements. Mutating statements
  require the route's privileged authority plus `allowDangerous: true`.
- SQL bypasses table helpers, trusted-value preparation, reference checks, and
  ordinary row visibility.
- The running OpenAPI document exposes registration, request parameters, limits,
  dry-run input, and declared responses. It does not prove the application's
  authorization requirements.

## Related documentation

- [Choose an application interface](/docs/guides/discovery/choose-an-application-interface/)
- [Tables, columns, and schema metadata](/docs/guides/model-data/tables-columns-and-schema-metadata/)
- [OpenAPI and endpoint discovery](/docs/guides/discovery/openapi-and-endpoint-discovery/)
