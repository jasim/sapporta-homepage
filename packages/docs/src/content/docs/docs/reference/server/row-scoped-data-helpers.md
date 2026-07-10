---
title: "Row-scoped data helpers"
description: "Look up `scopedRows()` construction and generated-style CRUD behavior."
---

## Identity

`scopedRows`, `ScopedRows`, `ListRowsInput`, and `ListRowsResult` from `@sapporta/server`.

## Contract

- `scopedRows(db, auth, table)` constructs operations for one table and request authority.
- List/get/create/update/delete methods apply row visibility, trusted values, validation, references, and immutable policy.
- Get/update/delete use not-found behavior for missing or invisible rows.
- Construct helpers against a transaction handle when all operations must share one transaction.
- `RowNotFoundError` and `ImmutableTableOperationError` are public error types.

## Minimal lookup

```ts
import { scopedRows } from "@sapporta/server";
```

## Related documentation

- [Row-safe custom endpoints and reports](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
