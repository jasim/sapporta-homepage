---
title: "@sapporta/shared/row-scope"
package: "@sapporta/shared"
version: "0.2.4"
specifier: "@sapporta/shared/row-scope"
---

> Sapporta API reference for `@sapporta/shared@0.2.4`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared/row-scope

Import from `@sapporta/shared/row-scope`. Documented from `@sapporta/shared@0.2.4`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

7 symbols documented here.

## Functions and components (2)

### isSystemManagedScopeFieldName

```ts
function isSystemManagedScopeFieldName(name: string): boolean;
```

### systemManagedScopeFieldNames

```ts
function systemManagedScopeFieldNames(): readonly string[];
```

## Values, classes, and namespaces (5)

### scopeColumnNames

```ts
const scopeColumnNames: {
    readonly typescript: {
        readonly workspaceId: "workspaceId";
        readonly scopedToUserId: "scopedToUserId";
    };
    readonly sql: {
        readonly workspaceId: "workspace_id";
        readonly scopedToUserId: "scoped_to_user_id";
    };
};
```

### SCOPED_TO_USER_ID_SQL_COLUMN

```ts
const SCOPED_TO_USER_ID_SQL_COLUMN: "scoped_to_user_id";
```

### SCOPED_TO_USER_ID_TS_COLUMN

```ts
const SCOPED_TO_USER_ID_TS_COLUMN: "scopedToUserId";
```

### WORKSPACE_ID_SQL_COLUMN

```ts
const WORKSPACE_ID_SQL_COLUMN: "workspace_id";
```

### WORKSPACE_ID_TS_COLUMN

```ts
const WORKSPACE_ID_TS_COLUMN: "workspaceId";
```
