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

## Task-app example

`completeTask` rejects an already completed task with 409, updates status, and inserts one `completed` event. A failed event insert rolls back the task update.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
