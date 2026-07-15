---
title: "Hierarchical grids"
description: "Render nested levels with stable identity and local or lazy child data."
---

Hierarchical grids use multiple levels. The root level renders first. Child
levels render under expanded parent rows.

```ts
const schema: GridSchema = {
  rootLevel: "projects",
  levels: {
    projects: {
      name: "projects",
      rowHeaderColumn: "none",
      childLevels: ["tasks"],
      columns: [text({ id: "name", name: "Project", edit: "default" })],
      options: {},
    },
    tasks: {
      name: "tasks",
      rowHeaderColumn: "none",
      childLevels: [],
      columns: [text({ id: "title", name: "Task", edit: "default" })],
      options: {},
    },
  },
};
```

In memory, nested rows live under `children`:

```ts
const tree: TreeNode[] = [
  {
    rowKey: "p1",
    levelName: "projects",
    columns: { name: "Launch" },
    children: {
      tasks: [
        {
          rowKey: "t1",
          levelName: "tasks",
          columns: { title: "Draft checklist" },
        },
      ],
    },
  },
];
```

For remote data, a child request should include the parent path and row key. The
server can then load only the children for that parent.

Use hierarchy when the user needs to work with related rows in place. If the
screen is only showing totals, subtotals, or drill links, a readonly result
surface may be a better fit than an editable grid.

## Render a local tree

Use `inMemoryGridDataSource()` when the full tree is already available in
browser state:

```tsx
import {
  GridLevel,
  GridRuntimeProvider,
  createGridRuntime,
  inMemoryGridDataSource,
  useGridRuntimeEffect,
  type GridSchema,
  type TreeNode,
} from "@sapporta/grid";
import { text } from "@sapporta/grid/column-preset";

const schema: GridSchema = {
  rootLevel: "projects",
  levels: {
    projects: {
      name: "projects",
      rowHeaderColumn: "none",
      columns: [text({ id: "name", name: "Project", edit: "default" })],
      childLevels: ["tasks"],
      options: {},
    },
    tasks: {
      name: "tasks",
      rowHeaderColumn: "none",
      columns: [text({ id: "title", name: "Task", edit: "default" })],
      childLevels: [],
      options: {},
    },
  },
};

const tree: TreeNode[] = [
  {
    rowKey: "project-1",
    levelName: "projects",
    columns: { name: "Launch" },
    children: {
      tasks: [
        {
          rowKey: "task-1",
          levelName: "tasks",
          columns: { title: "Review plan" },
        },
      ],
    },
  },
];

export function ProjectGrid() {
  const runtime = useGridRuntimeEffect(
    () =>
      createGridRuntime({
        schema,
        dataSource: inMemoryGridDataSource({
          schema,
          tree,
          levels: {
            projects: {
              sortMode: "client",
              filterMode: "none",
              paginationMode: "none",
            },
            tasks: {
              sortMode: "client",
              filterMode: "none",
              paginationMode: "none",
            },
          },
        }),
      }),
    [],
  );

  if (!runtime) return null;

  return (
    <GridRuntimeProvider runtime={runtime}>
      <GridLevel path={runtime.root.path} />
    </GridRuntimeProvider>
  );
}
```

Path-like level ids such as `projects.tasks` can make a larger hierarchy easier
to read, but they are still grid level ids. They do not have to match route
paths, database names, or backend resource names.
## Verify
Typecheck the example and exercise its visible loading, ready, interaction, and failure states. Use only public `@sapporta/grid` export paths.
Continue with [Grid Reference](/grid/reference/).
