---
title: "@sapporta/shared/temporal"
package: "@sapporta/shared"
version: "0.2.4"
specifier: "@sapporta/shared/temporal"
---

> Sapporta API reference for `@sapporta/shared@0.2.4`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared/temporal

Import from `@sapporta/shared/temporal`. Documented from `@sapporta/shared@0.2.4`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

10 symbols documented here.

## Functions and components (9)

### canonicalizeInstantString

Round-trip a string through the canonical form.

```ts
function canonicalizeInstantString(s: string): string;
```

### formatCanonicalInstant

Serialize a `Temporal.Instant` to the canonical `YYYY-MM-DDTHH:mm:ssZ` shape.

```ts
function formatCanonicalInstant(i: Temporal.Instant): string;
```

### formatInstantForDateTimeLocalInput

Canonical instant <-> browser datetime-local input codec.

```ts
function formatInstantForDateTimeLocalInput(value: unknown): string;
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

### parseCanonicalInstant

Parse a timestamp input to a `Temporal.Instant`.

```ts
function parseCanonicalInstant(s: string): Temporal.Instant;
```

### parseDateInputToPlainDateString

```ts
function parseDateInputToPlainDateString(value: string): string | null;
```

### parseDateTimeLocalInputToCanonicalInstantString

```ts
function parseDateTimeLocalInputToCanonicalInstantString(value: string): string | null;
```

### parsePlainDate

Parse an ISO `YYYY-MM-DD` string to a `Temporal.PlainDate`.

```ts
function parsePlainDate(s: string): Temporal.PlainDate;
```

## Values, classes, and namespaces (1)

### Temporal

Re-exported from `@js-temporal/polyfill`. See that package for its declaration.
