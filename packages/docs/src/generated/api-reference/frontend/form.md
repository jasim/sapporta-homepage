---
title: "@sapporta/frontend/form"
package: "@sapporta/frontend"
version: "0.7.0"
specifier: "@sapporta/frontend/form"
---

> Sapporta API reference for `@sapporta/frontend@0.7.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/frontend/form

Import from `@sapporta/frontend/form`. Documented from `@sapporta/frontend@0.7.0`; confirm the installed version with `node -p "require('@sapporta/frontend/package.json').version"`.

3 symbols documented here.

## Functions and components (2)

### fieldIssuesForSubmissionError

Return field issues carried by local submission validation or an API body.

```ts
function fieldIssuesForSubmissionError(error: unknown): FieldIssue[];
```

### firstFormErrorMessage

Normalize TanStack Form's first field error into displayable text.

```ts
function firstFormErrorMessage(errors: readonly unknown[]): string | undefined;
```

## Values, classes, and namespaces (1)

### FormSubmissionError

A submission failure whose issues can be rendered beside form fields.

```ts
class FormSubmissionError extends Error {
    readonly issues: readonly FieldIssue[];
    constructor(issues: readonly FieldIssue[]);
}
```
