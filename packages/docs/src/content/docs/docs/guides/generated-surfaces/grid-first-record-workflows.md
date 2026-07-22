---
title: "Grid-first record workflows"
description:
  "Choose generated tables, TGrid, or BaseGrid and select the interaction model
  for a record workflow."
---

This page chooses a Grid layer, interaction preset, and persistence boundary for
record-heavy workflows. You will compare generated tables, TGrid, and BaseGrid,
then build persisted hierarchies, selected-row panels, custom columns, and
temporary line-item drafts. These patterns support planning boards, bulk-action
queues, master-detail explorers, and transaction forms without forcing every
workflow into the same row model.

```text
Help me choose the right Sapporta Grid for this workflow. Tell me who owns the rows, pick an interaction preset, and keep persistence and authorization in the application layer.
```

## Surface decision

| Workflow                            | Preferred surface                        | Interaction                                       |
| ----------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| Ordinary editable table             | Generated table surface                  | Generated default                                 |
| Tailored persisted record grid      | TGrid                                    | Cell-grid or row-list based on the workflow       |
| Persisted parent-child hierarchy    | TGrid                                    | Row-primary preset or a cell-grid preset           |
| Editable grid with a detail panel   | TGrid first; BaseGrid for app-owned rows | Side-panel preset                                 |
| Bulk action worklist                | TGrid or BaseGrid                        | Independent multi-row selection                   |
| Temporary multi-line workflow draft | BaseGrid with ColumnPreset               | Cell editing or row-first selection               |
| Custom calculated workbench         | BaseGrid with ColumnPreset               | Selected for the work pattern                     |

Generated table routes provide the ordinary persisted-record surface. TGrid
retains table metadata, lookups, row-safe generated clients, record links, and
hierarchy. BaseGrid owns rows supplied by the application. ColumnPreset adds
standard editors and value codecs to BaseGrid.

Conventional controls still fit compact headers, singleton values, and
specialized panels around a Grid.

<!--
Screenshot brief
Suggested asset: grid-surface-comparison.png
Setup: Prepare three routes with the same task domain: the generated tasks table, the persisted ProjectTaskGrid TGrid example from this page, and the MealDraft BaseGrid example with two unsaved lines.
Frame: Capture a labeled three-panel composite at equal scale. Keep each toolbar or action row visible and crop navigation that does not help the comparison.
Visible proof: The generated surface shows ordinary table CRUD, TGrid shows persisted parent-child rows, and BaseGrid shows application-owned phantom draft rows with Add line and Save meal actions.
Alt text: Side-by-side comparison of a generated table, persisted hierarchical TGrid, and application-owned BaseGrid draft.
-->

## Interaction decision

Choose the interaction before custom cells, side panels, and toolbar actions.

| Preset                                      | Record workflow                                        |
| ------------------------------------------- | ------------------------------------------------------ |
| `CELL_EDITING_GRID`                         | Spreadsheet-style editing and rapid keyboard entry     |
| `CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION`  | Editable cells with separate bulk row selection        |
| `CELL_PRIMARY_WITH_SIDE_PANEL_ROW`          | A detail panel that follows the cell cursor row        |
| `CELL_PRIMARY_WITH_SELECTED_SIDE_PANEL_ROW` | A detail panel pinned to an independently selected row |
| `ROW_PRIMARY_MASTER_DETAIL`                 | Row-first hierarchy and master-detail navigation       |
| `ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION` | Row-first navigation plus an Enter/double-click action  |
| `ROW_MULTISELECT_LIST`                      | Command-oriented worklists and bulk row operations     |

Cell selection controls focus, rectangular ranges, copy, and spreadsheet
editing. Row selection identifies records for panels, delete commands, bulk
actions, and cross-level operations. The active row identifies one current
record for application context. `GridRuntime.activeRow()` resolves that value
across expanded paths, while `GridLevelRuntime` exposes path-local active-row
and selected-row reads. `GridRuntime.rowOperations` coordinates selected data
rows across expanded paths.

React components use runtime-backed row hooks. Non-React hosts use the matching
level reads and subscriptions.

```tsx
import {
  useActiveRow,
  useSelectedRowIds,
  type GridLevelRuntime,
  type GridPath,
} from "@sapporta/grid";

function RowState({ path }: { path: GridPath }) {
  const active = useActiveRow(path);
  const selected = useSelectedRowIds(path);
  return (
    <span>{active ? `${selected.length} selected` : "No active row"}</span>
  );
}

function observeRowState(level: GridLevelRuntime) {
  const readRowState = () => ({
    active: level.activeRow(),
    selected: level.selectedRowIds(),
  });

  const stopActive = level.subscribeActiveRow(readRowState);
  const stopSelected = level.subscribeSelectedRowIds(readRowState);
  return () => {
    stopActive();
    stopSelected();
  };
}
```

