---
title: "Filtering, sorting, search, and pagination"
description:
  "Build shareable table queries that behave consistently in UI, HTTP, and
  export."
---

This page builds one deterministic task query from filters, search, sort, and
pagination. You will call it through HTTP, reproduce it in the generated grid,
and see why invalid query state fails instead of broadening the result. These
mechanics support bookmarkable worklists, exports, saved views, and predictable
integrations.

```text
Show open launch tasks for one project, sorted by due date and split into small pages. Make the browser view and generated API use the same query.
```

## Compose the query

Generated list and export routes use one strict grammar:

```http
GET /api/tables/tasks?filter[project_id][eq]=1&filter[status][eq]=open&q=launch&sort=due_date,-id&page=1&limit=25
```

- Every filter includes a column and operator: `filter[column][operator]=value`.
- `q` searches only columns declared in `meta.search` and combines with filters
  using AND.
- `sort=due_date,-id` orders due date ascending, then ID descending.
- `page` is one-based. `limit` accepts values from 1 through 1000 and defaults
  to 50.

Bracket characters may need URL encoding in a shell or client. This `curl` form
keeps the query readable while encoding it correctly:

```bash
curl --get "http://localhost:3000/api/tables/tasks" \
  --data-urlencode "filter[project_id][eq]=1" \
  --data-urlencode "filter[status][eq]=open" \
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

<!--
Screenshot brief
Suggested asset: task-query-url-and-grid.png
Setup: Seed tasks across at least two projects and statuses. Configure the generated tasks screen for project 1, open status, launch search, and due-date ascending sort.
Frame: Capture the browser address bar and the full query toolbar above the matching task rows. Keep pagination or result count visible.
Visible proof: URL parameters correspond to the active project/status filters, launch search, due-date sort, and bounded result set.
Alt text: Generated tasks grid whose URL, filters, search, sort, and result count describe the same query.
-->

## Let invalid queries fail

Unknown columns, unsupported operators, malformed semantic values, search on a
table without search metadata, and invalid page or limit values return a
structured 400 response. A caller must correct the query. Retrying after
dropping a rejected filter can expose or export a much larger result set.

```http
GET /api/tables/tasks?filter[status]=open
```

The request above is invalid because it omits the operator bracket. For typed
frontend table code, use `TypedFilterCondition` with `encodeTypedFilters()` at
the URL boundary, and use `parseFiltersForTable()` when restoring URL filters
against table metadata. That keeps numbers, booleans, dates, timestamps, and
lookup IDs typed until serialization.

The task query now has one meaning in the URL, generated grid, HTTP route, and
export. Its strict failure behavior prevents a typo from turning into an
unfiltered read. Next, use the same metadata to create and edit records through
generated forms.

## Related reference

- [Query syntax](/docs/reference/http/query-syntax/)
- [Table endpoints](/docs/reference/http/table-endpoints/)
