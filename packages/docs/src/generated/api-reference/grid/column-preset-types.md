---
title: "@sapporta/grid/column-preset — Types"
package: "@sapporta/grid"
version: "0.4.1"
specifier: "@sapporta/grid/column-preset"
---

> Sapporta API reference for `@sapporta/grid@0.4.1`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/grid/column-preset — Types

Import from `@sapporta/grid/column-preset`. Documented from `@sapporta/grid@0.4.1`; confirm the installed version with `node -p "require('@sapporta/grid/package.json').version"`.

49 of 84 symbols published from `@sapporta/grid/column-preset`. Other groups: [Functions and components](https://sapporta.com/api-reference/grid/column-preset-functions.md), [Values, classes, and namespaces](https://sapporta.com/api-reference/grid/column-preset-values.md).

### BooleanPreset

```ts
type BooleanPreset = PresetBase & {
    kind: "boolean";
};
```

### BuiltInColumnPresetKind

```ts
type BuiltInColumnPresetKind = "identifier" | "text" | "number" | "currency" | "percentage" | "date" | "boolean" | "select" | "lookupValue" | "foreignKey";
```

### CharacterColumnSizing

```ts
type CharacterColumnSizing = {
    width?: number;
    minWidth?: number;
    maxWidth?: number;
};
```

### ColumnAlign

```ts
type ColumnAlign = "left" | "right" | "center";
```

### ColumnHeaderMenuProps

```ts
type ColumnHeaderMenuProps<TMeta = unknown, TFilter = unknown> = {
    level: HeaderLevelState<TFilter>;
    column: HeaderColumn<TMeta>;
    commands: GridLevelCommands<TFilter>;
    close: () => void;
};
```

### ColumnHeaderProps

```ts
type ColumnHeaderProps<TMeta = unknown> = {
    level: HeaderLevelState;
    column: HeaderColumn<TMeta>;
    commands: GridLevelCommands;
};
```

### ColumnPreset

```ts
type ColumnPreset = IdentifierPreset | TextPreset | NumberPreset | CurrencyPreset | PercentagePreset | DatePreset | BooleanPreset | SelectPreset | LookupPreset | ForeignKeyPreset | CustomPreset;
```

### ColumnPresetCellRenderRuntime

```ts
type ColumnPresetCellRenderRuntime = Pick<ColumnPresetRuntime, "preset" | "valueCodec">;
```

### ColumnPresetCellView

```ts
type ColumnPresetCellView = {
    renderCell: (props: CellRenderProps) => ReactNode;
};
```

### ColumnPresetEditOption

```ts
type ColumnPresetEditOption = "default" | "none" | {
    editor?: "default" | ComponentType<CellEditorProps>;
    startsOn?: readonly CellEditGesture[];
};
```

### ColumnPresetHeaderBehavior

```ts
type ColumnPresetHeaderBehavior<TMeta = unknown> = {
    sortable: boolean;
    renderColumnHeader?: (props: ColumnHeaderProps<TMeta>) => ReactNode;
    renderColumnHeaderMenu?: (props: ColumnHeaderMenuProps<TMeta, unknown>) => ReactNode;
};
```

### ColumnPresetKind

```ts
type ColumnPresetKind = BuiltInColumnPresetKind | (string & {});
```

### ColumnPresetLayout

```ts
type ColumnPresetLayout = {
    align: ColumnAlign;
    width: ColumnWidth;
};
```

### ColumnPresetOptions

```ts
type ColumnPresetOptions<TMeta = unknown> = {
    kind?: ColumnPresetKind;
    id: ColId;
    name: string;
    align?: ColumnAlign;
    width?: ColumnWidth;
    edit?: ColumnPresetEditOption;
    sortable?: boolean;
    format?: (value: unknown) => string;
    parse?: (value: string, props: CellEditorProps) => unknown;
    compare?: (a: unknown, b: unknown) => number;
    renderCell?: (props: CellRenderProps) => ReactNode;
    renderColumnHeader?: (props: ColumnHeaderProps<TMeta>) => ReactNode;
    renderColumnHeaderMenu?: (props: ColumnHeaderMenuProps<TMeta, unknown>) => ReactNode;
    activation?: CellActivation;
    copy?: GridColumnCopyBehavior;
    meta?: TMeta;
};
```

### ColumnPresetResolvedEdit

```ts
type ColumnPresetResolvedEdit = CellEditBehavior | undefined;
```

### ColumnPresetRuntime

```ts
type ColumnPresetRuntime<TMeta = unknown> = {
    preset: ColumnPreset;
    meta?: TMeta;
    valueCodec: ColumnPresetValueCodec;
    cellView: ColumnPresetCellView;
    edit?: CellEditBehavior;
    activation?: CellActivation;
    headerBehavior: ColumnPresetHeaderBehavior<TMeta>;
};
```

### ColumnPresetValueCodec

```ts
type ColumnPresetValueCodec = {
    format: (value: unknown) => string;
    parse?: (value: string, props: CellEditorProps) => unknown;
    compare: (a: unknown, b: unknown) => number;
};
```

### ColumnSizingOptions

```ts
type ColumnSizingOptions = {
    storageKey?: ColumnSizingStorageKey;
    enabled?: boolean;
    minPx?: number;
};
```

### ColumnSizingOverrides

```ts
type ColumnSizingOverrides = Record<ColId, number>;
```

### ColumnSizingStorageKey

```ts
type ColumnSizingStorageKey = string | ((context: ColumnSizingStorageKeyContext) => string | undefined);
```

### ColumnSizingStorageKeyContext

```ts
type ColumnSizingStorageKeyContext = {
    path: GridPath;
    levelName: string;
    schema: readonly ColumnSchema[];
};
```

### ColumnWidth

```ts
type ColumnWidth = "compact" | "content" | "fill" | "numeric" | "date" | "enum" | "foreignKey" | {
    min?: number;
    ideal?: number;
    max?: number;
} | {
    track: string;
};
```

### CurrencyPreset

```ts
type CurrencyPreset = PresetBase & {
    kind: "currency";
    currency: NumberDisplay;
};
```

### CustomPreset

```ts
type CustomPreset = PresetBase & {
    kind: Exclude<ColumnPresetKind, BuiltInColumnPresetKind>;
};
```

### DatePreset

```ts
type DatePreset = PresetBase & {
    kind: "date";
};
```

### ForeignKeyPreset

```ts
type ForeignKeyPreset = PresetBase & {
    kind: "foreignKey";
    lookup: LookupCapabilities;
};
```

### GridLevelCommands

```ts
type GridLevelCommands<TFilter = unknown> = {
    setSort?: (sort: readonly SortDescriptor[] | undefined) => Promise<SourceLoadResult>;
    setFilter?: (filter: TFilter | undefined) => Promise<SourceLoadResult>;
    refetch?: () => Promise<SourceLoadResult>;
    createRow: (node: TreeNode, atIndex?: number) => Promise<unknown>;
    removeRow: (rowKey: RowKey) => void | Promise<void>;
    writeCell: (coord: Coord, value: unknown) => void;
    commitPhantomRow: (rowKey: RowKey, atIndex?: number) => Promise<unknown>;
};
```

### HeaderColumn

```ts
type HeaderColumn<TMeta = unknown> = {
    column: ColumnSchema;
    columnIndex: number;
    preset: ColumnPreset | undefined;
    meta: TMeta | undefined;
};
```

### HeaderLevelState

```ts
type HeaderLevelState<TFilter = unknown> = {
    path: GridPath;
    levelName: string;
    schema: readonly ColumnSchema[];
    snapshot: LevelSnapshot;
    sort: readonly SortDescriptor[] | undefined;
    filter: TFilter | undefined;
    canWrite: boolean;
};
```

### IdentifierPreset

```ts
type IdentifierPreset = PresetBase & {
    kind: "identifier";
};
```

### LookupCapabilities

```ts
type LookupCapabilities<TValue extends LookupValue = LookupValue, TMeta = unknown> = {
    valueLookup: ValueLookup<TValue, TMeta>;
    searchLookup?: SearchLookup<TValue, TMeta>;
};
```

### LookupColumnOptions

```ts
type LookupColumnOptions<TMeta = unknown> = ColumnPresetOptions<TMeta> & {
    valueLookup: ValueLookup;
    searchLookup?: SearchLookup;
};
```

### LookupPreset

```ts
type LookupPreset = PresetBase & {
    kind: "lookupValue";
    lookup: LookupCapabilities;
};
```

### NumberColorRule

```ts
type NumberColorRule = "positive" | "negative" | "signed";
```

### NumberColumnOptions

```ts
type NumberColumnOptions<TMeta = unknown> = ColumnPresetOptions<TMeta> & {
    colorRule?: NumberColorRule;
    zeroDisplay?: ZeroDisplay;
    strong?: boolean;
};
```

### NumberDisplay

```ts
type NumberDisplay = {
    colorRule?: NumberColorRule;
    zeroDisplay?: ZeroDisplay;
    strong: boolean;
};
```

### NumberPreset

```ts
type NumberPreset = PresetBase & {
    kind: "number";
    number: NumberDisplay;
};
```

### NumericInputParseResult

```ts
type NumericInputParseResult = {
    ok: true;
    value: number | null;
} | {
    ok: false;
};
```

### PercentagePreset

```ts
type PercentagePreset = PresetBase & {
    kind: "percentage";
    percentage: NumberDisplay;
};
```

### PresetChromeOptions

```ts
type PresetChromeOptions<TMeta = unknown, TFilter = unknown> = {
    columnSizing?: ColumnSizingOptions;
    renderColumnHeaderMenu?: (props: ColumnHeaderMenuProps<TMeta, TFilter>) => ReactNode;
    commandOverrides?: (level: HeaderLevelState<TFilter>) => Partial<GridLevelCommands<TFilter>>;
};
```

### ResolvedColumnSizing

```ts
type ResolvedColumnSizing = {
    enabled: boolean;
    storageKey?: string;
    minPx: number;
};
```

### RowSelectionColumnOptions

```ts
type RowSelectionColumnOptions = {
    id?: ColId;
    name?: string;
    width?: ColumnWidth;
    header?: "checkbox" | "blank";
};
```

### SelectColumnOptions

```ts
type SelectColumnOptions<TMeta = unknown> = ColumnPresetOptions<TMeta> & {
    options: readonly (SelectOption | string)[];
};
```

### SelectOption

```ts
type SelectOption = {
    value: unknown;
    label: string;
};
```

### SelectPreset

```ts
type SelectPreset = PresetBase & {
    kind: "select";
    select: {
        options: readonly SelectOption[];
    };
};
```

### TextColumnOptions

```ts
type TextColumnOptions<TMeta = unknown> = ColumnPresetOptions<TMeta> & {
    display?: TextDisplayMode;
};
```

### TextDisplayMode

```ts
type TextDisplayMode = "multiLine" | "markdown";
```

### TextPreset

```ts
type TextPreset = PresetBase & {
    kind: "text";
    text: {
        display?: TextDisplayMode;
    };
};
```

### ZeroDisplay

```ts
type ZeroDisplay = "blank" | "dot";
```
