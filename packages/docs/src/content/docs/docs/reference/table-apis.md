---
title: "Table APIs"
description:
  "Lookup generated table route inventory, request shapes, response envelopes,
  lookup, count, and export behavior."
---

## Table API reference

Every table gets row-scoped routes under `/api/tables/<table>`. Protected apps
apply the current session or agent token to list, lookup, count, export, get,
update, and delete operations.

For examples and behavioral guidance, see
[Generated Table APIs](/docs/subsystems/generated-table-apis/).

| Operation     | Route                                | Shape                                                                                                  |
| ------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| List rows     | `GET /api/tables/<table>`            | Query accepts filters, `q`, `sort`, `page`, `limit`.                                                   |
| Get row       | `GET /api/tables/<table>/<id>`       | Returns `{ "data": row }`.                                                                             |
| Create row(s) | `POST /api/tables/<table>`           | Body is an object, an array, or a parent object with `$details`.                                       |
| Update row    | `PUT /api/tables/<table>/<id>`       | Body is a partial row object.                                                                          |
| Delete row    | `DELETE /api/tables/<table>/<id>`    | Returns the deleted row envelope.                                                                      |
| Export CSV    | `GET /api/tables/<table>/export.csv` | CSV response; uses row visibility plus filters, search, and sort.                                      |
| Lookup labels | `GET /api/tables/<table>/_lookup`    | Query: `ids`, `q`, `limit`; lookup `limit` must be `1..500`; response `{ "entries": [{ "value": 1, "label": "Label" }] }`. |
| Child counts  | `GET /api/tables/<table>/_count`     | Query: `group_by=<fk>&ids=1,2`; response `{ "data": { "1": 3 } }`.                                     |

List responses are always enveloped:

```json
{
  "data": [{ "id": 1 }],
  "meta": { "page": 1, "pages": 1, "total": 1, "limit": 50 }
}
```

Use `curl -G` or URL-encode bracketed filter keys:

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
