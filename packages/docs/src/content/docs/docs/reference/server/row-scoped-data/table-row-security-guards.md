---
title: "Table row-security guards"
description:
  "Use per-table row predicates and trusted value preparation in custom Drizzle
  queries and synchronous transactions."
---

Use a per-table guard when a custom query shape cannot use the ordinary
`scopedRows()` persistence methods.

`@sapporta/server` exports `RowSecurity`, `TableRowSecurity`, and
`InsertValuesOptions`.

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
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Scoped report helpers](/docs/reference/reports/scoped-report-helpers/)
- [Domain workflows and transactions](/docs/guides/application-code/domain-workflows-and-transactions/)
