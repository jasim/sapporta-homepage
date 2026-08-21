---
title: "Data-source writes and reconciliation"
description:
  "Implement source writes and observe authoritative reconciliation through
  GridLevelRuntime."
---

`WriteCapability` is implemented by the source and consumed by the runtime:

```ts
type WriteCapability = {
  setCell(rowKey: RowKey, colId: ColId, value: unknown): void;
  applyChanges(changes: readonly CellChange[]): void;
  createNode(node: TreeNode, atIndex?: number): Promise<CreateNodeResult>;
  removeNode(rowKey: RowKey): void | Promise<void>;
  onReconcile(listener: (event: ReconcileEvent) => void): () => void;
  canAppendRow?: () => boolean;
};
```

## Writes through GridLevelRuntime

Application code writes through the level runtime:

```ts
const level = runtime.root;
const rowId = makeRowId(level.path, "project-1");

level.writeCell({ rowId, colId: "status" }, "done");
level.applyChanges([{ rowKey: "project-1", colId: "status", value: "done" }]);
await level.createRow({
  rowKey: "project-2",
  levelName: level.schema.name,
  columns: { name: "Migration" },
});
await level.removeRow("project-2");
```

These commands validate the current level registration, require a writable
source, and emit runtime mutation events.

## Reconciliation

```ts
type ReconcileEvent =
  | { kind: "agreed"; rowKey: RowKey; colId: ColId; value: unknown }
  | {
      kind: "diverged";
      rowKey: RowKey;
      colId: ColId;
      optimisticValue: unknown;
      authoritativeValue: unknown;
      priorValue: unknown;
    }
  | {
      kind: "rejected";
      rowKey: RowKey;
      colId: ColId;
      optimisticValue: unknown;
      reason: string;
      priorValue: unknown;
    };
```

```ts
const unsubscribe = runtime.root.data.onReconcile((event) => {
  if (event.kind === "rejected") showSaveError(event.reason);
});
```

## Related documentation

- [Editing and saving](/grid/guides/editing-and-saving/)
- [Phantom rows and inserts](/grid/guides/advanced-rows/phantom-rows-and-inserts/)
- [GridLevelRuntime](/grid/reference/grid-core/level-runtime/)
