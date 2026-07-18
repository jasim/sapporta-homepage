---
title: "Add a complete-task endpoint"
description:
  "Register a protected domain endpoint that completes one task and records one
  event transactionally."
---

The task app can now store immutable completion events, but editing a task and
creating its event through two CRUD requests would allow either write to succeed
alone. This page adds one protected complete-task operation. You will define its
shared contract, implement a row-scoped synchronous transaction, mount the
route, and exercise every declared response. The operation enables reliable
state transitions and audit history while generated task screens continue to
handle ordinary record editing.

```text
Add a protected complete-task action that updates the visible task and records its completion event in one transaction. Keep ordinary task edits on the generated CRUD API, expose the action through OpenAPI, and return useful typed conflicts.
```

## Give the transition one application boundary

Generated table APIs remain the right interface for changing one task title,
priority, due date, or status. Completion has a stronger invariant: the task
must become `completed` in the same commit that creates its history event. An
app-owned endpoint gives that transition one ability check, one transaction, and
one result shape.

The shared contract describes only the wire boundary. Create
`packages/shared/src/contracts/complete-task.ts`:

```ts
import { initContract } from "@sapporta/rest-core";
import { z } from "zod";

const c = initContract();

const taskCompletionErrorSchema = z.object({
  error: z.string(),
  code: z.enum(["TASK_NOT_FOUND", "TASK_ALREADY_COMPLETED"]),
});

export const completeTaskContract = c.router({
  completeTask: c.mutation({
    method: "POST",
    path: "/tasks/:id/complete",
    summary: "Complete a task and record its completion event",
    pathParams: z.object({ id: z.coerce.number().int().positive() }),
    body: z.object({}),
    responses: {
      200: z.object({
        task_id: z.number().int(),
        event_id: z.number().int(),
        status: z.literal("completed"),
      }),
      404: taskCompletionErrorSchema,
      409: taskCompletionErrorSchema,
    },
  }),
});
```

Re-export it from `packages/shared/src/contracts/index.ts`:

```ts
export { completeTaskContract } from "./complete-task.js";
```

The shared package stays browser-safe: it contains Zod schemas and wire types,
not Hono contexts, Drizzle queries, or database handles. The contract path also
omits `/api`. The application mount adds that prefix at runtime.

## Keep transaction rules in the domain module

Create `packages/api/modules/tasks/complete-task.ts`. The module accepts the
database and authenticated request context. It does not know how the route was
mounted or how the browser called it.

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
  abstract readonly code: "TASK_NOT_FOUND" | "TASK_ALREADY_COMPLETED";

  toResponseBody() {
    return { error: this.message, code: this.code };
  }
}

export class TaskNotFoundError extends TaskCompletionError {
  readonly status = 404 as const;
  readonly code = "TASK_NOT_FOUND" as const;

  constructor() {
    super("Task not found");
    this.name = "TaskNotFoundError";
  }
}

