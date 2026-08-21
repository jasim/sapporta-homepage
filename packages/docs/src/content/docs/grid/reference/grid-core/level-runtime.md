---
title: "GridLevelRuntime"
description:
  "Look up path-local displayed rows, interaction, expansion, writes, and
  drafts."
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
