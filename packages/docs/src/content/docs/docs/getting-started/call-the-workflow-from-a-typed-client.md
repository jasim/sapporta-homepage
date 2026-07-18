---
title: "Call the workflow from a typed client"
description:
  "Create a frontend client from the complete-task contract and preserve
  declared success and error shapes."
---

The complete-task endpoint now protects the state transition and publishes its
wire contract. This page turns that same contract into a browser client. You
will call the action without repeating its method, path, parameters, response,
or error shapes, and you will keep declared failures intact for the interface to
explain. The client will become the command boundary for the project progress
screen on the next page.

```text
Create a browser client from the shared complete-task contract. Call it from a task action, retain the endpoint's typed error body, and refresh the screen from committed server state after success.
```

## Derive one browser method from the contract

Keep app-owned clients in `packages/frontend/src/api.ts`. This module imports
only browser-safe shared code and platform URL configuration:

```ts
import { createApiClient } from "@sapporta/shared/client";
import { getApiBase } from "@sapporta/frontend/platform";
import { completeTaskContract } from "task-app-shared";

export const taskActionsApi = createApiClient(completeTaskContract, {
  baseUrl: getApiBase,
});
```

Pass `getApiBase` as the resolver function. `createApiClient()` calls it before
each request, so the same client works with Vite's same-origin development proxy
and a deployed API origin. Evaluating `getApiBase()` at module load would remove
that late-bound behavior.

The contract key becomes the inferred method name:

```ts
const result = await taskActionsApi.completeTask({
  params: { id: taskId },
  body: {},
});

console.log(result.task_id, result.event_id, result.status);
```

The call contains no URL string. `getApiBase()` supplies `/api` in local
development, and the contract supplies `/tasks/:id/complete`, producing the
mounted request URL `/api/tasks/:id/complete`.

## Preserve declared failures for the screen

The client returns the successful 2xx body directly. A non-2xx response throws
`ApiError` with the HTTP status and parsed body retained. Narrow the body before
reading it, then store the status, code, and message when they affect the next
UI action. Continue in `packages/frontend/src/api.ts`:

```ts
import { ApiError } from "@sapporta/shared/client";

type TaskActionErrorBody = {
  error: string;
  code: "TASK_NOT_FOUND" | "TASK_ALREADY_COMPLETED";
};

export type TaskActionFailure = TaskActionErrorBody & {
  status: 404 | 409;
};

function isTaskActionErrorBody(value: unknown): value is TaskActionErrorBody {
  if (typeof value !== "object" || value === null) return false;

  const body = value as Record<string, unknown>;
  return (
    typeof body.error === "string" &&
    (body.code === "TASK_NOT_FOUND" || body.code === "TASK_ALREADY_COMPLETED")
  );
}

export function taskActionFailure(error: unknown): TaskActionFailure | null {
  if (
    error instanceof ApiError &&
    (error.status === 404 || error.status === 409) &&
    isTaskActionErrorBody(error.body)
  ) {
    return { status: error.status, ...error.body };
  }

  return null;
}
```

Do not replace the declared body with a new generic API envelope. A `409` tells
the screen that another caller may already have completed the task, so a refresh
is useful. A `404` covers both missing and invisible rows; the screen can remove
the stale item without learning which case occurred.

## Connect the method to a React action

Keep pending and failure state close to the control that owns the command. The
endpoint changes both the task and its history, so refetch server-backed data
after success rather than patching several client collections independently:

```tsx
const [pendingTaskId, setPendingTaskId] = useState<number | null>(null);
const [actionFailure, setActionFailure] = useState<TaskActionFailure | null>(
  null,
);

async function handleComplete(taskId: number) {
  setPendingTaskId(taskId);
  setActionFailure(null);

  try {
    await taskActionsApi.completeTask({
      params: { id: taskId },
      body: {},
    });
    await refreshProgress();
  } catch (error) {
    const failure = taskActionFailure(error);
    if (failure) {
      setActionFailure(failure);
      if (failure.status === 404 || failure.status === 409) {
        await refreshProgress();
      }
      return;
    }
    throw error;
  } finally {
    setPendingTaskId(null);
  }
}
```

Render `actionFailure.error` in an alert and disable only the active task's
button with `pendingTaskId === task.id`. The surrounding progress data can stay
readable during the request. Unexpected errors still reach the application's
normal error handling instead of being mislabeled as a domain conflict.

## Inspect the request the browser actually sends

Endpoint discovery remains useful before debugging client code. With the app
running, confirm the operation and its declared responses:

```bash
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
```

Then open the browser Network panel and complete an open task. The client sends:

```http
POST /api/tasks/1/complete HTTP/1.1
Content-Type: application/json

{}
```

The parsed 200 body returned to the caller is:

```json
{
  "task_id": 1,
  "event_id": 4,
  "status": "completed"
}
```

A second request for the same task produces HTTP 409 and preserves this body in
`ApiError.body`:

```json
{
  "error": "Task is already completed",
  "code": "TASK_ALREADY_COMPLETED"
}
```

<!--
Screenshot brief
Suggested asset: typed-complete-task-network-success.png
Setup: Start `pnpm dev`, sign in as a workspace owner, open browser developer tools to Network, and invoke the typed complete-task action for one open task.
Frame: Select the POST request and show the request URL, 200 status, `{}` request payload, and complete JSON response. Keep the invoking screen visible if the viewport allows it.
Visible proof: The inferred client reaches `/api/tasks/{id}/complete` and receives the declared task ID, event ID, and completed status.
Alt text: Browser Network panel showing a successful typed complete-task request and response.
-->

<!--
Screenshot brief
Suggested asset: typed-complete-task-conflict.png
Setup: Invoke the typed action for an already-completed task and let the screen render the preserved `ApiError` body.
Frame: Show the HTTP 409 request in Network beside the visible `Task is already completed` alert. Keep the task's completed state visible.
Visible proof: The client retains the declared conflict status and message instead of replacing them with a generic fetch failure.
Alt text: Completed task with a visible typed conflict message and its HTTP 409 Network request.
-->

The browser now derives its completion method from the same contract used for
request validation, handler types, endpoint discovery, and OpenAPI. The typed
client improves consistency but does not add authorization; the route still owns
its feature-ability check and row-scoped transaction. Next,
[build the project progress dashboard](/docs/getting-started/build-a-project-progress-dashboard/)
around this action. The
[typed client guide](/docs/guides/app-owned-features/typed-api-clients/) and
[serialization and API error reference](/docs/reference/contracts/serialization-and-api-errors/)
cover additional client and error shapes.
