---
title: "@sapporta/server/testing"
package: "@sapporta/server"
version: "0.5.0"
specifier: "@sapporta/server/testing"
---

> Sapporta API reference for `@sapporta/server@0.5.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/server/testing

Import from `@sapporta/server/testing`. Documented from `@sapporta/server@0.5.0`; confirm the installed version with `node -p "require('@sapporta/server/package.json').version"`.

2 symbols documented here.

## Functions and components (2)

### createTestConnection

Create an in-memory SQLite ProjectDbConnection for integration tests.

```ts
function createTestConnection(): {
    conn: ProjectDbConnection;
    teardown: () => void;
};
```

### createTestDb

Create an in-memory SQLite database for testing.

```ts
function createTestDb(): {
    sqlite: Database.Database;
    db: BetterSQLite3Database;
};
```
