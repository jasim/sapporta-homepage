---
title: "TGrid"
description:
  "Look up Sapporta table-aware Grid definitions, sessions, active rows,
  activation events, routes, query controls, and services."
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
- `TGrid` renders a configured session. `TableRoute` and
  `SchemaTableGridView` connect standard table routes.
- `useSchemaTableGrid()` exposes the session when an application-owned
  composition needs schema-derived defaults plus active-row or activation
  behavior.

Table-aware clients preserve Sapporta query syntax, lookups, row saves, auth,
record navigation, CSV export, and URL query state.

## Active row

TGrid projects the standalone `GridActiveRow` into the session's
`RowsByLevel` mapping. Each projection includes the row's identity and
kind-specific properties plus `levelId`, `values`, `level`, and `runtime`.

Data rows expose a complete typed `values` object for their level. Phantom,
rollup, opening, closing, subtotal, and footer rows expose partial values.
Consumers must narrow `kind === "data"` before treating `values` as a complete
persisted record. `levelId` narrows the applicable row type in a multi-level
definition.

```tsx
const session = useTGridSession(definition);
const activeRow = useTGridActiveRow(session);

const task =
  activeRow?.kind === "data" && activeRow.levelId === "tasks"
    ? activeRow.values
    : null;
```

`useTGridActiveRow(session)` returns React state backed by the session
subscription. The value changes when the cursor moves, the active row
disappears, or its displayed values change. Render a detail region directly
from it.

Non-React owners use `session.activeRow()` and
`session.subscribeActiveRow(listener)`. Snapshots preserve identity until
active identity or displayed values change.

`TGridActiveRow<RowsByLevel>` is the exported projection type.

## Row activation

Active-row state describes the current row. Row activation reports each
configured semantic command.

```tsx
import { ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION } from "@sapporta/grid";

const definition = defineTGrid<RowsByLevel>({
  rootLevel: "tasks",
  interaction: ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION,
  levels,
});

<TGrid
  session={session}
  onRowActivate={({ activeRow, trigger }) => {
    if (activeRow.kind === "data" && activeRow.levelId === "tasks") {
      navigate(`/tasks/${activeRow.values.id}/edit`);
    }
  }}
/>;
```

`TGrid` accepts `onRowActivate`. Non-React or shared session owners use
`session.onRowActivate(handler)`. Each event contains the typed `activeRow` and
the normalized keyboard or pointer `trigger`. Repeated activation of the same
row produces repeated events.

`TGridRowActivatedEvent<RowsByLevel>` is the exported event type.

The TGrid definition owns the interaction configuration. The callback does not
enable gestures by itself. `ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION` enables
Enter and double-click, reserves Enter for activation, and retains left/right
hierarchy expansion. Custom configurations use
`activeRow.activation.startsOn`.

`SchemaTableGridView` accepts an interaction configuration but does not expose
active-row state or activation callbacks as props. Use `useSchemaTableGrid()`,
then render `TGrid` with the returned session inside the application-owned
layout.

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
[table query options](/docs/reference/frontend/table-query-options/), or an
app-owned endpoint when the row may not be loaded on the current page.

Host-owned query state supplies visible controls and URL state. Source-owned
query state belongs to a relationship source. `fixedFilters` affect row loads
and CSV exports but are not editable filter state. Client query constraints do
not enforce authorization.

## Column and write behavior

- The table adapter composes `ColumnSchema.kind` with ColumnPreset draft
  parsers at cell commit.
- Numeric drafts become finite numbers. Clearing a non-text cell becomes an
  explicit `null`. An untouched field remains absent from the patch. Empty text
  remains `""`.
- Invalid editor text remains available to the editor and reaches the
  authoritative server validation boundary.
- Select-backed columns preserve exact option identity.
- Cell renderers, activations, editors, copy handlers, and write handlers
  receive a path-bound `GridLevelRuntime` as `context.level`.
- `context.runtime` contains grid-wide schema, events, registered levels,
  active-row state, and cross-path row operations.

Direct BaseGrid and ColumnPreset contracts live in the standalone Grid
Reference.

## Related documentation

- [Master-detail and row activation](/docs/guides/generated-surfaces/table-aware-grids-and-customization/#build-a-master-detail-view)
- [Grid-first record workflows](/docs/guides/generated-surfaces/grid-first-record-workflows/)
- [Table query options](/docs/reference/frontend/table-query-options/)
- [Grid interactions](/grid/reference/interactions/)
