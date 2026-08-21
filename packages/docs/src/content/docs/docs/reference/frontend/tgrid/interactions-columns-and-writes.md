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
then render `TGrid` with the returned session inside the application-owned
layout.

## Column and write behavior

- The table adapter composes `ColumnSchema.kind` with ColumnPreset draft parsers
  at cell commit.
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

Direct GridCore and ColumnPreset contracts live in the standalone Grid
Reference.

## Related documentation

- [Definitions, sessions, and queries](/docs/reference/frontend/tgrid/definitions-sessions-and-queries/)
- [Generated and client values](/docs/reference/schema/semantic-values/generated-and-client-values/)
- [Grid interactions](/grid/reference/interactions/)
- [ColumnPreset](/grid/reference/column-preset/)
