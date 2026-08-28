---
title: "@sapporta/honest"
package: "@sapporta/honest"
version: "0.3.13"
specifier: "@sapporta/honest"
---

> Sapporta API reference for `@sapporta/honest@0.3.13`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/honest

Import from `@sapporta/honest`. Documented from `@sapporta/honest@0.3.13`; confirm the installed version with `node -p "require('@sapporta/honest/package.json').version"`.

11 symbols documented here.

## Types (9)

### ApiDoc

```ts
interface ApiDoc {
    info: {
        title: string;
        version: string;
        description?: string;
    };
    [key: string]: unknown;
}
```

### ContentType

Response content types the adapter serializes natively.

```ts
type ContentType = "application/json" | "text/csv" | "text/plain";
```

### FamilyOptions

```ts
interface FamilyOptions<E extends Env, DocCtx> {
    method: HttpMethod;
    /** Hono-style generic path, e.g. `/tables/:tableName`. */
    genericPath: string;
    /**
     * Concrete ts-rest routes emitted at doc generation. Keys become
     * operation names; path+method must be unique across the full tree.
     */
    docs: (ctx: DocCtx) => Record<string, AppRoute>;
    /** Pick `{route, handler}` from the request, or return undefined. */
    dispatch: (c: Context<E>) => MaybePromise<ResolvedRoute<E> | undefined>;
    /** Default response when dispatch returns undefined. */
    notFound?: (c: Context<E>) => MaybePromise<Response>;
}
```

### GenerateOptions

```ts
interface GenerateOptions {
    setOperationId?: boolean | "concatenated-path";
    jsonQuery?: boolean;
    /**
     * Prefix every emitted path with this string. When a `TsRestApi` is
     * mounted under a parent Hono route (e.g. `parentApp.route("/api", api)`),
     * the contracts still hold their raw paths (`/tables/:name`). Pass
     * `pathPrefix: "/api"` so the served spec reports the externally-visible
     * URL.
     */
    pathPrefix?: string;
}
```

### HttpMethod

```ts
type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
```

### MaybePromise

```ts
type MaybePromise<T> = T | Promise<T>;
```

### ResolvedRoute

```ts
interface ResolvedRoute<E extends Env> {
    route: AppRoute;
    handler: RouteHandler<AppRoute, E>;
}
```

### RouteHandler

```ts
type RouteHandler<R extends AppRoute, E extends Env = Env> = (args: {
    c: Context<E>;
    request: ServerInferRequest<R>;
    files: UploadedFiles;
}) => MaybePromise<ServerInferResponses<R> | Response>;
```

### UploadedFiles

Files uploaded via `multipart/form-data`, keyed by the form field name.

```ts
type UploadedFiles = Record<string, File | File[]>;
```

## Functions and components (1)

### sendBody

Content-type-aware response send.

```ts
function sendBody(c: Context, body: unknown, status: ContentfulStatusCode, contentType: ContentType): Response;
```

## Values, classes, and namespaces (1)

### TsRestApi

`TsRestApi` IS a Hono app.

```ts
class TsRestApi<E extends Env = Env, DocCtx = void> extends Hono<E> {
    private readonly runtimeKeys;
    /**
     * Public (non-`#private`) for intentional reasons: cross-bundle reuse
     * needs duck-type access. When two copies of this class exist (e.g.
     * a host app and a compiled fixture loaded by a test runner),
     * `instanceof` fails, but both share the same `docEmitters` field
     * name. `extend()` below uses that to merge docs across the boundary.
     * Do not mutate from outside.
     */
    readonly docEmitters: DocEmitter<DocCtx>[];
    register<R extends AppRoute>(operationId: string, route: R, handler: RouteHandler<R, E>): this;
    registerFamily(opts: FamilyOptions<E, DocCtx>): this;
    /**
     * Pull another `TsRestApi`'s doc emitters into this one, so this api's
     * `generateDocument()` spec includes the other's routes. Runtime routes
     * on `other` are served by `other`'s own Hono tree (mount it separately
     * via `parentApp.route(prefix, other)`). This is the decoupling point:
     * per-sub-app Hono autonomy, centralized spec emission.
     */
    extend(other: {
        docEmitters: readonly DocEmitter<DocCtx>[];
    }): this;
    extend(other: {
        docEmitters: readonly DocEmitter<void>[];
    }): this;
    /**
     * Walk every registered route into a flat `AppRouter` object and defer
     * to `@sapporta/rest-open-api`. Path+method uniqueness is enforced; operation
     * keys are disambiguated by suffix if a family happens to reuse one.
     */
    generateDocument(ctx: DocCtx, apiDoc: ApiDoc, options?: GenerateOptions): ReturnType<typeof generateOpenApi>;
}
```
