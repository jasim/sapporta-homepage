---
title: "Count visible rows"
description:
  "Run filtered totals and bounded grouped counts without loading complete table
  rows."
---

Use an existing report when it already defines the business meaning of the
question. For an ad hoc count over one registered table, use the generated count
operation. It runs `count(*)` inside the caller's row boundary and accepts the
same typed filters as a generated table read.

A term such as “pending” still needs an application meaning. Inspect the table
metadata or a report, map that term to stored values such as
`status != "completed"`, and state the interpretation with the result.

## Count from the CLI

Count visible tasks whose status is not `completed`:

```bash
pnpm exec sapporta --output json rows count tasks \
  --where '{"status":{"neq":"completed"}}'
```

JSON output preserves the generated HTTP envelope:

```json
{ "data": { "kind": "total", "count": 8 } }
```

Group the matching rows by project:

```bash
pnpm exec sapporta --output json rows count tasks \
  --where '{"status":{"neq":"completed"}}' \
  --group-by project_id \
  --order desc \
  --limit 10
```

Without `--output json`, a total renders as a one-row table and grouped results
render with `value` and `count` columns. `--order` and `--limit` are valid only
with `--group-by`.

## Call the generated endpoint

The grouped CLI command above calls this generated route:

```http
GET /api/tables/tasks/_count?filter[status][neq]=completed&group_by=project_id&order=desc&limit=10
```

Grouped results have a separate wire shape from scalar totals:

```json
{
  "data": {
    "kind": "grouped",
    "groups": [
      { "value": 1, "count": 2 },
      { "value": 2, "count": 2 }
    ]
  }
}
```

The group value keeps the column's JSON type: string, number, boolean, or
`null`. Date and timestamp groups use their canonical string representation.
`null` is an ordinary group. Include or exclude it with
`filter[<column>][is]=null` or `notnull`.

Grouped counts default to descending count order and at most 50 groups. Set
`order=asc|desc` and a `limit` from `1` through `1000` to change that bound.
Equal counts are ordered by the group value ascending, so repeated calls have a
stable order.

The count endpoint accepts canonical `filter[column][operator]` parameters. It
does not accept table search, pagination, row sorting, or arbitrary query
parameters. `order` and `limit` require `group_by`; invalid columns, operators,
values, or option combinations return a structured HTTP `400`.

## Resolve foreign-key labels separately

A count grouped by `project_id` returns project keys, not labels. Resolve those
keys with the target table's lookup endpoint:

```http
GET /api/tables/projects/_lookup?ids=1,2
```

That second request applies the target table's own `read` ability and row scope.
Do not replace the grouped key with an unscoped join or assume every returned
key has a label visible to the caller.

## Count in application server code

`scopedRows()` exposes transport-free `count()` and `countBy()` operations.
Their `where` values are Drizzle expressions, and `countBy()` takes a column
from the same table:

```ts
import { ne } from "drizzle-orm";
import { scopedRows } from "@sapporta/server";
import { tasks, tasksTable } from "../schema/tasks.js";

const rows = scopedRows(db, auth, tasks);

const total = await rows.count({
  where: ne(tasksTable.status, "completed"),
});

const byProject = await rows.countBy({
  where: ne(tasksTable.status, "completed"),
  column: tasksTable.project_id,
  order: "desc",
  limit: 10,
});
```

Both operations add the request's row predicate before executing SQL.
`scopedRows()` does not check a route ability, so an application handler still
authorizes its action before counting.

## Know when the count operation is too small

The generated operation answers filtered totals and one-column groups over one
table. Use an application report or domain endpoint when the question combines
tables, calculates a business state, needs reusable labels or measures, or
already has a named application meaning. Do not retrieve complete rows merely to
count them.

## Related documentation

- [Generated table APIs](/docs/guides/generated-surfaces/generated-table-apis/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Table endpoints](/docs/reference/http/table-endpoints/)
- [Scoped lookups and counts](/docs/reference/server/row-scoped-data/lookups-and-counts/)
- [Route-based reports](/docs/guides/reports/route-based-reports/)
