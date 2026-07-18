---
title: "Custom API endpoints"
description:
  "Register a protected domain endpoint and expose it through OpenAPI."
---

Generated table routes cover ordinary row operations. A custom endpoint owns an
application action whose authorization, transaction, response, or external
effect does not fit one CRUD call.

This page connects a shared contract to a protected `TsRestApi` handler, mounts
the route under `/api`, and makes the operation discoverable. The pattern
supports approvals, state transitions, batch commands, exports, uploads, and
integrations while keeping application rules in normal TypeScript.

```text
Register the shared complete-task contract as a protected endpoint. Check the task-completion ability, delegate to the domain workflow, mount the sub-app under `/api`, include it in OpenAPI, and prove the route with the local CLI.
```

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

      const result = completeTask({ db: c.get("db"), auth }, request.params.id);

      return { status: 200, body: result };
    } catch (error) {
      if (error instanceof TaskCompletionError) {
        return {
          status: error.status,
          body: error.toResponseBody(),
        };
      }
      throw error;
    }
  },
);

export default api;
```

The operation ID passed to `register()` becomes the OpenAPI operation name. The
contract path remains `/tasks/:id/complete`; the runtime URL gains `/api` when
the application mounts its API tree.

## Mount runtime routes and documentation

A file under `packages/api/app/` is inert until `loadApp()` imports and mounts
it. `app.route()` mounts the Hono handlers. `app.extend()` carries the sub-app
contracts into the combined OpenAPI document.

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
pnpm exec sapporta api post /api/tasks/1/complete --body '{}'
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

Calling the same task again returns the declared conflict:

```json
{
  "error": "Task is already completed",
  "code": "TASK_ALREADY_COMPLETED"
}
```

<!--
Screenshot brief
Suggested asset: complete-task-endpoint-cli.png
Setup: Seed an open task, run `pnpm dev`, configure the CLI with a workspace-owner token, and run the `endpoints show` command followed by the successful `api post` command.
Frame: Capture one terminal with the endpoint method/path and the successful JSON response. Keep the commands and the `/api/tasks/{id}/complete` path visible.
Visible proof: The route is mounted under `/api`, is discoverable, accepts POST, and returns task and event identifiers from one action.
Alt text: Sapporta CLI showing the registered complete-task endpoint and a successful completion response.
-->

Use an authenticated member without `run` access for a boundary check, and use a
task from another workspace for a row-visibility check. The first should fail at
the ability edge. The second should be indistinguishable from a missing task
because the workflow scopes its database read.

The endpoint now has four explicit layers: a shared wire contract, a route-edge
permission check, a domain workflow, and an application mount. That separation
keeps generated CRUD available for ordinary task editing while giving completion
one coherent server action. The next useful steps are to test each declared
response, call the operation through the typed client, and add a custom screen
only when the workflow needs more UI than the generated task surface provides.

## Related reference

- [TsRestApi and route registration](/docs/reference/server/ts-rest-api-and-route-registration/)
- [OpenAPI](/docs/reference/http/openapi/)
