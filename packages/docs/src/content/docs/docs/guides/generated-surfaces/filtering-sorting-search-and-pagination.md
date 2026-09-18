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

Generated list and export routes carry filters, a search term, a sort list, and
page bounds in one query string:

```http
GET /api/tables/tasks?filter[project_id][eq]=1&filter[status][in]=open&q=launch&sort=due_date,-id&page=1&limit=25
```

Each filter names a column and an operator as `filter[column][operator]=value`.
`q` runs the table's configured search plan, `sort` takes column names with a
leading `-` for descending order, and `page` and `limit` bound the result.
[Query syntax](/docs/reference/http/query-syntax/) lists every operator, the
column kinds each one applies to, and the values each one accepts.

Search is enabled for visible application columns by default; explicitly
configured child paths can contribute at any finite depth. The search predicate
combines with filters using AND.

Bracket characters may need URL encoding in a shell or client. This `curl` form
keeps the query readable while encoding it correctly. Take `SAPPORTA_API_PORT`
from this project's environment (`pnpm dev` prints it as the API URL when it
starts).

```bash
curl --get "http://localhost:$SAPPORTA_API_PORT/api/tables/tasks" \
  --data-urlencode "filter[project_id][eq]=1" \
  --data-urlencode "filter[status][in]=open" \
  --data-urlencode "q=launch" \
  --data-urlencode "sort=due_date,-id" \
  --data-urlencode "page=1" \
  --data-urlencode "limit=25"
```

Use a logged-in browser session or an Agent token for authentication. Successful
response includes the current page and total count:

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
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 25,
    "pages": 1
  }
}
```

## Repeat a condition without collapsing it

Sometimes one column needs more than one condition. Repeating the same key keeps
both predicates:

```http
GET /api/tables/tasks?filter[title][contains]=launch&filter[title][contains]=checklist
```

That request means the visible title must contain **launch** and **checklist**.
The conditions stay in their original order and are combined with AND, just like
different filter keys. This is different from `filter[status][in]=open,review`,
where one `in` condition owns a comma-separated value list.

Generated URL state, `encodeTypedFilters()`, table query builders, typed
clients, and CSV export preserve duplicates as repeated URL keys. They do not
emit indexed names such as `filter[title][contains][0]`, and they do not keep
only the last value. That distinction matters because dropping either condition
would silently widen the result.

## Separate fixed conditions from user filters

A list read carries a second list of conditions under the `fixed` prefix. A
screen puts the constraints it owns there, such as a child grid's parent key or
a page that lists only open tasks, and keeps the user's own filters under
`filter`:

```http
GET /api/tables/tasks?fixed[project_id][eq]=1&filter[status][in]=open,review&q=launch
```

Every returned row satisfies the fixed conditions, and `filter` and `q` select
the matches among them. On an ordinary table the two lists combine with AND. On
a table that declares `meta.tree`, a tree read keeps each match's ancestors and
descendants only when they satisfy the fixed conditions too. The generated table
page and TGrid levels send their parent-row constraint and `fixedFilters` this
way; CSV export and count read only `filter` conditions.

The shared filter codec writes and reads either list. `encodeFilters()`,
`encodeTypedFilters()`, `decodeFilters()`, and `wireKey()` take an optional
`FilterNamespace`, `"filter"` by default or `"fixed"`:

```ts
import { encodeFilters, mintFilterId } from "@sapporta/shared/filter";

const params = encodeFilters(
  [
    {
      id: mintFilterId("project_id", "eq"),
      column: "project_id",
      op: "eq",
      value: "1",
    },
  ],
  "fixed",
);
params.toString(); // "fixed%5Bproject_id%5D%5Beq%5D=1"
```

## Keep query state in the URL

Generated table screens serialize the same query state in the URL. Open
`/tables/tasks`, select the project and open status, search for **launch**, set
due-date sort, and refresh. The controls and result should survive because the
URL owns the current query state. CSV export uses the active filter, search, and
sort rather than silently exporting all visible rows. The export streams that
complete selection through one deterministically ordered SQLite cursor and one
read snapshot, then releases the cursor when the response finishes or is
cancelled.

Status is select-backed text, so its `in` and `nin` value editor is a searchable
multi-value combobox. The input query filters the options derived from the
Drizzle enum declaration. Chosen values appear as removable chips, and only
those chosen values enter the filter draft. Search text itself never becomes a
filter value.

## Filter a timestamp column by day

A date control on a `timestamp` column names a calendar day in the active
workspace's time zone, and the operator picks which edge of that day the bound
sits on. `on or after` and `before` read the day's first instant; `after` and
`on or before` read its last.

`on` and `not on` are not offered for a timestamp column. A day is a range of
instants, and the condition grammar expresses one comparison per condition, so
either operator would match only the rows sitting at exactly local midnight. A
`date` column offers both, because a stored day and a named day are the same
value.

Filters on a `date` column compare calendar days directly and are unaffected by
the workspace zone.

## Let invalid queries fail

Unknown columns, unsupported operators, malformed semantic values, `q` on a
table with `search: false`, and invalid page or limit values return a structured
400 response carrying a stable code. A caller must correct the query. Retrying
after dropping a rejected filter can expose or export a much larger result set.
[Read a rejected query](/docs/reference/http/query-syntax/#read-a-rejected-query)
lists the codes and what each one reports.

For typed frontend table code, use `TypedFilterCondition` with
`encodeTypedFilters()` at the URL boundary, and use `parseFiltersForTable()`
when restoring URL filters against table metadata. That keeps numbers, booleans,
dates, timestamps, and lookup IDs typed until serialization.

Strict failure preserves the meaning of the request. A malformed narrow query
must not become a valid broad query.

## Related reference

- [Query syntax](/docs/reference/http/query-syntax/)
- [Configure table search](/docs/guides/model-data/configure-table-search/)
- [Use table search](/docs/guides/model-data/use-table-search/)
- [Table endpoints](/docs/reference/http/table-endpoints/)
- [Days and time zones](/docs/reference/server/days-and-time-zones/)
- [Group and filter by day](/docs/guides/reports/group-and-filter-by-day/)
