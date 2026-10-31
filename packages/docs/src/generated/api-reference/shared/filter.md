---
title: "@sapporta/shared/filter"
package: "@sapporta/shared"
version: "0.7.0"
specifier: "@sapporta/shared/filter"
---

> Sapporta API reference for `@sapporta/shared@0.7.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared/filter

Import from `@sapporta/shared/filter`. Documented from `@sapporta/shared@0.7.0`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

43 symbols documented here.

## Types (14)

### FilterCondition

A column-scoped condition.

```ts
type FilterCondition = {
    id: string;
    column: string;
    op: ScalarOp;
    value: string;
} | {
    id: string;
    column: string;
    op: ListOp;
    values: string[];
} | {
    id: string;
    column: string;
    op: NullOp;
    polarity: Polarity;
};
```

### FilterDraftCondition

A condition without an id, such as one being authored or one about to be encoded.

```ts
type FilterDraftCondition = {
    column: string;
    op: ScalarOp;
    value: string;
} | {
    column: string;
    op: ListOp;
    values: readonly FilterDraftValue[];
} | {
    column: string;
    op: NullOp;
    polarity: Polarity;
};
```

### FilterDraftValue

```ts
type FilterDraftValue = string | number;
```

### FilterNamespace

The query-string prefix a list of conditions is written under: `filter[col][op]` or `fixed[col][op]`.

```ts
type FilterNamespace = "filter" | "fixed";
```

### FilterParseErrorCode

Closed taxonomy of grammar-level parse failures.

```ts
type FilterParseErrorCode = "unknown_filter_shape" | "unknown_op" | "bad_value";
```

### FilterTableLike

```ts
type FilterTableLike = {
    columns: readonly {
        name: string;
        kind: ValueKind;
    }[];
};
```

### ListOp

```ts
type ListOp = (typeof LIST_OPS)[number];
```

### NullOp

```ts
type NullOp = (typeof NULL_OPS)[number];
```

### Operator

```ts
type Operator = (typeof OPERATORS)[number];
```

### Polarity

```ts
type Polarity = (typeof POLARITIES)[number];
```

### ScalarOp

```ts
type ScalarOp = (typeof SCALAR_OPS)[number];
```

### TypedFilterCondition

A column-scoped condition with a typed value.

```ts
type TypedFilterCondition = {
    id: string;
    column: string;
    op: ScalarOp;
    kind: ValueKind;
    value: TypedValue;
} | {
    id: string;
    column: string;
    op: ListOp;
    kind: ValueKind;
    values: TypedValue[];
} | {
    id: string;
    column: string;
    op: NullOp;
    kind: ValueKind;
    polarity: Polarity;
};
```

### TypedFilterParseCode

Typed version of `FilterParseError` failure codes.

```ts
type TypedFilterParseCode = "bad_value" | "op_not_applicable" | "unknown_column";
```

### TypedValue

A typed value post-boundary-parse.

```ts
type TypedValue = string | number | boolean | Temporal.PlainDate | Temporal.Instant | null;
```

## Functions and components (22)

### checkOperatorApplicable

Assert that `op` is applicable to `kind` or throw.

```ts
function checkOperatorApplicable(kind: ValueKind, op: Operator, column: string): void;
```

### conditionContentEqual

Deep equality on the `column + op + value` content of a condition.

```ts
function conditionContentEqual(a: TypedFilterCondition, b: TypedFilterCondition): boolean;
```

### decodeFilterObject

Parse filter conditions written as a JSON object, such as the CLI's `--where` flag:

```ts
function decodeFilterObject(source: unknown): FilterDraftCondition[];
```

### decodeFilters

Parse filter entries out of a query-string source into a list of conditions.

```ts
function decodeFilters(source: URLSearchParams | Readonly<QueryParamRecord>, namespace?: FilterNamespace): FilterCondition[];
```

### encodeFilters

Serialize a list of conditions to `URLSearchParams` in wire format.

```ts
function encodeFilters(filters: readonly FilterDraftCondition[], namespace?: FilterNamespace): URLSearchParams;
```

### encodeFilterValue

Serialize a condition's value for transmission.

```ts
function encodeFilterValue(cond: FilterDraftCondition): string;
```

### encodeTypedCondition

```ts
function encodeTypedCondition(cond: TypedFilterCondition): FilterCondition;
```

### encodeTypedFilters

Edge adapter for URL/API calls that already carry typed conditions.

```ts
function encodeTypedFilters(filters: readonly TypedFilterCondition[], namespace?: FilterNamespace): URLSearchParams;
```

### encodeTypedValue

```ts
function encodeTypedValue(v: TypedValue): string;
```

### eqCondition

Convenience: build a scalar equality condition, id-minted.

```ts
function eqCondition(column: string, value: string): FilterCondition;
```

### filtersEqual

List-order-sensitive equality.

```ts
function filtersEqual(a: readonly TypedFilterCondition[], b: readonly TypedFilterCondition[]): boolean;
```

### isOperator

```ts
function isOperator(v: string): v is Operator;
```

### materializeTypedFilterCondition

```ts
function materializeTypedFilterCondition(draft: FilterDraftCondition, table: FilterTableLike, id?: string): TypedFilterCondition;
function materializeTypedFilterCondition(draft: FilterDraftCondition, table: FilterTableInput, id?: string): TypedFilterCondition;
```

### mintFilterId

Mint a fresh in-memory id for a FilterCondition.

```ts
function mintFilterId(column: string, op: string): string;
```

### normalizeFilters

Accept either a ready-made condition list or the convenience shape `{ column: value }` of scalar equality filters; return a normalized list.

```ts
function normalizeFilters(init: Record<string, string> | FilterCondition[] | undefined): FilterCondition[];
```

### parseFilterForTable

```ts
function parseFilterForTable(filter: FilterCondition, table: FilterTableLike): TypedFilterCondition;
function parseFilterForTable(filter: FilterCondition, table: FilterTableInput): TypedFilterCondition;
```

### parseFilters

Boundary parse: convert raw filter conditions to typed ones.

```ts
function parseFilters(raw: FilterCondition[], resolveKind: (column: string) => ValueKind | undefined): TypedFilterCondition[];
```

### parseFiltersForTable

```ts
function parseFiltersForTable(filters: readonly FilterCondition[], table: FilterTableLike): TypedFilterCondition[];
function parseFiltersForTable(filters: readonly FilterCondition[], table: FilterTableInput): TypedFilterCondition[];
```

### parseFilterValue

Parse a raw URL-string into the typed form for a declared `kind`.

```ts
function parseFilterValue(kind: ValueKind, raw: string): TypedValue;
```

### serializeTypedValue

Serialize a TypedValue for binding to a SQLite query.

```ts
function serializeTypedValue(v: TypedValue): unknown;
```

### updateTypedFilterCondition

```ts
function updateTypedFilterCondition(existing: TypedFilterCondition, draft: FilterDraftCondition, table: FilterTableLike): TypedFilterCondition;
function updateTypedFilterCondition(existing: TypedFilterCondition, draft: FilterDraftCondition, table: FilterTableInput): TypedFilterCondition;
```

### wireKey

Wire-format key for a column+op pair, such as `filter[col][op]`.

```ts
function wireKey(column: string, op: Operator, namespace?: FilterNamespace): string;
```

## Values, classes, and namespaces (7)

### FilterParseError

Thrown on a grammar violation: by `decodeFilters` and `decodeFilterObject` on input, and by `wireKey` and `encodeFilterValue` for a filter the wire format cannot carry.

```ts
class FilterParseError extends Error {
    readonly code: FilterParseErrorCode;
    constructor(code: FilterParseErrorCode, message: string);
}
```

### LIST_OPS

```ts
const LIST_OPS: readonly ["in", "nin"];
```

### NULL_OPS

```ts
const NULL_OPS: readonly ["is"];
```

### OPERATORS

```ts
const OPERATORS: readonly ["eq", "neq", "gt", "gte", "lt", "lte", "contains", "startswith", "endswith", "in", "nin", "is"];
```

### POLARITIES

```ts
const POLARITIES: readonly ["null", "notnull"];
```

### SCALAR_OPS

```ts
const SCALAR_OPS: readonly ["eq", "neq", "gt", "gte", "lt", "lte", "contains", "startswith", "endswith"];
```

### TypedFilterParseError

Thrown by `parseFilters` and `parseFilterValue` on typed-boundary failures.

```ts
class TypedFilterParseError extends Error {
    readonly code: TypedFilterParseCode;
    constructor(code: TypedFilterParseCode, message: string);
}
```
