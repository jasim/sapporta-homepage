---
title: "TGrid definitions, sessions, and queries"
description:
  "Define table-aware grids and tree levels, own React or host sessions, use
  session refs, and inspect or change loaded-row query state."
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
- `useSchemaTableGrid()` exposes the session when an application composition
  needs schema-derived defaults plus active-row or activation behavior.

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
or an application endpoint when the row may not be loaded on the current page.

Host-owned query state supplies visible controls and URL state. Source-owned
query state belongs to a relationship source. `fixedFilters` affect row loads
and CSV exports but are not editable filter state. Row loads send a level's
parent-row constraint and `fixedFilters` as
[`fixed` conditions](/docs/reference/http/query-syntax/#fixed-conditions), and
the user's filters and search as `filter` conditions and `q`. CSV exports send
all of them as `filter` conditions. Client query constraints do not enforce
authorization.

## Tree levels

A level whose table declares `meta.tree` shows its rows as one indented tree.
The level's `tree` option adjusts that:

```ts
type TGridLevelTreeConfig = false | Partial<TableTree>;
```

- Leave `tree` out to follow the table's declared tree.
- `tree: false` shows a tree table as a flat, paged list, for example inside a
  picker.
- An object overrides single fields of the declared tree: `parentColumn`,
  `column`, `defaultExpanded`, or `matchContext`.
- A table without `meta.tree` can opt in by naming `parentColumn`. The level
  then builds the tree in the browser, and a search returns only the matching
  rows, because the server walks only a tree the table declares.

A tree level declares no `childLevels`; `defineTGrid()` throws when it does, and
when `parentColumn` is not a column of the table. The hierarchy is shown in the
declared `column` when the level shows it, otherwise in the card title column,
otherwise in the first column. `session.levelInfoById[level].tree` is the
resolved `TableTree` with the column actually used, or `null` for a flat level.

A tree level reads every row in one request so it can build the whole tree: the
first page at `MAX_PAGE_SIZE` (1,000) rows. `TGridLevelInfo.pagination` is
`"all"` for a tree level and `"pages"` for a flat one. Query state,
`setLevelPage()`, URL state, and `useTableLevelPager()` follow it, so a custom
page built from the table hooks shows a tree on one page.

When the table declares the same tree, each row load sends the level's
`matchContext` as the `tree` mode. A filter or search then keeps each match's
ancestors, and by default its subtree, inside the level's fixed conditions.
`useTGridSourceStatus(session).treeResult` reports the last load as a
`TGridTreeResult`:

- `matchCount`: rows that match the filter or search themselves, or `null` when
  neither is active;
- `loadedRowCount`: rows the load returned;
- `truncated`: `true` when the table holds more rows than one load returns, so
  the tree may be missing rows.

`treeResult` is `null` for a flat level and before the first load.

## Related documentation

- [Interactions, columns, and writes](/docs/reference/frontend/tgrid/interactions-columns-and-writes/)
- [Table query cache keys and ownership](/docs/reference/frontend/table-queries/cache-keys-and-ownership/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Show a table as a tree](/docs/guides/model-data/show-a-table-as-a-tree/)
- [Grid reference](/grid/reference/)
