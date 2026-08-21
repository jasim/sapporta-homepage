---
title: "GridCore React APIs"
description: "Create, provide, render, and observe a GridRuntime from React."
---

React-owned grids create and dispose the runtime with `useGridRuntimeEffect()`.
The hook creates the runtime after commit, returns `null` until the current
dependencies have a committed runtime, and disposes the old runtime from effect
cleanup.

```tsx
const runtime = useGridRuntimeEffect(
  () => createGridRuntime({ schema, dataSource }),
  [schema, dataSource],
);

if (!runtime) return null;

return (
  <GridRuntimeProvider runtime={runtime}>
    <GridCopyContextMenu>
      <GridLevel path={runtime.root.path} />
    </GridCopyContextMenu>
  </GridRuntimeProvider>
);
```

Avoid creating and disposing a runtime inside a memoized render path. React
development mode can replay effects while keeping render-created values, so the
grid runtime should be owned by `useGridRuntimeEffect`.

## React hooks

`GridRuntimeProvider` supplies the runtime to `GridLevel` and the public hooks.
Common hooks include:

```ts
useGridRuntime();
useGridActiveRow(runtime?);
useLevelSnapshot(path);
useDisplayedRowSequence(path);
useDisplayedRow(path, rowId);
useActiveCell();
useActiveCellForPath(path);
useCellSelection(path);
useActiveRow(path);
useSelectedRows(path);
useSelectedRowIds(path);
useRowInteractionSnapshot(path);
```

Use hooks in React components. Use `GridLevelRuntime` subscriptions in non-React
hosts and custom stores.

`useGridActiveRow()` reads the provider runtime. Passing a runtime argument
allows a component outside that provider to observe it. The hook returns
`GridActiveRow | null` and updates for both active identity and displayed-value
changes.

## Related documentation

- [GridRuntime](/grid/reference/grid-core/grid-runtime/)
- [GridLevelRuntime](/grid/reference/grid-core/level-runtime/)
- [Copying grid data](/grid/guides/copying-grid-data/)
