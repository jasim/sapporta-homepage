---
title: "Table-aware grids and customization"
description:
  "Customize a persisted table workflow while retaining schema, query, lookup, and save behavior."
---

The generated table page is already a table-aware Grid. Customize that layer
when registered Sapporta tables still own the rows but the page needs a
different column set, hierarchy, toolbar, or interaction.

## Choose the full page before the raw session

Sapporta exposes three table-aware entry points:

| Entry point | Use |
| --- | --- |
| `SchemaTableGridView` | Standard schema-derived table page |
| `TableGridView` or `useTableGrid` | Custom definition with page chrome, URL state, lifecycle, and lookups |
| `TGrid` with `useTGridSession` | Low-level session rendering inside custom chrome |

`TableGridView` is the usual custom-page boundary. It binds query state to the
route, loads lookup labels, owns session disposal, renders loading and error
states, and supplies the standard toolbar and pager. A raw TGrid session needs
those pieces composed explicitly.

## Define the table projection

This workbench retains the `tasks` table contract while selecting and ordering
four columns:

```tsx
import { useMemo } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { CELL_EDITING_GRID } from "@sapporta/grid";
import {
  TableGridView,
  defineTGrid,
} from "@sapporta/frontend";
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
returned result reconciles the visible row with the authoritative server
result. The server operation still owns its ability check, row scope,
validation, and transaction.

Column definitions may also use `columns.client()` for application-computed
values and `columns.remainingTable()` for the schema columns not named
explicitly.

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
