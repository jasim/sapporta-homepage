---
title: "Search table rows and relationships"
description:
  "Configure default, focused, and nested table search, then follow the query
  from a shareable URL to authorization-aware SQL."
---

Every Sapporta table is searchable by default. As soon as you register a table,
the generated table screen shows a search field and the list API accepts `q`.
You do not need to repeat the visible columns in metadata to get that first
useful search:

```ts
export const books = sapportaTable({
  drizzle: booksTable,
  meta: {
    label: "Books",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["title"],
  },
});
```

This default is equivalent to `search: "allColumns"`. It searches the book's
primary key and visible application columns. If one of those columns is a
foreign key, Sapporta searches the referenced row's label instead of the stored
ID. It does not walk into has-many children unless you ask it to.

That boundary gives the default predictable meaning: search the values displayed
as part of this row. From here you can narrow those values, add explicit
relationship paths, or disable search for the table.

## Choose what represents the root row

The `meta.search` API accepts three useful shapes:

```ts
type SearchSelf = false | "allColumns" | readonly string[];

type TableSearch =
  | false
  | "allColumns"
  | {
      self?: SearchSelf;
      children?: Readonly<Record<string, TableSearch>>;
    };
```

Use a `self` array when a broad search would include values people are unlikely
to remember. The names are public SQL column names:

```ts
export const books = sapportaTable({
  drizzle: booksTable,
  meta: {
    label: "Books",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["title"],
    search: {
      self: ["id", "title", "isbn", "author_id"],
    },
  },
});
```

This searches the stored `id`, `title`, and `isbn`. `author_id` behaves
differently because it is a reference. If the Authors table declares
`rowLabelColumns: ["first_name", "last_name"]`, the book search compares the
term with a label such as `Jane Doe`. It never searches the raw `author_id`.
Selecting a foreign-key column in `self` therefore means “search the referenced
label,” not “cast this ID to text.”

`"allColumns"` follows the same rule. It includes the primary key and ordinary
visible application columns, but excludes `visuallyHidden` columns and
system-managed ownership fields such as `workspace_id` and `scoped_to_user_id`.
An explicit `self` array may include a visually hidden application column when
that value genuinely represents the row. Ownership fields cannot be made
searchable.

## Add has-many relationships deliberately

A book is sometimes remembered by a value stored in another table. An ISBN
edition code, local catalog number, or quoted passage can all be useful ways to
find the book that owns them. Add that path under `search.children`:

```ts
export const books = sapportaTable({
  drizzle: booksTable,
  meta: {
    label: "Books",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["title"],
    children: [
      {
        table: "book_codes",
        foreignKey: "book_id",
        label: "Codes",
      },
    ],
    search: {
      self: ["id", "title", "isbn", "author_id"],
      children: {
        book_codes: {
          self: ["code", "language_id"],
        },
      },
    },
  },
});
```

The `book_codes` key is the child table's SQL name. It must identify exactly one
relationship already declared in the current table's `meta.children`. The
`book_codes.book_id` column must also be a real Drizzle foreign key, or an
explicit Sapporta reference, to the Books primary key.

The child node uses the same rules as the root. `code` searches its stored
value. If `language_id` references a Languages table whose row label is `name`,
the search compares the term with that language name rather than its stored ID.

Children can continue into their own declared children. Suppose a code has usage
records:

```ts
export const bookCodes = sapportaTable({
  drizzle: bookCodesTable,
  meta: {
    label: "Book codes",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["code"],
    children: [
      {
        table: "code_usages",
        foreignKey: "book_code_id",
      },
    ],
  },
});
```

The Books search can reach that second level:

```ts
search: {
  self: ["id", "title", "isbn", "author_id"],
  children: {
    book_codes: {
      self: ["code", "language_id"],
      children: {
        code_usages: "allColumns",
      },
    },
  },
},
```

Traversal is recursive but never implicit. `"allColumns"` searches one table
node; it does not silently descend into that table's children. If the
intermediate code fields should not match at all, keep the path and turn off
only that node's own values:

```ts
search: {
  children: {
    book_codes: {
      self: false,
      children: {
        code_usages: "allColumns",
      },
    },
  },
},
```

