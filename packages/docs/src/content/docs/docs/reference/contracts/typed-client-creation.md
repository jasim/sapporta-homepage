---
title: "Typed client creation"
description: "Look up `createApiClient()` options, inferred methods, and response behavior."
---

## Identity

`createApiClient` and `ApiError` from `@sapporta/shared/client`; `getApiBase` from `@sapporta/frontend/platform`.

## Contract

- The contract route ID becomes the client method name.
- Calls pass `params`, `query`, and `body` according to the route contract.
- `baseUrl` accepts the deferred `getApiBase` resolver used by generated frontends.
- 2xx responses return the parsed body; non-2xx responses throw `ApiError` with status and parsed body.
- Browser credentials follow the generated same-origin/split-origin client configuration.


## Related documentation

- [Typed API clients](/docs/guides/app-owned-features/typed-api-clients/)
