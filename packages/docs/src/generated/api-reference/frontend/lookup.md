---
title: "@sapporta/frontend/lookup"
package: "@sapporta/frontend"
version: "0.6.1"
specifier: "@sapporta/frontend/lookup"
---

> Sapporta API reference for `@sapporta/frontend@0.6.1`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/frontend/lookup

Import from `@sapporta/frontend/lookup`. Documented from `@sapporta/frontend@0.6.1`; confirm the installed version with `node -p "require('@sapporta/frontend/package.json').version"`.

18 symbols documented here.

## Types (6)

### LookupForColumn

```ts
type LookupForColumn<TMeta = unknown> = (column: ColumnSchema) => LookupCapabilities<LookupValue, TMeta> | undefined;
```

### LookupPickerItemDisplay

Choose table-like fields or a React component for each dropdown item.

```ts
type LookupPickerItemDisplay<TValue extends LookupValue = LookupValue, TMeta = unknown> = {
    /** Fields rendered by this item and therefore included in lookup search. */
    fields: readonly Extract<keyof TMeta, string>[];
    component?: ComponentType<LookupPickerItemProps<TValue, TMeta>>;
};
```

### LookupPickerItemProps

```ts
type LookupPickerItemProps<TValue extends LookupValue = LookupValue, TMeta = unknown> = {
    entry: LookupEntry<TValue, TMeta> & {
        meta: TMeta;
    };
};
```

### LookupPickerProps

```ts
type LookupPickerProps<TValue extends LookupValue = LookupValue, TMeta = unknown> = {
    lookup: LookupCapabilities<TValue, TMeta>;
    value: TValue | null;
    onChange: (value: TValue | null) => void;
    itemDisplay?: LookupPickerItemDisplay<TValue, TMeta>;
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;
    searchLimit?: number;
    id?: string;
    className?: string;
    ariaInvalid?: boolean;
    ariaDescribedBy?: string;
};
```

### LookupStore

```ts
type LookupStore<TMeta = unknown> = {
    table(tableName: string): LookupCapabilities<LookupValue, TMeta>;
    foreignKey: LookupForColumn<TMeta>;
    requireForeignKey(args: {
        tableName: string;
        column: ColumnSchema;
    }): LookupCapabilities<LookupValue, TMeta>;
    clear(): void;
};
```

### TableLookupSource

```ts
type TableLookupSource = {
    valueLookup: ValueLookup<LookupValue, Row>;
    searchLookup: SearchLookup<LookupValue, Row>;
};
```

## Functions and components (12)

### buildLookupSearchQuery

```ts
function buildLookupSearchQuery(searchText: string, limit?: number, fields?: readonly string[]): {
    q: string;
    limit?: string;
    fields?: string;
};
```

### buildLookupValueQuery

```ts
function buildLookupValueQuery(values: readonly LookupValue[]): {
    ids: string;
};
```

### createLookupStore

```ts
function createLookupStore(): LookupStore<Row>;
```

### createTableLookupSource

```ts
function createTableLookupSource(tableName: string): TableLookupSource;
```

### fetchLookup

```ts
function fetchLookup(tableName: string, ids: readonly LookupValue[]): Promise<LookupResponse>;
```

### fetchLookupEntriesForSearch

```ts
function fetchLookupEntriesForSearch(args: {
    tableName: string;
    searchText: string;
    limit: number;
    fields?: readonly string[];
}): Promise<LookupSearchPage<LookupValue, Row>>;
```

### fetchLookupEntriesForValues

```ts
function fetchLookupEntriesForValues(tableName: string, values: readonly LookupValue[]): Promise<LookupEntry<LookupValue, Row>[]>;
```

### fetchLookupSearch

```ts
function fetchLookupSearch(tableName: string, searchText: string, limit?: number, fields?: readonly string[]): Promise<LookupResponse>;
```

### lookupEntriesFromResponse

```ts
function lookupEntriesFromResponse(response: LookupResponse): LookupEntry<LookupValue, Row>[];
```

### LookupPicker

```ts
function LookupPicker<TValue extends LookupValue = LookupValue, TMeta = unknown>({ lookup, value, onChange, itemDisplay, placeholder, disabled, allowClear, searchLimit, id, className, ariaInvalid, ariaDescribedBy, }: LookupPickerProps<TValue, TMeta>): import("react").JSX.Element;
```

### useLookupStore

```ts
function useLookupStore(): LookupStore<Row>;
```

### useTableLookup

Lookup capabilities for one table.

```ts
function useTableLookup<TValue extends LookupValue = LookupValue>(tableName: string): LookupCapabilities<TValue, Row>;
```
