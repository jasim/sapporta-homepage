---
title: "Typed client creation"
description:
  "Look up `createApiClient()` options, inferred methods, and response behavior."
---

## Identity

`createApiClient` and `ApiError` from `@sapporta/shared/client`; `getApiBase`
from `@sapporta/frontend/platform`.

## Contract

- `createApiClient(contract, options)` returns a throwing client whose contract
  key becomes the method name.
- Calls pass `params`, `query`, and `body` according to the route contract.
- A `QueryParamRecord` value may contain a readonly string array. The client
  serializes that array as repeated URL keys in order, which preserves same-key
  table filters instead of collapsing them. Numeric table query inputs remain
  strings at this client boundary and are coerced by the shared contract on the
  server.
- Use `{ baseUrl: getApiBase }`, not `{ baseUrl: getApiBase() }`. The client
  calls the resolver immediately before every request and prepends the result to
  the contract path.
- `validateResponse` defaults to `true`. A response-schema mismatch rejects the
  call before response unwrapping.
- A valid 2xx response returns its body. A non-2xx response that reaches
  unwrapping throws `ApiError` with numeric `status` and an `unknown` body.
- Transport and response-validation failures pass through without fabricated
  HTTP statuses.
- `baseHeaders` defaults to `{ "Content-Type": "application/json" }`.
  `credentials` is passed to `fetch`; use the value required by the generated
  same-origin or split-origin authentication configuration.
- Setting `validateResponse: false` disables client response-schema proof and
  should be an explicit compatibility decision, not routine feature setup.

## Related documentation

- [Typed API clients](/docs/guides/application-code/typed-api-clients/)
- [Contract helpers and wire types](/docs/reference/contracts/contract-helpers-and-wire-types/)
