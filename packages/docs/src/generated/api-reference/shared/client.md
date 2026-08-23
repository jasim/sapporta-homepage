---
title: "@sapporta/shared/client"
package: "@sapporta/shared"
version: "0.2.4"
specifier: "@sapporta/shared/client"
---

> Sapporta API reference for `@sapporta/shared@0.2.4`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared/client

Import from `@sapporta/shared/client`. Documented from `@sapporta/shared@0.2.4`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

6 symbols documented here.

## Types (3)

### ClientInferResponses

Re-exported from `@sapporta/rest-core`. See that package for its declaration.

### CreateApiClientOptions

```ts
interface CreateApiClientOptions {
    /** Called before every fetch — returned value is prepended to each
     *  route's path. A getter (not a string) so a host can resolve it at
     *  call time without forcing client re-creation. */
    baseUrl: () => string;
    baseHeaders?: Record<string, string>;
    /** Passed through to fetch for every request. Use "include" when the
     *  API authenticates with cross-origin cookies. */
    credentials?: InitClientArgs["credentials"];
    /** Run zod validation on response bodies before returning. Default
     *  true — contracts are tight enough that failures indicate
     *  contract/runtime drift worth surfacing. */
    validateResponse?: boolean;
}
```

### ThrowingClient

```ts
type ThrowingClient<T extends AppRouter> = {
    [K in keyof T]: T[K] extends AppRoute ? ThrowingRouteFn<T[K]> : T[K] extends AppRouter ? ThrowingClient<T[K]> : never;
};
```

## Functions and components (2)

### createApiClient

```ts
function createApiClient<T extends AppRouter>(contract: T, options: CreateApiClientOptions): ThrowingClient<T>;
```

### isFetchNetworkError

Returns true when `fetch()` failed before receiving an HTTP response.

```ts
function isFetchNetworkError(err: unknown): boolean;
```

## Values, classes, and namespaces (1)

### ApiError

Thrown by Sapporta browser HTTP helpers when a route returns a non-2xx status.

```ts
class ApiError extends Error {
    status: number;
    body: unknown;
    constructor(status: number, body: unknown);
}
```
