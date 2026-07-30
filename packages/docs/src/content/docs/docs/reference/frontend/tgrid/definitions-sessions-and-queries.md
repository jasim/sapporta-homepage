---
title: "TGrid definitions, sessions, and queries"
description:
  "Define table-aware grids, own React or host sessions, use session refs, and
  inspect or change loaded-row query state."
---

## Identity

`TGrid` and table-grid exports come from `@sapporta/frontend`. Standalone
runtime primitives come from `@sapporta/grid`.

## Definition and lifecycle

- `defineTGrid()` declares schema-table levels, parent relationships, query
  ownership, interaction configuration, and typed column builders.
- `useTGridSession()` creates a session after React commit and disposes it on
  unmount. It returns `null` until the session exists.
- `createTGridSession()` creates a session for tests and non-React hosts. Its
  owner must call `dispose()`.
- `TGrid` renders a configured session. `TableRoute` and `SchemaTableGridView`
  connect standard table routes.
- `useSchemaTableGrid()` exposes the session when an application-owned
  composition needs schema-derived defaults plus active-row or activation
  behavior.

Table-aware clients preserve Sapporta query syntax, lookups, row saves, auth,
record navigation, CSV export, and URL query state.

## `sessionRef`

`TableGridView` and `SchemaTableGridView` accept:

```ts
sessionRef?: React.Ref<TGridSession<RowsByLevel, AppServices>>
```

Use it when another component needs to inspect or control the live session
without replacing the standard table UI—for example, to reload rows, observe
session state, coordinate selection or expansion, or reveal a deep-linked row.

The view owns and disposes the session. The ref is set after creation and
cleared to `null` when the session is replaced or released, so callback-ref
subscriptions must clean up on `null`. The parameter is also available through
`TablePageGridOptions` and `TableGridOptionsByTable`. `useTableGrid()` and
`useSchemaTableGrid()` omit it because their returned binding already contains
`session`.

## Query and loaded-row session APIs

`TGridSession` exposes:

- `getVisibleRows(levelId?, path?)` and `getLoadedRow(rowKey, levelId?, path?)`
  for rows already loaded into the Grid;
- `getQueryState(levelId?)` for host-owned query state;
- `reloadRows()`, `setLevelSort()`, `setLevelFilter()`, and `setLevelPage()` for
  path-specific table controls;
- `csvExportUrl(levelId?)` for the current fixed filters, visible filters,
  search, and sort; and
- `lookups`, `lookupForColumn`, application services, and level metadata for
  custom cells and editors.

Loaded-row reads are not database queries. Use generated table reads, public
[table read functions and options](/docs/reference/frontend/table-queries/read-functions-and-options/),
or an app-owned endpoint when the row may not be loaded on the current page.

Host-owned query state supplies visible controls and URL state. Source-owned
query state belongs to a relationship source. `fixedFilters` affect row loads
and CSV exports but are not editable filter state. Client query constraints do
not enforce authorization.

## Related documentation

- [Interactions, columns, and writes](/docs/reference/frontend/tgrid/interactions-columns-and-writes/)
- [Table query cache keys and ownership](/docs/reference/frontend/table-queries/cache-keys-and-ownership/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Grid reference](/grid/reference/)
