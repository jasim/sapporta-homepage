---
title: "@sapporta/server — Types"
package: "@sapporta/server"
version: "0.6.0"
specifier: "@sapporta/server"
---

> Sapporta API reference for `@sapporta/server@0.6.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/server — Types

Import from `@sapporta/server`. Documented from `@sapporta/server@0.6.0`; confirm the installed version with `node -p "require('@sapporta/server/package.json').version"`.

96 of 204 symbols published from `@sapporta/server`. Other groups: [Functions and components](https://sapporta.com/api-reference/server/index-functions.md), [Values, classes, and namespaces](https://sapporta.com/api-reference/server/index-values.md).

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

### AppRoute

A union of all possible endpoint types.

Re-exported from `@sapporta/rest-core`. See that package for its declaration.

### AppRouter

A router (or contract) in

Re-exported from `@sapporta/rest-core`. See that package for its declaration.

### AuthoritySlots

```ts
interface AuthoritySlots {
    systemGlobalOnly: SystemGlobalOnlyAuthority;
    workspaceGlobalOnly: WorkspaceGlobalOnlyAuthority;
    workspaceUserScoped: WorkspaceUserScopedAuthority;
}
```

### AuthorizedMetaHandlersOptions

```ts
interface AuthorizedMetaHandlersOptions<E extends SapportaEnv> {
    /** Project-owned auth guard that returns the request auth context. */
    requireAuthContext: SapportaAuthGuard<E>;
}
```

### AuthorizedTableHandlersOptions

```ts
interface AuthorizedTableHandlersOptions<E extends SapportaEnv> {
    /** Project-owned guard that returns the current request auth context. */
    guard: (c: Context<E>) => SapportaAuthContext;
}
```

### AuthSchemaIssue

```ts
interface AuthSchemaIssue {
    table: string;
    column?: string;
    code: AuthSchemaIssueCode;
    message: string;
}
```

### AuthSchemaIssueCode

```ts
type AuthSchemaIssueCode = "invalid_row_scope" | "missing_workspace_scope_column" | "missing_user_scope_column" | "system_managed_column_api_writable" | "unknown_reference_source_column" | "unregistered_reference_table" | "unsupported_reference_target_column" | "composite_reference" | "ambiguous_reference" | "conflicting_reference_rule";
```

### AuthWorkspace

Workspace facts that auth and row-security decisions can safely rely on.

```ts
type AuthWorkspace = {
    id: string;
    name: string;
    slug: string;
    /**
     * The calendar this workspace keeps.
     *
     * A day is a calendar day in this zone: it is what a report groups by, what
     * a day-bounded filter resolves against, and what a timestamp is displayed
     * on. It is a business fact in the same sense that a currency or a fiscal
     * year start is, so it belongs to the workspace rather than to whoever is
     * reading — two colleagues looking at one dashboard have to see the same
     * numbers under the same date.
     *
     * Checked where the workspace row is read, so everything downstream holds a
     * zone this runtime can render. Read it through `workspaceTimeZone`.
     */
    timeZone: TimeZone;
};
```

### BuildAbility

Builds the request ability from the same facts that row security receives.

```ts
type BuildAbility<AppAbility, Membership extends WorkspaceMembership = WorkspaceMembership> = (facts: {
    principal: Principal<Membership>;
    dataAuthority: RequestDataAuthority;
}) => AppAbility;
```

### ChildSearchPlan

```ts
interface ChildSearchPlan {
    readonly childTable: TableDef;
    readonly childForeignKey: SQLiteColumn;
    readonly parentTargetColumn: SQLiteColumn;
    readonly plan: SearchPlan;
}
```

### ColumnValueZod

```ts
type ColumnValueZod = z.ZodType;
```

### CompiledSearchPlans

```ts
interface CompiledSearchPlans {
    readonly plans: ReadonlyMap<string, SearchPlan>;
    readonly warnings: readonly SearchPlanWarning[];
}
```

### ContentType

Response content types the adapter serializes natively.

```ts
type ContentType = "application/json" | "text/csv" | "text/plain";
```

### CountRowsByInput

```ts
interface CountRowsByInput<TTable extends AnySQLiteTable = AnySQLiteTable> extends CountRowsInput {
    column: TableColumn<TTable>;
    order?: "asc" | "desc";
    limit?: number;
}
```

### CountRowsInput

```ts
interface CountRowsInput {
    where?: SQL;
}
```

### CreateAuthContextInput

```ts
interface CreateAuthContextInput<AppAbility, Membership extends WorkspaceMembership = WorkspaceMembership> {
    principal: Principal<Membership>;
    dataAuthority: RequestDataAuthority;
    ability: AppAbility;
    catalog: TableCatalog;
}
```

### CreateRowSecurityOptions

```ts
interface CreateRowSecurityOptions {
    /** Loaded table catalog used to resolve FK metadata and validate visibility. */
    catalog: TableCatalog;
}
```

### ExactOriginCorsOptions

```ts
interface ExactOriginCorsOptions {
    origins?: readonly string[];
    sameOrigin?: boolean;
    credentials?: boolean;
}
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

