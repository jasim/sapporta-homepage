---
title: "@sapporta/server — Functions and components"
package: "@sapporta/server"
version: "0.6.0"
specifier: "@sapporta/server"
---

> Sapporta API reference for `@sapporta/server@0.6.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/server — Functions and components

Import from `@sapporta/server`. Documented from `@sapporta/server@0.6.0`; confirm the installed version with `node -p "require('@sapporta/server/package.json').version"`.

88 of 204 symbols published from `@sapporta/server`. Other groups: [Types](https://sapporta.com/api-reference/server/index-types.md), [Values, classes, and namespaces](https://sapporta.com/api-reference/server/index-values.md).

### anonymousPrincipal

```ts
function anonymousPrincipal<Membership extends WorkspaceMembership = WorkspaceMembership>(): Principal<Membership>;
```

### apiWritePolicyIssues

Returns policy violations caused by fields table API callers may not submit: auth ownership columns and references marked `apiSettable: false`.

```ts
function apiWritePolicyIssues(table: TableDef, payload: unknown, references?: readonly ResolvedReferenceFact[]): ValidationErrorDetail[];
```

### assertAuthSchemaDefinitions

Fails boot when any registered table violates Sapporta auth metadata rules.

```ts
function assertAuthSchemaDefinitions(tables: readonly TableDef[]): void;
```

### assertDataAuthoritySupportsTable

```ts
function assertDataAuthoritySupportsTable(authority: RequestDataAuthority, table: TableDef): void;
```

### assertMigrationsReady

```ts
function assertMigrationsReady(options: {
    projectRoot: string;
    apiDistDir: string;
    sqlite: Database.Database;
    tables: readonly TableDef[];
}): void;
```

### assertSchemaDefinitions

Fails boot when schema definitions use column shapes Sapporta cannot safely serve over its generated APIs.

```ts
function assertSchemaDefinitions(tables: readonly TableDef[]): void;
```

### buildSearchPredicate

Binds a compiled search plan to one request's authorization context.

```ts
function buildSearchPredicate(plan: SearchPlan, searchTerm: string, auth: SapportaAuthContext): SQL;
```

### checkAuthSchemaDefinitions

Validates the auth-specific schema contract for every registered table.

```ts
function checkAuthSchemaDefinitions(tables: readonly TableDef[]): AuthSchemaIssue[];
```

### columnBySqlName

```ts
function columnBySqlName(table: TableDef, sqlName: string): SQLiteColumn | null;
```

### columnPropertyName

```ts
function columnPropertyName(table: TableDef, column: SQLiteColumn): string | null;
```

### compileSearchPlans

Resolves every table's recursive search metadata into immutable table and column facts.

```ts
function compileSearchPlans(tables: readonly TableDef[]): CompiledSearchPlans;
```

### connectProject

Open a SQLite database and configure it for server workloads.

```ts
function connectProject(filepath: string): ProjectDbConnection;
```

### createAuthContext

Creates the final auth value for a request.

```ts
function createAuthContext<AppAbility, Membership extends WorkspaceMembership = WorkspaceMembership>(input: CreateAuthContextInput<AppAbility, Membership>): SapportaAuthContext<AppAbility, Membership>;
```

### createRoute

```ts
function createRoute(def: TableDef, tables: readonly TableDef[]): {
    method: "POST";
    path: `/tables/${string}`;
    summary: `Create row(s) in ${string}`;
    description: `Object, array, or master-with-$details payload for ${string}.` | `Object or array of rows for ${string}.`;
    metadata: {
        tags: string[];
        skipBodyValidation: boolean;
    };
    body: ApiPayloadZod;
    responses: {
        201: ApiPayloadZod;
        404: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        409: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        422: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        500: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### createRowSecurity

Creates request-bound row security from request data authority and the loaded table catalog.

```ts
function createRowSecurity(dataAuthority: RequestDataAuthority, options: CreateRowSecurityOptions): RowSecurity;
```

### createTableCatalog

Immutable table catalog loaded from project schema files at server boot.

```ts
function createTableCatalog(tables: readonly TableDef[]): TableCatalog;
```

### deleteRoute

```ts
function deleteRoute(def: TableDef): {
    method: "DELETE";
    path: `/tables/${string}/:id`;
    summary: `Delete a row from ${string}`;
    metadata: {
        tags: string[];
    };
    pathParams: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: typeof import("@sapporta/rest-core").ContractNoBody;
    responses: {
        200: z.ZodObject<{
            data: import("../index.js").TableObjectZod;
        }, z.core.$strip>;
        403: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        404: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### exportCsvRoute

```ts
function exportCsvRoute(def: TableDef): {
    method: "GET";
    path: `/tables/${string}/export.csv`;
    summary: `Export ${string} rows as CSV`;
    metadata: {
        tags: string[];
    };
    query: z.ZodObject<{
        sort: z.ZodOptional<z.ZodString>;
        q: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodType<import("@sapporta/shared").QueryParamValue, unknown, z.core.$ZodTypeInternals<import("@sapporta/shared").QueryParamValue, unknown>>>>;
    responses: {
        200: import("@sapporta/rest-core").ContractOtherResponse<z.ZodString>;
        400: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### extractSchema

Extract schema metadata for a single table by name.

```ts
function extractSchema(source: readonly TableDef[], name: string): TableSchema | undefined;
```

### extractSchemas

Projects loaded `TableDef` values into browser-safe table metadata.

```ts
function extractSchemas(defs: readonly TableDef[]): TableSchema[];
```

### findProjectRootFrom

Walk up from `startDir` looking for a `sapporta.json` marker file.

```ts
function findProjectRootFrom(startDir?: string): string | null;
```

### findRowLabelColumns

The declared row-label columns for a table.

```ts
function findRowLabelColumns(schema: TableDef): readonly [string, ...string[]];
```

### forbidUnless

Turns an explicit authorization result into a 403 response.

```ts
function forbidUnless(c: Context, allowed: boolean): void;
```

### fromApiCodeDir

Given an API code directory (either packages/api or packages/api/dist), derive resource subdirectories.

```ts
function fromApiCodeDir(codeDir: string): {
    schemaDir: string;
    appDir: string;
};
```

### fromProjectRoot

Given a project root (containing sapporta.json), derive all standard paths.

```ts
function fromProjectRoot(projectRoot: string): {
    apiDir: string;
    apiDistDir: string;
    frontendDir: string;
    frontendDistDir: string;
    sharedDir: string;
    dataDir: string;
    databasePath: string;
    markerPath: string;
};
```

### getColumnEnumValues

Returns the non-empty enum tuple declared on a Drizzle text column.

```ts
function getColumnEnumValues(column: SQLiteColumn): readonly [string, ...string[]] | undefined;
```

### getRoute

```ts
function getRoute(def: TableDef): {
    method: "GET";
    path: `/tables/${string}/:id`;
    summary: `Get one row from ${string}`;
    metadata: {
        tags: string[];
    };
    pathParams: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    responses: {
        200: z.ZodObject<{
            data: import("../index.js").TableObjectZod;
        }, z.core.$strip>;
        404: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### insertRow

Insert a new row using Drizzle's table API.

```ts
function insertRow(schema: TableDef, db: BetterSQLite3Database, record: Record<string, unknown>): Promise<Record<string, unknown>>;
```

### installExactOriginCors

```ts
function installExactOriginCors<E extends SapportaEnv>(app: Hono<E>, options?: ExactOriginCorsOptions): Hono<E>;
```

### installFrameworkRoutePolicy

Install route policy for the framework surfaces that are not CASL-aware.

```ts
function installFrameworkRoutePolicy<E extends SapportaEnv>(app: Hono<E>, guard: SapportaAuthGuard<E>, options?: FrameworkRoutePolicyOptions): Hono<E>;
```

### installRequestLogging

```ts
function installRequestLogging<E extends SapportaEnv>(app: Hono<E>): Hono<E>;
```

### installSapportaDefaults

Install Sapporta's default middleware, health endpoint, and error handler on a Hono app.

```ts
function installSapportaDefaults<E extends SapportaEnv>(app: Hono<E>): Hono<E>;
```

### installSapportaErrorHandler

```ts
function installSapportaErrorHandler<E extends SapportaEnv>(app: Hono<E>): Hono<E>;
```

### installSapportaRequestContext

Installs request-local database handles for all `/api/*` routes.

```ts
function installSapportaRequestContext(app: Hono<SapportaEnv>, conn: ProjectDbConnection): void;
```

### isRowScope

```ts
function isRowScope(value: unknown): value is RowScope;
```

### isSystemManagedScopeFieldName

```ts
function isSystemManagedScopeFieldName(name: string): boolean;
```

### listRoute

```ts
function listRoute(def: TableDef): {
    method: "GET";
    path: `/tables/${string}`;
    summary: `List rows in ${string}`;
    metadata: {
        tags: string[];
    };
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodCoercedNumber<string>>;
        limit: z.ZodDefault<z.ZodCoercedNumber<string>>;
        sort: z.ZodOptional<z.ZodString>;
        q: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodType<import("@sapporta/shared").QueryParamValue, unknown, z.core.$ZodTypeInternals<import("@sapporta/shared").QueryParamValue, unknown>>>>;
    responses: {
        200: z.ZodObject<{
            data: z.ZodArray<import("../index.js").TableObjectZod>;
            meta: z.ZodObject<{
                total: z.ZodNumber;
                page: z.ZodNumber;
                limit: z.ZodNumber;
                pages: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>;
        400: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        404: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### loadSapportaProject

Loads the Sapporta project catalog without mutating the Hono app.

```ts
function loadSapportaProject(opts: LoadSapportaProjectOptions): Promise<SapportaProject>;
```

### loadSchemas

Load all schema files from a directory.

```ts
function loadSchemas(dir: string): Promise<SchemaLoadResult>;
```

### lookupRowAccessPredicate

```ts
function lookupRowAccessPredicate(dataAuthority: RequestDataAuthority, targetTable: TableDef): SQL;
```

### makeAuthorizedTableHandlers

```ts
function makeAuthorizedTableHandlers<E extends SapportaEnv>(catalog: TableCatalog, db: BetterSQLite3Database, options: AuthorizedTableHandlersOptions<E>): TableHandlers<E>;
```

### makeMetaHandlers

```ts
function makeMetaHandlers<E extends SapportaEnv>(catalog: TableCatalog, sqlite: Database.Database, db: BetterSQLite3Database, project: {
    dir: string;
    name: string;
    slug: string;
}, options: AuthorizedMetaHandlersOptions<E>): MetaHandlers<E>;
```

### mountHealth

```ts
function mountHealth<E extends SapportaEnv>(app: Hono<E>, policy?: HealthPolicy, guard?: SapportaHealthGuard<E>): Hono<E>;
```

### mountMeta

```ts
function mountMeta<E extends Env, DocCtx>(api: TsRestApi<E, DocCtx>, handlers: MetaHandlers<E>): TsRestApi<E, DocCtx>;
```

### mountOpenApi

Publish `/api/openapi.json`, merging the framework spec with any user-owned `TsRestApi` instances.

```ts
function mountOpenApi(app: Hono<SapportaEnv>, project: SapportaProject, frameworkApi: SapportaFrameworkApi, ...userApis: ReadonlyArray<Pick<TsRestApi<SapportaEnv>, "docEmitters">>): void;
```

### mountSapportaFramework

Mounts Sapporta's framework API under `/api`.

```ts
function mountSapportaFramework(app: Hono<SapportaEnv>, project: SapportaProject, options: MountSapportaFrameworkOptions): SapportaFrameworkApi;
```

### mountTables

```ts
function mountTables<E extends Env, DocCtx extends TablesDocContext = TablesDocContext>(api: TsRestApi<E, DocCtx>, catalog: TableCatalog, handlers: TableHandlers<E>): TsRestApi<E, DocCtx>;
```

### normalizeTableSearch

Applies table-search defaults and rejects shapes that cannot describe a finite, useful search.

```ts
function normalizeTableSearch(search: TableSearch | undefined): NormalizedTableSearch;
```

### parseTableWrite

Parses one insert or update patch at the authoritative save boundary.

```ts
function parseTableWrite(table: TableDef, record: Record<string, unknown>, operation: "insert" | "patch"): TableWriteParseResult;
```

### projectPath

Join path segments onto the project root.

```ts
function projectPath(...segments: string[]): string;
```

### projectRoot

The absolute path to the current Sapporta project root — Rails.root analogue.

```ts
function projectRoot(): string;
```

### projectRootFromDbPath

Derive project root from a database path (two levels up from data/sqlite.db).

```ts
function projectRootFromDbPath(databasePath: string): string;
```

### requestDataAuthority

```ts
function requestDataAuthority(rowAuthorities: RequestRowAuthorityRecord): RequestDataAuthority;
```

### requireResolvedTableReferences

Returns resolved reference facts or throws an `AuthSchemaValidationError`.

```ts
function requireResolvedTableReferences(table: TableDef, registeredTables: readonly TableDef[]): ResolvedReferenceFact[];
```

### resolveCountQuery

```ts
function resolveCountQuery<TTable extends AnySQLiteTable>(query: CountQuery, table: TableDef<TTable>): ResolvedCountQuery<TTable>;
```

### resolveExportQuery

```ts
function resolveExportQuery<TTable extends AnySQLiteTable>(query: ExportRowsQuery, table: TableDef<TTable>, options: ResolveRowsQueryOptions): RowsQuery;
```

### resolveLookupQuery

```ts
function resolveLookupQuery<TTable extends AnySQLiteTable>(query: LookupQuery, table: TableDef<TTable>): LookupRowsInput<TTable>;
```

### resolvePageQuery

Parse query string parameters into Drizzle query parts.

```ts
function resolvePageQuery<TTable extends AnySQLiteTable>(query: ListRowsQuery, table: TableDef<TTable>, options: ResolveRowsQueryOptions): PageRowsInput;
```

### resolveTableReferences

Resolves all FK facts Sapporta auth can enforce for one source table.

```ts
function resolveTableReferences(table: TableDef, registeredTables: readonly TableDef[]): ReferenceResolutionResult;
```

### rowLabeller

Build a labeller for a table.

```ts
function rowLabeller(schema: TableDef): RowLabeller;
```

### savePipeline

Parse and persist one prepared insert or patch.

```ts
function savePipeline(schema: TableDef, db: BetterSQLite3Database, record: Record<string, unknown>, id?: RecordId, options?: {
    updatePredicate?: SQL;
}): Promise<Record<string, unknown>>;
```

### scanTableRows

Read selected table rows through one SQLite statement and cursor.

```ts
function scanTableRows<TTable extends AnySQLiteTable>(db: BetterSQLite3Database, table: TableDef<TTable>, input?: TableRowScanInput): AsyncIterable<InferSelectModel<TTable, {
    dbColumnNames: true;
}>>;
```

### schemaApi

Standalone schema metadata endpoint (GET /).

```ts
function schemaApi(source: readonly TableDef[]): Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
```

### scopeColumnFact

```ts
function scopeColumnFact(table: TableDef, sqlName: string, typescriptName: string): ScopeColumnFact | null;
```

### scopedRows

```ts
function scopedRows<TTable extends AnySQLiteTable>(db: BetterSQLite3Database, auth: SapportaAuthContext, table: TableDef<TTable>): ScopedRows<TTable>;
```

### scopedToUserScopeColumn

```ts
function scopedToUserScopeColumn(table: TableDef): ScopeColumnFact | null;
```

### selectRowAccessPredicate

Selects the predicate required by the table's declared row scope.

```ts
function selectRowAccessPredicate(dataAuthority: RequestDataAuthority, table: TableDef): SQL;
```

### sendBody

Content-type-aware response send.

```ts
function sendBody(c: Context, body: unknown, status: ContentfulStatusCode, contentType: ContentType): Response;
```

### setProjectRoot

Publish the current project root.

```ts
function setProjectRoot(root: string): void;
```

### storeDbPath

Given a store directory and project ID, derive the database path.

```ts
function storeDbPath(storeDir: string, projectId: string): string;
```

### systemGlobalOnlyAuthority

```ts
function systemGlobalOnlyAuthority(): SystemGlobalOnlyAuthority;
```

### systemManagedScopeFieldNames

```ts
function systemManagedScopeFieldNames(): readonly string[];
```

### systemRows

Row-scope predicates translate trusted request facts into SQL.

```ts
function systemRows(dataAuthority: RequestDataAuthority, table: TableDef): SQL;
```

### trustedInsertValuesForDataAuthority

Computes trusted ownership fields for inserting a row using request data authority.

```ts
function trustedInsertValuesForDataAuthority(dataAuthority: RequestDataAuthority, table: TableDef): TrustedInsertValuesForDataAuthority;
```

### updateRoute

```ts
function updateRoute(def: TableDef, tables: readonly TableDef[]): {
    method: "PUT";
    path: `/tables/${string}/:id`;
    summary: `Update a row in ${string}`;
    metadata: {
        tags: string[];
        skipBodyValidation: boolean;
    };
    pathParams: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: import("../index.js").TableObjectZod;
    responses: {
        200: z.ZodObject<{
            data: import("../index.js").TableObjectZod;
        }, z.core.$strip>;
        403: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        404: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        409: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        422: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        500: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### updateRow

Update an existing row using Drizzle's table API.

```ts
function updateRow(schema: TableDef, db: BetterSQLite3Database, id: RecordId, record: Record<string, unknown>, options?: {
    updatePredicate?: SQL;
}): Promise<Record<string, unknown>>;
```

### userPrincipal

Wraps already-resolved user and membership facts.

```ts
function userPrincipal<Membership extends WorkspaceMembership>(input: {
    user: SapportaAuthUser;
    membership: Membership;
}): UserPrincipal<Membership>;
```

### validateApiWriteInput

Enforces API write policy and returns a shallow copy of the accepted object.

```ts
function validateApiWriteInput(table: TableDef, payload: unknown, references?: readonly ResolvedReferenceFact[]): Record<string, unknown>;
```

### validateColumnName

Validate a SQL column name.

```ts
function validateColumnName(name: string): {
    valid: true;
} | {
    valid: false;
    reason: string;
};
```

### validateForeignKeyReferences

Validates that submitted references point to rows visible to this request.

```ts
function validateForeignKeyReferences(db: BetterSQLite3Database, dataAuthority: RequestDataAuthority, sourceTable: TableDef, payload: unknown, registeredTables: readonly TableDef[], options?: ForeignKeyValidationOptions): Promise<void>;
```

### validateTableName

Validate a SQL table name for use as a UI-managed table.

```ts
function validateTableName(name: string): {
    valid: true;
} | {
    valid: false;
    reason: string;
};
```

### workspaceGlobalOnlyAuthority

```ts
function workspaceGlobalOnlyAuthority(workspace: AuthWorkspace): WorkspaceGlobalOnlyAuthority;
```

### workspaceRows

```ts
function workspaceRows(dataAuthority: RequestDataAuthority, table: TableDef): SQL;
```

### workspaceScopeColumn

```ts
function workspaceScopeColumn(table: TableDef): ScopeColumnFact | null;
```

### workspaceTimeZone

The calendar this request works in.

```ts
function workspaceTimeZone<AppAbility, Membership extends WorkspaceMembership>(auth: SapportaAuthContext<AppAbility, Membership>): TimeZone;
```

### workspaceUserRows

```ts
function workspaceUserRows(dataAuthority: RequestDataAuthority, table: TableDef): SQL;
```

### workspaceUserScopedAuthority

```ts
function workspaceUserScopedAuthority(input: {
    workspace: AuthWorkspace;
    user: SapportaAuthUser;
}): WorkspaceUserScopedAuthority;
```

### zodForColumnValue

Derives the required, non-null Zod schema for one column value.

```ts
function zodForColumnValue(table: TableDef, column: SQLiteColumn): ColumnValueZod;
```
