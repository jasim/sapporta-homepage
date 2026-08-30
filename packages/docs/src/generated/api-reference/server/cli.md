---
title: "@sapporta/server/cli"
package: "@sapporta/server"
version: "0.6.2"
specifier: "@sapporta/server/cli"
---

> Sapporta API reference for `@sapporta/server@0.6.2`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/server/cli

Import from `@sapporta/server/cli`. Documented from `@sapporta/server@0.6.2`; confirm the installed version with `node -p "require('@sapporta/server/package.json').version"`.

6 symbols documented here.

## Types (3)

### CliCommandContext

```ts
interface CliCommandContext extends CliRuntimeConfig {
    client: SapportaCliClient;
}
```

### CliCommandResult

```ts
interface CliCommandResult {
    data: Record<string, unknown>[];
    message?: string;
    additionalOutput?: string;
    tableOutputHandled?: boolean;
    raw?: unknown;
}
```

### CliCommandSpec

```ts
interface CliCommandSpec {
    name: readonly string[];
    summary: string;
    args?: readonly CliArgumentSpec[];
    options?: readonly CliOptionSpec[];
    examples?: readonly string[];
    inputSchema: z.ZodType<unknown>;
    run(input: Record<string, unknown>, context: CliCommandContext): Promise<CliCommandResult>;
}
```

## Functions and components (1)

### createCliProgram

```ts
function createCliProgram(version: string, commands: readonly CliCommandSpec[]): CliProgram;
```

## Values, classes, and namespaces (2)

### CLI_COMMANDS

```ts
const CLI_COMMANDS: readonly CliCommandSpec[];
```

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
