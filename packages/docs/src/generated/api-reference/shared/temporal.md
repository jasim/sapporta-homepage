---
title: "@sapporta/shared/temporal"
package: "@sapporta/shared"
version: "0.3.2"
specifier: "@sapporta/shared/temporal"
---

> Sapporta API reference for `@sapporta/shared@0.3.2`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared/temporal

Import from `@sapporta/shared/temporal`. Documented from `@sapporta/shared@0.3.2`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

25 symbols documented here.

## Types (3)

### LocalDayBound

Canonical instant <-> browser date input codec.

```ts
type LocalDayBound = "startOfDay" | "endOfDay";
```

### TemporalDisplayPrecision

Canonical value -> reading text.

```ts
type TemporalDisplayPrecision = "day" | "minute";
```

### TimeZone

An IANA zone id this runtime can read and do calendar math in.

```ts
type TimeZone = string & {
    readonly [timeZoneBrand]: true;
};
```

## Functions and components (21)

### canonicalizeInstantString

Round-trip a string through the canonical form.

```ts
function canonicalizeInstantString(s: string): string;
```

### describeInstantForDisplay

The full moment, for a tooltip or a detail line.

```ts
function describeInstantForDisplay(value: string, zone: TimeZone): string | null;
```

### deviceTimeZone

The zone the device is set to, for choosing a new workspace's first calendar.

```ts
function deviceTimeZone(): TimeZone;
```

### formatCanonicalInstant

Serialize a `Temporal.Instant` to the canonical `YYYY-MM-DDTHH:mm:ssZ` shape.

```ts
function formatCanonicalInstant(i: Temporal.Instant): string;
```

### formatInstantForDateInput

```ts
function formatInstantForDateInput(value: unknown, zone: TimeZone): string;
```

### formatInstantForDateTimeLocalInput

Canonical instant <-> browser datetime-local input codec.

```ts
function formatInstantForDateTimeLocalInput(value: unknown, zone: TimeZone): string;
```

### formatInstantForDisplay

```ts
function formatInstantForDisplay(value: string, precision: TemporalDisplayPrecision, zone: TimeZone): string;
```

### formatPlainDate

Format a `Temporal.PlainDate` back to its canonical ISO string.

```ts
function formatPlainDate(d: Temporal.PlainDate): string;
```

### formatPlainDateForDateInput

Canonical date <-> browser date input codec.

```ts
function formatPlainDateForDateInput(value: unknown): string;
```

### formatPlainDateForDisplay

```ts
function formatPlainDateForDisplay(value: string): string;
```

### formatTemporalForDisplay

Format whichever canonical shape the value carries at the requested precision, or report that it carries neither by returning `null`.

```ts
function formatTemporalForDisplay(value: string, precision: TemporalDisplayPrecision, zone: TimeZone): string | null;
```

### formatTimeZoneOffsetLabel

A short name for a zone, for a chip or a menu entry: `UTC+05:30`, `UTC-07:00`, `UTC`.

```ts
function formatTimeZoneOffsetLabel(zone: TimeZone, at?: Temporal.Instant): string;
```

### isValidTimeZone

Whether the runtime can do calendar math in `zone`.

```ts
function isValidTimeZone(zone: string): zone is TimeZone;
```

### localDayInZone

The calendar day `instant` falls on in `zone`, as `YYYY-MM-DD`.

```ts
function localDayInZone(instant: string, zone: TimeZone): string;
```

### parseCanonicalInstant

Parse a timestamp input to a `Temporal.Instant`.

```ts
function parseCanonicalInstant(s: string): Temporal.Instant;
```

### parseDateInputToInstantString

```ts
function parseDateInputToInstantString(value: string, bound: LocalDayBound, zone: TimeZone): string | null;
```

### parseDateInputToPlainDateString

```ts
function parseDateInputToPlainDateString(value: string): string | null;
```

### parseDateTimeLocalInputToCanonicalInstantString

```ts
function parseDateTimeLocalInputToCanonicalInstantString(value: string, zone: TimeZone): string | null;
```

### parsePlainDate

Parse an ISO `YYYY-MM-DD` string to a `Temporal.PlainDate`.

```ts
function parsePlainDate(s: string): Temporal.PlainDate;
```

### parseTimeZone

`zone` as a checked zone, or an error naming the mistake.

```ts
function parseTimeZone(zone: string): TimeZone;
```

### supportedTimeZones

Every zone a picker can offer, checked, in the order the runtime lists them.

```ts
function supportedTimeZones(): readonly TimeZone[];
```

## Values, classes, and namespaces (1)

### Temporal

Re-exported from `@js-temporal/polyfill`. See that package for its declaration.
