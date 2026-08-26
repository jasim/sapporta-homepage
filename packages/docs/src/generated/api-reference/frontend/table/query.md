---
title: "@sapporta/frontend/table/query"
package: "@sapporta/frontend"
version: "0.6.0"
specifier: "@sapporta/frontend/table/query"
---

> Sapporta API reference for `@sapporta/frontend@0.6.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/frontend/table/query

Import from `@sapporta/frontend/table/query`. Documented from `@sapporta/frontend@0.6.0`; confirm the installed version with `node -p "require('@sapporta/frontend/package.json').version"`.

10 symbols documented here.

## Types (7)

### DecodedTableRecordQueryArgs

```ts
type DecodedTableRecordQueryArgs<TRow> = TableRecordQueryArgs & {
    decodeRow: TableRowDecoder<TRow>;
};
```

### DecodedTableRecordsPageQueryArgs

```ts
type DecodedTableRecordsPageQueryArgs<TRow> = FetchTableRowsParams & {
    decodeRow: TableRowDecoder<TRow>;
};
```

### TableRecordQueryArgs

```ts
type TableRecordQueryArgs = {
    tableName: string;
    recordId: RecordId;
};
```

### TableRecordQueryKey

```ts
type TableRecordQueryKey = ReturnType<typeof tableQueryKeys.record>;
```

### TableRecordsPage

```ts
type TableRecordsPage<TRow> = Omit<PaginatedRows, "data"> & {
    data: TRow[];
};
```

### TableRecordsPageQueryKey

```ts
type TableRecordsPageQueryKey = ReturnType<typeof tableQueryKeys.page>;
```

### TableRowDecoder

```ts
type TableRowDecoder<TRow> = (row: Row) => TRow;
```

## Functions and components (2)

### tableRecordQueryOptions

```ts
function tableRecordQueryOptions(args: TableRecordQueryArgs): BuiltQueryOptions<Row, TableRecordQueryKey>;
function tableRecordQueryOptions<TRow>(args: DecodedTableRecordQueryArgs<TRow>): BuiltQueryOptions<TRow, TableRecordQueryKey>;
```

### tableRecordsPageQueryOptions

```ts
function tableRecordsPageQueryOptions(args: FetchTableRowsParams): BuiltQueryOptions<TableRecordsPage<Row>, TableRecordsPageQueryKey>;
function tableRecordsPageQueryOptions<TRow>(args: DecodedTableRecordsPageQueryArgs<TRow>): BuiltQueryOptions<TableRecordsPage<TRow>, TableRecordsPageQueryKey>;
```

## Values, classes, and namespaces (1)

### tableQueryKeys

Cache-key hierarchy for generic table reads.

```ts
const tableQueryKeys: {
    readonly all: readonly ["sapporta", "tables"];
    readonly table: typeof tableQueryKey;
    readonly records: typeof tableRecordsQueryKey;
    readonly record: typeof tableRecordQueryKey;
    readonly pages: typeof tableRecordsPagesQueryKey;
    readonly page: (params: FetchTableRowsParams) => readonly ["sapporta", "tables", string, "pages", Readonly<QueryParamRecord>];
};
```
