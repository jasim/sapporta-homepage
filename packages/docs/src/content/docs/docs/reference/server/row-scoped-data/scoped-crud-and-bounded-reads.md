---
title: "Scoped CRUD and bounded reads"
description:
  "Use `scopedRows()` for typed row CRUD, bounded lists and pages, tree matches,
  or a cursor-backed complete visible selection."
---

## Imports

`@sapporta/server` exports `scopedRows`, `ScopedRows`, `TableRow`, `RowsQuery`,
`RowsOrderBy`, `FindManyRowsInput`, `PageRowsInput`, `PageRowsResult`,
`TreeMatch`, `TreeMatchInput`, `scanTableRows`, `TableRowScanInput`,
`TableRowScanOrder`, `RowNotFoundError`, and `ImmutableTableOperationError`.

## `scopedRows(...)`

```ts
function scopedRows<TTable extends AnySQLiteTable>(
  db: BetterSQLite3Database,
  auth: SapportaAuthContext,
  table: TableDef<TTable>,
): ScopedRows<TTable>;
```

`scopedRows()` is the ordinary data boundary after a route has authenticated and
authorized its caller. Construction binds one registered Drizzle table to the
request's row-security policy. From there, every read adds the visible-row
predicate, and every generated-style write applies managed-field and reference
rules before persistence.

The helper deliberately does not parse URL parameters. Application code supplies
Drizzle expressions and numeric bounds, while generated HTTP handlers translate
the public string query into those inputs. It also does not perform an ability
check. A custom route must authorize the action before calling it.

`TableRow<TTable>` keys a row by database column name and gives each column its
own type, for columns declared with the Sapporta semantic factories and with
Drizzle's own builders alike. A table whose Drizzle property differs from its
column name returns the column name: `findMany()` returns database-named keys.
These are `expectTypeOf` assertions in the framework, so `pnpm typecheck`
(`tsc --noEmit`) is what reports a mismatch — `vite build` erases types without
checking them.

`ScopedRows` exposes the following CRUD and row-read methods:

```ts
interface ScopedRows<TTable extends AnySQLiteTable> {
  findMany(input: FindManyRowsInput): Promise<TableRow<TTable>[]>;
  page(input?: PageRowsInput): Promise<PageRowsResult<TTable>>;
  treeMatch(input: TreeMatchInput): Promise<TreeMatch>;
  get(id: RowId): Promise<TableRow<TTable>>;
  create(input: Record<string, unknown>): Promise<TableRow<TTable>>;
  create(input: readonly unknown[]): Promise<TableRow<TTable>[]>;
  create(input: unknown): Promise<TableRow<TTable> | TableRow<TTable>[]>;
  update(id: RowId, patch: unknown): Promise<TableRow<TTable>>;
  delete(id: RowId): Promise<TableRow<TTable>>;
  scan(input?: RowsQuery): AsyncIterable<TableRow<TTable>>;
}
```

The generic result is inferred from the bound Drizzle table, but returned object
keys use public SQL column names. A Drizzle property such as `workspaceId`
therefore appears as `workspace_id`, which matches generated HTTP rows. Singular
get, update, and delete throw `RowNotFoundError` for both missing and invisible
rows. Create and update apply API write policy, reference visibility, and the
normal save pipeline. Update and delete throw `ImmutableTableOperationError`
when the table is immutable.

## Choose a bounded read

`findMany()` is the direct choice when code needs rows but not a matching count:

```ts
import { desc, eq } from "drizzle-orm";

const rows = scopedRows(c.get("db"), auth, invoices);
const pending = await rows.findMany({
  where: eq(invoicesTable.status, "pending"),
  orderBy: desc(invoicesTable.createdAt),
  limit: 25,
  offset: 25,
});
```

Its `limit` is required and must be an integer from `1` through `1000`. `offset`
defaults to `0` and must be a nonnegative safe integer. When a response also
needs totals and page metadata, use `page()` instead:

