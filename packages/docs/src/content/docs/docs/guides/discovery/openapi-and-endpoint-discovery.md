---
title: "OpenAPI and endpoint discovery"
description: "Inspect the live generated and app-owned API contract."
---

The running Sapporta API publishes an OpenAPI 3.1 document for its generated and
app-owned routes. The CLI renders its paths, parameters, request bodies, and
responses. Authentication requirements are not currently part of the CLI's
endpoint detail.

## Discover the deployed contract

`/api/openapi.json` is protected in an authenticated application. The CLI uses
the same session or bearer authority as the data routes and turns the document
into a compact route inventory.

```bash
pnpm dev
pnpm exec sapporta endpoints list
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
```

`endpoints show` should describe a path parameter named `id`, the request body,
and every response declared by the shared ts-rest contract. The selector uses
the final mounted URL. The contract source uses `/tasks/:id/complete` because
`packages/api/app.ts` mounts the route below `/api`.

```json
{
  "method": "POST",
  "path": "/api/tasks/{id}/complete",
  "responses": [200, 400, 404, 409]
}
```

The exact printed layout can change with CLI output mode. The method, mounted
path, parameters, body, and declared statuses are the stable facts to inspect.

## Verify documentation and runtime separately

`TsRestApi` has two independent composition calls:

- `app.route("/", subApi)` mounts the Hono handlers.
- `app.extend(subApi)` copies the sub-app's current document emitters.

Both calls happen after the sub-app registers its operations. Discovery proves
that `extend()` published the contract. An API call proves that `route()`
mounted the handler.

```bash
pnpm build
pnpm dev
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
pnpm exec sapporta api post /api/tasks/1/complete --body '{}'
```

Run the last two commands in another terminal after the rebuilt server is
running. An OpenAPI entry can otherwise describe a route that returns 404, and
a working Hono route can be absent from OpenAPI.

If discovery returns `unauthenticated`, fix the caller authority before
debugging composition. If a new route is absent while other protected routes
appear, check its export, `api.register(...)`, and `app.extend(...)`. If it is
documented but the call returns 404, check `app.route(...)`.

## Related reference

- [OpenAPI](/docs/reference/http/openapi/)
- [HTTP endpoint index](/docs/reference/indexes/http-endpoints/)
