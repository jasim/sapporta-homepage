---
title: "@sapporta/server — Values, classes, and namespaces"
package: "@sapporta/server"
version: "0.10.0"
specifier: "@sapporta/server"
---

> Sapporta API reference for `@sapporta/server@0.10.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/server — Values, classes, and namespaces

Import from `@sapporta/server`. Documented from `@sapporta/server@0.10.0`; confirm the installed version with `node -p "require('@sapporta/server/package.json').version"`.

22 of 220 symbols published from `@sapporta/server`. Other groups: [Types](https://sapporta.com/api-reference/server/index-types.md), [Functions and components](https://sapporta.com/api-reference/server/index-functions.md).

### ApiWritePolicyError

```ts
class ApiWritePolicyError extends Error {
    readonly errors: readonly ValidationErrorDetail[];
    constructor(errors: readonly ValidationErrorDetail[]);
}
```

### AuthSchemaValidationError

```ts
class AuthSchemaValidationError extends Error {
    readonly issues: readonly AuthSchemaIssue[];
    constructor(issues: readonly AuthSchemaIssue[]);
}
```

### ImmutableTableOperationError

```ts
class ImmutableTableOperationError extends Error {
    constructor(tableName: string);
}
```

### initContract

Instantiate a ts-rest client, primarily to access `router`, `response`, and `body`

Re-exported from `@sapporta/rest-core`. See that package for its declaration.

### OPENAPI_PATH

Path of the generated app contract, kept in one place across boot.

```ts
const OPENAPI_PATH = "/api/openapi.json";
```

### PROJECT_API_TOKEN_FILE

The project's agent token file: a dotenv file in the project root holding `SAPPORTA_API_TOKEN` for the coding agents that work in the folder.

```ts
const PROJECT_API_TOKEN_FILE = ".env.agent";
```

### PROJECT_MARKER

The marker filename that identifies a Sapporta project root.

```ts
const PROJECT_MARKER = "sapporta.json";
```

### RowNotFoundError

```ts
class RowNotFoundError extends Error {
    constructor();
}
```

### RowScopePolicyError

Raised when a request's data authority cannot support the target table scope.

```ts
class RowScopePolicyError extends Error {
    readonly status = 403;
    readonly code = "row_scope_forbidden";
    constructor(table: TableDef, dataAuthority: RequestDataAuthority);
}
```

### rowScopes

```ts
const rowScopes: readonly ["workspaceUserScoped", "workspaceGlobal", "systemGlobal"];
```

### SchemaValidationError

```ts
class SchemaValidationError extends Error {
    readonly issues: readonly SchemaIssue[];
    constructor(issues: readonly SchemaIssue[]);
}
```

### scopeColumnNames

```ts
const scopeColumnNames: {
    readonly typescript: {
        readonly workspaceId: "workspaceId";
        readonly scopedToUserId: "scopedToUserId";
    };
    readonly sql: {
        readonly workspaceId: "workspace_id";
        readonly scopedToUserId: "scoped_to_user_id";
    };
};
```

### SCOPED_TO_USER_ID_SQL_COLUMN

```ts
const SCOPED_TO_USER_ID_SQL_COLUMN: "scoped_to_user_id";
```

### SCOPED_TO_USER_ID_TS_COLUMN

```ts
const SCOPED_TO_USER_ID_TS_COLUMN: "scopedToUserId";
```

### SearchPlanValidationError

```ts
class SearchPlanValidationError extends Error {
    readonly issues: readonly SearchPlanIssue[];
    constructor(issues: readonly SearchPlanIssue[]);
}
```

### tableApiZod

Stateless Zod vocabulary for the generated table API boundary.

```ts
const tableApiZod: {
    forInsert(table: TableDef, tables: readonly TableDef[]): TableObjectZod;
    forPatch(table: TableDef, tables: readonly TableDef[]): TableObjectZod;
    forRow(table: TableDef): TableObjectZod;
};
```

### tableWriteZod

Zod projections for trusted table writes.

```ts
const tableWriteZod: {
    forInsert(table: TableDef): TableObjectZod;
    forPatch(table: TableDef): TableObjectZod;
};
```

### TreeTooLargeError

A tree lookup would return more than `MAX_LOOKUP_TREE_ROWS` rows.

```ts
class TreeTooLargeError extends Error {
    constructor(tableName: string);
}
```

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

### WATCHABLE_SUBDIRS

Subdirectory names that the dev watcher should observe for hot-reload.

```ts
const WATCHABLE_SUBDIRS: readonly ["app"];
```

### WORKSPACE_ID_SQL_COLUMN

```ts
const WORKSPACE_ID_SQL_COLUMN: "workspace_id";
```

### WORKSPACE_ID_TS_COLUMN

```ts
const WORKSPACE_ID_TS_COLUMN: "workspaceId";
```
