---
title: "GridLevelRuntime"
description:
  "Look up path-local displayed rows, interaction, expansion, tree rows, writes,
  and drafts."
---

Resolve a level once, then use its path-bound reads, subscriptions, and
commands.

```ts
type GridLevelRuntime = {
  readonly path: GridPath;
  readonly schema: LevelSchema;
  readonly data: RuntimeLevelDataSource;

  displayedRows(): DisplayedRows;
  displayedRowSequence(): DisplayedRowSequence;
  displayedRow(rowId: RowId): LevelRow | undefined;
  dataRowTarget(rowId: RowId): RowOperationTarget<"data"> | undefined;
  subscribeDisplayedRowSequence(listener: () => void): () => void;
  subscribeDisplayedRow(rowId: RowId, listener: () => void): () => void;

  activeRow(): RowCursor | null;
  selectedRows(): RowSelection;
  selectedRowIds(): readonly RowId[];
  rowInteractionSnapshot(): RowInteractionSnapshot;
  subscribeActiveRow(listener: () => void): () => void;
  subscribeSelectedRows(listener: () => void): () => void;
  subscribeSelectedRowIds(listener: () => void): () => void;
  subscribeRowInteractionSnapshot(listener: () => void): () => void;

  selectRow(rowId: RowId): void;
  setRowSelection(selection: RowSelection): void;
  toggleRowSelection(rowId: RowId): void;
  extendRowSelectionTo(rowId: RowId): void;
  clearRowSelection(): void;

  isExpanded(rowId: RowId): boolean;
  subscribeExpansion(listener: () => void): () => void;
  expand(rowId: RowId): void;
  collapse(rowId: RowId): void;
  toggleExpand(rowId: RowId): void;

  readonly tree: GridLevelTree | null;

  writeCell(coord: Coord, value: unknown): void;
  applyChanges(changes: readonly CellChange[]): void;
  createRow(node: TreeNode, atIndex?: number): Promise<CreateNodeResult>;
  removeRow(rowKey: RowKey): Promise<void>;

  readonly drafts: {
    get(): readonly PhantomRow[];
    subscribe(listener: () => void): () => void;
    add(rowKey: RowKey, columns?: Readonly<Record<ColId, unknown>>): void;
    remove(rowKey: RowKey): void;
    setCell(rowKey: RowKey, colId: ColId, value: unknown): void;
    commit(rowKey: RowKey, atIndex?: number): Promise<CreateNodeResult>;
  };
};
```

Dynamic reads, commands, and subscriptions are guarded by the level's
registration lifetime. Static fields remain readable after unregistration.

```ts
const level = runtime.root;
const rowId = makeRowId(level.path, "project-1");

level.writeCell({ rowId, colId: "status" }, "done");
level.applyChanges([
  { rowKey: "project-1", colId: "status", value: "done" },
  { rowKey: "project-1", colId: "owner", value: "user-7" },
]);

await level.createRow({
  rowKey: "project-2",
  levelName: "projects",
  columns: { name: "New project" },
});
await level.removeRow("project-2");
```

`isExpanded()`, `expand()`, `collapse()`, and `toggleExpand()` concern child
levels mounted under a row. Same-level tree rows use `level.tree`.

## Tree rows

`level.tree` is `null` unless the level declares
[`tree`](/grid/reference/grid-core/schema-rows-and-identity/#tree-levels):

```ts
type GridLevelTree = {
  isExpanded(rowId: RowId): boolean;
  expand(rowId: RowId): void;
  collapse(rowId: RowId): void;
  toggle(rowId: RowId): void;
  expandAll(): void;
  collapseAll(): void;
  reveal(rowId: RowId): void;
  parentOf(rowId: RowId): RowId | null;
  childrenOf(rowId: RowId): readonly RowId[];
  addChild(
    parentRowId: RowId,
    columns?: Readonly<Record<ColId, unknown>>,
  ): RowId;
  subscribe(listener: () => void): () => void;
};
```

- `isExpanded()` reads `false` for a row without children, and `expand()` leaves
  such a row unchanged.
- `collapse()` hides a row's descendants and moves a cursor out of them. Hidden
  rows leave the row selection.
- `expandAll()` and `collapseAll()` also apply to rows that load later.
- `reveal()` expands every ancestor of a row so that the row is displayed.
- `parentOf()` returns `null` for a top-level row. `childrenOf()` returns
  children in display order, including hidden ones.
- `addChild()` adds a draft row under a data row, reveals it, and returns its
  row id. The draft's parent-key field holds the value from
  `tree.parentKeyValue`, or the parent's row key, unless `columns` supplies one.
  A child draft left blank is removed when the cursor leaves it.
- `subscribe()` observes expansion changes on this level. The runtime-wide
  `treeExpansionChanged` event reports the same changes with their path.

```ts
const accounts = runtime.root.tree;
if (accounts) {
  accounts.reveal(federalId);
  const draftId = accounts.addChild(taxesId, { name: "State" });
}
```

## Data access

`level.data` is the read and query facade for the level source. Runtime writes
remain on `GridLevelRuntime` so validation, reconciliation, and host events use
one boundary.

Use [Runtime data access](/grid/reference/data-sources/runtime-data-access/) for
the facade and query APIs. Use
[Data-source writes and reconciliation](/grid/reference/data-sources/writes-and-reconciliation/)
for the source-side write contract.

## Related documentation

- [Row selection](/grid/reference/interactions/row-selection/)
- [Phantom rows and inserts](/grid/guides/advanced-rows/phantom-rows-and-inserts/)
- [GridRuntime](/grid/reference/grid-core/grid-runtime/)
