---
title: "TsRestApi and route registration"
description: "Look up contract-driven Hono route registration and handler return shapes."
---

## Identity

`initContract` and `TsRestApi` exported from `@sapporta/server`.

## Contract

- `initContract()` creates ts-rest query and mutation contracts.
- `new TsRestApi<Env>()` creates a Hono-compatible contract registry.
- `register(routeId, route, handler)` supplies parsed `request` and Hono context `c`.
- Handlers return a response declared by the route as `{ status, body }` or a supported raw response.
- Project route modules are mounted explicitly from `loadApp()`; mounting under `/api` adds the public prefix.

## Minimal lookup

```ts
import { initContract, TsRestApi } from "@sapporta/server";
```

## Related documentation

- [Custom API endpoints](/docs/guides/app-owned-features/custom-api-endpoints/)
