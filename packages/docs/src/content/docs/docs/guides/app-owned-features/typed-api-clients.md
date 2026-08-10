---
title: "Typed API clients"
description:
  "Call app-owned endpoints from the browser using the shared contract."
---

A typed client turns a shared contract into browser methods. Each method accepts
the inferred request and validates the response by default. A valid success
returns its body. A non-2xx response that reaches the unwrap step throws
`ApiError`; transport and response-validation failures stay on their original
error paths.

## Create one application client module

Keep app-owned clients in `packages/frontend/src/api.ts`. The module imports
browser-safe contracts and contains no handler or database code.

```ts
import { createApiClient } from "@sapporta/shared/client";
import { getApiBase } from "@sapporta/frontend/platform";
import { completeTaskContract } from "task-app-shared";

export const taskActionsApi = createApiClient(completeTaskContract, {
  baseUrl: getApiBase,
});
```

Pass `getApiBase` as a function. The client calls it immediately before each
request, which supports the Vite development proxy and a deployed split-origin
API without rebuilding the client object.

The contract key becomes the method name. A completion call is fully inferred:

```ts
const result = await taskActionsApi.completeTask({
  params: { id: taskId },
  body: {},
});

console.log(result.task_id, result.event_id, result.status);
```

There is no `/api` string in this call. `getApiBase()` supplies the API base and
the contract supplies `/tasks/:id/complete`, producing the mounted request URL
`/api/tasks/:id/complete` in same-origin development.

## Preserve expected failure details

`ApiError.body` is `unknown`. A proxy, stale server, or unexpected failure may
not return the declared body, so recovery begins by parsing the exported strict
feature schema rather than copying its fields into frontend code:

```ts
import { ApiError } from "@sapporta/shared/client";
import {
  taskCompletionErrorSchema,
  type TaskCompletionErrorBody,
} from "task-app-shared";

export type TaskActionFailure =
  | {
      status: 404;
      body: TaskCompletionErrorBody & { code: "TASK_NOT_FOUND" };
    }
  | {
      status: 409;
      body: TaskCompletionErrorBody & {
        code: "TASK_ALREADY_COMPLETED";
      };
    };

export function taskActionFailure(
  error: unknown,
): TaskActionFailure | undefined {
  if (!(error instanceof ApiError)) return undefined;

  const parsed = taskCompletionErrorSchema.safeParse(error.body);
  if (!parsed.success) return undefined;

  if (error.status === 404 && parsed.data.code === "TASK_NOT_FOUND") {
    return { status: 404, body: parsed.data };
  }

  if (error.status === 409 && parsed.data.code === "TASK_ALREADY_COMPLETED") {
    return { status: 409, body: parsed.data };
  }

  return undefined;
}
```

The status/code pair matters. A schema-valid `404/TASK_NOT_FOUND` means the
screen's item is stale or no longer visible. A schema-valid
`409/TASK_ALREADY_COMPLETED` means a prior transaction already committed. Both
branches can refetch authoritative state without revealing whether a `404` row
exists outside the request's authority.

Returning `undefined` is not permission to invent a local generic conflict.
Malformed bodies, mismatched status/code pairs, shared `401`/`403` responses,
transport failures, response-validation failures, and unexpected errors stay on
the application's central error path. `apiProblemFromBody()` remains useful for
display-only error text; its optional generic code is not an exhaustive recovery
signal.

## Refresh the caches that own affected reads

Keep pending and error state close to the button that owns the operation.
Disable only the active command so the surrounding page stays readable.

The completion workflow updates `tasks` and inserts `task_events`. After
success, invalidate both generated-table prefixes rather than patching several
collections independently:

```ts
import { tableQueryKeys } from "@sapporta/frontend/table/query";

await Promise.all([
  queryClient.invalidateQueries({
    queryKey: tableQueryKeys.table("tasks"),
  }),
  queryClient.invalidateQueries({
    queryKey: tableQueryKeys.table("task_events"),
  }),
]);
```

Apply the same invalidation after either declared stale-state branch above. A
valid `400` can be displayed, but it does not imply that committed table state
changed and does not trigger this recovery. Let every unrecognized failure reach
the screen's central error boundary.

TGrid sessions use a separate cache. Call `reloadTGridRows("tasks")` or
`reloadTGridRows("task_events")` only when the owning screen coordinates an
affected mounted TGrid. See
[Table query cache keys and ownership](/docs/reference/frontend/table-queries/cache-keys-and-ownership/) for the
cache-key hierarchy. The
[custom workflow screens](/docs/guides/app-owned-features/custom-workflow-screens/)
guide owns the full mutation pattern.

## Observe the inferred request

Start the app, complete an open task from the screen, and inspect the browser
Network panel. The request should be:

```text
POST /api/tasks/{id}/complete
Content-Type: application/json

{}
```

The response body is the declared success value:

```json
{
  "task_id": 1,
  "event_id": 4,
  "status": "completed"
}
```

For production, `VITE_API_URL` is a public origin, without `/api`. It never
contains a token or secret. Cookie-authenticated cross-origin deployments also
need matching server CORS configuration and a client `credentials` policy.

The client preserves wire meaning. The server route still owns abilities, row
scope, and the transaction.

## Related reference

- [Typed client creation](/docs/reference/contracts/typed-client-creation/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
