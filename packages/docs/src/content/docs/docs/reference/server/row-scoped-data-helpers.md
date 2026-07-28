---
title: "Row-scoped data helpers"
description:
  "Look up typed row-scoped CRUD, bounded reads, cursor scans, lookup, counts,
  and HTTP query adapters."
---

## Imports

`@sapporta/server` exports `scopedRows`, `ScopedRows`, `TableRow`,
`TableColumn`, `RowsQuery`, `RowsOrderBy`, `FindManyRowsInput`, `PageRowsInput`,
`PageRowsResult`, `LookupRowsInput`, `LookupRowsByIdInput`,
`LookupRowsBySearchInput`, `CountRowsInput`, `CountRowsByInput`, `GroupCount`,
`scanTableRows`, `TableRowScanInput`, `TableRowScanOrder`, `ResolvedCountQuery`,
`ResolveRowsQueryOptions`, `RowSecurity`, `TableRowSecurity`,
`InsertValuesOptions`, `RowNotFoundError`, and `ImmutableTableOperationError`.

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

`ScopedRows` exposes:

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
  lookup(input?: LookupRowsInput<TTable>): Promise<LookupEntry[]>;
  count(input?: CountRowsInput): Promise<number>;
  countBy(input: CountRowsByInput<TTable>): Promise<GroupCount[]>;
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

## Use one lookup mode at a time

Direct lookup separates selected-ID recovery from picker search:

```ts
await rows.lookup({ ids: ["12", "14", "19"] });

await rows.lookup({
  search: "overdue",
  fields: [invoicesTable.id, invoicesTable.reference],
  limit: 20,
});
```

ID mode accepts between `1` and `500` string `RowId` values and does not accept
`search`, `fields`, or `limit`. Numeric primary-key IDs are validated and
converted before SQL; text primary-key IDs remain strings. Search mode accepts
visible Drizzle columns from the bound table, defaults to `50` results, and
accepts at most `500`. Keeping the modes disjoint prevents a selected-value
lookup from quietly becoming a broader search.

## Scalar and grouped counts

`count()` returns one number. `countBy()` returns typed group values without
loading complete rows:

```ts
interface CountRowsInput {
  where?: SQL;
}

interface CountRowsByInput<
  TTable extends AnySQLiteTable,
> extends CountRowsInput {
  column: TableColumn<TTable>;
  order?: "asc" | "desc";
  limit?: number;
}

interface GroupCount {
  value: string | number | boolean | null;
  count: number;
}
```

Both methods add `where` to the request's row predicate. `countBy()` requires a
column belonging to the bound table. It defaults to descending count order and
`50` groups, accepts limits from `1` through `1000`, and orders equal counts by
the group value ascending. `null` remains an ordinary group value.

These server inputs are transport-free. App-owned code supplies Drizzle
expressions and a table column; the generated HTTP and CLI adapters translate
canonical filter parameters and a column name into the same operations.

## Translate generated HTTP queries

Custom table adapters can reuse the same boundary as generated routes. The
server package exports:

```ts
resolvePageQuery(query, table, { auth, searchPlan });
resolveExportQuery(query, table, { auth, searchPlan });
resolveLookupQuery(query, table);
resolveCountQuery(query, table);
```

These functions accept the matching parsed shared-contract query and validate
table-dependent column, filter, lookup, search, and ordering semantics. The
page, export, and lookup resolvers return the direct Drizzle-shaped input for
the matching `scopedRows()` operation. Count needs one more choice:

```ts
const resolved = resolveCountQuery(query, table);
const data =
  resolved.kind === "total"
    ? await rows.count(resolved.input)
    : await rows.countBy(resolved.input);
```

That `ResolvedCountQuery` discriminator selects `count()` or `countBy()` without
putting HTTP grammar into either data method. These resolvers are the right
bridge when an adapter owns that grammar. Ordinary domain code should construct
its Drizzle predicate directly instead of manufacturing `filter[...]`, `q`, or
numeric query strings.

## Per-table guards

```ts
const guard = auth.rowSecurity.forTable(table);
```

`forTable(table)` accepts only the registered table. It binds request authority
and catalog metadata, not a database handle. Create one guard for every table a
custom query touches.

The core custom-query operations are:

```ts
guard.ownedRows(predicate?: SQL): SQL;

guard.insertValues<T extends Record<string, unknown>>(
  db: BetterSQLite3Database,
  input: T,
  options?: InsertValuesOptions<T>,
): Promise<T & Record<string, unknown>>;

guard.insertValuesSync<T extends Record<string, unknown>>(
  db: BetterSQLite3Database,
  input: T,
  options?: InsertValuesOptions<T>,
): T & Record<string, unknown>;

guard.patchValues<T extends Record<string, unknown>>(
  db: BetterSQLite3Database,
  patch: T,
): Promise<T>;

guard.validateReferences(
  db: BetterSQLite3Database,
  payload: unknown,
): Promise<void>;

guard.validateReferencesSync(
  db: BetterSQLite3Database,
  payload: unknown,
): void;
```

`ownedRows(predicate)` SQL-`AND`s the supplied predicate with the request's
table-ownership predicate. Use it on every custom select, update, and delete.
The guard does not expose persistence methods named `read`, `update`, or
`delete`; custom code runs Drizzle with the returned predicate.

`patchValues(...)` validates a caller patch but does not persist it.
`insertValues(...)` and `insertValuesSync(...)` prepare values in this order:

1. reject caller-supplied scope fields and `apiSettable: false` references;
2. merge trusted `serverValues`;
3. validate final foreign-key visibility;
4. stamp trusted scope fields from request authority.

They return prepared values. The caller still performs the insert or invokes a
save pipeline.

## `serverValues`

```ts
interface InsertValuesOptions<T extends Record<string, unknown>> {
  serverValues?:
    | Record<string, unknown>
    | ((input: T, index: number) => Record<string, unknown>);
}
```

When the feature accepts no writable event fields, keep the caller input empty:

```ts
const values = eventAccess.insertValuesSync(
  tx,
  {},
  {
    serverValues: {
      task_id: taskId,
      event_type: "completed",
      occurred_at: Temporal.Now.instant(),
    },
  },
);

tx.insert(taskEventsTable).values(values).run();
```

`serverValues` may supply a reference marked `apiSettable: false`, but it does
not bypass final reference visibility validation.

## Transactions, immutability, and raw access

The default `better-sqlite3` transaction callback is synchronous. Use
`insertValuesSync(tx, ...)` and synchronous Drizzle operations inside it.
Awaited network, mail, or queue effects belong after commit.

Per-table guards enforce row predicates only where the application uses them.
They do not enforce table abilities or `immutable`. `scopedRows().update()` and
`.delete()` enforce immutability; raw/custom Drizzle can bypass it. Custom
mutations must check the route ability, compose `ownedRows(...)`, prepare caller
patches when applicable, and preserve the intended immutable policy.

## Related documentation

- [Row-safe custom endpoints and reports](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
- [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
- [Search table rows and relationships](/docs/guides/model-data/search-indexes-and-display-metadata/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Table endpoints](/docs/reference/http/table-endpoints/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Domain workflows and transactions](/docs/guides/app-owned-features/domain-workflows-and-transactions/)
- [Scoped report helpers](/docs/reference/reports/scoped-report-helpers/)
