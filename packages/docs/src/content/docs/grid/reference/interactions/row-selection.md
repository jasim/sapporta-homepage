---
title: "Row selection"
description:
  "Configure and observe path-local row-operation targets and selection chrome."
---

Row selection identifies rows for operations such as delete, export, bulk edit,
or a pinned side panel. It is separate from active-row context and rectangular
cell selection.

## Configuration and value

```ts
type SelectedRowsConfig =
  | { readonly kind: "none" }
  | {
      readonly kind: "enabled";
      readonly mode: "single" | "range" | "multi";
      readonly sync:
        | { readonly kind: "follows-active-row" }
        | { readonly kind: "independent" };
      readonly keyboard: {
        readonly space: "toggle-active-row" | "ignore";
      };
    };
```

`follows-active-row` derives the effective selection from the active row. It is
a read-only projection. `independent` stores a path-local row selection that can
differ from the active row.

```ts
type RowSelection =
  | { readonly kind: "single"; readonly rowId: RowId }
  | {
      readonly kind: "range";
      readonly anchor: RowId;
      readonly head: RowId;
    }
  | { readonly kind: "set"; readonly rowIds: ReadonlySet<RowId> }
  | null;
```

Read and change row state through a `GridLevelRuntime`:

```ts
const level = runtime.root;
const rowId = makeRowId(level.path, "task-1");

level.activeRow();
level.selectedRows();
level.selectedRowIds();
level.rowInteractionSnapshot();

level.selectRow(rowId);
level.toggleRowSelection(rowId);
level.extendRowSelectionTo(rowId);
level.clearRowSelection();
```

Selection commands normalize row ids against the current displayed rows and the
configured selection mode. Non-selectable and stale rows are removed.

## Subscriptions

Level subscriptions correspond to distinct read models:

```ts
level.subscribeActiveRow(() => {
  renderInspector(level.activeRow());
});

level.subscribeSelectedRows(() => {
  persistSelection(level.selectedRows());
});

level.subscribeSelectedRowIds(() => {
  updateCount(level.selectedRowIds().length);
});

level.subscribeRowInteractionSnapshot(() => {
  updateRowChrome(level.rowInteractionSnapshot());
});
```

`subscribeSelectedRows()` observes the configured selection value.
`subscribeSelectedRowIds()` also observes displayed-order changes that alter the
projected ids. `subscribeRowInteractionSnapshot()` is designed for row
decoration.

React components use the corresponding hooks:

```ts
useActiveRow(path);
useSelectedRows(path);
useSelectedRowIds(path);
useRowInteractionSnapshot(path);
```

## Row selection chrome

`rowSelectionColumn()` creates a normal `ColumnSchema` that reads path-local row
status and invokes the level selection commands.

```ts
import { rowSelectionColumn, text } from "@sapporta/grid/column-preset";

const columns = [
  rowSelectionColumn(),
  text({ id: "title", name: "Title", edit: "default" }),
];
```

Set the level's `rowHeaderColumn` to `{ column: selectorColumnId }` when
row-header behavior should be attached to that column. Use
`"empty-selectable-cell"` for a separate row header or `"none"` when the level
has no row header.

## Cross-path operations

Stored selection remains path-local. Use
[`runtime.rowOperations`](/grid/reference/base-grid/grid-runtime/#cross-path-row-operations)
when one command intentionally spans the expanded hierarchy.

## Related documentation

- [Active rows and row activation](/grid/reference/interactions/active-row-and-activation/)
- [ColumnPreset](/grid/reference/column-preset/#row-selection-column)
- [Grid DOM state contract](/grid/reference/dom-and-styling-contract/)
