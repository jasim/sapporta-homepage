---
title: "OpenAPI and endpoint discovery"
description: "Inspect the live generated and app-owned API contract."
---

The running Sapporta API publishes an OpenAPI 3.1 document for its generated and
app-owned routes. This guide shows how to use that live contract to inspect
paths, parameters, request bodies, responses, and authentication requirements.

You will learn to distinguish a contract that exists in source from a route that
is actually mounted. This is useful when validating a new endpoint, building an
integration, or giving an agent the exact wire shape to call.

```text
Inspect the running Sapporta app and show me the exact contract for <operation>.
Use endpoint discovery first, then give me one valid request and the declared
success and error responses.
```

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
  "responses": [200, 404, 409]
}
```

The exact printed layout can change with CLI output mode. The method, mounted
path, parameters, body, and declared statuses are the stable facts to inspect.

## Prove that registration and mounting are separate

A `TsRestApi` route contributes runtime handling and OpenAPI metadata only after
the application mounts its sub-app. Inspect the normal result, temporarily
remove the `app.route("/", completeTaskApi)` mount in a disposable branch, and
run discovery again. Restore the mount after the comparison.

```bash
pnpm build
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
```

<!--
Screenshot brief
Suggested asset: /assets/guides/discovery/openapi-endpoint-discovery.png
Setup: Run the task app with the complete-task route mounted and authenticate the CLI with a workspace token.
Frame: Capture the terminal output of endpoints show for POST /api/tasks/{id}/complete from the command through the response schemas.
Visible proof: The mounted /api path, id parameter, request body, and 200, 404, and 409 responses are all readable.
Alt text: Sapporta CLI showing the live complete-task endpoint contract.
-->

If discovery returns `unauthenticated`, fix the caller authority before
debugging route registration. If a new route is absent while other protected
routes appear, check its export, `api.register(...)`, and explicit mount in
`loadApp()`.

Endpoint discovery makes the running server the source of truth for integrations
and validation. The non-obvious boundary is the mount: a correct contract file
is not a deployed route. Continue with
[custom API endpoints](/docs/guides/app-owned-features/custom-api-endpoints/) to
create one or
[typed API clients](/docs/guides/app-owned-features/typed-api-clients/) to call
the same contract from React.

## Related reference

- [OpenAPI](/docs/reference/http/openapi/)
- [HTTP endpoint index](/docs/reference/indexes/http-endpoints/)
