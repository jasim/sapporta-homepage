---
title: "@sapporta/server/data-dir"
package: "@sapporta/server"
version: "0.8.1"
specifier: "@sapporta/server/data-dir"
---

> Sapporta API reference for `@sapporta/server@0.8.1`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/server/data-dir

Import from `@sapporta/server/data-dir`. Documented from `@sapporta/server@0.8.1`; confirm the installed version with `node -p "require('@sapporta/server/package.json').version"`.

2 symbols documented here.

## Functions and components (2)

### databasePath

The path of the app's SQLite database inside the data directory.

```ts
function databasePath(): string;
```

### dataPath

Join path segments onto the data directory: `dataPath("user-config", "import-presets.json")`.

```ts
function dataPath(...segments: string[]): string;
```
