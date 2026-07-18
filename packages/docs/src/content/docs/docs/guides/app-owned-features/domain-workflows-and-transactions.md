---
title: "Domain workflows and transactions"
description:
  "Keep business invariants testable and commit multi-table changes atomically."
---

A domain workflow owns a business transition that spans more than one database
statement. The HTTP handler supplies the authenticated context and input; the
workflow reads current state, enforces invariants, and commits the complete
state change.

This page builds a synchronous SQLite transaction for task completion and a
reusable parent-detail pattern. These techniques support approvals plus audit
entries, orders plus line items, stock movements, ledger postings, and any
operation where a partial write would create an invalid application state.

```text
Move task completion into a domain module. In one short synchronous transaction, scope the task read, reject missing or completed tasks, update its status, and insert a server-authored completion event. Add focused tests for success, conflict, row visibility, and rollback.
```

## Keep the HTTP adapter outside the workflow

The route resolves auth and passes a small context to the domain module. The
module does not receive a Hono `Context`, parse JSON, or select an HTTP
response. This makes the transition callable from a route, job, or test without
reconstructing a request.

Create `packages/api/modules/tasks/complete-task.ts`:

```ts
import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { SapportaAuthContext } from "@sapporta/server";
import { Temporal } from "@sapporta/shared/temporal";
import { taskEvents, taskEventsTable } from "../../schema/task-events.js";
import { tasks, tasksTable } from "../../schema/tasks.js";

type TaskWorkflowContext = {
  db: BetterSQLite3Database;
  auth: SapportaAuthContext;
  now?: () => Temporal.Instant;
};

export abstract class TaskCompletionError extends Error {
  abstract readonly status: 404 | 409;
  abstract readonly code: string;

  toResponseBody() {
    return { error: this.message, code: this.code };
  }
}

export class TaskNotFoundError extends TaskCompletionError {
  readonly status = 404 as const;
  readonly code = "TASK_NOT_FOUND";

  constructor() {
    super("Task not found");
    this.name = "TaskNotFoundError";
  }
}

export class TaskAlreadyCompletedError extends TaskCompletionError {
  readonly status = 409 as const;
  readonly code = "TASK_ALREADY_COMPLETED";

  constructor() {
    super("Task is already completed");
    this.name = "TaskAlreadyCompletedError";
  }
}

export function completeTask(context: TaskWorkflowContext, taskId: number) {
  const { db, auth } = context;
  const now = context.now ?? (() => Temporal.Now.instant());
  const taskAccess = auth.rowSecurity.forTable(tasks);
  const eventAccess = auth.rowSecurity.forTable(taskEvents);

  return db.transaction((tx) => {
    const completedAt = now();
    const task = tx
      .select({ id: tasksTable.id, status: tasksTable.status })
      .from(tasksTable)
      .where(taskAccess.ownedRows(eq(tasksTable.id, taskId)))
      .get();

    if (!task) throw new TaskNotFoundError();
    if (task.status === "completed") {
      throw new TaskAlreadyCompletedError();
    }

    tx.update(tasksTable)
      .set({ status: "completed", updated_at: completedAt })
      .where(taskAccess.ownedRows(eq(tasksTable.id, task.id)))
      .run();

    const eventValues = eventAccess.insertValuesSync(
      tx,
      {},
      {
        serverValues: {
          task_id: task.id,
          event_type: "completed",
          occurred_at: completedAt,
        },
      },
    );

    const event = tx
      .insert(taskEventsTable)
      .values(eventValues as typeof taskEventsTable.$inferInsert)
      .returning({ id: taskEventsTable.id })
      .get();

    return {
      task_id: task.id,
      event_id: event.id,
      status: "completed" as const,
    };
  });
}
```

Both the task read and update compose the ID predicate with `ownedRows()`. A
task outside the request's data authority therefore follows the same 404 branch
as an absent task. The event guard stamps the trusted workspace value and
validates the server-authored task reference against the same request authority.

The clock is a dependency and returns `Temporal.Instant`. Tests can supply a
fixed instant without using `Date` or sleeping between assertions.

## Keep the SQLite boundary synchronous

The default Sapporta SQLite driver uses synchronous `better-sqlite3`
transactions. Keep the transaction callback synchronous and use
`insertValuesSync()` inside it. Do not mark the callback `async` or await
network, mail, storage, or other I/O inside it.

If a workflow needs an external service, complete the required read before the
transaction, commit the database change in a short synchronous callback, and
perform follow-up effects after commit. Work that must be coordinated reliably
with an external system usually needs a durable outbox or job record rather than
a long database transaction.

## Apply the parent-detail pattern

A parent-detail create needs one row-security guard for every table it touches.
Scope referenced-row reads in SQL. Pass parent keys and other server-authored
fields through `serverValues`; never copy ownership or parent keys from client
input.

```ts
import { eq } from "drizzle-orm";

const parentAccess = auth.rowSecurity.forTable(parents);
const detailAccess = auth.rowSecurity.forTable(details);
const referencedAccess = auth.rowSecurity.forTable(referencedRows);

const result = db.transaction((tx) => {
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
workflow remains responsible for executing the insert and returning the result.

## Prove atomic behavior

Write focused service tests against an isolated database. The essential cases
are:

- an open visible task becomes completed and receives one event;
- a second call raises `TaskAlreadyCompletedError` and adds no event;
- an invisible task raises `TaskNotFoundError`;
- an injected event insert failure rolls back the task update.

For a manual check, call the endpoint once and inspect both generated tables:

```bash
pnpm exec sapporta api post /api/tasks/1/complete --body '{}'
pnpm exec sapporta rows get tasks 1
pnpm exec sapporta rows list task_events --where '{"task_id":{"eq":1}}'
```

The task response should contain `"status": "completed"`, and the event list
should contain exactly one `"event_type": "completed"` row for that task.

<!--
Screenshot brief
Suggested asset: task-completion-atomic-result.png
Setup: Seed one open task, complete it once through the endpoint, then open the generated Tasks grid and expand that task's Task history child relationship.
Frame: Include the completed status on the parent row and the single completion event in the expanded Task history rows. Keep the task identity visible and exclude unrelated navigation.
Visible proof: The parent status and immutable history event are visible together after one workflow call.
Alt text: Completed task record with one completed event in its Task history child table.
-->

The workflow now protects the invariant that completion status and completion
history change together. Row visibility is enforced in SQL, trusted fields are
authored by the server, and a failed event insert rolls back the status update.
The same structure scales to more tables, but each additional table needs its
own guard and focused failure test. The next step is to keep the route adapter
thin, map the typed error family once at that edge, and expose the successful
operation through the shared client.

## Related reference

- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
- [Row-safe custom endpoints and reports](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