```ts
const result = await rows.page({
  where: eq(invoicesTable.status, "pending"),
  orderBy: desc(invoicesTable.createdAt),
  page: 2,
  limit: 25,
});
```

`page()` defaults to page `1` and limit `50`. Page must be an integer from `1`
through `MAX_PAGE`, and limit must be an integer from `1` through `1000`. The
method returns `{ data, meta: { total, page, limit, pages } }` and composes the
selection with `count()`, so use `findMany()` when that extra count is not part
of the result.

For either method, `where` is SQL-`AND`ed with the request's row predicate.
Requested order clauses come first. Otherwise Sapporta uses the table's default
sort when present. In every case it appends the primary key ascending as a
deterministic tie-breaker; without a requested or default sort, the primary key
is the only order.

## Match a tree with its context

On a table that declares `meta.tree`, `treeMatch()` selects the rows that match
a condition together with their ancestors, so each match can be shown in place
under its parents:

```ts
import { and, asc, eq, like } from "drizzle-orm";

const rows = scopedRows(c.get("db"), auth, accounts);
const match = await rows.treeMatch({
  fixed: eq(accountsTable.archived, false),
  match: like(accountsTable.name, "%tax%"),
  matchContext: "ancestors-and-descendants",
});
const result = await rows.page({
  where: match.where,
  orderBy: asc(accountsTable.name),
  limit: 1000,
});
```

`TreeMatchInput` takes three fields:

- `match` selects the matching rows.
- `fixed` is optional. Every row the result keeps satisfies it: the matches, and
  the ancestors and descendants around them. A page that lists only unarchived
  accounts passes its archive condition here, so a match never brings back an
  archived parent or child.
- `matchContext` is `"ancestors"` or `"ancestors-and-descendants"`. The second
  also keeps every descendant of a match, so a matching parent shows its whole
  subtree.

`TreeMatch` returns a `where` for `page()`, `findMany()`, `scan()`, or
`count()`, so ordering, paging, and column selection stay those of an ordinary
read. `matchCount` counts the rows that satisfy `fixed` and `match` themselves.
`contextIds` lists the ancestors that `where` keeps only because a descendant
matched.

The walk follows the table's `parentColumn` through rows the request may see
that satisfy `fixed`. It stops at a row outside that set and never returns one.
A loop of parent keys ends the walk. `treeMatch()` throws on a table without
`meta.tree`. The generated list route uses it for a `tree` read with a filter or
search; see
[Generated query resolvers](/docs/reference/server/row-scoped-data/generated-query-resolvers/).

## Stream a complete visible selection

A large export or sequential processor should not turn an entire visible table
into one array. `scan()` streams the selection through one SQLite statement and
one read snapshot:

```ts
for await (const invoice of rows.scan({
  where: eq(invoicesTable.status, "pending"),
  orderBy: desc(invoicesTable.createdAt),
})) {
  // Process one visible invoice.
}
```

The cursor is released when iteration finishes or the consumer stops early.
There is no batch-size input because the implementation does not rerun
`LIMIT`/`OFFSET` pages. As with other scoped reads, it applies the request row
predicate and adds primary-key ordering as a stable tie-breaker.

`scanTableRows()` exposes the storage primitive for a workflow that owns its
predicate explicitly:

```ts
const access = auth.rowSecurity.forTable(invoices);

for await (const invoice of scanTableRows(c.get("db"), invoices, {
  where: access.ownedRows(eq(invoicesTable.status, "pending")),
})) {
  // Process one intentionally scoped invoice.
}
```

Unlike `scopedRows().scan()`, `scanTableRows()` does not add row scope. Compose
`ownedRows(...)` yourself unless the operation is deliberately unrestricted.

## Related documentation

- [Lookups and counts](/docs/reference/server/row-scoped-data/lookups-and-counts/)
- [Table row-security guards](/docs/reference/server/row-scoped-data/table-row-security-guards/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Domain workflows and transactions](/docs/guides/application-code/domain-workflows-and-transactions/)
