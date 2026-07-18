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

Inside TGrid cell and save callbacks, use `context.level` for the path-bound
`GridLevelRuntime`. It owns the current path's rows, selection, expansion,
query, and writes. Use `context.runtime` for grid-wide events, level
enumeration, and cross-path row operations.

<!--
Screenshot brief
Suggested asset: custom-task-tgrid-workbench.png
Setup: Mount TaskWorkbench on a protected frontend route, load at least five tasks, then edit one status and apply one URL-synced filter.
Frame: Capture the complete workbench, its reordered columns, active edited cell, query toolbar, and browser URL.
Visible proof: Title, status, priority, and due date appear in the chosen order; select editing still works; the URL contains the active query; no workspace field is exposed.
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
- [Choose a Grid layer](/grid/start/choose-a-grid-layer/)
