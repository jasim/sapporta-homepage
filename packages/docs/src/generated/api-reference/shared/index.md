---
title: "@sapporta/shared"
package: "@sapporta/shared"
version: "0.7.0"
specifier: "@sapporta/shared"
---

> Sapporta API reference for `@sapporta/shared@0.7.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared

Import from `@sapporta/shared`. Documented from `@sapporta/shared@0.7.0`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

14 symbols documented here.

## Also available from narrower specifiers (115)

These are exported by `@sapporta/shared` too, but their signatures live on the narrower page. Prefer the narrower specifier in application code.

- `@sapporta/shared/contracts` — GroupCount
- `@sapporta/shared/csv` — cellToCsvString, csvEscape, csvRow
- `@sapporta/shared/daterange` — DateRangeParseError, DateRangeQueryBounds, DateRangeState, RELATIVE_DURATIONS, RelativeDuration, ResolvedDateRange, allTime, custom, dateRangeFieldNames, isRelativeDuration, parseDateRange, relative, resolveDateRange, resolveDateRangeQueryBounds, serializeDateRange, snapshotDateRange
- `@sapporta/shared/filter` — FilterCondition, FilterDraftCondition, FilterDraftValue, FilterNamespace, FilterParseError, FilterParseErrorCode, FilterTableLike, LIST_OPS, ListOp, NULL_OPS, NullOp, OPERATORS, Operator, POLARITIES, Polarity, SCALAR_OPS, ScalarOp, TypedFilterCondition, TypedFilterParseCode, TypedFilterParseError, TypedValue, checkOperatorApplicable, conditionContentEqual, decodeFilterObject, decodeFilters, encodeFilterValue, encodeFilters, encodeTypedCondition, encodeTypedFilters, encodeTypedValue, eqCondition, filtersEqual, isOperator, materializeTypedFilterCondition, mintFilterId, normalizeFilters, parseFilterForTable, parseFilterValue, parseFilters, parseFiltersForTable, serializeTypedValue, updateTypedFilterCondition, wireKey
- `@sapporta/shared/labels` — defaultColumnLabel, humanizeIdentifier, titleCaseIdentifier
- `@sapporta/shared/record-id` — RecordId, toRecordId
- `@sapporta/shared/row-scope` — SCOPED_TO_USER_ID_SQL_COLUMN, SCOPED_TO_USER_ID_TS_COLUMN, WORKSPACE_ID_SQL_COLUMN, WORKSPACE_ID_TS_COLUMN, isSystemManagedScopeFieldName, scopeColumnNames, systemManagedScopeFieldNames
- `@sapporta/shared/temporal` — LocalDayBound, Temporal, TemporalDisplayPrecision, TimeZone, canonicalizeInstantString, describeInstantForDisplay, deviceTimeZone, formatCanonicalInstant, formatInstantForDateInput, formatInstantForDateTimeLocalInput, formatInstantForDisplay, formatPlainDate, formatPlainDateForDateInput, formatPlainDateForDisplay, formatTemporalForDisplay, formatTimeZoneOffsetLabel, isValidTimeZone, localDayInZone, parseCanonicalInstant, parseDateInputToInstantString, parseDateInputToPlainDateString, parseDateTimeLocalInputToCanonicalInstantString, parsePlainDate, parseTimeZone, supportedTimeZones
- `@sapporta/shared/validation` — ApiProblem, BoundedIntegerErrorFactory, BoundedIntegerOptions, FieldIssue, OptionalBoundedIntegerOptions, RequiredBoundedIntegerOptions, apiProblemFromBody, assertBoundedInteger, fieldIssuesFromZodError, parseBoundedInteger, parseOptionalBoundedInteger
- `@sapporta/shared/value-kind` — ColumnMeta, OPERATOR_APPLICABILITY, ValueKind, isOperatorApplicable

## Types (4)

### CountGroupValue

```ts
type CountGroupValue = string | number | boolean | null;
```

### DateRangeSelectKey

```ts
type DateRangeSelectKey = "all_time" | RelativeDuration | "custom";
```

### QueryParamRecord

```ts
type QueryParamRecord = Record<string, QueryParamValue>;
```

### QueryParamValue

Lossless object representation for URL query parameters.

```ts
type QueryParamValue = string | readonly string[];
```

## Functions and components (6)

### appendQueryParam

Append one value without changing singleton keys into arrays prematurely.

```ts
function appendQueryParam(params: QueryParamRecord, key: string, value: string): void;
```

### hasRepeatedQueryParams

```ts
function hasRepeatedQueryParams(query: Readonly<QueryParamRecord>): boolean;
```

### isQueryParamRecord

```ts
function isQueryParamRecord(value: unknown): value is QueryParamRecord;
```

### lookupEntryMatches

Whether a lookup entry matches what is typed: the text, trimmed and ignoring case, inside the entry's label or inside one of its displayed `fields` in `meta`.

```ts
function lookupEntryMatches(entry: {
    label: string;
    meta?: unknown;
}, searchText: string, fields: readonly string[]): boolean;
```

### queryParamRecordToSearchParams

Convert the lossless record back to the repeated-key URL wire format.

```ts
function queryParamRecordToSearchParams(query: Readonly<QueryParamRecord>): URLSearchParams;
```

### searchWords

The words a table search matches: the term split on whitespace, with a double-quoted phrase kept as one word.

```ts
function searchWords(term: string): string[];
```

## Values, classes, and namespaces (4)

### DATE_RANGE_SELECT_KEYS

All keys in display order.

```ts
const DATE_RANGE_SELECT_KEYS: readonly DateRangeSelectKey[];
```

### DEFAULT_COUNT_GROUP_LIMIT

```ts
const DEFAULT_COUNT_GROUP_LIMIT = 50;
```

### MAX_COUNT_GROUPS

```ts
const MAX_COUNT_GROUPS = 1000;
```

### MAX_SEARCH_WORDS

The most words a search term is split into.

```ts
const MAX_SEARCH_WORDS = 16;
```
