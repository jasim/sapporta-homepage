---
title: "@sapporta/grid/column-preset — Functions and components"
package: "@sapporta/grid"
version: "0.4.1"
specifier: "@sapporta/grid/column-preset"
---

> Sapporta API reference for `@sapporta/grid@0.4.1`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/grid/column-preset — Functions and components

Import from `@sapporta/grid/column-preset`. Documented from `@sapporta/grid@0.4.1`; confirm the installed version with `node -p "require('@sapporta/grid/package.json').version"`.

32 of 84 symbols published from `@sapporta/grid/column-preset`. Other groups: [Types](https://sapporta.com/api-reference/grid/column-preset-types.md), [Values, classes, and namespaces](https://sapporta.com/api-reference/grid/column-preset-values.md).

### boolean

```ts
function boolean<TMeta = unknown>(options: ColumnPresetOptions<TMeta>): ColumnSchema;
```

### chrome

```ts
function chrome<TMeta = unknown, TFilter = unknown>(options?: PresetChromeOptions<TMeta, TFilter>): GridLevelChrome;
```

### clampColumnPixelWidth

```ts
function clampColumnPixelWidth(column: ColumnSchema, value: number, minPx?: number): number;
```

### column

```ts
function column<TMeta = unknown>(options: ColumnPresetOptions<TMeta>): ColumnSchema;
```

### ColumnPresetHeader

```ts
function ColumnPresetHeader<TMeta = unknown, TFilter = unknown>({ path, levelName, schema, rowHeaderColumn, options, }: {
    path: GridPath;
    levelName: string;
    schema: readonly ColumnSchema[];
    rowHeaderColumn: RowHeaderColumn;
    options: PresetChromeOptions<TMeta, TFilter>;
}): import("react").JSX.Element;
```

### columnPresetWidthForSizing

```ts
function columnPresetWidthForSizing(sizing: CharacterColumnSizing): ColumnWidth | undefined;
```

### columnSizingTemplateColumns

```ts
function columnSizingTemplateColumns(schema: readonly ColumnSchema[], overrides: ColumnSizingOverrides, minPx?: number): string;
```

### currency

```ts
function currency<TMeta = unknown>(options: NumberColumnOptions<TMeta>): ColumnSchema;
```

### date

```ts
function date<TMeta = unknown>(options: ColumnPresetOptions<TMeta>): ColumnSchema;
```

### foreignKey

```ts
function foreignKey<TMeta = unknown>(options: LookupColumnOptions<TMeta>): ColumnSchema;
```

### identifier

```ts
function identifier<TMeta = unknown>(options: ColumnPresetOptions<TMeta>): ColumnSchema;
```

### kind

```ts
function kind(column: ColumnSchema): ColumnPresetKind | undefined;
```

### loadColumnSizingOverrides

```ts
function loadColumnSizingOverrides(sizing: ResolvedColumnSizing, schema: readonly ColumnSchema[]): ColumnSizingOverrides;
```

### lookupCapabilities

```ts
function lookupCapabilities(preset: ColumnPreset): LookupCapabilities | undefined;
```

### lookupValue

```ts
function lookupValue<TMeta = unknown>(options: LookupColumnOptions<TMeta>): ColumnSchema;
```

### meta

```ts
function meta<TMeta = unknown>(column: ColumnSchema): TMeta | undefined;
```

### normalizeOptions

```ts
function normalizeOptions(options: readonly (SelectOption | string)[]): readonly SelectOption[];
```

### number

```ts
function number<TMeta = unknown>(options: NumberColumnOptions<TMeta>): ColumnSchema;
```

### parse

```ts
function parse(column: ColumnSchema): ((value: string, props: CellEditorProps) => unknown) | undefined;
```

### parseNumericInput

Decode the text accepted by Sapporta's numeric editors.

```ts
function parseNumericInput(value: string): NumericInputParseResult;
```

### percentage

```ts
function percentage<TMeta = unknown>(options: NumberColumnOptions<TMeta>): ColumnSchema;
```

### preset

```ts
function preset(column: ColumnSchema): ColumnPreset | undefined;
```

### presetRuntime

```ts
function presetRuntime<TMeta = unknown>(column: ColumnSchema): ColumnPresetRuntime<TMeta> | undefined;
```

### resolveColumnSizing

```ts
function resolveColumnSizing(options: ColumnSizingOptions | undefined, context: ColumnSizingStorageKeyContext): ResolvedColumnSizing;
```

### rowSelectionColumn

```ts
function rowSelectionColumn(options?: RowSelectionColumnOptions): ColumnSchema;
```

### sanitizeColumnSizingOverrides

```ts
function sanitizeColumnSizingOverrides(value: unknown, schema: readonly ColumnSchema[], minPx?: number): ColumnSizingOverrides;
```

### saveColumnSizingOverrides

```ts
function saveColumnSizingOverrides(sizing: ResolvedColumnSizing, schema: readonly ColumnSchema[], overrides: ColumnSizingOverrides): void;
```

### select

```ts
function select<TMeta = unknown>(options: SelectColumnOptions<TMeta>): ColumnSchema;
```

### templateColumns

```ts
function templateColumns(columns: readonly ColumnSchema[], overrides?: ColumnSizingOverrides): string;
```

### text

```ts
function text<TMeta = unknown>(options: TextColumnOptions<TMeta>): ColumnSchema;
```

### trackForColumn

```ts
function trackForColumn(column: ColumnSchema, overrides?: Readonly<Record<ColId, number>>): string;
```

### width

```ts
function width(column: ColumnSchema): ColumnWidth | undefined;
```
