---
title: "Table endpoints"
description: "Look up generated table routes, envelopes, statuses, lookup, count, and export."
---

## Identity

Generated HTTP routes under `/api/tables/<table>`.

## Contract

- `GET /api/tables/<table>` returns `{ data: row[], meta }`.
- `GET /api/tables/<table>/<id>` returns `{ data: row }`.
- `POST /api/tables/<table>` accepts one row, many rows, or supported `$details` input and returns 201.
- `PUT` and `DELETE /api/tables/<table>/<id>` return `{ data: row }`.
- `GET .../_lookup`, `GET .../_count`, and `GET .../export.csv` expose lookup, child-count, and CSV surfaces.
- Generated handlers apply current abilities, row visibility, trusted values, references, validation, and immutable-table policy.


## Related documentation

- [Generated table APIs](/docs/guides/generated-surfaces/generated-table-apis/)
