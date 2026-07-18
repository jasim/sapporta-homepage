---
title: "Shared contracts and request validation"
description:
  "Define browser-safe wire shapes once for validation, OpenAPI, handlers, and
  clients."
---

A shared contract describes one HTTP operation as data: its method, path,
inputs, responses, and documentation metadata. Sapporta uses that same value to
validate requests, type the route handler, generate OpenAPI, and create the
browser client.

This page shows where contracts belong, how request validation behaves, and how
to model success and expected failures. These concepts support command
endpoints, report parameters, imports, webhooks, and any other app-owned API
that needs a stable wire format.

```text
Add a shared contract for completing a task. Coerce the numeric path ID, accept an empty body, declare 200, 404, and 409 responses, export it from the shared package, and build the workspace.
```

## Keep the wire boundary in the shared package

Create one contract file per feature under `packages/shared/src/contracts/`. The
shared package may contain Zod schemas, contracts, wire types, constants, and
pure serializers. It remains a leaf package: React components, Hono handlers,
Drizzle queries, database handles, and file I/O stay in their owning packages.

The task app uses a contract for an operation that changes a task and records a
history event together. Create `packages/shared/src/contracts/complete-task.ts`:

```ts
import { initContract } from "@sapporta/rest-core";
import { z } from "zod";

const c = initContract();

const errorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const completeTaskContract = c.router({
  completeTask: c.mutation({
    method: "POST",
    path: "/tasks/:id/complete",
    summary: "Complete a task and record the event",
    metadata: { tags: ["tasks"] },
    pathParams: z.object({
      id: z.coerce.number().int().positive(),
    }),
    body: z.object({}).strict(),
    responses: {
      200: z.object({
        task_id: z.number().int(),
        event_id: z.number().int(),
        status: z.literal("completed"),
      }),
      404: errorSchema,
      409: errorSchema,
    },
  }),
});
```

The path is `/tasks/:id/complete`, not `/api/tasks/:id/complete`. The API
application is already mounted under `/api`; repeating that prefix in the
contract would produce the wrong URL.

Re-export the contract from `packages/shared/src/contracts/index.ts`:

```ts
export { completeTaskContract } from "./complete-task.js";
```

`packages/shared/src/index.ts` already re-exports that barrel in a generated
project. Both the API package and frontend package can now import
`completeTaskContract` from `task-app-shared`.

## Let the adapter parse the request

`TsRestApi` parses `pathParams`, `query`, `headers`, and `body` with the
contract schemas before it invokes the handler. The numeric coercion above turns
the path segment `"12"` into `request.params.id === 12`. A non-numeric ID fails
at the boundary, so domain code does not need another parser.

Run the task app, then compare a valid and invalid request:

```bash
curl -i -X POST http://localhost:3000/api/tasks/12/complete \
  -H 'Content-Type: application/json' \
  -d '{}'

curl -i -X POST http://localhost:3000/api/tasks/not-a-number/complete \
  -H 'Content-Type: application/json' \
  -d '{}'
```

Before the route is implemented, the first request may return 404. After
registration, the invalid path is rejected before the handler runs:

```json
{
  "error": "Invalid request",
  "code": "BAD_REQUEST",
  "details": [
    {
      "path": ["id"],
      "message": "Invalid input: expected number, received NaN"
    }
  ]
}
```

<!--
Screenshot brief
Suggested asset: shared-contract-openapi.png
Setup: Implement and mount the complete-task endpoint, start `pnpm dev`, sign in, and open the OpenAPI viewer or `/api/openapi.json`. Search for `completeTask`.
Frame: Show the POST `/api/tasks/{id}/complete` operation expanded, including the numeric `id` parameter and the 200, 404, and 409 responses. Exclude unrelated operations.
Visible proof: The mounted URL contains `/api`, the contract path parameter is numeric, and every expected response is documented.
Alt text: OpenAPI entry for the complete-task endpoint with its path parameter and declared responses.
-->

Request schemas define the runtime input boundary. Response schemas provide
TypeScript and OpenAPI shapes; the route handler remains responsible for
returning a body that matches the declared response. Declare every expected
non-2xx status so the route and client can preserve its stable payload.

## Check the shared boundary

Build all three packages and inspect the registered operation after its route is
mounted:

```bash
pnpm build
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
```

A successful endpoint inspection should report the method, mounted path, request
body, and declared responses. If it reports no route, check the route mount
before changing the contract.

The task app now has one browser-safe definition for validation, handler
inference, OpenAPI, and client inference. The important separation is that the
contract owns wire data while the API owns authorization and persistence. From
here, register the contract in a custom endpoint, then import the same value
into a typed browser client. Query schemas, multipart bodies, and non-JSON
responses use the same boundary and add only the fields their transport
requires.

## Related reference

- [Contract helpers and wire types](/docs/reference/contracts/contract-helpers-and-wire-types/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
