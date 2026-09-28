---
title: "@sapporta/shared/labels"
package: "@sapporta/shared"
version: "0.4.0"
specifier: "@sapporta/shared/labels"
---

> Sapporta API reference for `@sapporta/shared@0.4.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared/labels

Import from `@sapporta/shared/labels`. Documented from `@sapporta/shared@0.4.0`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

3 symbols documented here.

## Functions and components (3)

### defaultColumnLabel

```ts
function defaultColumnLabel(columnName: string): string;
```

### humanizeIdentifier

```ts
function humanizeIdentifier(identifier: string): string;
```

### titleCaseIdentifier

Title-cases a snake_case identifier: `JOURNAL_ENTRIES` and `journal_entries` both become `Journal Entries`.

```ts
function titleCaseIdentifier(identifier: string): string;
```
