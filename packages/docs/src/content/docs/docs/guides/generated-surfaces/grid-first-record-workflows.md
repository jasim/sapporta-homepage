---
title: "Grid-first record workflows"
description:
  "Start here for any custom data interface: choose generated tables, TGrid, or
  BaseGrid from who owns the rows and the work performed; continue to
  table-aware customization when one registered table still owns them."
---

A grid is not one abstraction in Sapporta. The generated table screen, TGrid,
and BaseGrid preserve different amounts of table meaning. An app-owned screen is
a separate axis: it can use ordinary controls, host a TGrid or BaseGrid, or
coordinate several surfaces. Choose the row and cache owner first, then choose
the screen composition and interaction.

## Choose who owns the rows

| Need                                                                            | Surface                                 | Data or cache owner                               | Boundary                                              |
| ------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| Ordinary CRUD, filters, lookups, child collections, and export                  | Generated table screen                  | Generated table surface and server                | Keep it as the ordinary record system.                |
| Registered table with custom columns, renderers, hierarchy, or Grid composition | TGrid, normally through `TableGridView` | Table-aware Grid session                          | The rows still belong to one registered table.        |
| Temporary, composite, calculated, or browser-owned rows                         | BaseGrid, usually with `ColumnPreset`   | App-owned source and runtime                      | BaseGrid does not add generated CRUD or row security. |
| Custom route, layout, workflow, URL state, commands, or non-grid controls       | App-owned React screen                  | Screen coordinates query, Grid, and action owners | Protected routing is UX, not API authorization.       |
| Reusable, authoritative scoped aggregate                                        | App-owned report route and screen       | Server route plus typed client and query          | Server-side JavaScript is not automatically scalable. |

The generated route is the default because it already has table metadata,
lookups, generated clients, URL query state, record links, and row-safe writes.
TGrid retains those table services while the application chooses the
composition. BaseGrid starts from an application-owned schema and data source.
`ColumnPreset` can add Sapporta's standard editors and codecs to BaseGrid, but
it does not turn application rows into registered table rows.

Use ordinary controls for singleton values, forms, wizards, and compact panels
around a Grid. A two-field form does not become clearer when represented as rows
and columns. A custom screen can keep generated screens as the system of record
while adding one focused projection or command beside them.

## Choose how selection means

The interaction preset decides what arrow keys, Enter, double-click, and
selection mean before a custom cell handles them. Presets configure interaction;
the application still renders any side panel or master-detail layout.

| Preset                                      | Primary use                                      |
| ------------------------------------------- | ------------------------------------------------ |
| `CELL_EDITING_GRID`                         | Spreadsheet-style entry                          |
| `CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION`  | Cell editing plus bulk row actions               |
| `CELL_PRIMARY_WITH_SIDE_PANEL_ROW`          | Detail follows the cell cursor                   |
| `CELL_PRIMARY_WITH_SELECTED_SIDE_PANEL_ROW` | Detail stays on a selected row                   |
| `ROW_PRIMARY_MASTER_DETAIL`                 | Row navigation and hierarchy                     |
| `ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION` | Row navigation plus Enter or double-click action |
| `ROW_MULTISELECT_LIST`                      | Command-oriented bulk work                       |

Cell selection owns focus, ranges, copy, and editing. Row selection identifies
records for a panel or bulk operation. The active row identifies one current
record. These states may point at the same row, but they are not synonyms.

React code reads runtime-backed state through hooks. Application commands use
activation events or runtime operations:

```tsx
import { useActiveRow, useSelectedRowIds, type GridPath } from "@sapporta/grid";

function RowContext({ path }: { path: GridPath }) {
  const active = useActiveRow(path);
  const selected = useSelectedRowIds(path);

  return (
    <span>{active ? `${selected.length} selected` : "No active row"}</span>
  );
}
```

Use the active row for a detail region that follows navigation. Use a
`rowActivated` event for a repeatable command: pressing Enter on the same row
twice should run the command twice even though active-row state did not change.

## Keep registered records in TGrid

This definition renders projects with task children. Both levels remain
registered Sapporta tables, so TGrid can load them through generated clients and
retain their row-security boundary.

