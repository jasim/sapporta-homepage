---
title: "@sapporta/server/cli/format"
package: "@sapporta/server"
version: "0.5.0"
specifier: "@sapporta/server/cli/format"
---

> Sapporta API reference for `@sapporta/server@0.5.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/server/cli/format

Import from `@sapporta/server/cli/format`. Documented from `@sapporta/server@0.5.0`; confirm the installed version with `node -p "require('@sapporta/server/package.json').version"`.

3 symbols documented here.

## Types (1)

### OutputFormat

```ts
type OutputFormat = "table" | "json";
```

## Functions and components (2)

### formatTable

Format rows as a readable table for terminal output.

```ts
function formatTable(rows: Record<string, unknown>[]): string;
```

### truncateValues

Truncate long string values in result rows to prevent context window overflow.

```ts
function truncateValues(rows: Record<string, unknown>[], maxLen?: number): Record<string, unknown>[];
```
