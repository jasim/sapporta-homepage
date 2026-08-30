---
title: "@sapporta/server/cli/client"
package: "@sapporta/server"
version: "0.6.2"
specifier: "@sapporta/server/cli/client"
---

> Sapporta API reference for `@sapporta/server@0.6.2`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/server/cli/client

Import from `@sapporta/server/cli/client`. Documented from `@sapporta/server@0.6.2`; confirm the installed version with `node -p "require('@sapporta/server/package.json').version"`.

7 symbols documented here.

## Types (4)

### CountRowsOptions

```ts
type CountRowsOptions = (CountRowsBaseOptions & {
    groupBy?: undefined;
    order?: undefined;
    limit?: undefined;
}) | (CountRowsBaseOptions & {
    groupBy: string;
    order?: CountQuery["order"];
    limit?: CountQuery["limit"];
});
```

### RowListOptions

```ts
interface RowListOptions {
    limit?: number;
    page?: number;
    sort?: string;
    q?: string;
    where?: Record<string, unknown>;
}
```

### SqlExecuteOptions

```ts
interface SqlExecuteOptions {
    params?: unknown[];
    dryRun?: boolean;
}
```

### SqlQueryOptions

```ts
interface SqlQueryOptions {
    params?: unknown[];
    limit?: number;
}
```

## Functions and components (2)

### encodePathSegment

```ts
function encodePathSegment(value: string): string;
```

### whereObjectToFilterParams

```ts
function whereObjectToFilterParams(where: Record<string, unknown> | undefined): Record<string, string>;
```

## Values, classes, and namespaces (1)

### SapportaCliClient

```ts
class SapportaCliClient {
    private readonly target;
    constructor(target: ApiTarget);
    /**
     * Call the deployment and return the response payload.
     *
     * Non-2xx replies and unreachable servers arrive as `ApiRequestError`, so
     * every method below can treat its return value as a success.
     */
    request(method: HttpMethod, path: string, opts?: {
        body?: unknown;
        query?: Record<string, unknown>;
    }): Promise<unknown>;
    /** Fetch the app contract describing every endpoint this deployment serves. */
    openApiSpec(): Promise<OpenApiDoc>;
    listTables(detail: boolean): Promise<unknown>;
    showTable(table: string): Promise<unknown>;
    tableIndexes(table: string): Promise<unknown>;
    sampleTable(table: string, opts: {
        limit?: number;
        columns?: string;
    }): Promise<unknown>;
    listRows(table: string, opts: RowListOptions): Promise<unknown>;
    getRow(table: string, id: string): Promise<unknown>;
    countRows(table: string, opts?: CountRowsOptions): Promise<unknown>;
    createRows(table: string, values: unknown): Promise<unknown>;
    updateRow(table: string, id: string, values: unknown): Promise<unknown>;
    deleteRow(table: string, id: string): Promise<unknown>;
    sqlQuery(sql: string, opts: SqlQueryOptions): Promise<unknown>;
    sqlExecute(sql: string, opts: SqlExecuteOptions): Promise<unknown>;
}
```
