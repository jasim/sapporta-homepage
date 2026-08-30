---
title: "@sapporta/frontend/routes/table"
package: "@sapporta/frontend"
version: "0.7.0"
specifier: "@sapporta/frontend/routes/table"
---

> Sapporta API reference for `@sapporta/frontend@0.7.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/frontend/routes/table

Import from `@sapporta/frontend/routes/table`. Documented from `@sapporta/frontend@0.7.0`; confirm the installed version with `node -p "require('@sapporta/frontend/package.json').version"`.

3 symbols documented here.

## Types (2)

### TableGridOptionsByTable

```ts
type TableGridOptionsByTable = Record<string, TablePageGridOptions>;
```

### TableRouteProps

```ts
type TableRouteProps = {
    gridOptionsByTable?: TableGridOptionsByTable;
};
```

## Functions and components (1)

### TableRoute

```ts
function TableRoute({ gridOptionsByTable }: TableRouteProps): import("react").JSX.Element | null;
```
