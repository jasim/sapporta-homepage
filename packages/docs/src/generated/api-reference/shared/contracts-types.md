---
title: "@sapporta/shared/contracts — Types"
package: "@sapporta/shared"
version: "0.3.2"
specifier: "@sapporta/shared/contracts"
---

> Sapporta API reference for `@sapporta/shared@0.3.2`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared/contracts — Types

Import from `@sapporta/shared/contracts`. Documented from `@sapporta/shared@0.3.2`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

43 of 112 symbols published from `@sapporta/shared/contracts`. Other groups: [Functions and components](https://sapporta.com/api-reference/shared/contracts-functions.md), [Values, classes, and namespaces](https://sapporta.com/api-reference/shared/contracts-values.md).

### AppRoute

A union of all possible endpoint types.

Re-exported from `@sapporta/rest-core`. See that package for its declaration.

### AppRouter

A router (or contract) in

Re-exported from `@sapporta/rest-core`. See that package for its declaration.

### AuthActiveWorkspace

```ts
type AuthActiveWorkspace = z.output<typeof authActiveWorkspaceSchema>;
```

### AuthBootstrapStatus

```ts
type AuthBootstrapStatus = z.output<typeof authBootstrapStatusSchema>;
```

### AuthContextResponse

```ts
type AuthContextResponse = z.output<typeof authContextResponseSchema>;
```

### AuthCurrentUser

```ts
type AuthCurrentUser = z.output<typeof authCurrentUserSchema>;
```

### AuthMembership

```ts
type AuthMembership = z.output<typeof authMembershipSchema>;
```

### AuthRole

```ts
type AuthRole = z.output<typeof authRoleSchema>;
```

### AuthToken

```ts
type AuthToken = z.output<typeof authTokenSchema>;
```

### AuthTokenListResponse

```ts
type AuthTokenListResponse = z.output<typeof authTokenListResponseSchema>;
```

### AuthWorkspaceSummary

```ts
type AuthWorkspaceSummary = z.output<typeof authWorkspaceSummarySchema>;
```

### ChildSchema

```ts
type ChildSchema = z.output<typeof childSchemaSchema>;
```

### ClientInferResponseBody

Re-exported from `@sapporta/rest-core`. See that package for its declaration.

### ClientInferResponses

Re-exported from `@sapporta/rest-core`. See that package for its declaration.

### ColumnSchema

```ts
type ColumnSchema = z.output<typeof columnSchemaSchema>;
```

### CountQuery

```ts
type CountQuery = z.output<typeof countQuerySchema>;
```

### CountResponse

```ts
type CountResponse = z.output<typeof countResponseSchema>;
```

### CountResult

```ts
type CountResult = z.output<typeof countResultSchema>;
```

### CreateAuthTokenBody

```ts
type CreateAuthTokenBody = z.output<typeof createAuthTokenBodySchema>;
```

### CreateAuthTokenResponse

```ts
type CreateAuthTokenResponse = z.output<typeof createAuthTokenResponseSchema>;
```

### ErrorBody

```ts
type ErrorBody = z.output<typeof errorBodySchema>;
```

### ExportRowsQuery

```ts
type ExportRowsQuery = z.output<typeof exportRowsQuerySchema>;
```

### GroupCount

```ts
interface GroupCount {
    value: CountGroupValue;
    count: number;
}
```

### LinkBind

```ts
type LinkBind = z.output<typeof linkBindSchema>;
```

### LinkIcon

```ts
type LinkIcon = z.output<typeof linkIconSchema>;
```

### LinkTarget

```ts
type LinkTarget = z.output<typeof linkTargetSchema>;
```

### ListMeta

```ts
type ListMeta = z.output<typeof listMetaSchema>;
```

### ListRowsQuery

```ts
type ListRowsQuery = z.output<typeof listRowsQuerySchema>;
```

### LookupEntry

```ts
type LookupEntry = z.output<typeof lookupEntrySchema>;
```

### LookupQuery

```ts
type LookupQuery = z.output<typeof lookupQuerySchema>;
```

### LookupResponse

```ts
type LookupResponse = z.output<typeof lookupResponseSchema>;
```

### NavLink

```ts
type NavLink = z.output<typeof navLinkSchema>;
```

### PaginatedRows

```ts
type PaginatedRows = z.output<typeof paginatedRowsSchema>;
```

### ProjectInfo

```ts
type ProjectInfo = z.output<typeof projectInfoSchema>;
```

### Row

```ts
type Row = z.output<typeof rowSchema>;
```

### ServerInferRequest

Re-exported from `@sapporta/rest-core`. See that package for its declaration.

### ServerInferResponseBody

Re-exported from `@sapporta/rest-core`. See that package for its declaration.

### ServerInferResponses

Re-exported from `@sapporta/rest-core`. See that package for its declaration.

### SingleRow

```ts
type SingleRow = z.output<typeof singleRowSchema>;
```

### SwitchActiveWorkspaceBody

```ts
type SwitchActiveWorkspaceBody = z.output<typeof switchActiveWorkspaceBodySchema>;
```

### TableSchema

```ts
type TableSchema = z.output<typeof tableSchemaSchema>;
```

### UiContract

```ts
type UiContract = typeof uiContract;
```

### UpdateWorkspaceTimeZoneBody

```ts
type UpdateWorkspaceTimeZoneBody = z.output<typeof updateWorkspaceTimeZoneBodySchema>;
```
