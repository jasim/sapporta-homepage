---
title: "Clipboard"
description: "Look up copy selection, columns, values, headers, serialization, and browser behavior."
---

## Identity
Clipboard and copy-menu exports from `@sapporta/grid/grid`.
Every framework table grid, TGrid, and report grid has a right-click copy menu.
Standalone BaseGrid surfaces get the same menu when they wrap the rendered
levels in `GridCopyContextMenu`.

The menu has two commands:

- `Copy` copies the active cell or selected cell range as CSV text.
- `Copy with headers` adds a header row before the CSV values.

The selection is the cell-grid selection. A single active cell copies one cell.
A range copies the rectangular range between the selection anchor and head. Row
selection is separate and stays available for row operations such as delete,
export, bulk edit, or opening a side panel.

## Default Clipboard Columns

A plain grid column contributes one clipboard column. The value comes from the
row data at the column id, and `Copy with headers` uses that same column id as
the header.

```ts
const accountColumn: ColumnSchema = {
  id: "account",
  name: "Account",
  renderCell: ({ value }) => String(value ?? ""),
};
```

Copying that column with headers produces:

```csv
account
Cash
```

The display name is still only a grid label. Clipboard headers are data
headers, so they should stay stable when the visible label changes.

## Labeled Values Copy Both Parts

Some visible columns show a label but store another value. `select`,
`foreignKey`, and `lookupValue` presets all have this shape. Spreadsheet users
usually need the label. Integration and reconciliation workflows often need the
stored value.

For those presets, one selected visible column contributes two clipboard
columns by default: the stored value and the label.

```ts
const accountColumn = columnPreset.foreignKey({
  id: "account_id",
  name: "Account",
  valueLookup: accountLookup,
  searchLookup: accountSearch,
});
```

Copying one selected `account_id` cell with headers produces:

```csv
account_id,account_id_label
acct_123,Cash
```

The same rule applies to `select` columns:

```ts
const statusColumn = columnPreset.select({
  id: "status",
  name: "Status",
  options: [
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
  ],
});
```

```csv
status,status_label
open,Open
```

The raw output column reads the stored value. The label output column uses the
preset's label source, with the preset value formatter as the fallback when a
lookup label is not available.

## When To Customize Copy

Start with the default behavior. It gives stable data headers for plain columns
and raw-plus-label output for labeled values.

Customize column copy behavior when the rendered cell is not the clipboard
contract you need. Common cases are unit conversion, combining several row
fields behind one visible column, copying an integration code instead of a
badge, or omitting the label column for a workflow that only accepts raw ids.

## Customize ColumnPreset Copy

ColumnPreset helpers also accept `copy`. This is useful when you want preset
display and editing behavior, but a different clipboard value.

```ts
const statusColumn = columnPreset.select({
  id: "status",
  name: "Status",
  options: [
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
  ],
  copy: () => [
    {
      header: "workflow_status",
      valueAt: (row) => row.columns.status,
    },
  ],
});
```

For `select`, `foreignKey`, and `lookupValue`, a supplied `copy` replaces the
raw-plus-label default for that column.

## Customize BaseGrid Copy

BaseGrid columns use `ColumnSchema.copy` directly.

```ts
const personColumn: ColumnSchema = {
  id: "person_id",
  name: "Person",
  renderCell: ({ row }) => String(row.columns.person_name ?? ""),
  copy: () => [
    {
      header: "person_id",
      valueAt: (row) => row.columns.person_id,
    },
    {
      header: "person_name",
      valueAt: (row) => row.columns.person_name,
    },
  ],
};
```

Standalone BaseGrid screens also need the context menu wrapper:

```tsx
<GridRuntimeProvider runtime={runtime}>
  <GridCopyContextMenu>
    <GridLevel path={rootPath(schema.rootLevel)} />
  </GridCopyContextMenu>
</GridRuntimeProvider>
```

Without a `copy` function, BaseGrid falls back to one clipboard column using
`column.id` and `row.columns[column.id]`.

## Header And Async Rules

`Copy` omits the header row. `Copy with headers` writes the headers returned by
the selected columns' copy behavior.

Headers should be stable data names, not display labels. The default header is
the grid column id. Labeled-value presets use `<column_id>_label` for the label
column. If two contributed clipboard columns use the same header, the grid
keeps the first one and appends suffixes such as `_2` and `_3` to later
duplicates.

Column copy behavior may be async. The grid waits for each selected column's
copy behavior before it materializes the CSV rows, which lets lookup-backed
columns load labels before writing to the clipboard.
## Related documentation
[Grid reference overview](/grid/reference/)