Call the returned cleanup when the non-React owner is disposed.

Use `useGridActiveRow()` or `runtime.subscribeActiveRow()` for a detail region
that follows the single global cursor across paths. Use the `rowActivated`
event for repeatable commands. Active-row state may stay unchanged while Enter
activates the same row again.

## Column behavior

ColumnPreset supplies standard editors and codecs. A custom column can replace
one behavior while retaining Grid editing and activation mechanics.

Built-in numeric presets retain raw text while editing and parse once at commit.
Their shared grammar accepts commas and surrounding whitespace, returns a finite
number for valid text, and preserves invalid text for the host save boundary.
Built-in select presets use a searchable combobox and commit the exact chosen
option value; the search query remains editor state.

```tsx
import type { CellEditorProps } from "@sapporta/grid";
import { parse, text } from "@sapporta/grid/column-preset";

declare function openCodePanel(code: string): void;

const formatCode = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

function CodeEditor(props: CellEditorProps) {
  const commit = (raw: string) =>
    props.commit(parse(props.column)?.(raw, props) ?? raw);

  return (
    <input
      autoFocus
      defaultValue={String(props.value ?? "")}
      onBlur={(event) => commit(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === "Escape") props.cancel();
      }}
    />
  );
}

const codeColumn = text({
  id: "code",
  name: "Code",
  edit: { editor: CodeEditor, startsOn: ["enter", "doubleClick"] },
  format: formatCode,
  parse: (value) => value.trim().toUpperCase(),
  compare: (left, right) => String(left).localeCompare(String(right)),
  renderCell: ({ value }) => <code>{formatCode(value)}</code>,
  activation: {
    startsOn: ["space"],
    describe: "Open code details",
    run: ({ value }) => openCodePanel(String(value)),
  },
});
```

The activation opens application UI. The save handler or application service
still owns persistence and domain rules.

## Persisted TGrid hierarchy

The following screen renders persisted projects and tasks. TGrid loads both
levels through generated table clients. The row-first preset makes arrow keys,
expansion, and the active row the primary navigation model.

```tsx
import { useMemo } from "react";
import { ROW_PRIMARY_MASTER_DETAIL } from "@sapporta/grid";
import { TGrid, defineTGrid, useTGridSession } from "@sapporta/frontend";
import type { TableSchema } from "@sapporta/shared/contracts";

type ProjectRow = {
  id: number;
  name: string;
};

type TaskRow = {
  id: number;
  project_id: number;
  title: string;
  status: "open" | "in_progress" | "completed";
};

type RowsByLevel = {
  projects: ProjectRow;
  "projects.tasks": TaskRow;
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
            query: { owner: "host", pageSize: 50, urlSync: true },
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
  if (!session) return null;

  return <TGrid session={session} />;
}
```

The parent relationship belongs in the application schema. This row-list example
is navigation-first, so its columns are explicitly read-only. Use a cell-grid
interaction when the same hierarchy needs inline editing. TGrid keeps
authorization in the generated table routes. Expansion registers the path-local
child runtime. Host commands can then address that child with the same identity
helpers used by BaseGrid.

```ts
import { childPath, type GridRuntime } from "@sapporta/grid";

function observeFirstProjectTasks(runtime: GridRuntime) {
  const projects = runtime.root;
  const project = projects
    .displayedRows()
    .rows.find((row) => row.kind === "data");

  if (project?.kind !== "data") return () => {};
  projects.expand(project.id);
  const tasksPath = childPath(
    projects.path,
    project.source.rowKey,
    "projects.tasks",
  );
  const tasks = runtime.level(tasksPath);
  return tasks.subscribeDisplayedRowSequence(() =>
    tasks.displayedRowSequence(),
  );
}
```

## Persisted TGrid with a selected-row panel

This screen keeps cell editing and pins a detail panel to an independently
selected row. The custom status save calls an app service and returns the
authoritative multi-field patch to TGrid.

