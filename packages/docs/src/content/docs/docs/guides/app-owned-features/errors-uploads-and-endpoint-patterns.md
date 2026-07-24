---
title: "Errors, uploads, and endpoint patterns"
description:
  "Model expected failures and non-basic endpoint bodies without weakening the
  contract boundary."
---

An endpoint contract can describe more than a successful JSON object. Expected
workflow failures, multipart files, CSV or text responses, and deliberate raw
responses all remain explicit parts of the application boundary.

This page shows how to preserve typed failures from a domain module to the
browser, how Sapporta separates multipart files from parsed fields, and when a
raw `Response` is appropriate. These patterns support imports, attachments,
downloads, upstream integrations, and workflow actions with actionable failure
states.

```text
Tighten the task endpoints: model expected workflow failures with one typed error family, map it once at the route edge, add a small multipart upload example that reads files from `files`, and exercise every declared branch.
```

## Map expected failures once

Use status codes to describe the failure at the HTTP boundary:

- `404` means the row is absent or invisible to this request.
- `409` means the request is valid but conflicts with current resource state.
- `422` means the request parsed but the workflow cannot accept a value the
  server derived or validated.
- `502` means an upstream system failed or returned unusable data.

A one-off check made directly in a handler can return a declared
`{ status, body }`. When a service or store can raise the failure, define one
error base for that workflow family and raise concrete subclasses where the
failure first becomes known.

The task workflow uses this family:

```ts
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
```

Catch the family once around the route adapter. Rethrow every other error so the
central error handler logs it and produces the application's unexpected-error
response.

```ts
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
```

The shared contract must declare both `404` and `409` with the stable
`{ error, code }` schema. Do not create a project-wide domain `ApiError`; each
workflow family should own the failures its route understands.

On the frontend, preserve the declared body carried by `ApiError`:

```ts
import { ApiError } from "@sapporta/shared/client";

try {
  await taskActionsApi.completeTask({ params: { id: taskId }, body: {} });
} catch (error) {
  if (error instanceof ApiError && error.status === 409) {
    const body = error.body as { error: string; code: string };
    setActionError(body.error);
    return;
  }
  throw error;
}
```

<!--
Screenshot brief
Suggested asset: complete-task-conflict.png
Setup: Complete a task once, open the custom progress screen, and invoke Complete on the same task again. Keep the dev server running with normal error handling.
Frame: Show the task row and the inline or toast error produced from the declared 409 body. Do not include a browser stack trace or developer tools.
Visible proof: The UI retains the domain message `Task is already completed` and the task remains completed.
Alt text: Task progress screen showing the declared already-completed conflict message.
-->

## Receive multipart files through `files`

For a multipart route, set `contentType` and include `File` in the body schema.
The adapter validates the complete multipart body, then exposes uploaded file
values through the handler's `files` argument. Text fields remain on
`request.body`.

```ts
import { initContract } from "@sapporta/rest-core";
import { z } from "zod";

const c = initContract();

export const taskAttachmentContract = c.router({
  inspectTaskAttachment: c.mutation({
    method: "POST",
    path: "/tasks/:id/attachment-inspection",
    summary: "Inspect a task attachment upload",
    contentType: "multipart/form-data",
    pathParams: z.object({ id: z.coerce.number().int().positive() }),
    body: z.object({
      label: z.string().min(1),
      file: z.instanceof(File),
    }),
    responses: {
      200: z.object({
        task_id: z.number().int(),
        label: z.string(),
        filename: z.string(),
        content_type: z.string(),
        bytes: z.number().int().nonnegative(),
      }),
      400: z.object({ error: z.string(), code: z.string() }),
    },
  }),
});
```

The matching route reads `files.file`, not `request.body.file`:

```ts
import { scopedRows } from "@sapporta/server";
import { tasks } from "../schema/tasks.js";

api.register(
  "inspectTaskAttachment",
  taskAttachmentContract.inspectTaskAttachment,
  async ({ c, request, files }) => {
    const auth = c.get("auth");
    forbidUnless(c, auth.ability.can("update", "tasks"));
    const taskRows = scopedRows(c.get("db"), auth, tasks, {
      searchPlan: catalog.searchPlanFor(tasks.sqlName),
    });
    await taskRows.get(request.params.id);

    const file = files.file;
    if (!(file instanceof File)) {
      return {
        status: 400,
        body: { error: "Expected one file", code: "FILE_REQUIRED" },
      };
    }

    const bytes = await file.arrayBuffer();
    return {
      status: 200,
      body: {
        task_id: request.params.id,
        label: request.body.label,
        filename: file.name,
        content_type: file.type || "application/octet-stream",
        bytes: bytes.byteLength,
      },
    };
  },
);
```

This example inspects an upload and deliberately does not add attachment
persistence to the task tutorial. A production route should validate size and
type, store the bytes outside the database when appropriate, and write only
trusted storage metadata through a scoped workflow.

Create a small fixture and call the mounted route:

```bash
curl -i -X POST http://localhost:3000/api/tasks/1/attachment-inspection \
  -H "Authorization: Bearer $SAPPORTA_API_TOKEN" \
  -F 'label=Completion evidence' \
  -F 'file=@./fixtures/evidence.txt;type=text/plain'
```

Do not set the `Content-Type` header yourself. `curl` or the browser supplies
the multipart boundary. The response reports what the server received:

```json
{
  "task_id": 1,
  "label": "Completion evidence",
  "filename": "evidence.txt",
  "content_type": "text/plain",
  "bytes": 84
}
```

<!--
Screenshot brief
Suggested asset: multipart-upload-response.png
Setup: Create `fixtures/evidence.txt`, mount the inspection route, start the API, and run the multipart curl request with a valid token.
Frame: Capture the curl command and HTTP 200 response headers plus the complete JSON body. Mask the bearer token and omit unrelated terminal history.
Visible proof: The multipart label and file metadata arrive through one declared endpoint, including filename, content type, and byte count.
Alt text: Terminal response from a multipart task attachment inspection request.
-->

## Declare non-JSON output

Use `c.otherResponse()` when the endpoint returns a supported text content type:

```ts
responses: {
  200: c.otherResponse({ contentType: "text/csv", body: z.string() }),
}
```

The handler can still return the ordinary typed shape:

```ts
return {
  status: 200,
  body: "task_id,title,status\n1,Audit launch checklist,completed\n",
};
```

Return a raw `Response` only for a deliberate escape hatch such as streaming, a
download filename, or custom headers that the normal contract return cannot
express. The route should still declare its intended output for clients and
OpenAPI.

The endpoint boundary now distinguishes expected domain failures, unexpected
server failures, structured multipart input, and non-JSON output. The
non-obvious detail is that request schemas are parsed at runtime while response
schemas primarily drive types and documentation, so handlers must still return
the declared response shape. Next, add one focused test for success and every
expected failure, and make each calling screen handle `ApiError` without
replacing its body with a generic message.

## Related reference

- [Contract helpers and wire types](/docs/reference/contracts/contract-helpers-and-wire-types/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