An object defaults `self` to `"allColumns"`, so a configuration containing only
`children` still searches the current table. Use `self: false` when you intend a
child-only or descendant-only search.

## Use the same search from UI, HTTP, and application code

Once search is enabled, the generated surface exposes it in the usual table
interfaces:

- The table toolbar sends the current term with its row request.
- `GET /api/tables/<table>?q=<term>` searches the generated list route.
- `GET /api/tables/<table>/export.csv?q=<term>` applies the same search to CSV
  export.
- `fetchTableRows({ tableName, search })` serializes `search` as the same `q`
  parameter. The CLI equivalent is
  `pnpm exec sapporta rows list <table> --q "<term>"`.

The metadata endpoint exposes only `"searchable": true` or `"searchable": false`
to the browser. The recursive plan remains on the server, where table
definitions and authorization are available.

Generated handlers retrieve the compiled plan from the loaded table catalog.
They own the `q` query parameter because `q` is HTTP grammar, not a
`scopedRows()` input.

App-owned code starts one layer lower. When it receives a search term through
its own contract, compile the plan into a Drizzle predicate and pass that
predicate to the bounded read that fits the result:

```ts
import { buildSearchPredicate, scopedRows } from "@sapporta/server";

const rows = scopedRows(db, auth, books);
const searchWhere = buildSearchPredicate(
  catalog.searchPlanFor(books.sqlName),
  "blue",
  auth,
);
const result = await rows.page({
  where: searchWhere,
  page: 1,
  limit: 50,
});
```

The resulting SQL can also narrow `findMany()` or `scan()`. This keeps
relational search context attached to the operation that uses it while the row
helper continues to add request visibility. Calls without search, including
`count()` and `countBy()`, need no search plan.

A generated-style HTTP adapter has a different job. It can pass the
contract-parsed query to `resolvePageQuery()` or `resolveExportQuery()`, which
resolve `q`, filters, columns, and ordering into the same Drizzle-shaped inputs.
Most application routes do not need that transport adapter; they can let
`loadSapportaProject()` build the catalog once and reuse
`catalog.searchPlanFor()` with `buildSearchPredicate()`.

Generated table screens also keep the search term in the page URL:

```text
/tables/books?q=blue
```

Filters, sort, and pagination can live beside it:

```text
/tables/books?filter[status][eq]=in_print&q=blue&sort=title&page=1
```

That makes a search state reusable rather than transient. You can bookmark a
support queue, share a pre-filtered catalog view, or make a domain link such as
“in-print books matching the current campaign phrase.” The recipient still sees
only rows and relationship values allowed by their own request authority.
Changing the search in the generated toolbar returns to the first page while
preserving the rest of the table-query model.

Search on `/_lookup` is separate. Lookup `q` filters the fields displayed by a
foreign-key picker; it does not use this recursive table-search plan. Grouped
`/_count` also does not accept table search.

## Know what a term means

Sapporta trims the term and keeps it as one literal substring. It does not split
`Jane Doe` into two tokens; it searches for the complete `Jane Doe` sequence.
Empty or whitespace-only `q` is treated as no search.

Matching is case-insensitive and converts ordinary selected values to text. The
conceptual predicate for each value is:

```sql
lower(coalesce(cast(value AS text), ''))
  LIKE lower(?) ESCAPE '\'
```