```tsx
import { useMemo } from "react";
import {
  CELL_PRIMARY_WITH_SELECTED_SIDE_PANEL_ROW,
  GridRuntimeProvider,
  useDisplayedRow,
  useSelectedRowIds,
  type GridPath,
  type RowId,
} from "@sapporta/grid";
import {
  TGrid,
  defineTGrid,
  useTGridSession,
  type TGridCellWriteContext,
} from "@sapporta/frontend";
import type { TableSchema } from "@sapporta/shared/contracts";

type TaskRow = {
  id: number;
  title: string;
  status: "open" | "in_progress" | "completed";
  completed_at: string | null;
};

type RowsByLevel = { tasks: TaskRow };

type TaskServices = {
  setStatus(input: {
    id: number;
    status: TaskRow["status"];
  }): Promise<Pick<TaskRow, "status" | "completed_at">>;
};

async function saveStatus(
  context: TGridCellWriteContext<RowsByLevel, TaskServices, "tasks", "status">,
) {
  const patch = await context.appServices.setStatus({
    id: context.row.id,
    status: context.value,
  });
  return { kind: "patch" as const, patch };
}

function SelectedTask(props: { path: GridPath; rowId: RowId }) {
  const row = useDisplayedRow(props.path, props.rowId);
  if (row.kind !== "data") return null;
  return (
    <aside>
      <h2>{String(row.source.columns.title)}</h2>
      <p>Status: {String(row.source.columns.status)}</p>
    </aside>
  );
}

function TaskPanel(props: { path: GridPath }) {
  const selected = useSelectedRowIds(props.path);
  const rowId = selected[0];
  return rowId ? <SelectedTask path={props.path} rowId={rowId} /> : null;
}

export function TaskWorkbench(props: {
  table: TableSchema;
  services: TaskServices;
}) {
  const definition = useMemo(
    () =>
      defineTGrid<RowsByLevel, TaskServices>({
        rootLevel: "tasks",
        interaction: CELL_PRIMARY_WITH_SELECTED_SIDE_PANEL_ROW,
        levels: {
          tasks: {
            table: props.table,
            childLevels: [],
            query: { owner: "host", pageSize: 50 },
            columns: (columns) => [
              columns.table("title", { edit: "default" }),
              columns.table("status", {
                edit: "default",
                saveCellValue: saveStatus,
              }),
              columns.table("completed_at", { edit: "none" }),
            ],
          },
        },
      }),
    [props.table],
  );

  const session = useTGridSession(definition, { services: props.services });
  if (!session) return null;

  const path = session.runtime.root.path;
  return (
    <GridRuntimeProvider runtime={session.runtime}>
      <div className="grid grid-cols-[minmax(0,1fr)_20rem] gap-4">
        <TGrid session={session} />
        <TaskPanel path={path} />
      </div>
    </GridRuntimeProvider>
  );
}
```

The TGrid save result reconciles the row returned by the domain operation. The
cell renderer does not own persistence or conflict handling.

## BaseGrid line-item draft

The following screen owns temporary meal-item rows. BaseGrid keeps row identity,
editing, selection, phantom drafts, and calculated display. A final app-owned
endpoint persists the meal header and all line items as one workflow.

