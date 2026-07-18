---
title: "Typed API clients"
description:
  "Call app-owned endpoints from the browser using the shared contract."
---

A typed API client turns the shared contract into browser methods. Each method
accepts the contract's inferred request and returns its successful response body
directly. Declared non-2xx responses become `ApiError` values with the HTTP
status and parsed body intact.

This page adds the task action client, calls it from React, and handles a
declared conflict without duplicating the endpoint shape. The same pattern
supports report runners, command buttons, import flows, and any custom screen
that calls an app-owned API.

```text
Create a frontend client from the shared complete-task contract with `getApiBase`. Call it from a task action, preserve declared `ApiError` bodies, refresh after success, and build the frontend.
```

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

`createApiClient()` unwraps successful 2xx responses. For any non-2xx response,
it throws `ApiError(status, body)`. Narrow the unknown body before displaying
its fields:

```ts
import { ApiError } from "@sapporta/shared/client";

type ErrorBody = { error: string; code: string };

function isErrorBody(value: unknown): value is ErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string" &&
    "code" in value &&
    typeof value.code === "string"
  );
}

export async function completeTaskFromScreen(taskId: number) {
  try {
    return await taskActionsApi.completeTask({
      params: { id: taskId },
      body: {},
    });
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 409) &&
      isErrorBody(error.body)
    ) {
      throw new Error(error.body.error);
    }
    throw error;
  }
}
```

For a real screen, retain the status or code as well as the message when those
values affect the next action. A `409` may prompt a refresh because another
caller already completed the task. A `404` may remove an item that is no longer
visible.

## Call the client from a React action

Keep pending and error state close to the button that owns the operation.
Refresh the server-backed data after success rather than patching several
related client collections independently.

```tsx
const [pendingTaskId, setPendingTaskId] = useState<number | null>(null);
const [actionError, setActionError] = useState<string | null>(null);

async function handleComplete(taskId: number) {
  setPendingTaskId(taskId);
  setActionError(null);

  try {
    await taskActionsApi.completeTask({
      params: { id: taskId },
      body: {},
    });
    await refreshProgress();
  } catch (error) {
    if (error instanceof ApiError && isErrorBody(error.body)) {
      setActionError(error.body.error);
      return;
    }
    setActionError("The task could not be completed.");
  } finally {
    setPendingTaskId(null);
  }
}
```

The endpoint updates both task status and history, so one refetch gives the
screen the committed server result. Disable only the active task action with
`pendingTaskId === task.id`; the rest of the page can remain readable.

## Observe the inferred request

Start the app, complete an open task from the screen, and inspect the browser
Network panel. The request should be:

```text
POST /api/tasks/1/complete
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

<!--
Screenshot brief
Suggested asset: typed-client-network-call.png
Setup: Start `pnpm dev`, sign in as a workspace owner, open the task progress screen, open browser developer tools to Network, and complete one open task.
Frame: Select the POST request and show its request URL, 200 status, `{}` payload, and JSON response. Keep the application row visible beside or behind developer tools if the viewport allows it.
Visible proof: The typed method reaches `/api/tasks/{id}/complete` and receives the contract's task ID, event ID, and completed status.
Alt text: Browser Network panel showing a successful typed complete-task API request and response.
-->

For production, `VITE_API_URL` is public build configuration. It may contain the
deployed API origin, but never a token or secret. Cookie-authenticated
cross-origin deployments also need the matching server CORS configuration and
client credentials policy.

The browser now derives its request and success type from the same contract used
by the server and OpenAPI. Expected failures retain their status and body, and
the screen refreshes from committed server state after the command. The client
does not make an endpoint authorization-safe; the route still owns its ability
check and row-scoped workflow. Next, place this action in a protected route with
explicit loading, empty, ready, pending, and error states.

## Related reference

- [Typed client creation](/docs/reference/contracts/typed-client-creation/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
