---
title: "Typed API Clients"
description:
  "Call app-owned Sapporta contracts from the frontend with createApiClient,
  getApiBase, typed inputs, and ApiError."
---

Browser code should call your workflow and report endpoints through typed
clients. The client uses the same shared contract as the server route, so method
names, request shapes, success bodies, and declared error statuses stay in sync.

Table screens and table routes remain the right default for ordinary table CRUD.
Typed clients are for your app's contracts: workflows, reports, imports, and
custom response shapes.

## Client setup

Create clients in `packages/frontend/src/api.ts`:

```ts
// packages/frontend/src/api.ts
import { getApiBase } from "@sapporta/frontend/platform";
import { createApiClient } from "@sapporta/shared/client";
import { invoicesContract } from "your-app-shared";

export const invoicesApi = createApiClient(invoicesContract, {
  baseUrl: getApiBase,
});
```

Pass `getApiBase` itself, not `getApiBase()`. The base URL is resolved when a
request runs, which keeps local Vite proxying and production deployment behavior
aligned.

Method names come from the contract route IDs:

```ts
export const invoicesContract = c.router({
  voidInvoice: c.mutation({ ... }),
});
```

The client method is `invoicesApi.voidInvoice(...)`.

## Call shapes

For a `GET` route with query parameters:

```ts
const result = await reportsApi.trialBalance({
  query: { asOfDate: "2026-06-30" },
});
```

For a path route:

```ts
const invoice = await invoicesApi.getInvoice({
  params: { id: 123 },
});
```

For a mutation with a JSON body:

```ts
const result = await invoicesApi.voidInvoice({
  params: { id: 123 },
  body: { reason: "duplicate" },
});
```

For uploads, contracts use `contentType: "multipart/form-data"` with `File`
fields. The underlying rest client builds `FormData` from the body or accepts an
explicit `FormData` object. Do not set a JSON `Content-Type` header for upload
clients; the browser must set the multipart boundary.

```ts
// packages/frontend/src/api.ts
export const importsApi = createApiClient(importsContract, {
  baseUrl: getApiBase,
  baseHeaders: {},
});
```

```ts
await importsApi.uploadStatement({
  body: {
    statement: file,
    source: "bank",
  },
});
```

Use the contract's typed body when it fits. If a route needs custom upload
progress, streaming, or special headers, use lower-level `fetch` for that route
and keep the request shape aligned with the contract.

## Response behavior

Successful `2xx` calls return the response body directly:

```ts
const { data } = await invoicesApi.voidInvoice({
  params: { id: 123 },
  body: { reason: "duplicate" },
});
```

Non-2xx responses throw `ApiError` from `@sapporta/shared/client`. The error
preserves the HTTP status and response body:

```ts
import { ApiError } from "@sapporta/shared/client";
import { invoicesApi } from "../api";

async function voidInvoice(id: number, reason: string) {
  try {
    const result = await invoicesApi.voidInvoice({
      params: { id },
      body: { reason },
    });

    return result.data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      return { error: "This invoice cannot be voided now.", body: err.body };
    }
    if (err instanceof ApiError && err.status === 422) {
      return { error: "Check the invoice details.", body: err.body };
    }
    throw err;
  }
}
```

Declare expected error statuses in the route contract so both OpenAPI and
frontend handling know the possible shapes. See
[Custom API Endpoints](/docs/subsystems/custom-api-endpoints/) for endpoint
error contracts.

## Base URL behavior

`getApiBase` keeps local and deployed calls consistent:

- In local Vite development, browser calls go through the dev proxy.
- In same-origin production deployments, calls stay on the deployed app origin.
- In split frontend/API deployments, set `VITE_API_URL` at frontend build time.

Do not put secrets in `VITE_*` variables. They are compiled into browser code.
Use cookies for browser sessions or server-side secret storage for backend jobs.

## Boundaries

Use table routes and screens for ordinary table workflows. Use typed clients for
your app-owned endpoints and report routes.

Do not import backend code, Drizzle tables, route handlers, or database helpers
into frontend code. Server handlers still choose auth, ability, and row scope;
typed clients only make browser calls type-safe.
