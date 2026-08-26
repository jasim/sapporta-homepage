---
title: "@sapporta/server"
package: "@sapporta/server"
version: "0.6.0"
specifier: "@sapporta/server"
---

> Sapporta API reference for `@sapporta/server@0.6.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/server

Import from `@sapporta/server`. Documented from `@sapporta/server@0.6.0`; confirm the installed version with `node -p "require('@sapporta/server/package.json').version"`.

204 symbols are published directly from this specifier — too many for one page, so they are grouped below.

## Pages

- [Types (96)](https://sapporta.com/api-reference/server/index-types.md) — ApiDoc, AppRoute, AppRouter, AuthoritySlots, AuthorizedMetaHandlersOptions, AuthorizedTableHandlersOptions, AuthSchemaIssue, AuthSchemaIssueCode, AuthWorkspace, BuildAbility, ChildSearchPlan, ColumnValueZod, CompiledSearchPlans, ContentType, CountRowsByInput, CountRowsInput, CreateAuthContextInput, CreateRowSecurityOptions, ExactOriginCorsOptions, FamilyOptions, FindManyRowsInput, ForeignKeyValidationOptions, FrameworkRoutePolicyOptions, GenerateOptions, GroupCount, HealthPolicy, InsertValuesOptions, LoadSapportaProjectOptions, LookupRowsByIdInput, LookupRowsBySearchInput, LookupRowsInput, MaybePromise, MetaHandlers, MountSapportaFrameworkOptions, NormalizedTableSearch, OpenApiPolicy, PageRowsInput, PageRowsResult, Principal, ProjectDbConnection, ReferenceResolutionResult, ReferenceRule, ReferenceSource, RequestDataAuthority, RequestRowAuthorityRecord, ResolvedCountQuery, ResolvedReferenceFact, ResolvedRoute, ResolveRowsQueryOptions, RouteHandler, RowLabeller, RowScope, RowSecurity, RowsOrderBy, RowsQuery, SapportaAbility, SapportaAuthContext, SapportaAuthGuard, SapportaAuthUser, SapportaEnv, SapportaFrameworkApi, SapportaProject, SchemaIssue, SchemaLoadResult, ScopeColumnFact, ScopedRows, SearchPlan, SearchPlanIssue, SearchPlanWarning, SearchValuePlan, ServerInferRequest, ServerInferResponseBody, ServerInferResponses, SystemGlobalDataAuthority, SystemGlobalOnlyAuthority, TableCatalog, TableColumn, TableFamilyHandler, TableHandlers, TableObjectZod, TableRow, TableRowScanInput, TableRowScanOrder, TableRowSecurity, TablesDocContext, TableWriteParseResult, TrustedInsertValuesForDataAuthority, UploadedFiles, UserPrincipal, ValidationErrorDetail, WorkspaceGlobalDataAuthority, WorkspaceGlobalOnlyAuthority, WorkspaceMembership, WorkspaceRole, WorkspaceUserDataAuthority, WorkspaceUserScopedAuthority
- [Functions and components (88)](https://sapporta.com/api-reference/server/index-functions.md) — anonymousPrincipal, apiWritePolicyIssues, assertAuthSchemaDefinitions, assertDataAuthoritySupportsTable, assertMigrationsReady, assertSchemaDefinitions, buildSearchPredicate, checkAuthSchemaDefinitions, columnBySqlName, columnPropertyName, compileSearchPlans, connectProject, createAuthContext, createRoute, createRowSecurity, createTableCatalog, deleteRoute, exportCsvRoute, extractSchema, extractSchemas, findProjectRootFrom, findRowLabelColumns, forbidUnless, fromApiCodeDir, fromProjectRoot, getColumnEnumValues, getRoute, insertRow, installExactOriginCors, installFrameworkRoutePolicy, installRequestLogging, installSapportaDefaults, installSapportaErrorHandler, installSapportaRequestContext, isRowScope, isSystemManagedScopeFieldName, listRoute, loadSapportaProject, loadSchemas, lookupRowAccessPredicate, makeAuthorizedTableHandlers, makeMetaHandlers, mountHealth, mountMeta, mountOpenApi, mountSapportaFramework, mountTables, normalizeTableSearch, parseTableWrite, projectPath, projectRoot, projectRootFromDbPath, requestDataAuthority, requireResolvedTableReferences, resolveCountQuery, resolveExportQuery, resolveLookupQuery, resolvePageQuery, resolveTableReferences, rowLabeller, savePipeline, scanTableRows, schemaApi, scopeColumnFact, scopedRows, scopedToUserScopeColumn, selectRowAccessPredicate, sendBody, setProjectRoot, storeDbPath, systemGlobalOnlyAuthority, systemManagedScopeFieldNames, systemRows, trustedInsertValuesForDataAuthority, updateRoute, updateRow, userPrincipal, validateApiWriteInput, validateColumnName, validateForeignKeyReferences, validateTableName, workspaceGlobalOnlyAuthority, workspaceRows, workspaceScopeColumn, workspaceTimeZone, workspaceUserRows, workspaceUserScopedAuthority, zodForColumnValue
- [Values, classes, and namespaces (20)](https://sapporta.com/api-reference/server/index-values.md) — ApiWritePolicyError, AuthSchemaValidationError, ImmutableTableOperationError, initContract, OPENAPI_PATH, PROJECT_MARKER, RowNotFoundError, RowScopePolicyError, rowScopes, SchemaValidationError, scopeColumnNames, SCOPED_TO_USER_ID_SQL_COLUMN, SCOPED_TO_USER_ID_TS_COLUMN, SearchPlanValidationError, tableApiZod, tableWriteZod, TsRestApi, WATCHABLE_SUBDIRS, WORKSPACE_ID_SQL_COLUMN, WORKSPACE_ID_TS_COLUMN

## Also available from narrower specifiers (25)

These are exported by `@sapporta/server` too, but their signatures live on the narrower page. Prefer the narrower specifier in application code.

- `@sapporta/server/cli/http-client` — HttpMethod
- `@sapporta/server/errors` — ActionError, QueryParseError, ValidationError
- `@sapporta/server/table` — ChildMeta, ColumnMeta, SapportaMeta, SapportaTableInputMeta, SearchSelf, TableDef, TableOptions, TableSearch, TableValidation, TableValidationContext, TableValidationField, TableValidationValue, bool, date, money, number, percentage, sapportaTable, select, text, timestamp