export class TaskAlreadyCompletedError extends TaskCompletionError {
  readonly status = 409 as const;
  readonly code = "TASK_ALREADY_COMPLETED" as const;

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

`ownedRows()` composes task identity with request data authority in SQL. An
absent task and a task outside the active workspace therefore reach the same 404
branch. This avoids leaking whether an invisible row exists.

The event receives `task_id`, `event_type`, and `occurred_at` through trusted
`serverValues`; the client supplies none of those fields. `insertValuesSync()`
validates the server-authored reference, rejects ownership tampering, and stamps
the request's workspace value. Each participating table has its own row-security
guard.

Sapporta's default SQLite transaction callback is synchronous. Do not mark the
callback `async`, use the asynchronous `insertValues()`, or await email,
storage, or network work inside it. External effects run after the commit or
through a durable outbox. The clock uses `Temporal.Instant`, which also lets a
test inject a fixed time without using `Date`.

## Adapt the workflow to HTTP once

Create `packages/api/app/complete-task.ts`. The route checks the feature ability
at the request edge, calls the domain function, and maps the workflow error
family once. Unexpected errors continue to the application's default error
handler.

```ts
import { forbidUnless, TsRestApi, type SapportaEnv } from "@sapporta/server";
import { completeTaskContract } from "task-app-shared";
import {
  completeTask,
  TaskCompletionError,
} from "../modules/tasks/complete-task.js";

const api = new TsRestApi<SapportaEnv>();

api.register(
  "completeTask",
  completeTaskContract.completeTask,
  ({ c, request }) => {
    try {
      const auth = c.get("auth");
      forbidUnless(c, auth.ability.can("run", "task_completion"));

      return {
        status: 200,
        body: completeTask({ db: c.get("db"), auth }, request.params.id),
      };
    } catch (error) {
      if (error instanceof TaskCompletionError) {
        return { status: error.status, body: error.toResponseBody() };
      }
      throw error;
    }
  },
);

export default api;
```

Authentication, the `task_completion` ability, and row visibility are three
separate boundaries. A signed-in member can be denied by the ability check even
when that member can edit tasks through generated CRUD. An authorized owner can
still complete only tasks visible through the request's row authority.

## Mount handlers and OpenAPI emitters

A route file under `packages/api/app/` is inert until `loadApp()` mounts it.
`app.route()` adds its Hono handlers to the runtime tree. `app.extend()` uses
the public `TsRestApi` composition API to add the sub-app's contract emitters to
the combined OpenAPI document.

Update `packages/api/app.ts`, preserving the generated sample routes and any
other app-owned mounts:

```ts
import type {
  ProjectDbConnection,
  SapportaEnv,
  TsRestApi,
} from "@sapporta/server";
import completeTaskApi from "./app/complete-task.js";
import helloApi from "./app/hello.js";
import publicApiSample from "./app/public-api-sample.js";
import type { SapportaMailer } from "./mailer.js";

export interface LoadAppOptions {
  conn: ProjectDbConnection;
  mailer: SapportaMailer;
}

function mountApi(app: TsRestApi<SapportaEnv>, api: TsRestApi<SapportaEnv>) {
  app.route("/", api);
  app.extend(api);
}

export function loadApp(app: TsRestApi<SapportaEnv>, _options: LoadAppOptions) {
  mountApi(app, helloApi);
  mountApi(app, publicApiSample);
  mountApi(app, completeTaskApi);
}
```

The `app` passed to `loadApp()` is already mounted below `/api`. The contract's
`/tasks/:id/complete` path therefore becomes `POST /api/tasks/:id/complete`.
Keep this protected route out of `publicApiRoutes`.

## Discover and call the mounted endpoint

Build and start the application before constructing a direct request:

```bash
pnpm build
pnpm dev
```

In another terminal, inspect the mounted operation and then call it with an
open, visible task:

```bash
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
pnpm exec sapporta api post /api/tasks/1/complete --body '{}'
```

The first successful call returns the contract's custom result:

```json
{
  "task_id": 1,
  "event_id": 4,
  "status": "completed"
}
```

Calling it again returns the declared conflict without inserting another event:

```json
{
  "error": "Task is already completed",
  "code": "TASK_ALREADY_COMPLETED"
}
```

Inspect both generated tables after the success:

```bash
pnpm exec sapporta rows get tasks 1
pnpm exec sapporta rows list task_events --where '{"task_id":{"eq":1}}'
```

The task has `status: "completed"` and exactly one related completion event. An
event-insert failure must leave the task open; add a focused workflow test that
injects that failure and proves the transaction rolls back.

<!--
Screenshot brief
Suggested asset: complete-task-endpoint-cli.png
Setup: Seed one open task, start `pnpm dev`, configure the project-local CLI with a workspace-owner token, run `endpoints show`, and call the task once.
Frame: Capture the endpoint method and mounted `/api/tasks/{id}/complete` path followed by the successful JSON response. Mask tokens and omit unrelated terminal history.
Visible proof: The sub-app is mounted, appears in endpoint discovery, accepts POST, and returns both task and event identifiers.
Alt text: Sapporta CLI showing the mounted complete-task endpoint and its successful response.
-->

<!--
Screenshot brief
Suggested asset: complete-task-generated-history.png
Setup: After the successful endpoint call, open the completed task in the generated Tasks surface and expand its Task history relationship.
Frame: Keep the task identity and completed status visible with the single `completed` history event and its occurrence time.
Visible proof: One API action changed the task state and created exactly one immutable child event.
Alt text: Generated task record showing completed status and one completion history event.
-->

Task completion now has one protected, discoverable transaction while ordinary
task changes remain available through generated CRUD. The important constraints
are server-authored scope and event fields, row predicates inside the
transaction, a synchronous SQLite callback, and one route-edge mapping for typed
workflow errors. Next,
[call the workflow from a typed client](/docs/getting-started/call-the-workflow-from-a-typed-client/),
then use the
[domain workflow guide](/docs/guides/app-owned-features/domain-workflows-and-transactions/)
and
[TsRestApi reference](/docs/reference/server/ts-rest-api-and-route-registration/)
for larger transitions.
