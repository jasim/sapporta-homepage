---
title: "Filtering, sorting, search, and pagination"
description:
  "Build shareable table queries that behave consistently in UI, HTTP, and
  export."
---

The generated grid, table API, and CSV export share one query language. A URL
therefore names a stable view of a table: predicates, search term, order, and
page.

## Compose the query

Generated list and export routes use one strict grammar:

```http
GET /api/tables/tasks?filter[project_id][eq]=1&filter[status][in]=open&q=launch&sort=due_date,-id&page=1&limit=25
```

- Every filter includes a column and operator: `filter[column][operator]=value`.
- `in` and `nin` accept comma-separated values. Select-backed text also supports
  the other text operators, including `eq` and `neq`.
- `q` uses the table's configured search plan. Search is enabled for visible
  application columns by default; explicitly configured child paths can
  contribute at any finite depth. The search predicate combines with filters
  using AND.
- `sort=due_date,-id` orders due date ascending, then ID descending.
- `page` is one-based. `limit` accepts values from 1 through 1000 and defaults
  to 50.

Bracket characters may need URL encoding in a shell or client. This `curl` form
keeps the query readable while encoding it correctly:

```bash
curl --get "http://localhost:3000/api/tables/tasks" \
  --data-urlencode "filter[project_id][eq]=1" \
  --data-urlencode "filter[status][in]=open" \
  --data-urlencode "q=launch" \
  --data-urlencode "sort=due_date,-id" \
  --data-urlencode "page=1" \
  --data-urlencode "limit=25"
```

Use the authenticated browser session, an API token, or the Sapporta CLI when
the app is protected. The successful response includes the current page and
total count:

```json
{
  "data": [
    {
      "id": 7,
      "project_id": 1,
      "title": "Publish launch checklist",
      "status": "open",
      "due_date": "2026-08-01"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 25, "pages": 1 }
}
```

Generated table screens serialize the same query state in the URL. Open
`/tables/tasks`, select the project and open status, search for **launch**, set
due-date sort, and refresh. The controls and result should survive because the
URL owns the current query state. CSV export uses the active filter, search, and
sort rather than silently exporting all visible rows.

Status is select-backed text, so its `in` and `nin` value editor is a searchable
multi-value combobox. The input query filters the options derived from the
Drizzle enum declaration. Chosen values appear as removable chips, and only
those chosen values enter the filter draft. Search text itself never becomes a
filter value.

## Let invalid queries fail

Unknown columns, unsupported operators, malformed semantic values, `q` on a
table with `search: false`, and invalid page or limit values return a structured
400 response. A caller must correct the query. Retrying after dropping a
rejected filter can expose or export a much larger result set.

```http
GET /api/tables/tasks?filter[status]=open
```

The request above is invalid because it omits the operator bracket. For typed
frontend table code, use `TypedFilterCondition` with `encodeTypedFilters()` at
the URL boundary, and use `parseFiltersForTable()` when restoring URL filters
against table metadata. That keeps numbers, booleans, dates, timestamps, and
lookup IDs typed until serialization.

Strict failure preserves the meaning of the request. A malformed narrow query
must not become a valid broad query.

## Related reference

- [Search table rows and relationships](/docs/guides/model-data/search-indexes-and-display-metadata/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Table endpoints](/docs/reference/http/table-endpoints/)
