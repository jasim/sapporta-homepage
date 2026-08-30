---
title: "@sapporta/server/errors"
package: "@sapporta/server"
version: "0.6.2"
specifier: "@sapporta/server/errors"
---

> Sapporta API reference for `@sapporta/server@0.6.2`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/server/errors

Import from `@sapporta/server/errors`. Documented from `@sapporta/server@0.6.2`; confirm the installed version with `node -p "require('@sapporta/server/package.json').version"`.

10 symbols documented here.

## Types (4)

### ClassifiedSqliteError

```ts
type ClassifiedSqliteError = {
    code: ErrorCodeValue;
    status: 400 | 409 | 422 | 500;
    message: string;
};
```

### ErrorCodeValue

```ts
type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];
```

### QueryParseErrorCode

Closed taxonomy of generated table-query parse failures.

```ts
type QueryParseErrorCode = "unknown_filter_shape" | "unknown_column" | "unknown_op" | "bad_value" | "op_not_applicable" | "bad_limit" | "bad_page" | "no_search_config";
```

### SqliteErrorContext

```ts
type SqliteErrorContext = "sql" | "write" | "framework";
```

## Functions and components (1)

### classifySqliteError

```ts
function classifySqliteError(err: unknown, context: SqliteErrorContext): ClassifiedSqliteError | null;
```

## Values, classes, and namespaces (5)

### ActionError

```ts
class ActionError extends Error {
    readonly code: string;
    constructor(message: string, code?: string);
}
```

### ErrorCode

Well-known error codes for structured error output.

```ts
const ErrorCode: {
    readonly TABLE_NOT_FOUND: "TABLE_NOT_FOUND";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly INVALID_TABLE_NAME: "INVALID_TABLE_NAME";
    readonly INVALID_COLUMN_NAME: "INVALID_COLUMN_NAME";
    readonly INVALID_JSON: "INVALID_JSON";
    readonly INVALID_SQL: "INVALID_SQL";
    readonly DANGEROUS_SQL: "DANGEROUS_SQL";
    readonly BAD_LIMIT: "BAD_LIMIT";
    readonly SELECT_ONLY: "SELECT_ONLY";
    readonly CONFLICT: "CONFLICT";
    readonly ROW_NOT_FOUND: "ROW_NOT_FOUND";
    readonly PROJECT_NOT_FOUND: "PROJECT_NOT_FOUND";
    readonly REPORT_NOT_FOUND: "REPORT_NOT_FOUND";
    readonly VALIDATION_FAILED: "VALIDATION_FAILED";
    readonly MISSING_ARGUMENT: "MISSING_ARGUMENT";
    readonly INIT_NPM_REGISTRY_UNAVAILABLE: "INIT_NPM_REGISTRY_UNAVAILABLE";
    readonly INIT_SETUP_FAILED: "INIT_SETUP_FAILED";
    readonly INIT_TARGET_EXISTS: "INIT_TARGET_EXISTS";
    readonly APP_SERVER_UNREACHABLE: "APP_SERVER_UNREACHABLE";
    readonly NON_JSON_RESPONSE: "NON_JSON_RESPONSE";
    readonly INTERNAL: "INTERNAL";
};
```

### OperationError

Typed error that carries a machine-readable error code.

```ts
class OperationError extends Error {
    code: string;
    constructor(message: string, code: string);
}
```

### QueryParseError

```ts
class QueryParseError extends Error {
    readonly code: QueryParseErrorCode;
    constructor(code: QueryParseErrorCode, message: string);
}
```

### ValidationError

```ts
class ValidationError extends Error {
    readonly errors: Array<{
        field: string;
        message: string;
    }>;
    constructor(errors: Array<{
        field: string;
        message: string;
    }>);
}
```
