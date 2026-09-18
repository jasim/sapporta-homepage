---
title: "TGrid interactions, columns, and writes"
description:
  "Use typed active rows, semantic activation events, interaction configuration,
  and table-aware column write behavior."
---

## Active row

TGrid projects the standalone `GridActiveRow` into the session's `RowsByLevel`
mapping. Each projection includes the row's identity and kind-specific
properties plus `levelId`, `values`, `level`, and `runtime`.

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
disappears, or its displayed values change. Render a detail region directly from
it.

Non-React owners use `session.activeRow()` and
`session.subscribeActiveRow(listener)`. Snapshots preserve identity until active
identity or displayed values change.

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
hierarchy expansion. Custom configurations use `activeRow.activation.startsOn`.

`SchemaTableGridView` accepts an interaction configuration but does not expose
active-row state or activation callbacks as props. Use `useSchemaTableGrid()`,
then render `TGrid` with the returned session inside the application layout.

## Column and write behavior

- The table adapter composes `ColumnSchema.kind` with ColumnPreset draft parsers
  at cell commit.
- Numeric drafts become finite numbers. Clearing a non-text cell becomes an
  explicit `null`. An untouched field remains absent from the patch. Empty text
  remains `""`.
- Invalid editor text remains available to the editor and reaches the
  authoritative server validation boundary.
- Select-backed columns preserve exact option identity, and render their value
  as plain text.
- `date` and `timestamp` are separate presets, chosen from the column's declared
  kind. A date cell renders `2026-08-23`; a timestamp cell renders
  `2026-08-23 16:38` in the active workspace's time zone and describes the full
  moment on hover.
- The timestamp preset offers no date-picker editor. An `<input type="date">`
  has nowhere to put the time component and would drop it on commit.
- Cell renderers, activations, editors, copy handlers, and write handlers
  receive a path-bound `GridLevelRuntime` as `context.level`.
- `context.runtime` contains grid-wide schema, events, registered levels,
  active-row state, and cross-path row operations.

## Tree rows

On a
[tree level](/docs/reference/frontend/tgrid/definitions-sessions-and-queries/#tree-levels),
TGrid wraps the tree column with `withTreeColumn`. The column indents each row
by its depth and shows a chevron on rows with children. Space expands or
collapses the row, and Enter does the same on a cell that cannot be edited. The
Grid level declares `parentKeyValue` from the table's primary key, so a child
draft stores its parent key with the column's type, such as a number for an
integer id.

On a writable tree level, the row context menu offers **Add child row**. It adds
a draft under the row with the parent column filled in and, in a cell grid,
opens the tree column's editor in the draft. Leaving the draft saves it like any
new row; a draft left untouched is removed.

Rows present only because a descendant matched the filter or search carry
`data-tree-context="true"`, and the Sapporta preset renders them in the muted
foreground color.

## Column widths

`TGrid` accepts `columnSizing`, every ColumnPreset column-sizing option except
`storageKey`. TGrid stores dragged widths under
`sapporta:grid-columns:<root table>:<level>`. `minWidths` raises the floors of
the named widths, such as `{ numeric: 128 }` for currency in a larger face:

```tsx
const columnSizing = { minWidths: { numeric: 128, timestamp: 176 } };

<TGrid session={session} presentation="tabular" columnSizing={columnSizing} />;
```

Give the object a stable identity, at module level or in `useMemo`; the grid
chrome is rebuilt whenever it changes. See
[Column sizing](/docs/reference/column-sizing/#raise-the-built-in-widths).

Direct GridCore and ColumnPreset contracts live in the standalone Grid
Reference.

## Related documentation

- [Definitions, sessions, and queries](/docs/reference/frontend/tgrid/definitions-sessions-and-queries/)
- [Generated and client values](/docs/reference/schema/semantic-values/generated-and-client-values/)
- [Days and time zones](/docs/reference/server/days-and-time-zones/)
- [Grid interactions](/grid/reference/interactions/)
- [ColumnPreset](/grid/reference/column-preset/)
