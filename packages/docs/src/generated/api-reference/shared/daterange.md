---
title: "@sapporta/shared/daterange"
package: "@sapporta/shared"
version: "0.2.4"
specifier: "@sapporta/shared/daterange"
---

> Sapporta API reference for `@sapporta/shared@0.2.4`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared/daterange

Import from `@sapporta/shared/daterange`. Documented from `@sapporta/shared@0.2.4`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

16 symbols documented here.

## Types (4)

### DateRangeQueryBounds

Date bounds resolved from route query params, ready for SQL/Drizzle comparisons.

```ts
type DateRangeQueryBounds = {
    state: DateRangeState;
    from: string | null;
    to: string | null;
};
```

### DateRangeState

Discriminated union.

```ts
type DateRangeState = {
    type: "all_time";
} | {
    type: "relative";
    duration: RelativeDuration;
} | {
    type: "custom";
    start: Temporal.PlainDate | null;
    end: Temporal.PlainDate | null;
};
```

### RelativeDuration

```ts
type RelativeDuration = (typeof RELATIVE_DURATIONS)[number];
```

### ResolvedDateRange

Flattened boundary pair the engine passes to SQL.

```ts
type ResolvedDateRange = {
    from: Temporal.PlainDate | null;
    to: Temporal.PlainDate | null;
};
```

## Functions and components (7)

### dateRangeFieldNames

URL keys that carry a daterange param named `paramName`.

```ts
function dateRangeFieldNames(paramName: string): {
    relative: string;
    from: string;
    to: string;
};
```

### isRelativeDuration

```ts
function isRelativeDuration(s: string): s is RelativeDuration;
```

### parseDateRange

Read the (up to three) URL keys for `paramName` out of a flat params map and return the corresponding state.

```ts
function parseDateRange(paramName: string, params: Record<string, unknown>): DateRangeState;
```

### resolveDateRange

Collapse a `DateRangeState` to the two boundary dates the engine binds into SQL.

```ts
function resolveDateRange(state: DateRangeState, today: Temporal.PlainDate): ResolvedDateRange;
```

### resolveDateRangeQueryBounds

Parse a route query's daterange fields and resolve them to ISO date strings.

```ts
function resolveDateRangeQueryBounds(paramName: string, params: Record<string, unknown>, today?: Temporal.PlainDate): DateRangeQueryBounds;
```

### serializeDateRange

Serialize a state into the flat URL-key shape.

```ts
function serializeDateRange(state: DateRangeState, paramName: string): Record<string, string>;
```

### snapshotDateRange

Resolve a relative range to its equivalent custom range.

```ts
function snapshotDateRange(state: DateRangeState, today: Temporal.PlainDate): DateRangeState;
```

## Values, classes, and namespaces (5)

### allTime

```ts
const allTime: () => DateRangeState;
```

### custom

```ts
const custom: (start: Temporal.PlainDate | null, end: Temporal.PlainDate | null) => DateRangeState;
```

### DateRangeParseError

```ts
class DateRangeParseError extends Error {
    readonly context: unknown;
    constructor(message: string, context: unknown);
}
```

### relative

```ts
const relative: (duration: RelativeDuration) => DateRangeState;
```

### RELATIVE_DURATIONS

Rolling-window presets.

```ts
const RELATIVE_DURATIONS: readonly ["7d", "30d", "90d", "1y", "mtd", "ytd"];
```
