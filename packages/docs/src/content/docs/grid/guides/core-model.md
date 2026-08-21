---
title: "Core model"
description: "Understand schemas, levels, paths, row identity, runtimes, and lifecycle."
---

Sapporta Grid starts with a `GridSchema`. The schema describes the row levels
the grid can render and the columns available at each level.

```ts
const schema = {
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
} satisfies GridSchema;
```

The root level is the top-level grid. Child levels appear under expanded parent
rows. A row path identifies where a level is rendered:

```ts
rootPath("projects");
childPath(rootPath("projects"), "project-1", "tasks");
```

Every `TreeNode` carries a required `rowKey`. The key must be unique within its
level path and stable for the life of the row. A server-backed row normally uses
its record id. The runtime combines a path, row kind, and row key into a tagged
`RowId`; call `makeRowId(path, rowKey)` when host code needs that identity.

## Runtime

`createGridRuntime()` combines the schema and a data source. `GridRuntime` owns
the immutable schema, interaction configuration, host events, registered
levels, and cross-path row operations. `GridLevelRuntime` owns rows,
subscriptions, selection, expansion, writes, and drafts for one `GridPath`.

```ts
const runtimeForScript = createGridRuntime({ schema, dataSource });
const projects = runtimeForScript.root;
const project = projects.displayedRows().rows[0];

if (project?.kind === "data") {
  projects.expand(project.id);
  const tasks = runtimeForScript.level(
    childPath(projects.path, project.source.rowKey, "tasks"),
  );
  tasks.subscribeDisplayedRowSequence(() => {
    console.log(tasks.displayedRowSequence());
  });
}
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
    <GridLevel path={runtime.root.path} />
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
provides schema, columns, data sources, and persistence. Use `runtime.root` or
`runtime.level(path)` before reading or changing path-local state. Use
`runtime.registeredLevels()` only when a command intentionally spans the
expanded hierarchy.
## Verify
Typecheck the example and exercise its visible loading, ready, interaction, and failure states. Use only public `@sapporta/grid` export paths.
Continue with
[Schema, rows, paths, and identity](/grid/reference/grid-core/schema-rows-and-identity/)
or [GridRuntime](/grid/reference/grid-core/grid-runtime/).
