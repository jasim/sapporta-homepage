---
title: "@sapporta/shared/validation"
package: "@sapporta/shared"
version: "0.3.2"
specifier: "@sapporta/shared/validation"
---

> Sapporta API reference for `@sapporta/shared@0.3.2`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared/validation

Import from `@sapporta/shared/validation`. Documented from `@sapporta/shared@0.3.2`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

11 symbols documented here.

## Types (6)

### ApiProblem

The structured, presentation-neutral parts of a Sapporta error body.

```ts
interface ApiProblem {
    summary: string;
    code?: string;
    fieldIssues: readonly FieldIssue[];
}
```

### BoundedIntegerErrorFactory

```ts
type BoundedIntegerErrorFactory = (message: string) => Error;
```

### BoundedIntegerOptions

```ts
interface BoundedIntegerOptions {
    name: string;
    min: number;
    max?: number;
    makeError: BoundedIntegerErrorFactory;
}
```

### FieldIssue

A validation issue associated with one form or request field.

```ts
interface FieldIssue {
    field: string;
    message: string;
}
```

### OptionalBoundedIntegerOptions

```ts
interface OptionalBoundedIntegerOptions extends BoundedIntegerOptions {
    blankAsUndefined?: boolean;
}
```

### RequiredBoundedIntegerOptions

```ts
interface RequiredBoundedIntegerOptions extends BoundedIntegerOptions {
    defaultValue: number;
}
```

## Functions and components (5)

### apiProblemFromBody

Parse a Sapporta ErrorBody and normalize its recognized field details.

```ts
function apiProblemFromBody(body: unknown): ApiProblem | undefined;
```

### assertBoundedInteger

```ts
function assertBoundedInteger(value: number, options: BoundedIntegerOptions): void;
```

### fieldIssuesFromZodError

Convert Zod issues without discarding nested field paths.

```ts
function fieldIssuesFromZodError(error: ZodError): FieldIssue[];
```

### parseBoundedInteger

```ts
function parseBoundedInteger(raw: BoundedIntegerInput, options: RequiredBoundedIntegerOptions): number;
```

### parseOptionalBoundedInteger

```ts
function parseOptionalBoundedInteger(raw: BoundedIntegerInput, options: OptionalBoundedIntegerOptions): number | undefined;
```
