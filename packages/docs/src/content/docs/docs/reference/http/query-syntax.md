---
title: "Query syntax"
description: "Look up strict filters, search, sort, and pagination for generated table routes."
---

## Identity

Query parser used by table list and export routes.

## Contract

- Filters use `filter[column][operator]=value`; `filter[column]=value` is invalid.
- Operators are `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`, `contains`, `startswith`, `endswith`, and nullable `is`.
- `q` searches configured columns and combines with filters using AND.
- `sort=created_at,-id` applies ascending then descending sort.
- `page` is one-based; `limit` defaults to 50 and is bounded to 1..1000.
- Unknown shapes, columns, operators, values, pages, and limits return structured 400 errors.


## Related documentation

- [Filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)
