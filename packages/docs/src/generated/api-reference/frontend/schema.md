---
title: "@sapporta/frontend/schema"
package: "@sapporta/frontend"
version: "0.6.0"
specifier: "@sapporta/frontend/schema"
---

> Sapporta API reference for `@sapporta/frontend@0.6.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/frontend/schema

Import from `@sapporta/frontend/schema`. Documented from `@sapporta/frontend@0.6.0`; confirm the installed version with `node -p "require('@sapporta/frontend/package.json').version"`.

5 symbols documented here.

## Functions and components (4)

### fetchProjectInfo

```ts
function fetchProjectInfo(): Promise<ProjectInfo>;
```

### fetchSchema

Load and validate the server's browser-safe table model.

```ts
function fetchSchema(): Promise<{
    tables: TableSchema[];
}>;
```

### loadProjectInfo

```ts
function loadProjectInfo(): Promise<void>;
```

### loadSchema

```ts
function loadSchema(opts?: {
    force?: boolean;
}): Promise<void>;
```

## Values, classes, and namespaces (1)

### useSchemaStore

```ts
const useSchemaStore: import('zustand').UseBoundStore<import('zustand').StoreApi<SchemaState & SchemaActions>>;
```
