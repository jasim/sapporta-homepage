---
title: "Multipart file uploads"
description:
  "Declare multipart input, receive validated files separately from text fields,
  and preserve row scope and storage limits."
---

Set the contract `contentType` and include `File` in the body schema. The
adapter validates the complete multipart body, then exposes uploaded values
through the handler's `files` argument. Text fields remain on `request.body`.

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

The scoped read proves the path ID names a visible task before the route echoes
it. Check declared size and type before buffering. Production also needs an
upstream body limit, content inspection where required, external byte storage
where appropriate, and scoped storage metadata.

Exercise the mounted route. Take `SAPPORTA_API_PORT` from this project's `.env.development`; `pnpm dev`
prints it as the API URL when it starts.

```bash
curl -i -X POST "http://localhost:$SAPPORTA_API_PORT/api/tasks/1/attachment-inspection" \
  -H "Authorization: Bearer $SAPPORTA_API_TOKEN" \
  -F 'label=Completion evidence' \
  -F 'file=@./fixtures/evidence.txt;type=text/plain'
```

Do not set `Content-Type` manually; the browser or `curl` supplies the multipart
boundary.

## Related documentation

- [Shared contracts and request validation](/docs/guides/application-code/shared-contracts-and-request-validation/)
- [Scoped table reads and writes](/docs/guides/security/scoped-table-reads-and-writes/)
- [Contract helpers and wire types](/docs/reference/contracts/contract-helpers-and-wire-types/)
