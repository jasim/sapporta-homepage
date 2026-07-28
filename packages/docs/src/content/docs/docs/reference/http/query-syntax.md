---
title: "Query syntax"
description:
  "Look up strict filters, lookup modes, count grouping, search, sort, and
  pagination for generated table routes."
---

## Identity

Strict query syntax shared by generated table reads, lookups, exports, and
counts.

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
- The same filter key may appear more than once. Every value is preserved in
  order and becomes a separate AND condition. For example,
  `filter[name][contains]=left&filter[name][contains]=right` requires both
  substrings. Do not replace repeated keys with indexed forms such as
  `filter[name][contains][0]`.
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
- `page` is one-based, defaults to `1`, and accepts values through `MAX_PAGE`.
  `limit` defaults to `50` and accepts values from `1` through `1000`. These
  values are strings on the URL and typed-client input, then the shared contract
  coerces and bounds them before table-dependent resolution. Repeating a
  singleton key such as `page` or `limit` is invalid. CSV export is unpaginated.
- Lookup has two separate query modes. ID mode accepts `ids=<id>,<id>` with `1`
  through `500` non-empty values and rejects `q`, `fields`, and `limit`. Search
  mode accepts optional `q`, comma-separated visible `fields`, and a `limit`
  that defaults to `50` and accepts at most `500`. Keeping these modes separate
  lets a picker recover selected values without accidentally broadening into
  search.
- Count accepts optional `group_by=<column>`. Without it, the response is one
  total and `order` or `limit` is invalid. With it, `order=asc|desc` sorts by
  count, ties sort by group value ascending, and `limit` bounds the group list.
  Grouped count defaults to descending order and `50` groups; the maximum is
  `1000`.
- Contract-shape failures, such as a repeated singleton, a nonnumeric page, an
  out-of-range list or lookup limit, contradictory lookup modes, an unsupported
  count `order`, or a grouped limit above `1000`, return HTTP `400 BAD_REQUEST`.
  After that contract boundary, table-dependent filter, column, and search
  failures return HTTP `400` with one of these stable codes:
  `unknown_filter_shape`, `unknown_column`, `unknown_op`, `bad_value`,
  `op_not_applicable`, or `no_search_config`.

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
- [Contract helpers and wire types](/docs/reference/contracts/contract-helpers-and-wire-types/)
