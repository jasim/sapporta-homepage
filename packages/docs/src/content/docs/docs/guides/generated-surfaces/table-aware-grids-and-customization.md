---
title: "Table-aware grids and customization"
description:
  "Choose the highest-level Sapporta table grid and customize it without losing
  table behavior."
---

This page moves from the generated table route to a tailored persisted-record
Grid. You will reorder task columns and keep schema metadata, lookups, row-safe
generated clients, URL query state, and record navigation. This layer fits
workbenches, triage queues, and master-detail screens that still operate on
registered Sapporta tables.

```text
Turn my tasks table into a focused workbench. Keep Sapporta lookups, scoped saves, and URL query state, but show title, status, priority, and due date in my order.
```

## Choose the highest useful layer

Use the generated table surface while its standard presentation fits. Use
`SchemaTableGridView` or `TGrid` when persisted Sapporta tables still own the
records but the page needs different columns, query defaults, saves, hierarchy,
or interaction. Use `BaseGrid` when the application owns temporary rows, a
composite draft, a projection, or a custom data source.

The following TGrid keeps the task table contract while choosing a focused set
of columns:

```tsx
import { useMemo } from "react";
import { CELL_EDITING_GRID } from "@sapporta/grid";
import { TGrid, defineTGrid, useTGridSession } from "@sapporta/frontend";
import type { TableSchema } from "@sapporta/shared/contracts";

type TaskRow = {
  id: number;
  title: string;
  status: "open" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
};

type RowsByLevel = { tasks: TaskRow };

export function TaskWorkbench({ table }: { table: TableSchema }) {
  const definition = useMemo(
    () =>
      defineTGrid<RowsByLevel>({
        rootLevel: "tasks",
        interaction: CELL_EDITING_GRID,
        levels: {
          tasks: {
            table,
            childLevels: [],
            query: { owner: "host", pageSize: 50, urlSync: true },
            columns: (columns) => [
              columns.table("title", { edit: "default" }),
              columns.table("status", { edit: "default" }),
              columns.table("priority", { edit: "default" }),
              columns.table("due_date", { edit: "default" }),
            ],
          },
        },
      }),
    [table],
  );

  const session = useTGridSession(definition);
  if (!session) return null;

  return <TGrid session={session} />;
}
```

`useTGridSession()` owns runtime construction, table queries, services, and
disposal with the React lifecycle. `owner: "host"` makes this screen own the
root query. `urlSync: true` keeps supported search, filters, sort, and
pagination shareable.

Table column builders retain the schema's select options, semantic codecs,
lookup behavior, formatting, copy behavior, and save client. A custom renderer
or editor can replace one behavior without replacing the table boundary.

Select-backed columns use the searchable ColumnPreset combobox and commit only
the chosen option. Numeric columns keep raw editor text until commit, then the
table adapter decodes it with the column's required semantic `kind`. Clearing a
non-text cell becomes an explicit `null`; omitting a field leaves it unchanged.
Invalid text is preserved for authoritative server validation rather than being
silently rewritten.

Inside TGrid cell and save callbacks, use `context.level` for the path-bound
`GridLevelRuntime`. It owns the current path's rows, selection, expansion,
query, and writes. Use `context.runtime` for grid-wide events, level
enumeration, and cross-path row operations.

## Build a master-detail view

A master-detail screen uses active-row state for the current preview and row
activation for the next workflow action. These are separate channels. Arrow
movement changes the preview. Enter or double-click can open an edit route even
when the row did not change.

```tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION } from "@sapporta/grid";
import {
  TGrid,
  defineTGrid,
  useTGridActiveRow,
  useTGridSession,
} from "@sapporta/frontend";
import type { TableSchema } from "@sapporta/shared/contracts";

type TaskRow = {
  id: number;
  title: string;
  status: "open" | "in_progress" | "completed";
  description: string | null;
};

type RowsByLevel = { tasks: TaskRow };

export function TaskBrowser({ table }: { table: TableSchema }) {
  const navigate = useNavigate();
  const definition = useMemo(
    () =>
      defineTGrid<RowsByLevel>({
        rootLevel: "tasks",
        interaction: ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION,
        levels: {
          tasks: {
            table,
            childLevels: [],
            rowHeaderColumn: "none",
            query: { owner: "host", pageSize: 50, urlSync: true },
            columns: (columns) => [
              columns.table("title", { edit: "none" }),
              columns.table("status", { edit: "none" }),
            ],
          },
        },
      }),
    [table],
  );

  const session = useTGridSession(definition);
  const activeRow = useTGridActiveRow(session);
  if (!session) return null;

  const task =
    activeRow?.kind === "data" && activeRow.levelId === "tasks"
      ? activeRow.values
      : null;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_22rem] gap-4">
      <TGrid
        session={session}
        onRowActivate={({ activeRow: activated }) => {
          if (activated.kind === "data" && activated.levelId === "tasks") {
            navigate(`/tasks/${activated.values.id}/edit`);
          }
        }}
      />
      <aside aria-live="polite">
        {task ? (
          <>
            <h2>{task.title}</h2>
            <p>{task.description ?? "No description."}</p>
          </>
        ) : (
          <p>Select a task.</p>
        )}
      </aside>
    </div>
  );
}
```

`useTGridActiveRow()` updates for cursor movement and displayed-value changes.
It already represents React state and should not be mirrored into local state.
The active row may be a structural or draft row, so the example narrows both
`kind` and `levelId` before using the typed record values.

The activation callback runs only for gestures enabled by the interaction.
`ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION` uses Enter and double-click for row
activation and left/right for hierarchy expansion. The callback remains an
event handler because activating the same row twice must run the action twice.

Row selection remains independent. Use selected-row APIs for bulk actions and
operation targets. Use the active row for one current preview.

<!--
Screenshot brief
Suggested asset: custom-task-tgrid-workbench.png
Setup: Mount TaskWorkbench on a protected frontend route, load at least five tasks, then edit one status and apply one URL-synced filter.
Frame: Capture the complete workbench, its reordered columns, active edited cell, query toolbar, and browser URL.
Visible proof: Title, status, priority, and due date appear in the chosen order; the status combobox searches and commits a declared option; the URL contains the active query; no workspace field is exposed.
Alt text: Customized table-aware task Grid retaining generated editing and URL query behavior.
-->

The specialized workbench now changes presentation and interaction without
rebuilding table loading, saves, lookups, query state, or authorization in
React. Fixed filters and hidden columns remain product constraints; generated
routes still enforce row access on the server. For hierarchy, side panels, bulk
selection, and temporary multi-line drafts, continue with the Grid-first
workflow guide.

## Related reference

- [Grid-first record workflows](/docs/guides/generated-surfaces/grid-first-record-workflows/)
- [TGrid](/docs/reference/frontend/tgrid/)
- [Grid interactions](/grid/reference/interactions/)
- [Choose a Grid layer](/grid/start/choose-a-grid-layer/)
