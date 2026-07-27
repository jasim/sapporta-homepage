---
title: "Custom API endpoints"
description:
  "Register a protected domain endpoint and expose it through OpenAPI."
---

Generated table routes name CRUD operations. A custom endpoint names an
application operation: complete, approve, publish, import, or reconcile. Its
adapter joins a shared wire contract to authorization and a domain workflow.

## Build a thin route adapter

Create `packages/api/app/complete-task.ts`. The adapter reads request-scoped
dependencies from Hono, checks the feature ability, and translates expected
domain failures. Database rules remain in the workflow rather than accumulating
in the route file.

```ts
import { forbidUnless, TsRestApi, type SapportaEnv } from "@sapporta/server";
import { completeTaskContract } from "task-app-shared";
import {
  completeTask,
  taskCompletionErrorResponse,
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
      return taskCompletionErrorResponse(error);
    }
  },
);

export default api;
```

The operation ID passed to `register()` becomes the OpenAPI operation name. The
contract path remains `/tasks/:id/complete`; the runtime URL gains `/api` when
the application mounts its API tree.

This is the only catch for the expected workflow family.
`taskCompletionErrorResponse()` returns the declared `404` or `409` pair and
rethrows anything outside `TaskCompletionError`. The adapter-generated `400`
comes from request parsing before this handler runs. Shared infrastructure `401`
and `403` responses are documented outside the feature contract because
authentication or `forbidUnless()` can terminate the request before the
workflow.

The named `task_completion` ability is useful for roles that should receive only
this operation. A generated project owner already has `manage` on `all`, which
subsumes that named check; adding a duplicate owner grant is illustrative, not
cumulative configuration.

## Mount runtime routes and documentation

A file under `packages/api/app/` is inert until `loadApp()` imports it.
`app.route()` mounts Hono handlers. `app.extend()` copies the sub-app's current
contract emitters into the combined OpenAPI document. The calls are independent:
one can create a working but undocumented route, or a documented route that
returns 404.

Update `packages/api/app.ts`:

```ts
import type {
  ProjectDbConnection,
  SapportaEnv,
  TsRestApi,
} from "@sapporta/server";
import completeTaskApi from "./app/complete-task.js";
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
  mountApi(app, completeTaskApi);
}
```

Keep the generated sample mounts or other application routes alongside this one.
Register every child route before `loadApp()` mounts and extends that child, and
finish both operations before the application mounts OpenAPI. `extend()`
snapshots the child's current documentation emitters; routes added afterward
will be missing from that snapshot.

Add the endpoint to `publicApiRoutes` only when anonymous callers should be able
to reach it. A public entry bypasses only the anonymous gate; the handler must
still check an ability and apply row security.

## Exercise the mounted operation

Build first, then start the app and inspect the exact mounted route:

```bash
pnpm build
pnpm dev
```

In another terminal:

```bash
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
pnpm exec sapporta api post "/api/tasks/$TASK_ID/complete" --body '{}'
```

The generic CLI command receives the mounted path, including `/api`. A
successful response has the contract's wire shape:

```json
{
  "task_id": 1,
  "event_id": 4,
  "status": "completed"
}
```

Calling the same task again after the first transaction commits returns the
declared conflict:

```json
{
  "error": "Task is already completed",
  "code": "TASK_ALREADY_COMPLETED"
}
```

Use an authenticated member without `run` access for a boundary check, and use a
task from another workspace for a row-visibility check. The first should fail at
the ability edge. The second should be indistinguishable from a missing task
because the workflow scopes its database read.

That `409` is a sequential already-completed result. The workflow does not
promise the same feature response for simultaneous writers in different
processes or database connections.

The adapter translates requests into workflow input and semantic failures into
declared HTTP responses. The workflow owns the transaction.

## Related reference

- [TsRestApi and route registration](/docs/reference/server/ts-rest-api-and-route-registration/)
- [OpenAPI](/docs/reference/http/openapi/)
