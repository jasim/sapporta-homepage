---
title: "Table-aware grids and customization"
description:
  "Change the standard table page's columns, or replace its definition, while
  retaining schema, query, lookup, and save behavior."
---

The generated table page is already a table-aware Grid. Customize that layer
when registered Sapporta tables still own the rows but the page needs a
different column set, hierarchy, toolbar, or interaction.

## Choose the full page before the raw session

Sapporta exposes three table-aware entry points:

| Entry point                          | Use                                                                   |
| ------------------------------------ | --------------------------------------------------------------------- |
| `SchemaTableGridView` or `TablePage` | Standard schema-derived table page; pass `columns` to change its columns |
| `TableGridView` or `useTableGrid`    | Custom definition with page chrome, URL state, lifecycle, and lookups |
| `TGrid` with `useTGridSession`       | Low-level session rendering inside custom chrome                      |

To change only the columns of the standard page, keep `SchemaTableGridView` and
pass [`columns`](#change-the-standard-pages-columns). The generated query state,
filters, search, sort, pagination, CSV export, lookup labels, record routes,
toolbar, and New record all stay. Reach for `TableGridView` when the page needs
its own chrome, extra levels, or a different interaction configuration.

`TableGridView` is the usual custom-page boundary. It binds query state to the
route, loads lookup labels, owns session disposal, renders loading and error
states, and supplies the standard toolbar and pager. A raw TGrid session needs
those pieces composed explicitly.

## Change the standard page's columns

`SchemaTableGridView` already gives you the whole table page: columns derived
from the table schema, query state in the URL, filters, search, sort, pagination,
CSV export, lookup labels, record routes, the toolbar, and New record. `columns`
changes only the columns and keeps all of that.

Without `columns`, a page that needed one column of its own — an "Edit" button, a
computed value, a column a fixed filter hides — could not stay on
`SchemaTableGridView`. It left for `TableGridView` and rebuilt the projection:
declare a `defineTGrid` definition, wire the route and query state by hand, and
list every schema column, keeping that list in step with the table:

```tsx
// Before: replacing the page to change one column.
const definition = defineTGrid<RowsByLevel>({
  rootLevel: "accounts",
  interaction: CELL_EDITING_GRID,
  levels: {
    accounts: {
      table,
      childLevels: [],
      query: { owner: "host", pageSize: 50, urlSync: true },
      columns: (columns) => [
        columns.table("id"),
        columns.table("name", { edit: "default" }),
        columns.table("status", { edit: "default" }),
        columns.table("created_at"),
        // ...every other schema column, and every column added later.
      ],
    },
  },
});

<TableGridView definition={definition} table={table} route={route} />;
```

Now the same page keeps the standard view and names only what differs. This
Accounts page shows every schema column, then an "Edit" column that opens the
application's own dialog:

```tsx
import { useMemo, useState } from "react";
import {
  TablePage,
  type TablePageGridOptions,
  type TGridCellRenderContext,
  type SchemaTableRowsByLevel,
} from "@sapporta/frontend";

type AccountRow = Record<string, unknown>;

export function AccountsPage() {
  const [editing, setEditing] = useState<AccountRow | null>(null);
  // A new `columns` value rebuilds the grid. `setEditing` never changes, so
  // the options are built once.
  const gridOptions = useMemo<TablePageGridOptions>(
    () => ({
      columns: (columns) => [
        columns.remainingTable(),
        columns.client("edit", {
          label: "",
          width: 72,
          renderCell: EditButton,
          activation: {
            startsOn: ["click", "enter"],
            describe: "Edit account",
            run: ({ row }) => setEditing(row),
          },
        }),
      ],
    }),
    [],
  );

  return (
    <>
      <TablePage tableName="accounts" gridOptions={gridOptions} />
      {editing && (
        <EditAccountDialog account={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}

function EditButton(
  _context: TGridCellRenderContext<SchemaTableRowsByLevel, unknown, string>,
) {
  return <span>Edit</span>;
}
```

`columns` takes the same spec list or builder callback as a `defineTGrid` level,
so the root table's columns are described the same way whether the standard page
uses them or an application definition does (see
[Define the table projection](#define-the-table-projection)). The list is read in
order:

- `columns.remainingTable()` adds, in schema order, the visible table columns
  that the list does not name with `columns.table()`.
- `exclude` leaves columns out of this view, such as a column a fixed filter
  holds to one value. Other views of the table still show it.
- `columnOptions` gives some of the added columns the options `columns.table()`
  takes, such as `renderCell` or `edit: "none"`. Those columns keep their schema
  position.
- `columns.table()` places a column where it appears in the list, before or
  after `remainingTable()`. `[columns.remainingTable(), columns.table("notes")]`
  moves `notes` to the end.
- `columns.client()` adds an application column where it appears in the list.
  Its `renderCell` and `activation` receive the row as `row`.

This one leaves two columns out and changes two others in place:

```ts
import type { SchemaTableColumns } from "@sapporta/frontend";

const DRAFT_COLUMNS: SchemaTableColumns = (columns) => [
  columns.remainingTable({
    exclude: ["created_at", "updated_at"],
    columnOptions: {
      comment: { minWidth: 24, renderCell: CommentCell },
      source_narration: { minWidth: 40 },
    },
  }),
];
```

Keep the value stable: declare it as a module constant, as above, or build it
with `useMemo` when it uses page state. A new value rebuilds the grid, which
reloads its rows and collapses expanded rows.

The grid checks the columns when it builds, not when `defineTGrid` is called:
`expandTGridColumnSpecs` throws an error naming the level and the table when a
name is not a column of the table, when `columnOptions` names a column that
`remainingTable()` does not add, when a client column's id is the name of a
table column, or when a column would be shown twice. It is exported for an
application that compiles a level's columns itself.

## Define the table projection

Reach for `defineTGrid` and `TableGridView` when the page supplies its own
chrome, extra levels, a custom interaction configuration, or a projection that
is not the table's own columns. To change only the columns of the standard page,
use [`columns`](#change-the-standard-pages-columns) instead.

This workbench retains the `tasks` table contract while selecting and ordering
four columns:

```tsx
import { useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CELL_EDITING_GRID } from "@sapporta/grid";
import { TableGridView, defineTGrid } from "@sapporta/frontend";
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
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  return (
    <TableGridView
      definition={definition}
      table={table}
      route={{
        path: location.pathname,
        searchParams,
        navigate,
      }}
      registerAs="tasks"
      onNewRecord={() => navigate("/tables/tasks/new")}
    />
  );
}
```

`urlSync: true` declares that the root query participates in URL state.
`TableGridView` performs the actual binding by passing route seeds and a query
change handler into the session. Search, filters, sort, and pagination therefore
survive reload and browser navigation.

Table column builders retain semantic codecs, select options, foreign-key
lookups, formatting, copy behavior, and the generated save client. The
application can replace one behavior without rebuilding the table boundary:

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

A custom writer may return a value, patch, row, or reload instruction. The
returned result reconciles the visible row with the authoritative server result.
The server operation still owns its ability check, row scope, validation, and
transaction.

Column definitions may also use `columns.client()` for application-computed
values and `columns.remainingTable()` for the schema columns not named
explicitly.


## Embed a grid in a page that already names it

Pass `header="toolbar"` when the grid sits inside a surface that already shows
the table's name, such as a tab under a record's header or a split panel. On a
wide layout the header becomes one row: the filter cards lead, then the
application's actions, search, clear sort, delete, **New record**, the view
switch, and Export as an icon. It wraps to a second row only when they do not
fit, and renders no title, no record count, and does not set the browser tab's
title. On a narrow layout the title row goes away and its **New record** and
**More** buttons join the search row.

`SchemaTableGridView` and `TableGridView` take the prop (`header`, default
`"page"`), `TablePage` passes it through `gridOptions`, and the exported
`TableGridHeaderVariant` names the two values. The hooks `useSchemaTableGrid`
and `useTableGrid` do not take it.

## Access the live session without replacing the table page

Pass `sessionRef` when the surrounding component needs to inspect or control the
live `TGridSession` while retaining the standard `TableGridView` UI. This covers
custom controls and observers, coordinating selection or expansion, and cases
such as revealing a deep-linked row after it loads.

```tsx
const sessionRef = useRef<TGridSession<RowsByLevel> | null>(null);
<TableGridView {...props} sessionRef={sessionRef} />; // Later: sessionRef.current?.reloadRows()
```

The view owns and disposes the session, so consumers must treat it as borrowed.
Use a stable callback ref when attaching subscriptions and release them when the
callback receives `null`. `SchemaTableGridView`, `TablePageGridOptions`, and
`TableGridOptionsByTable` expose the same parameter. The corresponding hooks do
not need it because their returned binding already contains `session`.

## Drop lower only for custom chrome

Use `useTableGrid()` when the page needs the same bound session with a different
layout. Use `useTGridSession()` and `useTGridLifecycle()` directly only when the
application must own the entire page composition. Raw `TGrid` does not bind
React Router or load lookup labels by itself.

Active-row state, row activation, side panels, and parent-child levels are Grid
interaction concerns. They do not change the persistence boundary. Hidden
columns and fixed filters are presentation, not authorization.

## Related reference

- [TGrid](/docs/reference/frontend/tgrid/)
- [Grid-first record workflows](/docs/guides/generated-surfaces/grid-first-record-workflows/)
- [Grid interactions](/grid/reference/interactions/)
- [Choose a Grid layer](/grid/start/choose-a-grid-layer/)
