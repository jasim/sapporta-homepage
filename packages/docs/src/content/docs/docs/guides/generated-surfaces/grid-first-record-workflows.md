---
title: "Grid-first record workflows"
description:
  "Choose generated tables, TGrid, or BaseGrid from the owner of the rows and the work performed on them."
---

A grid is not one abstraction in Sapporta. The generated table screen, TGrid,
and BaseGrid preserve different amounts of table meaning. Choose the layer from
the owner of the rows, then choose an interaction preset from the work a person
performs.

## Choose who owns the rows

| Rows and workflow | Surface |
| --- | --- |
| Registered table; standard list, edit, and export | Generated table route |
| Registered table; custom columns, hierarchy, query, or layout | TGrid |
| Application projection, temporary draft, or composite row model | BaseGrid |

The generated route is the default because it already has table metadata,
lookups, generated clients, URL query state, record links, and row-safe writes.
TGrid retains those table services while the application chooses the
composition. BaseGrid starts from an application-owned schema and data source.
`ColumnPreset` can add Sapporta's standard editors and codecs to BaseGrid, but
it does not turn application rows into registered table rows.

Use ordinary controls for singleton values and compact panels around a Grid. A
two-field form does not become clearer when represented as rows and columns.

## Choose how selection means

The interaction preset decides what arrow keys, Enter, double-click, and
selection mean before a custom cell handles them. Presets configure interaction;
the application still renders any side panel or master-detail layout.

| Preset | Primary use |
| --- | --- |
| `CELL_EDITING_GRID` | Spreadsheet-style entry |
| `CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION` | Cell editing plus bulk row actions |
| `CELL_PRIMARY_WITH_SIDE_PANEL_ROW` | Detail follows the cell cursor |
| `CELL_PRIMARY_WITH_SELECTED_SIDE_PANEL_ROW` | Detail stays on a selected row |
| `ROW_PRIMARY_MASTER_DETAIL` | Row navigation and hierarchy |
| `ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION` | Row navigation plus Enter or double-click action |
| `ROW_MULTISELECT_LIST` | Command-oriented bulk work |

Cell selection owns focus, ranges, copy, and editing. Row selection identifies
records for a panel or bulk operation. The active row identifies one current
record. These states may point at the same row, but they are not synonyms.

React code reads runtime-backed state through hooks. Application commands use
activation events or runtime operations:

```tsx
import {
  useActiveRow,
  useSelectedRowIds,
  type GridPath,
} from "@sapporta/grid";

function RowContext({ path }: { path: GridPath }) {
  const active = useActiveRow(path);
  const selected = useSelectedRowIds(path);

  return (
    <span>
      {active ? `${selected.length} selected` : "No active row"}
    </span>
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
            columns: (columns) => [
              columns.table("name", { edit: "none" }),
            ],
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
loads lookup labels and disposes lifecycle resources for the raw session.

For a full route with URL query state, use `TableGridView` or compose
`useTableGridUrlState()` and pass its seeds and change handler to
`useTGridSession()`. Setting `urlSync` in the definition only declares that a
query may participate in this composition; it does not read or write the URL by
itself.

Table column builders retain the schema's semantic codec, select options,
lookup behavior, formatting, copy behavior, and save client. A column may
replace one renderer or save operation without replacing the rest of the table
boundary:

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

## Use BaseGrid for application rows

A temporary invoice or meal draft does not yet belong to one persisted table.
BaseGrid can own those rows until one app-owned endpoint accepts the complete
document.

```tsx
import { useEffect, useMemo } from "react";
import {
  CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION,
  GridLevel,
  GridRuntimeProvider,
  createGridRuntime,
  inMemoryGridDataSource,
  useGridRuntimeEffect,
  type GridSchema,
} from "@sapporta/grid";
import { currency, number, text } from "@sapporta/grid/column-preset";

const schema = {
  rootLevel: "items",
  levels: {
    items: {
      name: "items",
      childLevels: [],
      columns: [
        text({ id: "name", name: "Item", edit: "default" }),
        number({ id: "quantity", name: "Qty", edit: "default" }),
        currency({ id: "unit_price", name: "Unit price", edit: "default" }),
      ],
      options: { allowPhantoms: true },
    },
  },
} satisfies GridSchema;

export function LineItemDraft() {
  const dataSource = useMemo(
    () =>
      inMemoryGridDataSource({
        schema,
        tree: [],
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

  return (
    <GridRuntimeProvider runtime={runtime}>
      <GridLevel path={runtime.root.path} />
    </GridRuntimeProvider>
  );
}
```

`useGridRuntimeEffect()` disposes the runtime with the component. Phantom rows
keep draft identity through editing and failure. Before final submit, commit the
drafts, derive the domain request, and send the whole document to an app-owned
endpoint. That endpoint owns validation and the multi-table transaction.

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
