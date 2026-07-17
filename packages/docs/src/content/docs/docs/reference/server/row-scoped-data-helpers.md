---
title: "Row-scoped data helpers"
description: "Look up `scopedRows()` construction and generated-style CRUD behavior."
---

## Identity

`scopedRows`, `ScopedRows`, `ListRowsInput`, `ListRowsResult`,
`TableRowSecurity`, and `InsertValuesOptions` from `@sapporta/server`.

## Contract

- `scopedRows(db, auth, table)` constructs operations for one table and request authority.
- List/get/create/update/delete methods apply row visibility, trusted values, validation, references, and immutable policy.
- Get/update/delete use not-found behavior for missing or invisible rows.
- Construct helpers against a transaction handle when all operations must share one transaction.
- `auth.rowSecurity.forTable(table)` creates a request-bound guard for custom
  Drizzle reads, writes, joins, aggregates, and transactions. Create one guard
  for every table touched.
- `guard.ownedRows(predicate?)` combines a caller predicate with request row
  visibility for reads, updates, and deletes.
- `guard.insertValues(db, input, options?)` prepares an asynchronous write;
  `guard.insertValuesSync(tx, input, options?)` is the synchronous variant for
  the default `better-sqlite3` transaction callback.
- `options.serverValues` supplies trusted server-authored fields such as the
  parent foreign key in a detail insert. It does not bypass final reference
  visibility validation.
- `RowNotFoundError` and `ImmutableTableOperationError` are public error types.

## Minimal lookup

```ts
import { scopedRows } from "@sapporta/server";
```

## Related documentation

- [Row-safe custom endpoints and reports](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
- [Domain workflows and transactions](/docs/guides/app-owned-features/domain-workflows-and-transactions/)
