---
title: "Search table rows and relationships"
description:
  "Choose the focused guide for configuring, calling, securing, or indexing
  generated table search."
---

Sapporta table search has four independent responsibilities: table metadata
defines the plan, callers supply a term, the server applies relationship-aware
authorization, and the database executes the resulting predicates. Read only
the page that owns the part you are changing.

- [Configure table search](/docs/guides/model-data/configure-table-search/)
  covers default search, selected root columns, foreign-key labels, recursive
  child paths, disabling search, and configuration validation.
- [Use table search](/docs/guides/model-data/use-table-search/) covers the
  generated UI, HTTP, export, CLI, frontend, and app-owned server callers.
- [Relational search semantics and security](/docs/guides/model-data/relational-search-semantics-and-security/)
  explains literal term matching, predicate composition, generated SQL, and
  authorization on every relationship branch.
- [Index relational search paths](/docs/guides/model-data/index-relational-search-paths/)
  covers child-foreign-key indexes, query-plan review, and the point at which
  the generated substring search should give way to FTS or an external index.

Start with configuration when changing a table definition. Start with usage
when composing a query against an existing table. Security-sensitive review
should include the semantics page even when no metadata changes.

## Related documentation

- [Relationships and lookup behavior](/docs/guides/model-data/relationships-and-lookup-behavior/)
- [Filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)
- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
