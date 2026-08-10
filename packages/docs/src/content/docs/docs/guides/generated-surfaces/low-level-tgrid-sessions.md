---
title: "Low-level TGrid sessions"
description:
  "Compose registered-table hierarchy, query ownership, lifecycle, and reload
  registration when an application needs to render TGrid directly."
---

Use a low-level TGrid session when registered Sapporta tables still own the rows
but the application must own the entire Grid composition. Prefer `TableGridView`
when standard page chrome, URL state, lookups, loading, and session disposal fit
the screen.

## Define the registered hierarchy

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
and disposes the session.

## Coordinate reload and URL state

Call `session.reloadRows()` from controls that already hold the session. Supply
`registerAs` to `useTGridLifecycle()` only when an external flow must address
this mounted root through `reloadTGridRows()`. The registry is a narrow command
bridge; it does not own the session.

For a full route with URL query state, use `TableGridView` or compose
`useTableGridUrlState()` and pass its seeds and change handler to
`useTGridSession()`. Setting `urlSync` only declares that the query may
participate; it does not read or write the URL itself.

Table column builders retain schema codecs, select options, lookups, formatting,
copy behavior, and the save client. A custom writer returns authoritative
reconciliation without moving authorization into the cell:

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

The server operation still owns ability, row scope, conflict handling, and the
transaction.

## Related documentation

- [Table-aware grids and customization](/docs/guides/generated-surfaces/table-aware-grids-and-customization/)
- [Grid interaction and selection](/docs/guides/generated-surfaces/grid-interaction-and-selection/)
- [TGrid](/docs/reference/frontend/tgrid/)
- [Hierarchical grids](/grid/guides/hierarchical-grids/)
