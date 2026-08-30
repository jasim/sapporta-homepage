---
title: "@sapporta/grid/column-preset — Values, classes, and namespaces"
package: "@sapporta/grid"
version: "0.6.0"
specifier: "@sapporta/grid/column-preset"
---

> Sapporta API reference for `@sapporta/grid@0.6.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/grid/column-preset — Values, classes, and namespaces

Import from `@sapporta/grid/column-preset`. Documented from `@sapporta/grid@0.6.0`; confirm the installed version with `node -p "require('@sapporta/grid/package.json').version"`.

4 of 100 symbols published from `@sapporta/grid/column-preset`. Other groups: [Types](https://sapporta.com/api-reference/grid/column-preset-types.md), [Functions and components](https://sapporta.com/api-reference/grid/column-preset-functions.md).

### columnPreset

```ts
const columnPreset: {
    identifier: typeof identifier;
    text: typeof text;
    number: typeof number;
    currency: typeof currency;
    percentage: typeof percentage;
    date: typeof date;
    timestamp: typeof timestamp;
    boolean: typeof boolean;
    select: typeof select;
    lookupValue: typeof lookupValue;
    foreignKey: typeof foreignKey;
    column: typeof column;
    chrome: typeof chrome;
    preset: typeof preset;
    meta: typeof meta;
    kind: typeof kind;
    width: typeof width;
    parse: typeof parse;
    trackForColumn: typeof trackForColumn;
    templateColumns: typeof templateColumns;
};
```

### DEFAULT_COLUMN_RESIZE_MIN_PX

```ts
const DEFAULT_COLUMN_RESIZE_MIN_PX = 48;
```

### GRID_COLUMN_PRESET_RUNTIME

```ts
const GRID_COLUMN_PRESET_RUNTIME: unique symbol;
```

### presetCellClassNames

Class names the built-in text cells use, for columns that render their own.

```ts
const presetCellClassNames: {
    readonly text: string;
    readonly identifier: string;
    readonly multiLine: string;
};
```
