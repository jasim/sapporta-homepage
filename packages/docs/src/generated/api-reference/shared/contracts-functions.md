---
title: "@sapporta/shared/contracts — Functions and components"
package: "@sapporta/shared"
version: "0.3.2"
specifier: "@sapporta/shared/contracts"
---

> Sapporta API reference for `@sapporta/shared@0.3.2`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared/contracts — Functions and components

Import from `@sapporta/shared/contracts`. Documented from `@sapporta/shared@0.3.2`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

2 of 112 symbols published from `@sapporta/shared/contracts`. Other groups: [Types](https://sapporta.com/api-reference/shared/contracts-types.md), [Values, classes, and namespaces](https://sapporta.com/api-reference/shared/contracts-values.md).

### hrefPlaceholderColumns

Column names referenced by `{column}` placeholders in a url link href.

```ts
function hrefPlaceholderColumns(href: string): string[];
```

### substituteHrefPlaceholders

Substitutes `{column}` placeholders with URL-encoded row values; null when a referenced value is absent, so the caller withholds the link instead of emitting a half-formed href.

```ts
function substituteHrefPlaceholders(href: string, values: Readonly<Record<string, unknown>>): string | null;
```
