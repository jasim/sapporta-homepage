---
title: "Scoped CRUD and bounded reads"
description:
  "Use `scopedRows()` for typed row CRUD, bounded lists and pages, or a
  cursor-backed complete visible selection."
---

## Imports

`@sapporta/server` exports `scopedRows`, `ScopedRows`, `TableRow`, `RowsQuery`,
`RowsOrderBy`, `FindManyRowsInput`, `PageRowsInput`, `PageRowsResult`,
`scanTableRows`, `TableRowScanInput`, `TableRowScanOrder`, `RowNotFoundError`,
and `ImmutableTableOperationError`.

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

`ScopedRows` exposes the following CRUD and row-read methods:

```ts
interface ScopedRows<TTable extends AnySQLiteTable> {
  findMany(input: FindManyRowsInput): Promise<TableRow<TTable>[]>;
  page(input?: PageRowsInput): Promise<PageRowsResult<TTable>>;
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
- [Domain workflows and transactions](/docs/guides/app-owned-features/domain-workflows-and-transactions/)
