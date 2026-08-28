---
title: "@sapporta/shared/csv"
package: "@sapporta/shared"
version: "0.3.1"
specifier: "@sapporta/shared/csv"
---

> Sapporta API reference for `@sapporta/shared@0.3.1`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared/csv

Import from `@sapporta/shared/csv`. Documented from `@sapporta/shared@0.3.1`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

3 symbols documented here.

## Functions and components (3)

### cellToCsvString

```ts
function cellToCsvString(value: unknown): string;
```

### csvEscape

CSV serialization shared by the server's table export and the grid's clipboard copy.

```ts
function csvEscape(value: string): string;
```

### csvRow

```ts
function csvRow(values: readonly unknown[]): string;
```
