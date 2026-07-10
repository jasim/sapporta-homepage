---
title: "Typed API clients"
description: "Call app-owned endpoints from the browser using the shared contract."
---

Call app-owned endpoints from the browser using the shared contract.

`createApiClient()` derives browser methods from a shared contract. `getApiBase` supplies the current same-origin, proxy, or split-origin base URL.

For the programmer, the frontend owns one client module and imports no handler or database code.
For the application user, successful calls return the declared body and expected HTTP failures retain status and parsed response data.

## System boundary

- Pass `getApiBase` as a function rather than evaluating it at module load.
- Route IDs become client method names.
- Non-2xx responses throw `ApiError`.
- `VITE_API_URL` is public build configuration and never contains secrets.

## Task-app example

The progress screen calls `taskActionsApi.completeTask({ params: { id }, body: {} })` and handles the declared 404 and 409 bodies.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Typed client creation](/docs/reference/contracts/typed-client-creation/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
