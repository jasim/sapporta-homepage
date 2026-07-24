---
title: "Shared contracts and request validation"
description:
  "Define browser-safe wire shapes once for validation, OpenAPI, handlers, and
  clients."
---

A shared contract describes one HTTP operation as data: method, path, input,
responses, and documentation. The server uses it to parse requests and type the
handler. OpenAPI and the browser client use the same value.

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
      400: errorSchema,
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


Request schemas define the runtime input boundary. Malformed JSON or a failed
path, query, header, or body parse returns an adapter-generated `400` before the
handler runs, so declare that response when it belongs in OpenAPI.

Response schemas provide server types and OpenAPI shapes; the server adapter
does not parse a handler's response body. The generated browser client validates
responses by default. A malformed server response can therefore fail at the
client boundary even though the handler returned it.

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

The contract owns wire data. The API owns authorization, row visibility,
persistence, and effects.

## Related reference

- [Contract helpers and wire types](/docs/reference/contracts/contract-helpers-and-wire-types/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
