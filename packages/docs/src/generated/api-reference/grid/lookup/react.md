---
title: "@sapporta/grid/lookup/react"
package: "@sapporta/grid"
version: "0.5.1"
specifier: "@sapporta/grid/lookup/react"
---

> Sapporta API reference for `@sapporta/grid@0.5.1`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/grid/lookup/react

Import from `@sapporta/grid/lookup/react`. Documented from `@sapporta/grid@0.5.1`; confirm the installed version with `node -p "require('@sapporta/grid/package.json').version"`.

4 symbols documented here.

## Functions and components (4)

### useLookupOptions

```ts
function useLookupOptions<TValue extends LookupValue = LookupValue, TMeta = unknown>(args: {
    valueLookup: ValueLookup<TValue, TMeta> | undefined;
    searchLookup: SearchLookup<TValue, TMeta> | undefined;
    selectedValues: readonly TValue[];
    searchText: string;
    limit: number;
    fields?: readonly string[];
}): readonly LookupEntry<TValue, TMeta>[];
```

### useLookupSearchResults

```ts
function useLookupSearchResults<TValue extends LookupValue = LookupValue, TMeta = unknown>(searchLookup: SearchLookup<TValue, TMeta> | undefined, searchText: string, limit: number, fields?: readonly string[]): readonly LookupEntry<TValue, TMeta>[];
```

### useLookupValueEntries

```ts
function useLookupValueEntries<TValue extends LookupValue = LookupValue, TMeta = unknown>(valueLookup: ValueLookup<TValue, TMeta> | undefined, values: readonly TValue[]): readonly (LookupEntry<TValue, TMeta> | undefined)[];
```

### useLookupValueLabels

```ts
function useLookupValueLabels<TValue extends LookupValue = LookupValue, TMeta = unknown>(valueLookup: ValueLookup<TValue, TMeta> | undefined, values: readonly TValue[]): {
    labelFor(value: TValue): string | null;
};
```
