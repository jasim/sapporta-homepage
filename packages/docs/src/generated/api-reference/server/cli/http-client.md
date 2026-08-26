---
title: "@sapporta/server/cli/http-client"
package: "@sapporta/server"
version: "0.6.0"
specifier: "@sapporta/server/cli/http-client"
---

> Sapporta API reference for `@sapporta/server@0.6.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/server/cli/http-client

Import from `@sapporta/server/cli/http-client`. Documented from `@sapporta/server@0.6.0`; confirm the installed version with `node -p "require('@sapporta/server/package.json').version"`.

4 symbols documented here.

## Types (2)

### HttpMethod

```ts
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
```

### HttpRequestOptions

```ts
interface HttpRequestOptions {
    body?: unknown;
    queryParams?: Record<string, string>;
}
```

## Functions and components (1)

### httpRequest

```ts
function httpRequest(target: ApiTarget, method: HttpMethod, path: string, opts?: HttpRequestOptions): Promise<unknown>;
```

## Values, classes, and namespaces (1)

### ApiRequestError

A failed API call, carrying the deployment it was aimed at.

```ts
class ApiRequestError extends OperationError {
    readonly target: ApiTarget;
    readonly requestUrl: string;
    readonly targetConfirmed: boolean;
    constructor(options: {
        message: string;
        code: string;
        target: ApiTarget;
        requestUrl: string;
        targetConfirmed: boolean;
    });
}
```