```tsx
import { useEffect, useMemo } from "react";
import {
  CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION,
  GridLevel,
  GridRuntimeProvider,
  createGridRuntime,
  inMemoryGridDataSource,
  useGridRuntimeEffect,
  type CellRenderProps,
  type GridSchema,
  type TreeNode,
} from "@sapporta/grid";
import {
  currency,
  number,
  rowSelectionColumn,
  text,
} from "@sapporta/grid/column-preset";

function LineTotalCell({ row }: CellRenderProps) {
  if (row.kind !== "data" && row.kind !== "phantom") return null;
  const quantity = Number(row.source.columns.quantity ?? 0);
  const unitPrice = Number(row.source.columns.unit_price ?? 0);
  return <span>{(quantity * unitPrice).toFixed(2)}</span>;
}

const schema = {
  rootLevel: "items",
  levels: {
    items: {
      name: "items",
      rowHeaderColumn: { column: "__row_selection" },
      childLevels: [],
      columns: [
        rowSelectionColumn(),
        text({ id: "name", name: "Item", edit: "default" }),
        number({ id: "quantity", name: "Qty", edit: "default" }),
        currency({ id: "unit_price", name: "Unit price", edit: "default" }),
        currency({
          id: "line_total",
          name: "Total",
          edit: "none",
          renderCell: LineTotalCell,
        }),
      ],
      options: { allowPhantoms: true },
    },
  },
} satisfies GridSchema;

const initialRows: TreeNode[] = [];

export function MealDraft(props: {
  submitMeal(input: {
    name: string;
    items: Array<{ name: string; quantity: number; unit_price: number }>;
  }): Promise<void>;
}) {
  const dataSource = useMemo(
    () =>
      inMemoryGridDataSource({
        schema,
        tree: initialRows,
        levels: {
          items: {
            sortMode: "none",
            filterMode: "none",
            paginationMode: "none",
          },
        },
      }),
    [],
  );

  const runtime = useGridRuntimeEffect(
    () =>
      createGridRuntime({
        schema,
        dataSource,
        interaction: CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION,
      }),
    [dataSource],
  );

  useEffect(() => {
    if (!runtime || runtime.root.drafts.get().length > 0) return;
    runtime.root.drafts.add("new-item", {
      name: "",
      quantity: 1,
      unit_price: 0,
    });
  }, [runtime]);

  if (!runtime) return null;
  const activeRuntime = runtime;

  function addLine() {
    activeRuntime.root.drafts.add(crypto.randomUUID(), {
      name: "",
      quantity: 1,
      unit_price: 0,
    });
  }

  async function removeSelectedRows() {
    const selectedRowIds = activeRuntime.root.selectedRowIds();
    for (const rowId of selectedRowIds) {
      const row = activeRuntime.root.displayedRow(rowId);
      if (row?.kind === "phantom") {
        activeRuntime.root.drafts.remove(row.source.rowKey);
      }
    }

    const targets = activeRuntime.rowOperations.selectedDataTargets();
    await activeRuntime.rowOperations.remove(targets);
  }

  async function submit() {
    for (const draft of activeRuntime.root.drafts.get()) {
      await activeRuntime.root.drafts.commit(draft.rowKey);
    }

    const items = activeRuntime.root.displayedRows().rows.flatMap((row) => {
      if (row.kind !== "data") return [];
      return [
        {
          name: String(row.source.columns.name),
          quantity: Number(row.source.columns.quantity),
          unit_price: Number(row.source.columns.unit_price),
        },
      ];
    });

    await props.submitMeal({ name: "Lunch", items });
  }

  return (
    <GridRuntimeProvider runtime={activeRuntime}>
      <GridLevel path={activeRuntime.root.path} />
      <div className="flex gap-2">
        <button type="button" onClick={addLine}>
          Add line
        </button>
        <button type="button" onClick={removeSelectedRows}>
          Remove selected
        </button>
        <button type="button" onClick={submit}>
          Save meal
        </button>
      </div>
    </GridRuntimeProvider>
  );
}
```

`writeCell`, `applyChanges`, `createRow`, and `removeRow` remain available on
the path-local `GridLevelRuntime` for imperative commands. Phantom rows keep an
unsaved line stable through editing, saving, and failure states. The final
submit remains an application operation because the header and line items form
one domain transaction.

```ts
import type { GridRuntime } from "@sapporta/grid";

async function runGridCommands(runtime: GridRuntime) {
  const level = runtime.root;
  const first = level.displayedRows().rows.find((row) => row.kind === "data");

  if (first?.kind === "data") {
    level.writeCell({ rowId: first.id, colId: "quantity" }, 2);
    level.applyChanges([
      { rowKey: first.source.rowKey, colId: "quantity", value: 3 },
      { rowKey: first.source.rowKey, colId: "unit_price", value: 4.5 },
    ]);
  }

  await level.createRow({
    rowKey: crypto.randomUUID(),
    levelName: "items",
    columns: { name: "Apple", quantity: 1, unit_price: 0.75 },
  });
  await level.removeRow("obsolete-line");
}
```

## Persistence and authorization

Grid owns row identity, focus, editing state, selection, hierarchy, draft
display, and runtime subscriptions. Save handlers and application services own
domain validation, persistence, conflicts, and transactions. Backend endpoints
apply authentication and row scope.

Fixed filters, hidden columns, row keys, and client selection state do not form
an authorization boundary.

The examples now separate three decisions that are easy to conflate. The data
owner selects the Grid layer. The work pattern selects the interaction preset.
The save boundary selects either generated table persistence or an app-owned
domain operation. Grid continues to own row identity, focus, selection,
hierarchy, and drafts, while backend routes own authorization and transactions.

Start with the generated table route for ordinary records. Move to TGrid when
registered Sapporta tables still own the rows but the workflow needs a tailored
composition. Move to BaseGrid when the application owns the row model or a
temporary multi-record draft. From there, use the Grid reference pages below to
add keyboard behavior, deeper hierarchy, advanced rows, or custom editors
without crossing those ownership boundaries.

## Related documentation

- [Grid core model](/grid/guides/core-model/)
- [Choose a Grid layer](/grid/start/choose-a-grid-layer/)
- [Interactions](/grid/reference/interactions/)
- [Keyboard and selection](/grid/guides/keyboard-and-selection/)
- [Hierarchical grids](/grid/guides/hierarchical-grids/)
- [Columns and editors](/grid/guides/columns-and-editors/)
- [Advanced rows](/grid/guides/advanced-rows/)
- [Table-aware grids and customization](/docs/guides/generated-surfaces/table-aware-grids-and-customization/)
