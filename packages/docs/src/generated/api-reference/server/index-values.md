---
title: "@sapporta/server — Values, classes, and namespaces"
package: "@sapporta/server"
version: "0.6.2"
specifier: "@sapporta/server"
---

> Sapporta API reference for `@sapporta/server@0.6.2`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/server — Values, classes, and namespaces

Import from `@sapporta/server`. Documented from `@sapporta/server@0.6.2`; confirm the installed version with `node -p "require('@sapporta/server/package.json').version"`.

20 of 204 symbols published from `@sapporta/server`. Other groups: [Types](https://sapporta.com/api-reference/server/index-types.md), [Functions and components](https://sapporta.com/api-reference/server/index-functions.md).

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