### FindManyRowsInput

```ts
interface FindManyRowsInput extends RowsQuery {
    /** Required upper bound for the number of returned rows. */
    limit: number;
    /** Safe-integer number of matching rows to skip. Defaults to zero. */
    offset?: number;
}
```

### ForeignKeyValidationOptions

```ts
interface ForeignKeyValidationOptions {
    /**
     * When true, missing FK fields are ignored. Update patches should set this;
     * create bodies usually leave it false and still only validate submitted
     * non-null values.
     */
    partial?: boolean;
    /**
     * Skips API write policy checks when the caller has already separated
     * API-submitted fields from trusted server-authored values.
     */
    skipApiWritePolicy?: boolean;
}
```

### FrameworkRoutePolicyOptions

```ts
interface FrameworkRoutePolicyOptions {
    /**
     * Who may read `/api/openapi.json`. Defaults to `"authenticated"`, which
     * matches the behavior of projects that do not set the policy.
     */
    openapi?: OpenApiPolicy;
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

### GroupCount

```ts
interface GroupCount {
    value: CountGroupValue;
    count: number;
}
```

### HealthPolicy

```ts
type HealthPolicy = "disabled" | "public" | "authenticated";
```

### InsertValuesOptions

```ts
interface InsertValuesOptions<T extends Record<string, unknown> = Record<string, unknown>> {
    /**
     * Trusted values authored by server code after API policy checks, such as
     * a parent row id in a master-detail insert. These values may include
     * references marked `apiSettable: false`; final FK visibility is still
     * validated after they are merged.
     */
    serverValues?: Record<string, unknown> | ((input: T, index: number) => Record<string, unknown>);
}
```

### LoadSapportaProjectOptions

```ts
interface LoadSapportaProjectOptions {
    /** Human-readable project name shown in the frontend chrome and auth pages. */
    name: string;
    slug: string;
    /** Absolute path to the project root containing sapporta.json. */
    projectRoot: string;
    /**
     * Absolute path to the project's compiled `packages/api/dist/` (with
     * a `schema/` subdirectory). Schemas load from here at
     * runtime; `tsc --watch` keeps it fresh during development.
     */
    apiDistDir: string;
    conn: ProjectDbConnection;
}
```

### LookupRowsByIdInput

```ts
type LookupRowsByIdInput = {
    ids: readonly RecordId[];
    search?: never;
    fields?: never;
    limit?: never;
};
```

### LookupRowsBySearchInput

```ts
type LookupRowsBySearchInput<TTable extends AnySQLiteTable = AnySQLiteTable> = {
    ids?: never;
    search?: string;
    fields?: readonly TableColumn<TTable>[];
    limit?: number;
};
```

### LookupRowsInput

```ts
type LookupRowsInput<TTable extends AnySQLiteTable = AnySQLiteTable> = LookupRowsByIdInput | LookupRowsBySearchInput<TTable>;
```

### MaybePromise

```ts
type MaybePromise<T> = T | Promise<T>;
```

### MetaHandlers

```ts
interface MetaHandlers<E extends Env> {
    projectInfo: RouteHandler<typeof projectInfoRoute, E>;
    listTables: RouteHandler<typeof listTablesRoute, E>;
    getTable: RouteHandler<typeof getTableRoute, E>;
    tableIndexes: RouteHandler<typeof tableIndexesRoute, E>;
    tableSample: RouteHandler<typeof tableSampleRoute, E>;
    sql: RouteHandler<typeof sqlRoute, E>;
}
```

### MountSapportaFrameworkOptions

```ts
interface MountSapportaFrameworkOptions {
    conn: ProjectDbConnection;
    auth: {
        requireAuthContext: SapportaAuthGuard;
    };
    /**
     * Who may read `/api/openapi.json`. Defaults to `"authenticated"`.
     *
     * A generated project gates that route twice: this policy, and the
     * project's own anonymous gate over `/api/*`. Setting this to `"public"`
     * on its own is not enough — the route must also be listed as a public
     * route for the anonymous gate. See `createProjectAuth` in the scaffold.
     */
    openapiPolicy?: OpenApiPolicy;
}
```

### NormalizedTableSearch

```ts
type NormalizedTableSearch = false | "allColumns" | {
    readonly self: SearchSelf;
    readonly children: Readonly<Record<string, NormalizedTableSearch>>;
};
```

### OpenApiPolicy

Who may read the generated OpenAPI document at `/api/openapi.json`.

```ts
type OpenApiPolicy = "disabled" | "public" | "authenticated";
```

### PageRowsInput

```ts
interface PageRowsInput extends RowsQuery {
    page?: number;
    limit?: number;
}
```

### PageRowsResult

```ts
interface PageRowsResult<TTable extends AnySQLiteTable = AnySQLiteTable> {
    data: TableRow<TTable>[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}
```

### Principal

The requester for one request.

```ts
type Principal<Membership extends WorkspaceMembership = WorkspaceMembership> = {
    kind: "anonymous";
} | {
    kind: "user";
    user: SapportaAuthUser;
    membership: Membership;
};
```

### ProjectDbConnection

```ts
interface ProjectDbConnection {
    /** Raw better-sqlite3 handle — used for PRAGMAs, raw SQL, transactions */
    sqlite: Database.Database;
    /** Drizzle ORM wrapper — used for typed queries and schema push */
    db: BetterSQLite3Database;
}
```

### ReferenceResolutionResult

```ts
interface ReferenceResolutionResult {
    references: ResolvedReferenceFact[];
    issues: AuthSchemaIssue[];
}
```

### ReferenceRule

```ts
interface ReferenceRule {
    /** Registered Sapporta target table SQL name. */
    table: string;
    /** Target column SQL name. Defaults to the target table primary key. */
    column?: string;
    /** When false, table API callers may not submit this FK on create/update. */
    apiSettable?: boolean;
}
```

### ReferenceSource

```ts
type ReferenceSource = "drizzle" | "meta" | "drizzle+meta";
```

### RequestDataAuthority

Trusted ownership authority available to one request.

```ts
interface RequestDataAuthority {
    rowAuthorities: RequestRowAuthorityRecord;
}
```

### RequestRowAuthorityRecord

```ts
type RequestRowAuthorityRecord = AtLeastOne<AuthoritySlots>;
```

### ResolvedCountQuery

```ts
type ResolvedCountQuery<TTable extends AnySQLiteTable = AnySQLiteTable> = {
    kind: "total";
    input: CountRowsInput;
} | {
    kind: "grouped";
    input: CountRowsByInput<TTable>;
};
```

### ResolvedReferenceFact

```ts
interface ResolvedReferenceFact {
    sourceTable: TableDef;
    sourceColumn: string;
    sourceColumnRef: SQLiteColumn;
    targetTable: TableDef;
    targetColumn: string;
    targetColumnRef: SQLiteColumn;
    apiSettable: boolean;
    source: ReferenceSource;
}
```

### ResolvedRoute

```ts
interface ResolvedRoute<E extends Env> {
    route: AppRoute;
    handler: RouteHandler<AppRoute, E>;
}
```

### ResolveRowsQueryOptions

```ts
interface ResolveRowsQueryOptions {
    auth: SapportaAuthContext;
    searchPlan: SearchPlan;
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

### RowLabeller

```ts
interface RowLabeller {
    /** SQL name of the primary key column. */
    readonly pkName: string;
    /** SQL names used to build the display label. */
    readonly labelColumns: readonly string[];
    /** Render a row as a human-readable label. */
    readonly label: (row: Record<string, unknown>) => string;
}
```

### RowScope

```ts
type RowScope = (typeof rowScopes)[number];
```

### RowSecurity

```ts
interface RowSecurity {
    /**
     * Binds request auth and the loaded table catalog to one table's row-scope and
     * reference metadata. Use a separate guard for every table touched by a
     * workflow.
     */
    forTable(tableDef: TableDef): TableRowSecurity;
    /**
     * Returns a row-security engine narrowed to a more specific data authority.
     * Exact route authorization helpers use this after validating the workflow's
     * required authority slot.
     */
    withDataAuthority(dataAuthority: RequestDataAuthority): RowSecurity;
}
```

### RowsOrderBy

```ts
type RowsOrderBy = SQLiteColumn | SQL;
```

### RowsQuery

```ts
interface RowsQuery {
    where?: SQL;
    orderBy?: RowsOrderBy | readonly RowsOrderBy[];
}
```

### SapportaAbility

Minimal ability protocol Sapporta needs from an application CASL ability.

```ts
interface SapportaAbility {
    can(action: string, subject: string): boolean;
}
```

### SapportaAuthContext

The authorization facts available to one request.

```ts
interface SapportaAuthContext<AppAbility = SapportaAbility, Membership extends WorkspaceMembership = WorkspaceMembership> {
    principal: Principal<Membership>;
    dataAuthority: RequestDataAuthority;
    ability: AppAbility;
    rowSecurity: RowSecurity;
}
```

### SapportaAuthGuard

```ts
type SapportaAuthGuard<E extends SapportaEnv = SapportaEnv> = (c: Context<E>) => SapportaAuthContext;
```

### SapportaAuthUser

User facts copied from the active session provider.

```ts
type SapportaAuthUser = {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
};
```

### SapportaEnv

Hono `Env` shape used by every Sapporta-managed app and sub-app.

```ts
interface SapportaEnv extends Env {
    Variables: {
        db: BetterSQLite3Database;
        sqlite: Database.Database;
        auth: SapportaAuthContext;
    };
}
```

### SapportaFrameworkApi

```ts
type SapportaFrameworkApi = TsRestApi<SapportaEnv, FrameworkDocCtx>;
```

### SapportaProject

```ts
interface SapportaProject {
    /** Human-readable project name shown in the frontend chrome and auth pages. */
    name: string;
    /** Project slug used for framework metadata and OpenAPI title generation. */
    slug: string;
    /** Compiled API directory used by metadata handlers to serve live schema info. */
    apiDistDir: string;
    /** Static table catalog loaded from project schema files. */
    catalog: TableCatalog;
}
```

### SchemaIssue

```ts
type SchemaIssue = {
    table: string;
    column: string;
    message: string;
};
```

### SchemaLoadResult

```ts
interface SchemaLoadResult {
    tables: TableDef[];
}
```

### ScopeColumnFact

```ts
interface ScopeColumnFact {
    sqlName: string;
    typescriptName: string;
    column: SQLiteColumn;
    propertyName: string | null;
}
```

### ScopedRows

```ts
interface ScopedRows<TTable extends AnySQLiteTable = AnySQLiteTable> {
    findMany(input: FindManyRowsInput): Promise<TableRow<TTable>[]>;
    page(input?: PageRowsInput): Promise<PageRowsResult<TTable>>;
    get(id: RecordId): Promise<TableRow<TTable>>;
    create(input: readonly unknown[]): Promise<TableRow<TTable>[]>;
    create(input: Record<string, unknown>): Promise<TableRow<TTable>>;
    create(input: unknown): Promise<TableRow<TTable> | TableRow<TTable>[]>;
    update(id: RecordId, patch: unknown): Promise<TableRow<TTable>>;
    delete(id: RecordId): Promise<TableRow<TTable>>;
    scan(input?: RowsQuery): AsyncIterable<TableRow<TTable>>;
    lookup(input?: LookupRowsInput<TTable>): Promise<LookupEntry[]>;
    count(input?: CountRowsInput): Promise<number>;
    countBy(input: CountRowsByInput<TTable>): Promise<GroupCount[]>;
}
```

### SearchPlan

```ts
interface SearchPlan {
    readonly table: TableDef;
    readonly disabled: boolean;
    readonly self: readonly SearchValuePlan[];
    readonly children: readonly ChildSearchPlan[];
}
```

### SearchPlanIssue

```ts
interface SearchPlanIssue {
    readonly table: string;
    readonly path: string;
    readonly message: string;
}
```

### SearchPlanWarning

```ts
interface SearchPlanWarning {
    readonly table: string;
    readonly column: string;
    readonly message: string;
}
```

### SearchValuePlan

```ts
type SearchValuePlan = {
    readonly kind: "column";
    readonly column: SQLiteColumn;
} | {
    readonly kind: "referenceLabel";
    readonly sourceColumn: SQLiteColumn;
    readonly targetTable: TableDef;
    readonly targetColumn: SQLiteColumn;
    readonly labelColumns: readonly SQLiteColumn[];
};
```

### ServerInferRequest

Re-exported from `@sapporta/rest-core`. See that package for its declaration.

### ServerInferResponseBody

Re-exported from `@sapporta/rest-core`. See that package for its declaration.

### ServerInferResponses

Re-exported from `@sapporta/rest-core`. See that package for its declaration.

### SystemGlobalDataAuthority

```ts
type SystemGlobalDataAuthority = RequestDataAuthority & {
    rowAuthorities: {
        systemGlobalOnly: SystemGlobalOnlyAuthority;
        workspaceGlobalOnly?: never;
        workspaceUserScoped?: never;
    };
};
```

### SystemGlobalOnlyAuthority

```ts
interface SystemGlobalOnlyAuthority {
    kind: "systemGlobalOnly";
}
```

### TableCatalog

```ts
interface TableCatalog {
    readonly tables: readonly TableDef[];
    readonly searchWarnings: readonly SearchPlanWarning[];
    get(name: string): TableDef | undefined;
    has(name: string): boolean;
    searchPlanFor(tableName: string): SearchPlan;
}
```

### TableColumn

```ts
type TableColumn<TTable extends AnySQLiteTable = AnySQLiteTable> = TTable["_"]["columns"][keyof TTable["_"]["columns"]];
```

### TableFamilyHandler

```ts
type TableFamilyHandler<R extends AppRoute, E extends Env> = (args: {
    def: TableDef;
    route: R;
    tables: readonly TableDef[];
}) => RouteHandler<R, E>;
```

### TableHandlers

```ts
interface TableHandlers<E extends Env> {
    list: TableFamilyHandler<ReturnType<typeof listRoute>, E>;
    get: TableFamilyHandler<ReturnType<typeof getRoute>, E>;
    create: TableFamilyHandler<ReturnType<typeof createRoute>, E>;
    update: TableFamilyHandler<ReturnType<typeof updateRoute>, E>;
    delete: TableFamilyHandler<ReturnType<typeof deleteRoute>, E>;
    exportCsv: TableFamilyHandler<ReturnType<typeof exportCsvRoute>, E>;
    lookup: RouteHandler<typeof lookupRoute, E>;
    count: RouteHandler<typeof countRoute, E>;
}
```

### TableObjectZod

```ts
type TableObjectZod = z.ZodObject<z.ZodRawShape>;
```

### TableRow

A table row keyed by public SQL column names.

```ts
type TableRow<TTable extends AnySQLiteTable = AnySQLiteTable> = InferSelectModel<TTable, {
    dbColumnNames: true;
}>;
```

### TableRowScanInput

```ts
interface TableRowScanInput {
    where?: SQL;
    orderBy?: TableRowScanOrder | readonly TableRowScanOrder[];
}
```

### TableRowScanOrder

```ts
type TableRowScanOrder = SQLiteColumn | SQL;
```

### TableRowSecurity

Request-bound security helpers for one table.

```ts
interface TableRowSecurity {
  addOwnershipFields: …;
  ensureOwnership: …;
  ensureOwnership: …;
  insertValues: …;
  insertValues: …;
  insertValuesSync: …;
  insertValuesSync: …;
  insertManyValues: …;
  ownedRows: …;
  patchValues: …;
  patchValues: …;
  validateReferences: …;
  validateReferencesSync: …;
}
// 13 members; inferred types elided. Read the full type from the declaration file if needed.
```

### TablesDocContext

```ts
interface TablesDocContext {
    tables: readonly TableDef[];
}
```

### TableWriteParseResult

```ts
type TableWriteParseResult = {
    success: true;
    data: Record<string, unknown>;
} | {
    success: false;
    issues: ValidationErrorDetail[];
};
```

### TrustedInsertValuesForDataAuthority

```ts
interface TrustedInsertValuesForDataAuthority {
    /** SQL column names for Drizzle insert/update payloads. */
    sql: Record<string, string>;
    /** TypeScript property names for schema-facing callers. */
    typescript: Record<string, string>;
}
```

### UploadedFiles

Files uploaded via `multipart/form-data`, keyed by the form field name.

```ts
type UploadedFiles = Record<string, File | File[]>;
```

### UserPrincipal

The signed-in case of `Principal`, for callers who know there is a user.

```ts
type UserPrincipal<Membership extends WorkspaceMembership = WorkspaceMembership> = Extract<Principal<Membership>, {
    kind: "user";
}>;
```

### ValidationErrorDetail

```ts
type ValidationErrorDetail = FieldIssue;
```

### WorkspaceGlobalDataAuthority

```ts
type WorkspaceGlobalDataAuthority = RequestDataAuthority & {
    rowAuthorities: {
        workspaceGlobalOnly: WorkspaceGlobalOnlyAuthority;
        systemGlobalOnly?: never;
        workspaceUserScoped?: never;
    };
};
```

### WorkspaceGlobalOnlyAuthority

```ts
interface WorkspaceGlobalOnlyAuthority {
    kind: "workspaceGlobalOnly";
    workspace: AuthWorkspace;
}
```

### WorkspaceMembership

The user's relationship to the current workspace.

```ts
type WorkspaceMembership<Role extends string = WorkspaceRole> = {
    id: string;
    roles: readonly Role[];
};
```

### WorkspaceRole

```ts
type WorkspaceRole = "owner" | "member";
```

### WorkspaceUserDataAuthority

```ts
type WorkspaceUserDataAuthority = RequestDataAuthority & {
    rowAuthorities: {
        workspaceUserScoped: WorkspaceUserScopedAuthority;
        systemGlobalOnly?: never;
        workspaceGlobalOnly?: never;
    };
};
```

### WorkspaceUserScopedAuthority

```ts
interface WorkspaceUserScopedAuthority {
    kind: "workspaceUserScoped";
    workspace: AuthWorkspace;
    user: SapportaAuthUser;
}
```
