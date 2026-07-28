---
title: "Row-scoped data helpers"
description:
  "Look up `scopedRows()` construction, generated-style CRUD, and scoped counts."
---

## Imports

`@sapporta/server` exports `scopedRows`, `ScopedRows`,
`ScopedRowsSearchOptions`, `ListRowsInput`, `ListRowsResult`, `CountRowsInput`,
`CountRowsByInput`, `GroupCount`, `RowSecurity`, `TableRowSecurity`,
`InsertValuesOptions`, `RowNotFoundError`, and `ImmutableTableOperationError`.

## `scopedRows(...)`

```ts
function scopedRows(
  db: BetterSQLite3Database,
  auth: SapportaAuthContext,
  table: TableDef,
): ScopedRows;
```

Construction binds the registered table to the request's row-security policy.
Supply a catalog-compiled search plan only to a `list()` or `exportRows()` call
that contains a non-empty `q`:

```ts
const rows = scopedRows(db, auth, tasks);
const result = await rows.list(
  { q: "launch" },
  { searchPlan: catalog.searchPlanFor(tasks.sqlName) },
);
```

A plan for a different table is rejected. `scopedRows()` performs no ability
check; generated handlers authorize first, and custom handlers must do the same.

`ScopedRows` exposes:

```ts
interface ScopedRows {
  list(
    query?: ListRowsInput,
    options?: ScopedRowsSearchOptions,
  ): Promise<ListRowsResult>;
  get(id: RowId): Promise<Record<string, unknown>>;
  create(
    input: unknown,
  ): Promise<Record<string, unknown> | Record<string, unknown>[]>;
  update(id: RowId, patch: unknown): Promise<Record<string, unknown>>;
  delete(id: RowId): Promise<Record<string, unknown>>;
  exportRows(
    query?: ListRowsInput,
    options?: ScopedRowsSearchOptions,
  ): Promise<Record<string, unknown>[]>;
  lookup(query?: ListRowsInput): Promise<LookupEntry[]>;
  count(input?: CountRowsInput): Promise<number>;
  countBy(input: CountRowsByInput): Promise<GroupCount[]>;
}
```

List, lookup, count, grouped count, and export filter by row visibility.
Singular get/update/delete throw `RowNotFoundError` for both missing and
invisible rows. Create and update apply API write policy, reference visibility,
and the normal save pipeline. Update and delete throw
`ImmutableTableOperationError` when the table is immutable.

## Scalar and grouped counts

`count()` returns one number. `countBy()` returns typed group values without
loading complete rows:

```ts
interface CountRowsInput {
  where?: SQL;
}

interface CountRowsByInput extends CountRowsInput {
  column: SQLiteColumn;
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
expressions and a `SQLiteColumn`; the generated HTTP and CLI adapters translate
canonical filter parameters and a column name into the same operations.

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
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Domain workflows and transactions](/docs/guides/app-owned-features/domain-workflows-and-transactions/)
- [Scoped report helpers](/docs/reference/reports/scoped-report-helpers/)
