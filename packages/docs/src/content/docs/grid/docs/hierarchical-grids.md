---
title: "Hierarchical Grids"
description:
  "Render parent and child rows with Sapporta Grid levels, paths, row keys, and
  tree data."
---

Hierarchical grids use multiple levels. The root level renders first. Child
levels render under expanded parent rows.

```ts
const schema: GridSchema = {
  rootLevel: "projects",
  levels: {
    projects: {
      name: "projects",
      childLevels: ["tasks"],
      columns: [text({ id: "name", name: "Project", edit: "default" })],
      options: { rowKey: (node) => String(node.columns.id) },
    },
    tasks: {
      name: "tasks",
      childLevels: [],
      columns: [text({ id: "title", name: "Task", edit: "default" })],
      options: { rowKey: (node) => String(node.columns.id) },
    },
  },
};
```

In memory, nested rows live under `children`:

```ts
const tree: TreeNode[] = [
  {
    levelName: "projects",
    columns: { id: "p1", name: "Launch" },
    children: {
      tasks: [
        {
          levelName: "tasks",
          columns: { id: "t1", title: "Draft checklist" },
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
  rootPath,
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
      columns: [text({ id: "name", name: "Project", edit: "default" })],
      childLevels: ["tasks"],
      options: { rowKey: (node) => String(node.columns.id) },
    },
    tasks: {
      name: "tasks",
      columns: [text({ id: "title", name: "Task", edit: "default" })],
      childLevels: [],
      options: { rowKey: (node) => String(node.columns.id) },
    },
  },
};

const tree: TreeNode[] = [
  {
    levelName: "projects",
    columns: { id: "project-1", name: "Launch" },
    children: {
      tasks: [
        {
          levelName: "tasks",
          columns: { id: "task-1", title: "Review plan" },
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
            projects: { sortMode: "client", filterMode: "none" },
            tasks: { sortMode: "client", filterMode: "none" },
          },
        }),
      }),
    [],
  );

  if (!runtime) return null;

  return (
    <GridRuntimeProvider runtime={runtime}>
      <GridLevel path={rootPath(schema.rootLevel)} />
    </GridRuntimeProvider>
  );
}
```

Path-like level ids such as `projects.tasks` can make a larger hierarchy easier
to read, but they are still grid level ids. They do not have to match route
paths, database names, or backend resource names.
