---
title: "Getting Started"
description:
  "Install @sapporta/grid and render a small editable React grid from local
  rows."
---

Install the standalone package in a React app:

```bash
pnpm add @sapporta/grid
```

Import the Grid CSS once, usually next to the rest of your app styles:

```ts
import "@sapporta/grid/index.css";
```

Then create a schema, rows, a runtime, and a React surface:

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
import { select, text } from "@sapporta/grid/column-preset";

const schema: GridSchema = {
  rootLevel: "tasks",
  levels: {
    tasks: {
      name: "tasks",
      childLevels: [],
      columns: [
        text({ id: "title", name: "Task", edit: "default", width: "fill" }),
        select({
          id: "status",
          name: "Status",
          edit: "default",
          options: [
            { value: "todo", label: "To do" },
            { value: "doing", label: "Doing" },
            { value: "done", label: "Done" },
          ],
        }),
      ],
      options: { rowKey: (node) => String(node.columns.id) },
    },
  },
};

const tree: TreeNode[] = [
  {
    levelName: "tasks",
    columns: { id: "1", title: "Review import workflow", status: "doing" },
  },
  {
    levelName: "tasks",
    columns: { id: "2", title: "Ship keyboard polish", status: "todo" },
  },
];

export function TaskGrid() {
  const runtime = useGridRuntimeEffect(
    () =>
      createGridRuntime({
        schema,
        dataSource: inMemoryGridDataSource({
          schema,
          tree,
          levels: {
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
      <GridLevel path={rootPath(schema.rootLevel)} />
    </GridRuntimeProvider>
  );
}
```

That first grid is intentionally local. It proves the visible surface, column
model, row identity, and keyboard behavior before you connect a backend.

When the grid should read or write server data, keep the schema and React
surface. Replace the in-memory data source with your own source or save
handlers.
