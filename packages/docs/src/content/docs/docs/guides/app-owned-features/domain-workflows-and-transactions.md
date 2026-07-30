---
title: "Domain workflows and transactions"
description:
  "Keep business invariants testable and commit multi-table changes atomically."
---

A domain workflow gives one name to a state transition. It reads current state,
enforces invariants, and commits every required write or none of them. HTTP is
one caller of that transition. In this project convention, expected workflow
errors carry their declared HTTP status and payload so every route maps the
family the same way.

## Keep the HTTP adapter outside the workflow

The route resolves auth and passes a small context to the domain module. The
module does not receive a Hono `Context`, parse JSON, or mount a URL. This keeps
the transaction callable from a route, job, or test without reconstructing a
request. The HTTP-aware error family is a deliberate application convention, not
a Sapporta framework requirement.

Create `packages/api/modules/tasks/complete-task.ts`:

```ts
import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { SapportaAuthContext } from "@sapporta/server";
import { Temporal } from "@sapporta/shared/temporal";
import type { TaskCompletionErrorBody } from "task-app-shared";
import { taskEvents, taskEventsTable } from "../../schema/task-events.js";
import { tasks, tasksTable } from "../../schema/tasks.js";

type TaskWorkflowContext = {
  db: BetterSQLite3Database;
  auth: SapportaAuthContext;
  now?: () => Temporal.Instant;
};

export abstract class TaskCompletionError extends Error {
  abstract readonly status: 404 | 409;
  abstract readonly payload: TaskCompletionErrorBody;
}

export class TaskNotFoundError extends TaskCompletionError {
  readonly status = 404 as const;
  readonly payload = {
    error: "Task not found",
    code: "TASK_NOT_FOUND",
  } as const satisfies TaskCompletionErrorBody;

  constructor() {
    super("Task not found");
    this.name = "TaskNotFoundError";
  }
}

export class TaskAlreadyCompletedError extends TaskCompletionError {
  readonly status = 409 as const;
  readonly payload = {
    error: "Task is already completed",
    code: "TASK_ALREADY_COMPLETED",
  } as const satisfies TaskCompletionErrorBody;

  constructor() {
    super("Task is already completed");
    this.name = "TaskAlreadyCompletedError";
  }
}

type TaskCompletionErrorResponse =
  | { status: 404; body: TaskCompletionErrorBody }
  | { status: 409; body: TaskCompletionErrorBody };

export function taskCompletionErrorResponse(
  error: unknown,
): TaskCompletionErrorResponse {
  if (!(error instanceof TaskCompletionError)) throw error;

  switch (error.status) {
    case 404:
      return { status: 404, body: error.payload };
    case 409:
      return { status: 409, body: error.payload };
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

The prior scoped read also defines the documented repeat behavior. Once one
transaction commits, a later sequential call reads `completed` and returns the
typed `409`. The update does not carry an old-status predicate: without checking
the affected-row count, that predicate would not establish a conflict branch.

This example does not promise that simultaneous writers in different processes
or connections receive the same feature `409`. SQLite can serialize, wait, or
surface a busy failure according to the deployment connection model. If the
product needs a stable cross-process second-writer response, add a checked
conditional update or version column and prove that policy against the deployed
topology.

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

For an atomic parent plus line-item create, continue with
[Parent-detail transactions](/docs/guides/app-owned-features/parent-detail-transactions/).

## Prove atomic behavior

Write focused service tests against an isolated database. The essential cases
are:

- an open visible task becomes completed and receives one event;
- a later sequential call raises `TaskAlreadyCompletedError` and adds no event;
- an invisible task raises `TaskNotFoundError`;
- an injected event insert failure rolls back the task update;
- every expected error maps to its declared status and strict payload;
- an unexpected error escapes the family adapter; and
- a deployment-specific simultaneous-writer test records the actual outcome
  without treating cross-process `409` as a guarantee.

For a manual check, set `TASK_ID` to an open visible task, call the endpoint
once, and inspect both generated tables:

```bash
pnpm exec sapporta api post "/api/tasks/$TASK_ID/complete" --body '{}'
pnpm exec sapporta rows get tasks "$TASK_ID"
pnpm exec sapporta rows list task_events \
  --where "{\"task_id\":{\"eq\":$TASK_ID}}"
```

The task response should contain `"status": "completed"`, and the event list
should contain exactly one `"event_type": "completed"` row for that task.

Each additional table needs its own guard and failure test. The HTTP adapter
catches `TaskCompletionError` once and calls `taskCompletionErrorResponse()` for
the exhaustive family mapping. Every other error stays on the application's
central error path.

## Related reference

- [Table row-security guards](/docs/reference/server/row-scoped-data/table-row-security-guards/)
- [Row-safe custom endpoints and reports](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
- [Parent-detail transactions](/docs/guides/app-owned-features/parent-detail-transactions/)
