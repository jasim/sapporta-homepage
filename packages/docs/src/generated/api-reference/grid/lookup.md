---
title: "@sapporta/grid/lookup"
package: "@sapporta/grid"
version: "0.6.0"
specifier: "@sapporta/grid/lookup"
---

> Sapporta API reference for `@sapporta/grid@0.6.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/grid/lookup

Import from `@sapporta/grid/lookup`. Documented from `@sapporta/grid@0.6.0`; confirm the installed version with `node -p "require('@sapporta/grid/package.json').version"`.

18 symbols documented here.

## Types (9)

### GridValueLookupColumn

```ts
type GridValueLookupColumn = {
    colId: ColId;
    valueLookup: ValueLookup;
};
```

### LookupCapabilities

```ts
type LookupCapabilities<TValue extends LookupValue = LookupValue, TMeta = unknown> = {
    valueLookup: ValueLookup<TValue, TMeta>;
    searchLookup?: SearchLookup<TValue, TMeta>;
};
```

### LookupEntry

```ts
type LookupEntry<TValue extends LookupValue = LookupValue, TMeta = unknown> = {
    value: TValue;
    label: string;
    description?: string;
    disabled?: boolean;
    /** Source data available to custom lookup item renderers. */
    meta?: TMeta;
};
```

### LookupSearchPage

```ts
type LookupSearchPage<TValue extends LookupValue = LookupValue, TMeta = unknown> = {
    entries: readonly LookupEntry<TValue, TMeta>[];
    nextCursor?: string;
};
```

### LookupSearchRequest

```ts
type LookupSearchRequest = {
    searchText?: string;
    limit?: number;
    cursor?: string;
    /** Entry metadata fields displayed by the requesting picker. */
    fields?: readonly string[];
};
```

### LookupSubscription

```ts
type LookupSubscription = {
    subscribeToLookupChanges(listener: () => void): () => void;
};
```

### LookupValue

```ts
type LookupValue = string | number;
```

### SearchLookup

```ts
type SearchLookup<TValue extends LookupValue = LookupValue, TMeta = unknown> = LookupSubscription & {
    /**
     * React external-store invariant: callers use this as a
     * `useSyncExternalStore` snapshot reader. For the same normalized search
     * text, repeated reads must return the same array reference until the
     * lookup store actually changes; allocating a fresh `[]` or filtered array
     * on each read makes React treat the snapshot as changing during render.
     */
    cachedSearchResults(request?: Pick<LookupSearchRequest, "searchText" | "fields">): readonly LookupEntry<TValue, TMeta>[];
    loadSearchResults(request?: LookupSearchRequest): Promise<LookupSearchPage<TValue, TMeta>>;
};
```

### ValueLookup

```ts
type ValueLookup<TValue extends LookupValue = LookupValue, TMeta = unknown> = LookupSubscription & {
    entryForValue(value: unknown): LookupEntry<TValue, TMeta> | undefined;
    loadMissingEntries(values: readonly unknown[]): Promise<void>;
};
```

## Functions and components (4)

### isLookupValue

```ts
function isLookupValue(value: unknown): value is LookupValue;
```

### lookupValueEquals

```ts
function lookupValueEquals(a: LookupValue, b: LookupValue): boolean;
```

### lookupValueKey

Tagged by `typeof`: a numeric id and its string form are distinct keys.

```ts
function lookupValueKey(value: LookupValue): string;
```

### startLoadingValueLookupEntriesForGridRows

```ts
function startLoadingValueLookupEntriesForGridRows(args: {
    runtime: GridRuntime;
    lookupColumnsForGridPath: (path: GridPath) => readonly GridValueLookupColumn[];
}): () => void;
```

## Values, classes, and namespaces (5)

### CachedSearchLookup

```ts
class CachedSearchLookup<TValue extends LookupValue = LookupValue, TMeta = unknown> extends SearchLookupStore implements SearchLookup<TValue, TMeta> {
    private readonly loadEntriesForSearch;
    private readonly defaultSearchLimit;
    private readonly maxCachedSearches;
    private readonly searchPagesByScope;
    private readonly loadingSearchesByRequest;
    private readonly latestRequestBySearchScope;
    constructor(args: {
        loadEntriesForSearch: LoadEntriesForSearch<TValue, TMeta>;
        defaultSearchLimit?: number;
        maxCachedSearches?: number;
    });
    cachedSearchResults(request?: Pick<LookupSearchRequest, "searchText" | "fields">): readonly LookupEntry<TValue, TMeta>[];
    loadSearchResults(request?: LookupSearchRequest): Promise<LookupSearchPage<TValue, TMeta>>;
    private normalizeRequest;
    private loadAndStoreSearchPage;
    private evictOldSearches;
}
```

### CachedValueLookup

```ts
class CachedValueLookup<TValue extends LookupValue = LookupValue, TMeta = unknown> extends ValueLookupStore<TValue, TMeta> implements ValueLookup<TValue, TMeta> {
    private readonly loadEntriesForValues;
    private readonly loadingEntriesByValueKey;
    constructor(args: {
        loadEntriesForValues: LoadEntriesForValues<TValue, TMeta>;
    });
    loadMissingEntries(values: readonly unknown[]): Promise<void>;
    private loadAndStoreEntries;
}
```

### RecordValueLookup

```ts
class RecordValueLookup extends StaticValueLookup<string, unknown> implements ValueLookup<string, unknown> {
    constructor(labelsByValue: Record<string, string>);
}
```

### StaticSearchLookup

```ts
class StaticSearchLookup<TValue extends LookupValue = LookupValue, TMeta = unknown> extends SearchLookupStore implements SearchLookup<TValue, TMeta> {
    private readonly entries;
    private readonly entriesBySearchScope;
    constructor(entries: readonly LookupEntry<TValue, TMeta>[]);
    cachedSearchResults(request?: Pick<LookupSearchRequest, "searchText" | "fields">): readonly LookupEntry<TValue, TMeta>[];
    loadSearchResults(request?: LookupSearchRequest): Promise<LookupSearchPage<TValue, TMeta>>;
    private entriesForRequest;
}
```

### StaticValueLookup

```ts
class StaticValueLookup<TValue extends LookupValue = LookupValue, TMeta = unknown> extends ValueLookupStore<TValue, TMeta> implements ValueLookup<TValue, TMeta> {
    constructor(entries: readonly LookupEntry<TValue, TMeta>[]);
    loadMissingEntries(_values: readonly unknown[]): Promise<void>;
}
```
