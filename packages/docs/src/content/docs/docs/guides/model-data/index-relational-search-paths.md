---
title: "Index relational search paths"
description:
  "Index child-correlation paths, inspect representative query plans, and know
  when generated substring search is no longer the right operation."
---

Literal substring matching uses a leading wildcard. It is not SQLite full-text
search, and an ordinary B-tree index does not make `LIKE '%blue%'` scan-free. It
fits operational tables where people remember fragments and the searchable set
remains deliberate.

## Index each child correlation

The relationship lookup inside a correlated `EXISTS` does have a useful index
path. Put the child foreign key first:

```ts
export const bookCodesTable = sqliteTable(
  "book_codes",
  {
    // Columns omitted for focus.
  },
  (table) => [index("book_codes_book_id_idx").on(table.book_id)],
);
```

Sapporta logs a startup warning when a child foreign key used by relational
search is not the first column of an index. The warning does not block startup,
but it identifies the correlation the database will run for every candidate
parent. Inspect `EXPLAIN QUERY PLAN` with representative data before broadening
a search tree.

Changing only `meta.search` does not require a migration. Adding or changing the
Drizzle index does. Generate, review, and apply that migration through the
normal schema workflow.

For a large document corpus, language-aware ranking, stemming, or tokenized
matching, use an application search endpoint backed by FTS or an external index.
Generated table search intentionally remains literal, relational, and attached
to ordinary table reads.

## Related documentation

- [Configure table search](/docs/guides/model-data/configure-table-search/)
- [Relational search semantics and security](/docs/guides/model-data/relational-search-semantics-and-security/)
- [Schema changes and migrations](/docs/guides/model-data/schema-changes-and-migrations/)
