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

## Tree column

On a
[tree level](/grid/reference/grid-core/schema-rows-and-identity/#tree-levels),
`withTreeColumn()` makes one column the tree column. The column indents each row
by its depth, shows a chevron on rows with children, and keeps a chevron-sized
slot on other rows, so content at the same depth lines up:

```ts
function withTreeColumn(
  column: ColumnSchema,
  options?: TreeColumnOptions,
): ColumnSchema;

type TreeColumnOptions = {
  activation?: CellActivation; // default treeExpansionActivation()
  indentStep?: string; // one level of indentation, such as "18px"
};
```

The wrapped column keeps its own `renderCell` and edit gestures. Its activation
is `treeExpansionActivation({ startsOn? })`, which toggles the row on Space and,
on a cell that cannot be edited, on Enter. A click on the chevron toggles the
row; a click elsewhere in the cell focuses, selects, or edits as usual.

`TreeCellFrame` is the frame `withTreeColumn` draws around the cell content. A
custom renderer can use it directly:

```tsx
renderCell: (props) => (
  <TreeCellFrame activation={props.activation} row={props.row} indentStep="20px">
    <AccountName value={props.value} />
  </TreeCellFrame>
),
```

A custom activation reads and toggles tree rows through `actions.treeExpansion`,
which offers `canToggle({ path, row })`, `isExpanded({ path, rowId })`, and
`toggle({ path, rowId })`. A row can toggle only in a tree level and only while
it has children.

## Related documentation

- [GridRuntime](/grid/reference/grid-core/grid-runtime/)
- [GridLevelRuntime](/grid/reference/grid-core/level-runtime/)
- [Copying grid data](/grid/guides/copying-grid-data/)
