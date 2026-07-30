---
title: "Table endpoints"
description:
  "Look up generated table routes, envelopes, statuses, lookup, count, and
  export."
---

## Identity

Generated HTTP routes under `/api/tables/<table>`.

## Contract

- `GET /api/tables/<table>` returns
  `{ data: row[], meta: { total, page, limit, pages } }`. `page` defaults to
  `1`; `limit` defaults to `50` and accepts `1` through `1000`.
- `GET /api/tables/<table>/<id>` returns `{ data: row }`. This HTTP operation
  does not imply a generated frontend detail route.
- `POST /api/tables/<table>` accepts one row, an array of rows, or a supported
  master-with-`$details` body. It returns HTTP `201` with `{ data: row }`,
  `{ data: row[] }`, or `{ data: { master: row, details: row[] } }`,
  respectively.
- `PUT /api/tables/<table>/<id>` accepts a strict partial object containing any
  writable subset. Omitted fields remain unchanged. It returns `{ data: row }`.
- `DELETE /api/tables/<table>/<id>` returns the deleted row as `{ data: row }`.
- `GET /api/tables/<table>/_lookup` returns
  `{ entries: Array<{ value: string | number, label: string, meta: row }> }`.
  `meta` contains ordinary visible source-row fields; it is not invariantly
  empty. The query uses exactly one of two modes:
  - `ids=1,2` recovers `1` through `500` selected IDs and rejects `q`, `fields`,
    or `limit`.
  - `q=relaunch&fields=name,code&limit=20` searches visible display fields.
    Search defaults to `50` results and accepts at most `500`.
- `GET /api/tables/<table>/_count` returns either
  `{ data: { kind: "total", count: number } }` or
  `{ data: { kind: "grouped", groups: Array<{ value, count }> } }`. Group values
  are typed strings, numbers, booleans, or `null`.
- `GET /api/tables/<table>/export.csv` returns CSV.
- List, export, and count preserve repeated `filter[column][operator]` keys and
  AND-combine every condition. They do not collapse repeated keys to the last
  value.
- `q` on the list and CSV export routes runs the same table search plan. Lookup
  `q` follows lookup display fields instead; count does not accept table search.
- Count accepts the canonical `filter[column][operator]` parameters. Without
  `group_by`, `order` and `limit` are invalid. With `group_by`, count order
  defaults to descending and `limit` defaults to `50`, with a maximum of `1000`.
  Count ties use the group value ascending.
- A foreign-key group returns keys rather than labels. Resolve labels through
  the target table's lookup route, which applies its own authorization and row
  scope.
- Insert and patch schemas expose only caller-controlled fields. Generated
  primary keys with defaults, system-managed scope fields, `apiWritable: false`
  columns, and references with `apiSettable: false` are absent from OpenAPI and
  generated client types. Client-assigned primary keys remain available when the
  table permits them.
- Timestamp defaults do not make a column API-owned. Set `apiWritable: false`
  when a direct caller must not provide that timestamp.
- Generated handlers apply current abilities, API write policy, row visibility,
  trusted values, visible-reference checks, structural parsing, and application
  issues. Update and delete helpers also apply immutable-table policy.
- Request-time write policy rejects server-owned fields even when a caller
  bypasses generated clients. Authoritative structural parsing runs after auth
  has supplied required trusted values and immediately before the Drizzle write.
- Request and response objects use public SQL column names. Insert parsing
  permits omission for defaulted or nullable fields; patch omission leaves a
  field unchanged.
- Primary and foreign keys may be strings or numbers. Lookup `value`, create
  bodies, filters, and returned rows preserve the declared key type.
- CSV export is unpaginated, but it does not first materialize the complete
  result. The handler streams a deterministically ordered selection through one
  SQLite cursor and one read snapshot. Finishing or cancelling the response
  releases that cursor.
- After action authorization succeeds, a missing row and a row excluded by its
  row predicate both return HTTP `404`:

  ```json
  { "error": "Not found", "code": "ROW_NOT_FOUND" }
  ```

  Action denial is a separate authorization result. The
  [auth and row-security reference](/docs/reference/server/auth-and-row-security/)
  owns the exact managed-field and authorization boundaries.

### Example envelopes

```json
{
  "data": [{ "id": 42, "name": "Website Relaunch" }],
  "meta": { "total": 1, "page": 1, "limit": 25, "pages": 1 }
}
```

```json
{
  "entries": [
    {
      "value": 42,
      "label": "Website Relaunch",
      "meta": { "id": 42, "name": "Website Relaunch" }
    }
  ]
}
```

```json
{
  "data": {
    "kind": "grouped",
    "groups": [
      { "value": 1, "count": 4 },
      { "value": null, "count": 2 }
    ]
  }
}
```

## Direct endpoint discovery

Inspect the mounted operation before composing a raw request:

```bash
pnpm exec sapporta endpoints show "GET /api/tables/tasks"
pnpm exec sapporta endpoints show "GET /api/tables/{tableName}/_count"
pnpm exec sapporta endpoints show "PUT /api/tables/tasks/{id}"
```

Use the discovered method, path, request shape, and declared response schema.
The output does not describe application authorization requirements. Generated
row updates use `PUT /api/tables/<table>/<id>`, not `PATCH`, but the body is
patch-shaped. The discovered request schema describes caller-supplied values; it
is not the trusted write shape produced after auth preparation.

## Related documentation

- [Generated table APIs](/docs/guides/generated-surfaces/generated-table-apis/)
- [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
- [Filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)
- [Use table search](/docs/guides/model-data/use-table-search/)
- [Generated and client values](/docs/reference/schema/semantic-values/generated-and-client-values/)
