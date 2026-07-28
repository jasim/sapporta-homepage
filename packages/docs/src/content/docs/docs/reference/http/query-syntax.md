---
title: "Query syntax"
description:
  "Look up strict filters, count grouping, search, sort, and pagination for
  generated table routes."
---

## Identity

Strict query syntax shared by generated table reads, exports, and counts.

## Contract

- Filters use `filter[column][operator]=value`; `filter[column]=value` is
  invalid.
- Operators are `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`, `contains`,
  `startswith`, `endswith`, and `is`.
- Text accepts `eq`, `neq`, `contains`, `startswith`, `endswith`, `in`, `nin`,
  and `is`. Numbers, dates, and timestamps accept `eq`, `neq`, `gt`, `gte`,
  `lt`, `lte`, `in`, `nin`, and `is`. Booleans accept `eq`, `neq`, and `is`.
- `in` and `nin` use a non-empty comma-separated list with no empty item. `is`
  accepts only `null` or `notnull`.
- List, CSV export, and count routes accept these canonical filters. Each route
  then accepts only its own non-filter parameters; unknown parameters are
  rejected rather than ignored.
- `q` runs the table's server-side search plan and combines with filters using
  AND. The complete trimmed term is one case-insensitive literal substring; `%`,
  `_`, and `\` do not become wildcards. Non-empty `q` on a table with
  `search: false` returns `no_search_config`. Only list and CSV export accept
  this table search.
- `sort=created_at,-id` applies ascending then descending sort. Each name must
  be a real SQL column. Sort applies to list and CSV export, not count.
- `page` is a one-based integer. `limit` defaults to `50` and accepts integers
  from `1` through `1000` for list pagination. CSV export is unpaginated.
- Count accepts optional `group_by=<column>`. Without it, the response is one
  total and `order` or `limit` is invalid. With it, `order=asc|desc` sorts by
  count, ties sort by group value ascending, and `limit` bounds the group list.
  Grouped count defaults to descending order and `50` groups; the maximum is
  `1000`.
- Contract-shape failures, such as an unsupported count `order` or a grouped
  limit above `1000`, return HTTP `400 BAD_REQUEST`. Parsed filter, column,
  pagination, and search failures return HTTP `400` with one of these stable
  codes: `unknown_filter_shape`, `unknown_column`, `unknown_op`, `bad_value`,
  `op_not_applicable`, `bad_limit`, `bad_page`, or `no_search_config`.

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

- [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
- [Search table rows and relationships](/docs/guides/model-data/search-indexes-and-display-metadata/)
- [Filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)
