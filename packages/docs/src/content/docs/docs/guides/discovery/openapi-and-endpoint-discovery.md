---
title: "OpenAPI and endpoint discovery"
description:
  "Inspect mounted methods, paths, inputs, and declared responses; use the
  security guides and negative tests for authorization."
---

The running Sapporta API publishes an OpenAPI 3.1 document for its documented
generated and application routes. Treat that protected live document as the
deployed contract inventory, then verify runtime behavior separately. Raw Hono
routes and contracts deliberately excluded from OpenAPI can still be mounted
without appearing here.

## Target the deployed application

`/api/openapi.json` is protected in an authenticated application. The CLI uses
the same bearer authority as other API-backed commands. Set the target and
credential outside visible command text when the defaults are not the intended
application:

```bash
export SAPPORTA_API_URL="https://app.example.com"
read -s SAPPORTA_API_TOKEN
export SAPPORTA_API_TOKEN

pnpm exec sapporta endpoints list
```

If this request fails, first separate target failures from shared authentication
failures. A protected OpenAPI response preserves stable server codes such as
`unauthenticated`, `token_expired`, or `forbidden`; message prose is not the
automation boundary.

## Inspect the mounted contract

List before selecting one endpoint. The built-in metadata route is a harmless
place to inspect both discovery and runtime behavior.

```bash
pnpm exec sapporta endpoints list
pnpm exec sapporta endpoints show "GET /api/meta/tables"
pnpm exec sapporta --output json \
  endpoints show "GET /api/meta/tables"
```

The selector uses the final mounted URL, including `/api`. `endpoints show`
renders the method, path, summary, description, parameters, request body, and
declared responses that are present for that operation. JSON output exposes the
same detail as structured data for an agent or script.

The CLI detail does **not** include application authorization metadata. A
feature contract can also omit shared infrastructure `401` and `403` responses
without making the route public, and the presence of either response does not
prove the route's complete authorization boundary. Combine discovery with the
[security guides](/docs/guides/security/authentication-and-abilities/), route
registration evidence, and negative authorization tests.

## Verify documentation and runtime separately

`TsRestApi` has two independent composition calls:

- `app.route("/", subApi)` mounts the Hono handlers.
- `app.extend(subApi)` copies the sub-app's current documentation emitters.

Register every sub-app operation before composing it. `extend()` snapshots the
emitters present at that call, and all composition must happen before the
OpenAPI document is generated. Discovery proves that documentation composition
published a contract. A direct call proves that runtime composition mounted its
handler.

```bash
pnpm exec sapporta endpoints show "GET /api/meta/tables"
pnpm exec sapporta --output json \
  api get /api/meta/tables
```

Use a harmless read for this check. An OpenAPI entry can describe a route whose
handler was not mounted, and a working Hono route can be absent from OpenAPI.

| Observation                             | Check next                                                          |
| --------------------------------------- | ------------------------------------------------------------------- |
| All discovery fails                     | API URL, running server, and shared authentication boundary         |
| One route is absent while others appear | Contract export, `api.register(...)`, `extend(...)`, and call order |
| Route appears but the call returns 404  | `route(...)` mount path and runtime registration                    |
| Call works but the route is absent      | `extend(...)` and whether it ran before OpenAPI generation          |

## Continue

- [Choose an application interface](/docs/guides/discovery/choose-an-application-interface/)
  determines whether the discovered route owns the task.
- [Use the Sapporta CLI](/docs/guides/discovery/use-the-sapporta-cli/) covers
  target selection, execution, JSON output, and read-back.
- [Agent access and scoped tokens](/docs/guides/security/agent-access-and-scoped-tokens/)
  owns bearer-token setup and lifecycle.
- [OpenAPI](/docs/reference/http/openapi/)
- [HTTP endpoint index](/docs/reference/indexes/http-endpoints/)
