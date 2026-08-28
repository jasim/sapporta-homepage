---
title: "@sapporta/shared/error"
package: "@sapporta/shared"
version: "0.3.1"
specifier: "@sapporta/shared/error"
---

> Sapporta API reference for `@sapporta/shared@0.3.1`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared/error

Import from `@sapporta/shared/error`. Documented from `@sapporta/shared@0.3.1`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

1 symbol documented here.

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
