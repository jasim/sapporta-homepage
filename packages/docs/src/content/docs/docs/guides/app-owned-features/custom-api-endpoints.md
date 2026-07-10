---
title: "Custom API endpoints"
description: "Register a protected domain endpoint and expose it through OpenAPI."
---

Register a protected domain endpoint and expose it through OpenAPI.

App-owned endpoints use a shared ts-rest contract, a `TsRestApi` route adapter, and explicit mounting from `packages/api/app.ts`.

For the programmer, the project adds an endpoint when generated CRUD cannot express a domain transaction, custom response, upload, or external effect.
For the application user, users receive one coherent action instead of coordinating several row operations.

## System boundary

- Contract paths omit the `/api` mount prefix.
- Handlers return declared `{ status, body }` responses.
- Route files are inert until `loadApp()` mounts them.
- Public API routes are explicit exceptions.

## Task-app example

The shared path `/tasks/:id/complete` is mounted as `POST /api/tasks/:id/complete`. The route checks `task_completion` and delegates to a domain workflow.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [TsRestApi and route registration](/docs/reference/server/ts-rest-api-and-route-registration/)
- [OpenAPI](/docs/reference/http/openapi/)
