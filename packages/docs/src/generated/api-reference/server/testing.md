---
title: "@sapporta/server/testing"
package: "@sapporta/server"
version: "0.8.0"
specifier: "@sapporta/server/testing"
---

> Sapporta API reference for `@sapporta/server@0.8.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/server/testing

Import from `@sapporta/server/testing`. Documented from `@sapporta/server@0.8.0`; confirm the installed version with `node -p "require('@sapporta/server/package.json').version"`.

4 symbols documented here.

## Types (1)

### TestAuthContextOptions

```ts
interface TestAuthContextOptions {
    userId?: string;
    workspaceId?: string;
    isOwner?: boolean;
    tables?: readonly TableDef[];
    /**
     * The calendar the test workspace keeps, as an IANA id. Defaults to `UTC`;
     * name a zone with an offset to check that a handler reads days in the
     * workspace's calendar rather than the machine's.
     */
    timeZone?: string;
}
```

## Functions and components (3)

### createTestAuthContext

```ts
function createTestAuthContext(options?: TestAuthContextOptions): SapportaAuthContext;
```

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
