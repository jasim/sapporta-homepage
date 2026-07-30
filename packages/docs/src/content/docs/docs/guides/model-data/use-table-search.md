---
title: "Use table search"
description:
  "Call an existing table search from generated UI, HTTP, CLI, frontend code, or
  an app-owned server operation."
---

Once a table has a valid search plan, the generated surface exposes the same
term through its ordinary callers.

## Use the generated callers

- The table toolbar sends the current term with its row request.
- `GET /api/tables/<table>?q=<term>` searches the generated list route.
- `GET /api/tables/<table>/export.csv?q=<term>` applies the same search to CSV
  export.
- `fetchTableRows({ tableName, search })` serializes `search` as `q`.
- The CLI uses `pnpm exec sapporta rows list <table> --q "<term>"`.

The metadata endpoint exposes only `"searchable": true` or `"searchable": false`
to the browser. The recursive plan remains on the server.

Generated handlers retrieve the compiled plan from the loaded table catalog.
They own the `q` HTTP parameter; `scopedRows()` deliberately does not.

## Search in app-owned server code

When an app-owned contract accepts a search term, compile the plan into a
Drizzle predicate and pass it to the bounded read that fits the result:

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

The same predicate can narrow `findMany()` or `scan()`. The row helper still
adds request visibility. Calls without search, including `count()` and
`countBy()`, need no search plan.

A generated-style HTTP adapter can pass its parsed query to `resolvePageQuery()`
or `resolveExportQuery()`, which resolve `q`, filters, columns, and ordering.
Most application routes can reuse `catalog.searchPlanFor()` with
`buildSearchPredicate()` instead.

## Keep search in URL state

Generated table screens store the term in the page URL:

```text
/tables/books?q=blue
```

Filters, sort, and pagination can live beside it:

```text
/tables/books?filter[status][eq]=in_print&q=blue&sort=title&page=1
```

Changing the term returns to the first page while preserving the rest of the
table-query model. The recipient of a shared URL still sees only rows and
relationship values allowed by their own request authority.

Search on `/_lookup` is separate. Lookup `q` filters the fields displayed by a
foreign-key picker; it does not use recursive table search. Grouped `/_count`
also does not accept table search.

## Related documentation

- [Configure table search](/docs/guides/model-data/configure-table-search/)
- [Relational search semantics and security](/docs/guides/model-data/relational-search-semantics-and-security/)
- [Filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)
- [Table read functions and query options](/docs/reference/frontend/table-queries/read-functions-and-options/)
- [Scoped CRUD and bounded reads](/docs/reference/server/row-scoped-data/scoped-crud-and-bounded-reads/)
