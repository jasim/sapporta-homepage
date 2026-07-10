---
title: "ColumnPreset"
description: "Look up ColumnPreset constructors, options, formatting, editing, copy, and sizing APIs."
---

## Identity
`@sapporta/grid/column-preset`.
## ColumnPreset API

ColumnPreset helpers return ordinary `ColumnSchema` values. They are the
recommended starting point for most BaseGrid columns.

### Constructors

```ts
function identifier<TMeta = unknown>(
  options: ColumnPresetOptions<TMeta>,
): ColumnSchema;
function text<TMeta = unknown>(options: TextColumnOptions<TMeta>): ColumnSchema;
function number<TMeta = unknown>(
  options: NumberColumnOptions<TMeta>,
): ColumnSchema;
function currency<TMeta = unknown>(
  options: NumberColumnOptions<TMeta>,
): ColumnSchema;
function percentage<TMeta = unknown>(
  options: NumberColumnOptions<TMeta>,
): ColumnSchema;
function date<TMeta = unknown>(
  options: ColumnPresetOptions<TMeta>,
): ColumnSchema;
function boolean<TMeta = unknown>(
  options: ColumnPresetOptions<TMeta>,
): ColumnSchema;
function select<TMeta = unknown>(
  options: SelectColumnOptions<TMeta>,
): ColumnSchema;
function lookupValue<TMeta = unknown>(
  options: LookupColumnOptions<TMeta>,
): ColumnSchema;
function foreignKey<TMeta = unknown>(
  options: LookupColumnOptions<TMeta>,
): ColumnSchema;
function column<TMeta = unknown>(
  options: ColumnPresetOptions<TMeta>,
): ColumnSchema;
```

### Common Options

```ts
type ColumnPresetOptions<TMeta = unknown> = {
  kind?: ColumnPresetKind;
  id: ColId;
  name: string;
  align?: "left" | "right" | "center";
  width?: ColumnWidth;
  edit?:
    | "default"
    | "none"
    | {
        editor?: "default" | ComponentType<CellEditorProps>;
        startsOn?: readonly CellEditGesture[];
      };
  activation?: CellActivation;
  sortable?: boolean;
  format?: (value: unknown) => string;
  parse?: (value: string, props: CellEditorProps) => unknown;
  compare?: (a: unknown, b: unknown) => number;
  renderCell?: (props: CellRenderProps) => ReactNode;
  copy?: GridColumnCopyBehavior;
  meta?: TMeta;
};
```

### Widths

```ts
type ColumnWidth =
  | "compact"
  | "content"
  | "fill"
  | "numeric"
  | "date"
  | "enum"
  | "foreignKey"
  | { min?: number; ideal?: number; max?: number }
  | { track: string };
```

### Select Columns

```ts
const status = select({
  id: "status",
  name: "Status",
  edit: "default",
  width: "enum",
  options: [
    { value: "todo", label: "To do" },
    { value: "doing", label: "Doing" },
    { value: "done", label: "Done" },
  ],
});
```

### Number Columns

```ts
const estimate = number({
  id: "estimate",
  name: "Estimate",
  edit: "default",
  width: "numeric",
  zeroDisplay: "blank",
});

const variance = currency({
  id: "variance",
  name: "Variance",
  colorRule: "signed",
});
```

### Custom Formatting

```ts
const duration = number({
  id: "durationMinutes",
  name: "Duration",
  format: (value) => `${Number(value ?? 0)} min`,
  parse: (value) => Number(value.replace("min", "").trim()),
});
```

### Row Selection Column

```ts
function rowSelectionColumn(options?: RowSelectionColumnOptions): ColumnSchema;

type RowSelectionColumnOptions = {
  id?: ColId;
  name?: string;
  width?: ColumnWidth;
  header?: "checkbox" | "blank";
};
```

`rowSelectionColumn()` renders checkbox chrome on top of the runtime's row
selection APIs.

```ts
const columns = [
  rowSelectionColumn(),
  text({ id: "title", name: "Title", edit: "default" }),
];
```

### ColumnPreset Helpers

```ts
function preset(column: ColumnSchema): ColumnPreset | undefined;
function meta<TMeta = unknown>(column: ColumnSchema): TMeta | undefined;
function kind(column: ColumnSchema): ColumnPresetKind | undefined;
function width(column: ColumnSchema): ColumnWidth | undefined;
function parse(
  column: ColumnSchema,
): ((value: string, props: CellEditorProps) => unknown) | undefined;
function lookupCapabilities(
  column: ColumnSchema,
): LookupCapabilities | undefined;
function trackForColumn(column: ColumnSchema): string;
function templateColumns(columns: readonly ColumnSchema[]): string;
```

Use `templateColumns` when you build custom chrome that must align with the
grid's column widths.

```tsx
const style = {
  display: "grid",
  gridTemplateColumns: templateColumns(schema.levels.tasks.columns),
};
```
## Related documentation
[Grid reference overview](/grid/reference/)
