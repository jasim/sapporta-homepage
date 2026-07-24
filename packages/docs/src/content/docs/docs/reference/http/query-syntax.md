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
  `startswith`, `endswith`, and nullable `is`.
- `q` runs the table's server-side search plan and combines with filters using
  AND. The complete trimmed term is one case-insensitive literal substring; `%`,
  `_`, and `\` do not become wildcards. Non-empty `q` on a table with
  `search: false` returns `no_search_config`.
- `sort=created_at,-id` applies ascending then descending sort.
- `page` is one-based; `limit` defaults to 50 and is bounded to 1..1000.
- Unknown shapes, columns, operators, values, pages, and limits return
  structured 400 errors.

## Related documentation

- [Search table rows and relationships](/docs/guides/model-data/search-indexes-and-display-metadata/)
- [Filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)