```tsx
import { useMemo } from "react";
import { ROW_PRIMARY_MASTER_DETAIL } from "@sapporta/grid";
import {
  TGrid,
  defineTGrid,
  useTGridLifecycle,
  useTGridSession,
} from "@sapporta/frontend";
import type { TableSchema } from "@sapporta/shared/contracts";

type RowsByLevel = {
  projects: { id: number; name: string };
  "projects.tasks": {
    id: number;
    project_id: number;
    title: string;
    status: "open" | "in_progress" | "completed";
  };
};

export function ProjectTaskGrid(props: {
  projects: TableSchema;
  tasks: TableSchema;
}) {
  const definition = useMemo(
    () =>
      defineTGrid<RowsByLevel>({
        rootLevel: "projects",
        interaction: ROW_PRIMARY_MASTER_DETAIL,
        levels: {
          projects: {
            table: props.projects,
            childLevels: ["projects.tasks"],
            rowHeaderColumn: "none",
            query: { owner: "host", pageSize: 50 },
            columns: (columns) => [columns.table("name", { edit: "none" })],
          },
          "projects.tasks": {
            table: props.tasks,
            parent: {
              level: "projects",
              foreignKey: "project_id",
              defaultSort: "title",
            },
            childLevels: [],
            rowHeaderColumn: "none",
            query: { owner: "source", pageSize: 25 },
            columns: (columns) => [
              columns.table("title", { edit: "none" }),
              columns.table("status", { edit: "none" }),
            ],
          },
        },
      }),
    [props.projects, props.tasks],
  );

  const session = useTGridSession(definition);
  useTGridLifecycle({ session });
  return session ? <TGrid session={session} /> : null;
}
```

`owner: "host"` gives the screen control of the root query. `owner: "source"`
lets the parent relationship provide the child predicate. `useTGridLifecycle()`
loads lookup labels and cleans up those side effects. `useTGridSession()` owns
and disposes the session itself.

Call `session.reloadRows()` from controls that already hold the session. Supply
`registerAs` to `useTGridLifecycle()` only when an external flow needs to
address this mounted root table through `reloadTGridRows()`. That registry is a
narrow command bridge; it does not own the session.

For a full route with URL query state, use `TableGridView` or compose
`useTableGridUrlState()` and pass its seeds and change handler to
`useTGridSession()`. Setting `urlSync` in the definition only declares that a
query may participate in this composition; it does not read or write the URL by
itself.

Table column builders retain the schema's semantic codec, select options, lookup
behavior, formatting, copy behavior, and save client. A column may replace one
renderer or save operation without replacing the rest of the table boundary:

```ts
columns.table("status", {
  edit: "default",
  saveCellValue: async (context) => {
    const patch = await context.appServices.setStatus({
      id: context.row.id,
      status: context.value,
    });
    return { kind: "patch", patch };
  },
});
```

The returned patch reconciles every field changed by the domain operation. The
cell editor still does not own authorization, conflict handling, or the
transaction.

## Use BaseGrid for a bounded calculated projection

Suppose a screen already owns two small generated-table reads and needs one
read-only project summary. These local rows make the bound visible: each read is
capped at 100, and the projection refuses to present complete-looking totals
when either response says more rows exist.

