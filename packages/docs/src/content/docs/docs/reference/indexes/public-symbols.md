---
title: "Public symbols"
description: "Find canonical reference owners for Sapporta package exports."
---

## Identity

Package/export index checked against the linked Sapporta package export maps.

## Contract

- `@sapporta/server`: `sapportaTable`, `tableApiZod`, `tableWriteZod`,
  `zodForColumnValue`, `parseTableWrite`, `columnBySqlName`,
  `columnPropertyName`, schema/auth helpers, `scopedRows`, `ScopedRows`,
  `TableRow`, `TableColumn`, `RowsQuery`, `RowsOrderBy`, `FindManyRowsInput`,
  `PageRowsInput`, `PageRowsResult`, the `LookupRows*Input` family,
  `CountRowsInput`, `CountRowsByInput`, `GroupCount`, `scanTableRows`,
  `TableRowScanInput`, `TableRowScanOrder`, `resolvePageQuery`,
  `resolveExportQuery`, `resolveLookupQuery`, `resolveCountQuery`,
  `ResolvedCountQuery`, `ResolveRowsQueryOptions`, `TsRestApi`, `initContract`,
  migration readiness, and project loading.
- `@sapporta/server/errors`: the whole error vocabulary — `ErrorCode`,
  `ErrorCodeValue`, `OperationError`, `ValidationError`, `QueryParseError`, and
  SQLite error classification.
- `@sapporta/server/testing`: `createTestDb` and `createTestConnection`. Test
  utilities live only here; they are not on the production root export.
- `@sapporta/shared`: Temporal/filter/date-range/value helpers,
  `CountGroupValue`, `GroupCount`, `DEFAULT_COUNT_GROUP_LIMIT`,
  `MAX_COUNT_GROUPS`, `QueryParamValue`, `QueryParamRecord`,
  `appendQueryParam()`, `queryParamRecordToSearchParams()`,
  `isQueryParamRecord()`, `hasRepeatedQueryParams()`, and browser-safe subpaths
  for contracts, clients, grid datasets, errors, and validation, including table
  query schemas and bounds, `FieldIssue`, `fieldIssuesFromZodError()`, and
  `apiProblemFromBody()`.
- `@sapporta/shared/record-id`: `RecordId` and `toRecordId()`, the address
  boundary for a primary key in a URL segment, query key, or grid row key.
- `@sapporta/frontend`: app shell, auth, generated record surfaces,
  metadata-derived form fields, submission-error helpers, generated table query
  options and keys, `buildTableSelectionQuery()`, `buildTableRowsQuery()`,
  TGrid, report components, lookups, and platform helpers.
- `@sapporta/frontend/lookup`: `useLookupStore()`, `useTableLookup()`, and
  `LookupPicker`, generic over the target table's primary-key type.
- `@sapporta/frontend/layout` and `@sapporta/frontend/shell`: `AppPage`,
  `PageFrame`, `PageHeader`, `PageHeaderButton`, `PageBody`, `SidebarProvider`,
  `SidebarRegion`, `SidebarShell`, `SidebarToggle`, and `useSidebar()`.
- `@sapporta/grid`: standalone GridCore runtime/React APIs, grid-wide active-row
  state, row-activation events, ColumnPreset, `parseNumericInput`, lookup, and
  CSS subpaths; see standalone Grid Reference.

## Related documentation

- [Generated and client values](/docs/reference/schema/semantic-values/generated-and-client-values/)
- [Server write values and contracts](/docs/reference/schema/semantic-values/server-write-values-and-contracts/)
- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
- [App shell, routes, and navigation](/docs/reference/frontend/app-shell-routes-and-navigation/)
- [Table query options](/docs/reference/frontend/table-query-options/)
- [TGrid](/docs/reference/frontend/tgrid/)
- [Grid reference](/grid/reference/)
