---
title: "Query syntax"
description:
  "Look up strict filters, search, sort, and pagination for generated table
  routes."
---

## Identity

Query parser used by table list and export routes.

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
- `q` runs the table's server-side search plan and combines with filters using
  AND. The complete trimmed term is one case-insensitive literal substring; `%`,
  `_`, and `\` do not become wildcards. Non-empty `q` on a table with
  `search: false` returns `no_search_config`.
- `sort=created_at,-id` applies ascending then descending sort. Each name must
  be a real SQL column.
- `page` is a one-based integer. `limit` defaults to `50` and accepts integers
  from `1` through `1000`.
- Query failures return HTTP `400` with one of these stable codes:
  `unknown_filter_shape`, `unknown_column`, `unknown_op`, `bad_value`,
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
retrying can widen a list or export.

## Related documentation

- [Search table rows and relationships](/docs/guides/model-data/search-indexes-and-display-metadata/)
- [Filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)
