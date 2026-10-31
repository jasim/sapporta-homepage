---
title: "@sapporta/honest"
package: "@sapporta/honest"
version: "0.3.18"
specifier: "@sapporta/honest"
---

> Sapporta API reference for `@sapporta/honest@0.3.18`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/honest

Import from `@sapporta/honest`. Documented from `@sapporta/honest@0.3.18`; confirm the installed version with `node -p "require('@sapporta/honest/package.json').version"`.

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
    /**
     * Where each emitter merged from another api is documented: the mount
     * paths that `route()` used, and the entry that `extend()` added, if
     * any. `route()` merges once per (emitter, mount path), so one sub-api
     * mounted at `/v1` and `/v2` is documented at both. `extend()` adds an
     * emitter only when no merge has documented it yet, so code that calls
     * both `route()` and `extend()` lists each route once.
     */
    private readonly mergedEmitters;
    register<R extends AppRoute>(operationId: string, route: R, handler: RouteHandler<R, E>): this;
    registerFamily(opts: FamilyOptions<E, DocCtx>): this;
    /**
     * Mount another Hono app under `path`, as Hono's `route()` does. When
     * the mounted app is a `TsRestApi`, its doc emitters are merged too, with
     * `path` prepended to each contract path, so this api's
     * `generateDocument()` lists the mounted routes at the URLs that serve
     * them. Like Hono's `route()`, this copies what `app` holds at call time:
     * routes registered on `app` afterwards are neither served nor documented.
     * A mounted `TsRestApi` must accept this api's doc context, or have none.
     */
    route<SubPath extends string, SubEnv extends Env, SubSchema extends Schema, SubBasePath extends string>(path: SubPath, app: Hono<SubEnv, SubSchema, SubBasePath> & MountableDocs<DocCtx>): import("hono/hono-base").HonoBase<E, import("hono/types").BlankSchema | import("hono/types").MergeSchemaPath<SubSchema, import("hono/types").MergePath<"/", SubPath>>, "/", "/">;
    /**
     * Pull another `TsRestApi`'s doc emitters into this one, so this api's
     * `generateDocument()` spec includes the other's routes. Runtime routes
     * on `other` are served by `other`'s own Hono tree (mount it separately
     * via `parentApp.route(prefix, other)`). This is the decoupling point:
     * per-sub-app Hono autonomy, centralized
// …declaration truncated at 2500 bytes.
```
