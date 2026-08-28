---
title: "Query syntax"
description:
  "Look up strict filters, lookup modes, count grouping, search, sort, and
  pagination for generated table routes."
---

You can make complex queries on tables by using the generated table API and the
query syntax:

```http
GET /api/tables/tasks?filter[project_id][eq]=1&filter[status][in]=open,review&q=launch&sort=due_date,-id&page=1&limit=25
```

That request reads `tasks` in project 1, keeps rows whose status is `open` or
`review`, applies the table's search plan to the term `launch`, orders by due
date ascending and then by ID descending, and returns the first 25 matches.

Generated list, CSV export, count, and lookup routes all share this same
grammar. Each route then accepts its own non-filter parameters and rejects every
parameter it does not own.

## Filter conditions

Every filter names a column and an operator:

```http
filter[column][operator]=value
```

`filter[status]=open` omits the operator and is rejected. The column must be a
real SQL column on the table, and a typo returns a `400` rather than an ignored
parameter, so a malformed narrow query never becomes a valid broad one.

Operators fall into five groups. The group decides the shape the value takes on
the URL.

| Group                     | Operators                            | Value shape                             |
| ------------------------- | ------------------------------------ | --------------------------------------- |
| [Equality](#equality)     | `eq`, `neq`                          | one value                               |
| [Ordering](#ordering)     | `gt`, `gte`, `lt`, `lte`             | one value                               |
| [Substring](#substring)   | `contains`, `startswith`, `endswith` | one text value                          |
| [Membership](#membership) | `in`, `nin`                          | comma-separated list, at least one item |
| [Presence](#presence)     | `is`                                 | the literal `null` or `notnull`         |

### Equality

`eq` and `neq` compare one value against the stored value and apply to every
column kind. The value is parsed in the column's kind first, so
`filter[due_date][eq]=2026-08-01` compares a calendar day and
`filter[is_billable][eq]=true` compares a boolean.

| Operator | Matches                                       | Example                    |
| -------- | --------------------------------------------- | -------------------------- |
| `eq`     | the stored value equals the given value       | `filter[status][eq]=open`  |
| `neq`    | the stored value differs from the given value | `filter[status][neq]=done` |

A row whose column is `NULL` holds no value to compare, so it matches neither
`eq` nor `neq`. Select those rows with `is`.

### Ordering

`gt`, `gte`, `lt`, `lte` compare one value in the column's own ordering and
apply to `number`, `date`, and `timestamp` columns. A text column returns
`op_not_applicable`.

| Operator | Matches               | Example                            |
| -------- | --------------------- | ---------------------------------- |
| `gt`     | greater than          | `filter[estimate_hours][gt]=8`     |
| `gte`    | greater than or equal | `filter[due_date][gte]=2026-08-01` |
| `lt`     | less than             | `filter[due_date][lt]=2026-09-01`  |
| `lte`    | less than or equal    | `filter[estimate_hours][lte]=40`   |

Two conditions on one column bound a range. The pair above selects every task
due in August 2026.

### Substring

`contains`, `startswith`, and `endswith` match inside a `text` column. Every
other kind returns `op_not_applicable`. A `%` or `_` in the value is escaped and
matches literally.

| Operator     | Matches                         | Example                             |
| ------------ | ------------------------------- | ----------------------------------- |
| `contains`   | the value appears anywhere      | `filter[title][contains]=launch`    |
| `startswith` | the stored value begins with it | `filter[title][startswith]=Publish` |
| `endswith`   | the stored value ends with it   | `filter[code][endswith]=-2026`      |

### Membership

`in` and `nin` take a comma-separated list and apply to `text`, `number`,
`date`, and `timestamp` columns. Each item is parsed in the column's kind. A
boolean column takes `eq` and `neq` instead.

| Operator | Matches                               | Example                          |
| -------- | ------------------------------------- | -------------------------------- |
| `in`     | the stored value is one of the items  | `filter[status][in]=open,review` |
| `nin`    | the stored value is none of the items | `filter[project_id][nin]=4,5`    |

The list must be non-empty and contain no empty item: `filter[status][in]=` and
`filter[status][in]=open,,review` both return `bad_value`. A comma inside a
value has no escape; match such a value with `eq`.

### Presence

`is` carries a polarity rather than a value, applies to every column kind, and
is the only operator that reads a missing value.

| Value     | Matches                  | Example                        |
| --------- | ------------------------ | ------------------------------ |
| `null`    | the column is `NULL`     | `filter[due_date][is]=null`    |
| `notnull` | the column holds a value | `filter[due_date][is]=notnull` |

Any other value returns `bad_value`.

## Operators by column kind

A column's declared kind decides which operators apply and how each value is
parsed.

| Kind        | Operators                                                            | Value format                                          |
| ----------- | -------------------------------------------------------------------- | ----------------------------------------------------- |
| `text`      | `eq`, `neq`, `contains`, `startswith`, `endswith`, `in`, `nin`, `is` | the string as written                                 |
| `number`    | `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`, `is`             | a finite number, such as `8` or `-2.5`                |
| `boolean`   | `eq`, `neq`, `is`                                                    | `true` or `false`                                     |
| `date`      | `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`, `is`             | an ISO calendar day, `2026-08-01`                     |
| `timestamp` | `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`, `is`             | an ISO instant with an offset, `2026-08-01T09:00:00Z` |

An operator outside a kind's row returns `op_not_applicable`. A value that does
not parse in the kind returns `bad_value`.

## Filter a timestamp column by day

A timestamp column compares canonical instants. A day-shaped value such as
`2026-08-24` carries no time and no offset, so it returns `bad_value` on a
timestamp column.

A day is a range of instants, and one condition expresses one comparison. Ask a
day-shaped question by naming the pair of instants the day occupies in the
workspace time zone, `gte` the first and `lt` the first instant of the next day:

```http
GET /api/tables/tasks?filter[completed_at][gte]=2026-08-24T00:00:00%2B05:30&filter[completed_at][lt]=2026-08-25T00:00:00%2B05:30
```

A `+` inside a query value decodes as a space, so an offset is percent-encoded
as `%2B`. The server normalizes each bound to canonical UTC before comparing.
The generated filter UI and `resolveDateRangeQueryBounds()` both produce that
pair from a calendar day and the workspace time zone.

A `date` column stores the day itself, compares calendar days directly, and
takes `2026-08-24` as written.

## Repeat a filter key

The same filter key may appear more than once. Every value is preserved in order
and becomes a separate AND condition:

```http
GET /api/tables/tasks?filter[title][contains]=launch&filter[title][contains]=checklist
```

That request requires both substrings. Indexed forms such as
`filter[title][contains][0]` are not accepted, and repeated keys are not
collapsed to the last value. Dropping either condition would widen the result.

## Search with `q`

`q` runs the table's server-side search plan and combines with filters using
AND. The complete trimmed term is one case-insensitive literal substring; `%`,
`_`, and `\` do not become wildcards. An empty or whitespace-only `q` is treated
as absent. A non-empty `q` on a table with `search: false` returns
`no_search_config`.

List and CSV export accept this table search. Lookup runs its own search over
display fields, and count accepts no search term.

## Sort rows

`sort` takes a comma-separated list of column names, each optionally prefixed
with `-` for descending order. `sort=created_at,-id` sorts by creation time
ascending, then by ID descending. Each name must be a real SQL column, and
anything else returns `unknown_column`. Sort applies to list and CSV export.

## Paginate

| Parameter | Default | Accepted range         | Notes            |
| --------- | ------- | ---------------------- | ---------------- |
| `page`    | `1`     | `1` through `MAX_PAGE` | one-based        |
| `limit`   | `50`    | `1` through `1000`     | rows in one page |

Both values are strings on the URL and on typed-client input. The shared
contract coerces and bounds them before table-dependent resolution. Repeating a
singleton key such as `page` or `limit` is invalid. CSV export is unpaginated.

## Choose a lookup mode

Lookup has two separate query modes, and one request uses exactly one of them.
Keeping the modes apart lets a picker recover its selected values without
accidentally broadening into search.

| Mode   | Parameters             | Bounds                                                                                    |
| ------ | ---------------------- | ----------------------------------------------------------------------------------------- |
| ID     | `ids=7,9`              | `1` through `500` non-empty values; rejects `q`, `fields`, `limit`                        |
| Search | `q`, `fields`, `limit` | `fields` names visible display fields; `limit` defaults to `50` and accepts at most `500` |

Lookup does not accept `filter[column][operator]` parameters.

## Group a count

Count accepts the canonical filters and an optional `group_by=<column>`.

| Parameter | Without `group_by` | With `group_by`                               |
| --------- | ------------------ | --------------------------------------------- |
| Response  | one total          | one row per group value                       |
| `order`   | invalid            | `asc` or `desc`, by count; defaults to `desc` |
| `limit`   | invalid            | `1` through `1000` groups; defaults to `50`   |

Ties sort by group value ascending, so repeated calls return groups in a stable
order.

## Parameters by route

| Route                                | Filters | `q`                  | `sort` | Pagination      | Own parameters               |
| ------------------------------------ | ------- | -------------------- | ------ | --------------- | ---------------------------- |
| `GET /api/tables/<table>`            | yes     | table search         | yes    | `page`, `limit` | —                            |
| `GET /api/tables/<table>/export.csv` | yes     | table search         | yes    | unpaginated     | —                            |
| `GET /api/tables/<table>/_count`     | yes     | no                   | no     | no              | `group_by`, `order`, `limit` |
| `GET /api/tables/<table>/_lookup`    | no      | display-field search | no     | `limit`         | `ids`, `fields`              |

## Read a rejected query

A query passes two boundaries. Contract-shape failures — a repeated singleton, a
nonnumeric page, an out-of-range list or lookup limit, contradictory lookup
modes, an unsupported count `order`, or a grouped limit above `1000` — return
HTTP `400 BAD_REQUEST`. Table-dependent failures come after that boundary and
return HTTP `400` with one of these stable codes:

| Code                   | Cause                                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `unknown_filter_shape` | a `filter[...]` key that is not `filter[column][operator]`                                                                       |
| `unknown_column`       | a filter, sort, or group column that is not on the table                                                                         |
| `unknown_op`           | an operator outside the supported set                                                                                            |
| `op_not_applicable`    | an operator that does not apply to the column's kind                                                                             |
| `bad_value`            | a value that does not parse in the column's kind, an empty `in` list or item, or an `is` polarity other than `null` or `notnull` |
| `no_search_config`     | a non-empty `q` on a table with `search: false`                                                                                  |

This malformed filter omits its operator:

```http
GET /api/tables/tasks?filter[status]=open
```

It returns:

```json
{
  "error": "Filter \"filter[status]\" must use filter[col][op]=value syntax",
  "code": "unknown_filter_shape"
}
```

Callers must correct a rejected query. Dropping an invalid predicate and
retrying can widen a list, export, or count.

## Related documentation

- [Filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)
- [Table endpoints](/docs/reference/http/table-endpoints/)
- [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
- [Use table search](/docs/guides/model-data/use-table-search/)
- [Days and time zones](/docs/reference/server/days-and-time-zones/)
- [Contract helpers and wire types](/docs/reference/contracts/contract-helpers-and-wire-types/)
