---
title: "Errors, uploads, and endpoint patterns"
description:
  "Model expected failures and non-basic endpoint bodies without weakening the
  contract boundary."
---

An endpoint contract can describe expected failures, multipart input, and text
output. A raw `Response` is the boundary's explicit escape hatch.

## Map expected failures once

Use status codes to describe the failure at the HTTP boundary:

- `404` means the row is absent or invisible to this request.
- `409` means the request is valid but conflicts with current resource state.
- `422` means the request parsed but the workflow cannot accept a value the
  server derived or validated.
- `502` means an upstream system failed or returned unusable data.

A domain module raises one typed expected-error family. In the task-completion
slice, that family already carries the declared status and strict feature
payload. The adapter catches it once:

```ts
try {
  const auth = c.get("auth");

  return {
    status: 200,
    body: completeTask({ db: c.get("db"), auth }, request.params.id),
  };
} catch (error) {
  return taskCompletionErrorResponse(error);
}
```

`taskCompletionErrorResponse()` accepts only `TaskCompletionError`, covers the
family's declared `404` and `409` variants, and rethrows everything else.
Unexpected database, programming, and infrastructure failures therefore stay on
the application's central error path.

Declare each feature-owned status in the shared contract. Request parsing owns
the declared generic `400`; shared authentication middleware owns `401` and
`403` outside the feature response map. On the frontend, `ApiError.body` remains
`unknown`; parse the exported strict feature schema before using a code for
recovery.

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
    const taskRows = scopedRows(c.get("db"), auth, tasks);
    await taskRows.get(request.params.id);

    const file = files.file;
    if (!(file instanceof File)) {
      return {
        status: 400,
        body: { error: "Expected one file", code: "FILE_REQUIRED" },
      };
    }

    if (file.size > 5_000_000 || file.type !== "text/plain") {
      return {
        status: 400,
        body: { error: "Unsupported file", code: "FILE_REJECTED" },
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

The scoped read proves that the path ID names a visible task before the route
echoes it. The file's declared size and type are checked before buffering.
Production also needs an upstream request-body limit, content inspection when
the format requires it, external byte storage where appropriate, and scoped
storage metadata.

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

## Declare non-JSON output

Use `c.otherResponse()` for the supported native text types: `text/csv` and
`text/plain`.

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

Return a raw `Response` only for streaming, a download filename, or custom
headers that the normal return cannot express. It bypasses both the handler's
declared response type and runtime response-shape enforcement. The contract may
still document the intended output, but tests must prove the raw response.

## Related reference

- [Contract helpers and wire types](/docs/reference/contracts/contract-helpers-and-wire-types/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