```tsx
import { useMemo } from "react";
import {
  CELL_GRID_WITH_ACTIVE_ROW,
  GridLevel,
  GridRuntimeProvider,
  createGridRuntime,
  inMemoryGridDataSource,
  useGridRuntimeEffect,
  type GridSchema,
  type TreeNode,
} from "@sapporta/grid";
import { number, percentage, text } from "@sapporta/grid/column-preset";

type Project = { id: string; name: string };
type Task = { id: string; projectId: string; completed: boolean };
type BoundedPage<T> = {
  data: readonly T[];
  meta: { total: number; limit: number };
};

const ROW_CAP = 100;
const projectsPage: BoundedPage<Project> = {
  data: [
    { id: "project-a", name: "Launch" },
    { id: "project-b", name: "Follow-up" },
  ],
  meta: { total: 2, limit: ROW_CAP },
};
const tasksPage: BoundedPage<Task> = {
  data: [
    { id: "task-a", projectId: "project-a", completed: true },
    { id: "task-b", projectId: "project-a", completed: false },
  ],
  meta: { total: 2, limit: ROW_CAP },
};

const schema = {
  rootLevel: "projects",
  levels: {
    projects: {
      name: "projects",
      rowHeaderColumn: "none",
      childLevels: [],
      options: {},
      columns: [
        text({ id: "name", name: "Project", edit: "none" }),
        number({ id: "tasks", name: "Tasks", edit: "none" }),
        number({ id: "completed", name: "Completed", edit: "none" }),
        percentage({
          id: "completion",
          name: "Completion",
          edit: "none",
        }),
      ],
    },
  },
} satisfies GridSchema;

export function ProjectProgressGrid() {
  const incomplete =
    projectsPage.meta.total > projectsPage.data.length ||
    tasksPage.meta.total > tasksPage.data.length;

  if (incomplete) {
    return (
      <p role="status">
        This summary is incomplete because a generated read exceeded the{" "}
        {ROW_CAP}-row cap. Use the scoped project-progress report for complete
        totals.
      </p>
    );
  }

  return <CompleteProjectProgressGrid />;
}

function CompleteProjectProgressGrid() {
  const tree = useMemo(() => {
    const countsByProject = new Map<
      string,
      { total: number; completed: number }
    >();

    for (const task of tasksPage.data) {
      const counts = countsByProject.get(task.projectId) ?? {
        total: 0,
        completed: 0,
      };
      counts.total += 1;
      if (task.completed) counts.completed += 1;
      countsByProject.set(task.projectId, counts);
    }

    return projectsPage.data.map((project) => {
      const counts = countsByProject.get(project.id) ?? {
        total: 0,
        completed: 0,
      };
      const completion =
        counts.total === 0 ? 0 : counts.completed / counts.total;

      return {
        rowKey: project.id,
        levelName: "projects",
        columns: {
          name: project.name,
          tasks: counts.total,
          completed: counts.completed,
          completion,
        },
      };
    }) satisfies TreeNode[];
  }, []);

  const runtime = useGridRuntimeEffect(
    () =>
      createGridRuntime({
        schema,
        interaction: CELL_GRID_WITH_ACTIVE_ROW,
        dataSource: inMemoryGridDataSource({
          schema,
          tree,
          levels: {
            projects: {
              readonly: true,
              sortMode: "client",
              filterMode: "none",
              paginationMode: "none",
            },
          },
        }),
      }),
    [tree],
  );

  if (!runtime) return null;

  return (
    <GridRuntimeProvider runtime={runtime}>
      <GridLevel path={runtime.root.path} />
    </GridRuntimeProvider>
  );
}
```

The pre-indexing pass avoids filtering every task once per project. The stable
project ID supplies `rowKey`; an array index or display name does not. A project
with no tasks gets the deliberate ratio `0`, and `percentage()` renders a ratio
such as `0.4` as `40%`.

Both the columns and in-memory source are read-only. The application owns the
rows and calculation; Grid owns rendering and interaction. See the
[BaseGrid reference](/grid/reference/base-grid/#construction-and-react-lifecycle)
for the exact runtime lifecycle and identity contracts.

A bounded browser projection is suitable for small, screen-local data. Put a
reusable or authoritative aggregate behind a scoped
[report route](/docs/guides/reports/route-based-reports/). Large datasets still
need scoped SQL grouping or another store-level implementation; moving the same
JavaScript loop to the server changes placement and reuse, not its complexity.

## Keep persistence on the server

The host or data source supplies stable row keys. Grid derives runtime row
identities and owns focus, editing state, selection, hierarchy, drafts, and
subscriptions. A generated table route or app-owned endpoint owns
authentication, row scope, domain validation, conflicts, and transactions.

Hidden columns, fixed client filters, row keys, and selection state are
presentation. None is an authorization boundary.

## Related documentation

- [Choose a Grid layer](/grid/start/choose-a-grid-layer/)
- [Grid core model](/grid/guides/core-model/)
- [Interactions](/grid/reference/interactions/)
- [Columns and editors](/grid/guides/columns-and-editors/)
- [Hierarchical grids](/grid/guides/hierarchical-grids/)
- [Table-aware grids and customization](/docs/guides/generated-surfaces/table-aware-grids-and-customization/)
