---
title: "Relational search semantics and security"
description:
  "Understand literal term matching, correlated relationship queries, and row
  authorization on every generated-search branch."
---

Generated table search is literal, relational, and request-scoped. This page
explains the runtime meaning of an already-configured search plan.

## Know what a term means

Sapporta trims the term and keeps it as one literal substring. It does not split
`Jane Doe` into tokens. Empty or whitespace-only `q` is no search.

Matching is case-insensitive and converts ordinary selected values to text:

```sql
lower(coalesce(cast(value AS text), ''))
  LIKE lower(?) ESCAPE '\'
```

Sapporta binds `%term%`. User-supplied `%`, `_`, and `\` are escaped so they
remain literal characters.

Values inside one node are joined with `OR`. Child branches and foreign-key
labels are additional `OR` branches. Structured filters and the root
row-visibility predicate are joined to that expression with `AND`:

```text
visible book
AND status is in_print
AND (
  a selected book value contains "blue"
  OR an allowed author label contains "blue"
  OR an allowed book code or descendant contains "blue"
)
```

## Follow the generated SQL

Sapporta resolves metadata into a search plan when the catalog loads. At request
time it binds that plan to the term, abilities, and row predicates. A Books
query roughly becomes:

```sql
SELECT books.*
FROM books
WHERE
  books.workspace_id = ?
  AND books.status = 'in_print'
  AND (
    lower(coalesce(cast(books.title AS text), ''))
      LIKE lower(?) ESCAPE '\'
    OR EXISTS (
      SELECT 1
      FROM authors AS sapporta_search_1
      WHERE sapporta_search_1.id = books.author_id
        AND sapporta_search_1.workspace_id = ?
        AND lower(
          coalesce(cast(sapporta_search_1.first_name AS text), '')
          || ' ' ||
          coalesce(cast(sapporta_search_1.last_name AS text), '')
        ) LIKE lower(?) ESCAPE '\'
    )
    OR EXISTS (
      SELECT 1
      FROM book_codes AS sapporta_search_2
      WHERE sapporta_search_2.book_id = books.id
        AND sapporta_search_2.workspace_id = ?
        AND (
          lower(coalesce(cast(sapporta_search_2.code AS text), ''))
            LIKE lower(?) ESCAPE '\'
          OR EXISTS (
            /* recursively compiled descendant search */
          )
        )
    )
  )
ORDER BY books.title;
```

The exact SQL depends on selected fields and every table's row scope. Correlated
`EXISTS` keeps one root row even when several children match. Deeper
relationships become nested `EXISTS` clauses rather than joins that multiply
root rows.

## Authorization follows every branch

The generated route first requires root-table read access. Each child or
foreign-key-label branch contributes only when the caller can read that table,
and that table's row predicate is placed inside its `EXISTS`.

If the caller cannot read Authors, author labels do not participate. Sapporta
does not fall back to raw `author_id` values. If every configured branch is
inaccessible, the search returns no matches. This omission prevents search from
revealing related rows outside the caller's scope.

A child match decides that its parent belongs in the root result. Expanding that
parent runs the child grid's own query and shows all child rows visible there;
the root `q` is not inherited. Use an explicit child-table filter or an
application result when a workflow needs match provenance.

## Related documentation

- [Configure table search](/docs/guides/model-data/configure-table-search/)
- [Use table search](/docs/guides/model-data/use-table-search/)
- [Index relational search paths](/docs/guides/model-data/index-relational-search-paths/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