Sapporta binds `%term%` to the placeholder. `%`, `_`, and `\` supplied by the
user are escaped first, so they remain literal characters instead of becoming
SQL wildcard syntax.

Values inside a search node are joined with `OR`. Child branches and foreign-key
labels are additional `OR` branches. Structured filters and the root
row-visibility predicate are joined to that whole search expression with `AND`.
A request for `q=blue` plus `status=in_print` therefore means:

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

Sapporta resolves the metadata into a search plan when the table catalog loads.
At request time it binds that plan to the current search term, abilities, and
row-security predicates. A Books query roughly becomes:

```sql
SELECT books.*
FROM books
WHERE
  /* root row visibility */
  books.workspace_id = ?
  AND books.status = 'in_print'
  AND (
    lower(coalesce(cast(books.id AS text), ''))
      LIKE lower(?) ESCAPE '\'
    OR lower(coalesce(cast(books.title AS text), ''))
      LIKE lower(?) ESCAPE '\'
    OR EXISTS (
      SELECT 1
      FROM authors AS sapporta_search_1
      WHERE sapporta_search_1.id = books.author_id
        /* referenced-row visibility */
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
        /* child-row visibility */
        AND sapporta_search_2.workspace_id = ?
        AND (
          lower(coalesce(cast(sapporta_search_2.code AS text), ''))
            LIKE lower(?) ESCAPE '\'
          OR EXISTS (
            /* language row label and its visibility predicate */
          )
          OR EXISTS (
            /* recursively compiled code_usages search */
          )
        )
    )
  )
ORDER BY books.title;
```

The exact SQL depends on the selected fields and the row scope of every table.
The important shape is the correlated `EXISTS`. A book with five matching codes
still appears once, and deeper relationships become nested `EXISTS` clauses
rather than joins that multiply root rows.

## Authorization follows every branch

The generated route first requires read access to the root table. Each child or
foreign-key-label branch contributes only when the caller can also read that
table, and that table's row-scope predicate is placed inside its `EXISTS`.

If the caller cannot read Authors, author labels do not participate. Sapporta
does not fall back to searching raw `author_id` values. If every configured
branch is inaccessible, the search returns no matches. This omission behavior
keeps search from revealing that a related row exists outside the caller's
scope.

There is one related UI behavior worth making explicit. A code match decides
that its book belongs in the root result set. When you expand that book, the
child grid runs its own query and shows all child rows visible in that child
surface. The root `q` is not inherited. If a workflow needs a matched-codes-only
screen, make that child filter explicit in its own URL or build an app-owned
result that carries match provenance.

## Disable search or narrow it without surprises

Set `search: false` when free-text search has no useful meaning for the root
table:

```ts
meta: {
  label: "Exchange rates",
  rowScope: "systemGlobal",
  rowLabelColumns: ["currency_code"],
  search: false,
},
```

The browser metadata then exposes `"searchable": false`, and the generated table
screen hides its search control. A non-empty `q` sent to the list or export
route returns a structured 400 error with code `no_search_config`. Silently
ignoring the term would turn a narrow request into a broad one.

This switch governs the table's own root search. Another table may still reach
it through an explicit child configuration and select the values to search at
that node. Table-level `search: false` is not a global visibility rule.

Invalid configurations fail while the project loads, before the server accepts
requests. Sapporta rejects unknown `self` columns, ownership fields, empty
column arrays, unresolved references, missing row-label columns, undeclared or
ambiguous child names, child foreign keys that point somewhere other than the
current parent, and cyclic configuration objects. A finite path may revisit the
same table—for example, two explicitly configured levels of employee reports—as
long as the JavaScript configuration object itself is not cyclic. Use
`self: false`, not `self: []`.

## Index the relationship path

Literal substring matching uses a leading wildcard, so this feature is not
SQLite full-text search and an ordinary B-tree index does not make
`LIKE '%blue%'` scan-free. It fits operational tables where people remember a
fragment of a title, code, customer name, or note and the searchable set remains
deliberate.

The relationship lookup inside each correlated `EXISTS` does have a useful index
path. Put the child foreign key first in an index:

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
but it points at the correlation the database will run for each candidate
parent. Inspect `EXPLAIN QUERY PLAN` with representative data before broadening
a search tree.

Changing only `meta.search` does not change SQLite storage, so it does not need
a database migration. Adding or changing the Drizzle index does. Generate that
migration, review the SQL, and apply it through the normal schema workflow.

For a large document corpus, language-aware ranking, stemming, or tokenized
matching, use an app-owned search endpoint backed by an appropriate FTS or
external index. The metadata search described here intentionally remains
literal, relational, and tied to generated table reads.

## Related documentation

- [Filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)
- [Relationships and lookup behavior](/docs/guides/model-data/relationships-and-lookup-behavior/)
- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Table query options](/docs/reference/frontend/table-query-options/)
- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
