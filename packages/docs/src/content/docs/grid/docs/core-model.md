---
title: "Core Model"
description:
  "Understand the Sapporta Grid runtime model: schemas, levels, row keys, paths,
  columns, and data sources."
---

Sapporta Grid starts with a `GridSchema`. The schema describes the row levels
the grid can render and the columns available at each level.

```ts
const schema = {
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
} satisfies GridSchema;
```

The root level is the top-level grid. Child levels appear under expanded parent
rows. A row path identifies where a level is rendered:

```ts
rootPath("projects");
childPath(rootPath("projects"), "project-1", "tasks");
```

Row keys come from your data. They must be stable for the life of the row. If a
row is saved by a server, use the server id. If a row is local only, generate a
temporary key and replace it after save only when your data source reconciles
the row.

## Runtime

`createGridRuntime()` combines the schema and a data source. The runtime owns
focus, editing state, selection state, displayed row snapshots, child expansion,
and data reconciliation.

```ts
const runtimeForScript = createGridRuntime({ schema, dataSource });
```

React components consume that runtime through `GridRuntimeProvider`:

```tsx
const runtime = useGridRuntimeEffect(
  () => createGridRuntime({ schema, dataSource }),
  [dataSource],
);

if (!runtime) return null;

return (
  <GridRuntimeProvider runtime={runtime}>
    <GridLevel path={rootPath(schema.rootLevel)} />
  </GridRuntimeProvider>
);
```

For React-owned grids, `useGridRuntimeEffect` creates the runtime after commit,
returns `null` until the current dependencies have a committed runtime, and
disposes the old runtime from effect cleanup. Outside React, create the runtime
manually and call `runtime.dispose()` when that owner is done.

Avoid creating and disposing a runtime inside a memoized render path. React
development mode can replay effects while keeping render-created values, so the
grid runtime should be owned by `useGridRuntimeEffect` or by a non-React owner
with an explicit `dispose()` call.

The runtime is the boundary between the host app and the rendered grid. The host
provides schema, columns, data sources, and save behavior. The runtime owns row
identity, focus, editing state, selection state, expansion, displayed row
snapshots, and reconciliation events.
