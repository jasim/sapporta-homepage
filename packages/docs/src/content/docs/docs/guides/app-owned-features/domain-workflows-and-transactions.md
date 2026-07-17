---
title: "Domain workflows and transactions"
description: "Keep business invariants testable and commit multi-table changes atomically."
---

Keep business invariants testable and commit multi-table changes atomically.

Thin route adapters pass explicit database, auth, input, clock, and service dependencies into domain modules. Drizzle transactions define the all-or-nothing boundary.

For the programmer, the project reads current state, checks the transition, and performs scoped writes in one workflow module.
For the application user, users never observe a completed task without its completion-history event.

## System boundary

- Read state inside the transaction.
- Use row-security guards against the transaction handle.
- Return a small domain result and translate expected errors at the HTTP edge.
- Test success, repeat calls, invisible rows, and injected write failure.

## Scoped parent-detail insert

Create one row-security guard for every table touched by the workflow. Use the
guard's visibility predicate for reads and its insert-value helper for writes.
Pass parent keys and other server-authored references through `serverValues`;
never copy ownership or parent keys from client input.

The default Sapporta SQLite driver uses synchronous `better-sqlite3`
transactions. Keep the transaction callback synchronous and use
`insertValuesSync()` inside it. Do not mark the callback `async` or await work
inside it.

```ts
import { eq } from "drizzle-orm";

const parentAccess = auth.rowSecurity.forTable(parents);
const detailAccess = auth.rowSecurity.forTable(details);
const referencedAccess = auth.rowSecurity.forTable(referencedRows);

const result = db.transaction((tx) => {
  // Scope reads in SQL. A missing result also covers an invisible row.
  const referenced = tx
    .select({ id: referencedRowsTable.id })
    .from(referencedRowsTable)
    .where(
      referencedAccess.ownedRows(
        eq(referencedRowsTable.id, input.referenced_id),
      ),
    )
    .get();

  if (!referenced) throw new ReferencedRowNotFoundError();

  const parentValues = parentAccess.insertValuesSync(tx, input.parent);
  const parent = tx
    .insert(parentsTable)
    .values(parentValues as typeof parentsTable.$inferInsert)
    .returning({ id: parentsTable.id })
    .get();

  const insertedDetails = input.details.map((detail) => {
    const detailValues = detailAccess.insertValuesSync(tx, detail, {
      serverValues: { parent_id: parent.id },
    });

    return tx
      .insert(detailsTable)
      .values(detailValues as typeof detailsTable.$inferInsert)
      .returning()
      .get();
  });

  return { parent, details: insertedDetails };
});
```

`insertValuesSync()` rejects client ownership fields and server-managed
references, merges trusted `serverValues`, validates final foreign-key
visibility, and stamps request ownership. It prepares values for Drizzle; the
workflow remains responsible for the insert and its returned row.

If asynchronous network or file work is required, complete it before entering
the SQLite transaction or redesign the boundary. Keep the database transaction
short and synchronous.

## Task-app example

`completeTask` rejects an already completed task with 409, updates status, and inserts one `completed` event. A failed event insert rolls back the task update.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
- [Row-safe custom endpoints and reports](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
