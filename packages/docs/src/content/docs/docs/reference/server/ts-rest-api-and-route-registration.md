---
title: "TsRestApi and route registration"
description:
  "Look up contract-driven Hono route registration and handler return shapes."
---

## Identity

`initContract` and `TsRestApi` exported from `@sapporta/server`.

## Contract

- `initContract()` creates ts-rest query and mutation contracts.
- `new TsRestApi<Env>()` creates a Hono-compatible contract registry.
- `register(operationId, route, handler)` installs the runtime method/path and
  adds one documentation emitter to that `TsRestApi`. The handler receives
  parsed `request`, Hono context `c`, and the `files` channel for multipart
  uploads.
- Handlers return a response declared by the route as `{ status, body }` or a
  supported raw response.
- `parent.route("/", child)` mounts the child's Hono runtime handlers. It does
  not copy documentation emitters.
- `parent.extend(child)` copies the child's current documentation emitters. It
  does not mount runtime handlers.
- Call both operations after the child has registered all routes and before
  OpenAPI is mounted. `extend()` snapshots the emitters present at that call;
  routes registered on the child later are absent from the parent snapshot.
- Project route modules are imported and composed explicitly from `loadApp()`.
  Mounting the parent under `/api` adds the public runtime and OpenAPI prefix;
  project contract paths omit `/api`.

## Minimal lookup

```ts
import { initContract, TsRestApi, type SapportaEnv } from "@sapporta/server";

function mountApi(
  parent: TsRestApi<SapportaEnv>,
  child: TsRestApi<SapportaEnv>,
) {
  parent.route("/", child);
  parent.extend(child);
}
```

The `@sapporta/server` `initContract` re-export is appropriate in server-only
code. A project shared contract imports it from `@sapporta/rest-core` so the
shared package remains browser-safe.

## Related documentation

- [Custom API endpoints](/docs/guides/application-code/custom-api-endpoints/)
- [Contract helpers and wire types](/docs/reference/contracts/contract-helpers-and-wire-types/)
