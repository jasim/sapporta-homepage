---
title: "@sapporta/frontend/platform"
package: "@sapporta/frontend"
version: "0.7.0"
specifier: "@sapporta/frontend/platform"
---

> Sapporta API reference for `@sapporta/frontend@0.7.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/frontend/platform

Import from `@sapporta/frontend/platform`. Documented from `@sapporta/frontend@0.7.0`; confirm the installed version with `node -p "require('@sapporta/frontend/package.json').version"`.

11 symbols documented here.

## Functions and components (9)

### appTimeZone

The zone every timestamp on this page is written in.

```ts
function appTimeZone(): TimeZone;
```

### errorMessage

```ts
function errorMessage(err: unknown, fallback?: string): string;
```

### fetchApi

```ts
function fetchApi(path: string, init?: RequestInit): Promise<Response>;
```

### fetchJson

```ts
function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T>;
```

### getApiBase

```ts
function getApiBase(): string;
```

### loadPref

```ts
function loadPref<T extends JsonValue>(key: string, fallback: T): T;
```

### parseErrorBody

```ts
function parseErrorBody(response: Response): Promise<unknown>;
```

### savePref

```ts
function savePref<T extends JsonValue>(key: string, value: T): void;
```

### setAppTimeZone

Publish the zone the active workspace keeps.

```ts
function setAppTimeZone(value: string): void;
```

## Values, classes, and namespaces (2)

### API_ORIGIN

```ts
const API_ORIGIN: any;
```

### ApiError

Thrown by Sapporta browser HTTP helpers when a route returns a non-2xx status.

```ts
class ApiError extends Error {
    status: number;
    body: unknown;
    constructor(status: number, body: unknown);
}
```
