---
title: "Public symbols"
description: "Find canonical reference owners for Sapporta package exports."
---

## Identity

Package/export index checked against the linked Sapporta package export maps.

## Contract

- `@sapporta/server`: `sapportaTable`, `tableApiZod`, `tableWriteZod`,
  `zodForColumnValue`, `parseTableWrite`, `columnBySqlName`,
  `columnPropertyName`, schema/auth helpers, `scopedRows`,
  `ScopedRowsSearchOptions`, `CountRowsInput`, `CountRowsByInput`, `GroupCount`,
  `TsRestApi`, `initContract`, migration readiness, and project loading.
- `@sapporta/shared`: Temporal/filter/date-range/value helpers,
  `CountGroupValue`, `GroupCount`, `DEFAULT_COUNT_GROUP_LIMIT`,
  `MAX_COUNT_GROUPS`, and browser-safe subpaths for contracts, clients, grid
  datasets, errors, and validation, including `FieldIssue`,
  `fieldIssuesFromZodError()`, and `apiProblemFromBody()`.
- `@sapporta/frontend`: app shell, auth, generated record surfaces,
  metadata-derived form fields, submission-error helpers, generated table query
  options and keys, TGrid, report components, lookups, and platform helpers.
- `@sapporta/grid`: standalone BaseGrid runtime/React APIs, grid-wide active-row
  state, row-activation events, ColumnPreset, `parseNumericInput`, lookup, and
  CSS subpaths; see standalone Grid Reference.

## Related documentation

- [Grid reference](/grid/reference/)
