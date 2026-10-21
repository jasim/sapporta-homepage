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
- A list read accepts `fixed[col][op]=value` conditions in the filter grammar.
  Every returned row satisfies them; `filter[...]` and `q` select the matches
  among those rows. See
  [Fixed conditions](/docs/reference/http/query-syntax/#fixed-conditions).
- On a table with `meta.tree`, `tree=ancestors` or
  `tree=ancestors-and-descendants` returns each filter or search match with its
  ancestors (and its subtree), walking only through rows that satisfy the
  `fixed` conditions. With a filter or search applied, `meta` also carries
  `tree: { matchCount, contextIds }`: the number of rows that match themselves,
  and the ids of ancestors present only because a descendant matched. See
  [Keep tree matches in context](/docs/reference/http/query-syntax/#keep-tree-matches-in-context).
- `GET /api/tables/<table>/<id>` returns `{ data: row }`. This HTTP operation
  does not imply a generated frontend detail route. It accepts only the
  `computed` query parameter; any other query key returns HTTP `400`.
- `POST /api/tables/<table>` accepts one row, an array of rows, or a supported
  master-with-`$details` body. It returns HTTP `201` with `{ data: row }`,
  `{ data: row[] }`, or `{ data: { master: row, details: row[] } }`,
  respectively.
- Detail rows omit the `$details` foreign key; the server stamps it from the
  created master. A row that carries it is rejected `422 VALIDATION_FAILED` when
  the child declares that reference `apiSettable: false`, and silently
  overwritten otherwise.
- `PUT /api/tables/<table>/<id>` accepts a strict partial object containing any
  writable subset. Omitted fields remain unchanged. It returns `{ data: row }`.
- `DELETE /api/tables/<table>/<id>` returns the deleted row as `{ data: row }`.
- `GET /api/tables/<table>/_lookup` returns
  `{ entries: Array<{ value: string | number, label: string, meta: row }> }`.
  `meta` contains ordinary visible source-row fields; it is not invariantly
  empty. The query uses exactly one of two modes:
  - `ids=1,2` recovers `1` through `500` selected IDs and rejects `q`, `fields`,
    `limit`, `notUnder`, and filter conditions.
  - `q=relaunch&fields=name,code&limit=20` searches visible display fields.
    Search defaults to `50` results and accepts at most `500`. Search mode also
    accepts `filter[col][op]=value` conditions and, on a tree table,
    `notUnder=<id>`, which narrow the choices; see
    [Narrow a lookup search](/docs/reference/http/query-syntax/#narrow-a-lookup-search).
  - Both modes accept `computed`.
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

### Computed fields

The list read (including tree reads and child-level reads), the single-row
read, and both lookup modes accept `computed=name,name2`, the names of
[computed fields](/docs/reference/schema/table-definitions/#computed-fields)
declared by the table. The response then carries a `computed` member beside
`data` or `entries`:

```json
{
  "data": [{ "id": 12, "name": "Groceries", "parent_id": 7 }],
  "meta": { "total": 1, "page": 1, "limit": 50, "pages": 1 },
  "computed": { "parentPath": { "12": "Expenses > Kitchen" } }
}
```

- `computed` maps each requested field name to an object keyed by row id, in
  its string form, and each id to the field's value. Its type is
  `ComputedValues` from `@sapporta/shared/contracts`.
- Every requested field holds every returned row's id. `null` means the row has
  no value for the field. A tree read covers the context rows as well as the
  matches.
- Without `computed`, or with an empty value, the response has no `computed`
  member. Repeated names are computed once.
- A name the table does not declare returns HTTP `400` with the code
  `unknown_computed_field`, and the message lists the table's computed fields.
- A loader that throws, leaves out an id, or returns a value its `schema`
  rejects fails the read with HTTP `500`.
- Create, update, and delete compute nothing, and their responses have no
  `computed` member. CSV export and count do not accept `computed`.
- The OpenAPI response schema lists each computed field of the table, with its
  value `schema` and `notes`.

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
- [Computed fields and row captions](/docs/guides/model-data/computed-fields-and-row-captions/)
- [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
- [Filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)
- [Use table search](/docs/guides/model-data/use-table-search/)
- [Generated and client values](/docs/reference/schema/semantic-values/generated-and-client-values/)
