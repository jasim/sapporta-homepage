---
title: "@sapporta/shared/contracts — Values, classes, and namespaces"
package: "@sapporta/shared"
version: "0.3.2"
specifier: "@sapporta/shared/contracts"
---

> Sapporta API reference for `@sapporta/shared@0.3.2`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared/contracts — Values, classes, and namespaces

Import from `@sapporta/shared/contracts`. Documented from `@sapporta/shared@0.3.2`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

67 of 112 symbols published from `@sapporta/shared/contracts`. Other groups: [Types](https://sapporta.com/api-reference/shared/contracts-types.md), [Functions and components](https://sapporta.com/api-reference/shared/contracts-functions.md).

### ApiError

Thrown by Sapporta browser HTTP helpers when a route returns a non-2xx status.

```ts
class ApiError extends Error {
    status: number;
    body: unknown;
    constructor(status: number, body: unknown);
}
```

### authActiveWorkspaceSchema

```ts
const authActiveWorkspaceSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    timeZone: z.ZodString;
    isOwner: z.ZodBoolean;
}, z.core.$strip>;
```

### authBootstrapStatusSchema

```ts
const authBootstrapStatusSchema: z.ZodObject<{
    shouldShowSignUp: z.ZodOptional<z.ZodLiteral<true>>;
}, z.core.$strip>;
```

### authContextResponseSchema

```ts
const authContextResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodNullable<z.ZodString>;
        email: z.ZodString;
        emailVerified: z.ZodBoolean;
    }, z.core.$strip>;
    workspace: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        slug: z.ZodString;
        timeZone: z.ZodString;
        isOwner: z.ZodBoolean;
    }, z.core.$strip>;
    memberships: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspace: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            slug: z.ZodString;
            timeZone: z.ZodString;
        }, z.core.$strip>;
        role: z.ZodEnum<{
            owner: "owner";
            member: "member";
        }>;
        isOwner: z.ZodBoolean;
    }, z.core.$strip>>;
    role: z.ZodEnum<{
        owner: "owner";
        member: "member";
    }>;
    isOwner: z.ZodBoolean;
}, z.core.$strip>;
```

### authCurrentUserSchema

```ts
const authCurrentUserSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodNullable<z.ZodString>;
    email: z.ZodString;
    emailVerified: z.ZodBoolean;
}, z.core.$strip>;
```

### authMembershipSchema

```ts
const authMembershipSchema: z.ZodObject<{
    id: z.ZodString;
    workspace: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        slug: z.ZodString;
        timeZone: z.ZodString;
    }, z.core.$strip>;
    role: z.ZodEnum<{
        owner: "owner";
        member: "member";
    }>;
    isOwner: z.ZodBoolean;
}, z.core.$strip>;
```

### authRoleSchema

Auth and workspace shapes returned to the browser UI.

```ts
const authRoleSchema: z.ZodEnum<{
    owner: "owner";
    member: "member";
}>;
```

### authTokenListResponseSchema

```ts
const authTokenListResponseSchema: z.ZodObject<{
    tokens: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        organizationId: z.ZodString;
        name: z.ZodString;
        createdAt: z.ZodString;
        expiresAt: z.ZodNullable<z.ZodString>;
        lastUsedAt: z.ZodNullable<z.ZodString>;
        revokedAt: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
```

### authTokenSchema

Metadata for an agent access token.

```ts
const authTokenSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    organizationId: z.ZodString;
    name: z.ZodString;
    createdAt: z.ZodString;
    expiresAt: z.ZodNullable<z.ZodString>;
    lastUsedAt: z.ZodNullable<z.ZodString>;
    revokedAt: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
```

### authWorkspaceSummarySchema

```ts
const authWorkspaceSummarySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    timeZone: z.ZodString;
}, z.core.$strip>;
```

### childSchemaSchema

```ts
const childSchemaSchema: z.ZodObject<{
    table: z.ZodString;
    foreignKey: z.ZodString;
    label: z.ZodString;
    columns: z.ZodArray<z.ZodString>;
    defaultSort: z.ZodString;
    width: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
```

### columnSchemaSchema

```ts
const columnSchemaSchema: z.ZodObject<{
    name: z.ZodString;
    label: z.ZodString;
    kind: z.ZodEnum<{
        number: "number";
        boolean: "boolean";
        text: "text";
        date: "date";
        timestamp: "timestamp";
    }>;
    displayFormat: z.ZodOptional<z.ZodEnum<{
        currency: "currency";
        percentage: "percentage";
    }>>;
    textDisplay: z.ZodOptional<z.ZodEnum<{
        multiLine: "multiLine";
        markdown: "markdown";
    }>>;
    dataType: z.ZodOptional<z.ZodString>;
    primary: z.ZodOptional<z.ZodBoolean>;
    isUnique: z.ZodOptional<z.ZodBoolean>;
    notNull: z.ZodOptional<z.ZodBoolean>;
    hasDefault: z.ZodOptional<z.ZodBoolean>;
    foreignKey: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        table: z.ZodString;
        column: z.ZodString;
    }, z.core.$strip>>>;
    select: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        options: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>>;
    visuallyHidden: z.ZodOptional<z.ZodBoolean>;
    width: z.ZodOptional<z.ZodNumber>;
    minWidth: z.ZodOptional<z.ZodNumber>;
    maxWidth: z.ZodOptional<z.ZodNumber>;
    colorRule: z.ZodOptional<z.ZodEnum<{
        positive: "positive";
        negative: "negative";
        signed: "signed";
    }>>;
    zeroDisplay: z.ZodOptional<z.ZodEnum<{
        blank: "blank";
        dot: "dot";
    }>>;
    strong: z.ZodOptional<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
    apiWritable: z.ZodOptional<z.ZodBoolean>;
    links: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"table">;
        table: z.ZodString;
        bind: z.ZodRecord<z.ZodString, z.ZodString>;
        label: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodEnum<{
            external: "external";
            "drill-up": "drill-up";
            "drill-into": "drill-into";
            report: "report";
        }>>;
        target: z.ZodOptional<z.ZodEnum<{
            _self: "_self";
            _blank: "_blank";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        kind: z.ZodLiteral<"report">;
        report: z.ZodString;
        bind: z.ZodRecord<z.ZodString, z.ZodString>;
        label: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodEnum<{
            external: "external";
            "drill-up": "drill-up";
            "drill-into": "drill-into";
            report: "report";
        }>>;
        target: z.ZodOptional<z.ZodEnum<{
            _self: "_sel
// …declaration truncated at 2500 bytes.
```

### countQuerySchema

Count visible rows after applying canonical `filter[col][op]` parameters.

```ts
const countQuerySchema: z.ZodObject<{
    group_by: z.ZodOptional<z.ZodString>;
    order: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<string>>;
}, z.core.$catchall<z.ZodType<QueryParamValue, unknown, z.core.$ZodTypeInternals<QueryParamValue, unknown>>>>;
```

### countResponseSchema

```ts
const countResponseSchema: z.ZodObject<{
    data: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"total">;
        count: z.ZodNumber;
    }, z.core.$strip>, z.ZodObject<{
        kind: z.ZodLiteral<"grouped">;
        groups: z.ZodArray<z.ZodType<GroupCount, unknown, z.core.$ZodTypeInternals<GroupCount, unknown>>>;
    }, z.core.$strip>], "kind">;
}, z.core.$strip>;
```

### countResultSchema

```ts
const countResultSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"total">;
    count: z.ZodNumber;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"grouped">;
    groups: z.ZodArray<z.ZodType<GroupCount, unknown, z.core.$ZodTypeInternals<GroupCount, unknown>>>;
}, z.core.$strip>], "kind">;
```

### countRoute

```ts
const countRoute: {
    method: "GET";
    path: "/tables/:tableName/_count";
    summary: "Count visible rows in a table";
    description: "Counts rows after request row security and canonical filter[col][op]=value filters. Optionally groups results and returns a deterministically ordered, bounded group list.";
    metadata: {
        tags: string[];
    };
    pathParams: z.ZodObject<{
        tableName: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodObject<{
        group_by: z.ZodOptional<z.ZodString>;
        order: z.ZodOptional<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>;
        limit: z.ZodOptional<z.ZodCoercedNumber<string>>;
    }, z.core.$catchall<z.ZodType<import("../query-params.js").QueryParamValue, unknown, z.core.$ZodTypeInternals<import("../query-params.js").QueryParamValue, unknown>>>>;
    responses: {
        200: z.ZodObject<{
            data: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"total">;
                count: z.ZodNumber;
            }, z.core.$strip>, z.ZodObject<{
                kind: z.ZodLiteral<"grouped">;
                groups: z.ZodArray<z.ZodType<import("./table-schema.js").GroupCount, unknown, z.core.$ZodTypeInternals<import("./table-schema.js").GroupCount, unknown>>>;
            }, z.core.$strip>], "kind">;
        }, z.core.$strip>;
        400: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        403: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        404: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### createAuthTokenBodySchema

```ts
const createAuthTokenBodySchema: z.ZodObject<{
    name: z.ZodString;
    organizationId: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
```

### createAuthTokenResponseSchema

Creation returns both metadata and the one-time bearer token.

```ts
const createAuthTokenResponseSchema: z.ZodObject<{
    token: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        organizationId: z.ZodString;
        name: z.ZodString;
        createdAt: z.ZodString;
        expiresAt: z.ZodNullable<z.ZodString>;
        lastUsedAt: z.ZodNullable<z.ZodString>;
        revokedAt: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
    rawToken: z.ZodString;
}, z.core.$strip>;
```

### createAuthTokenRoute

```ts
const createAuthTokenRoute: {
    method: "POST";
    path: "/auth-tokens";
    summary: "Create an agent access token";
    metadata: {
        tags: string[];
    };
    body: z.ZodObject<{
        name: z.ZodString;
        organizationId: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
    responses: {
        201: z.ZodObject<{
            token: z.ZodObject<{
                id: z.ZodString;
                userId: z.ZodString;
                organizationId: z.ZodString;
                name: z.ZodString;
                createdAt: z.ZodString;
                expiresAt: z.ZodNullable<z.ZodString>;
                lastUsedAt: z.ZodNullable<z.ZodString>;
                revokedAt: z.ZodNullable<z.ZodString>;
            }, z.core.$strip>;
            rawToken: z.ZodString;
        }, z.core.$strip>;
        400: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        401: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        403: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        422: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### createRowRoute

```ts
const createRowRoute: {
    method: "POST";
    path: "/tables/:tableName";
    summary: "Create a row (or rows) in any table";
    metadata: {
        tags: string[];
    };
    pathParams: z.ZodObject<{
        tableName: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>]>;
    responses: {
        201: z.ZodObject<{
            data: z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>]>;
        }, z.core.$strip>;
        404: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        409: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        422: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        500: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### DEFAULT_LOOKUP_LIMIT

```ts
const DEFAULT_LOOKUP_LIMIT = 50;
```

### DEFAULT_PAGE

```ts
const DEFAULT_PAGE = 1;
```

### DEFAULT_PAGE_SIZE

```ts
const DEFAULT_PAGE_SIZE = 50;
```

### deleteRowRoute

```ts
const deleteRowRoute: {
    method: "DELETE";
    path: "/tables/:tableName/:id";
    summary: "Delete a row by id";
    metadata: {
        tags: string[];
    };
    pathParams: z.ZodObject<{
        tableName: z.ZodString;
        id: z.ZodString;
    }, z.core.$strip>;
    body: typeof import("@sapporta/rest-core").ContractNoBody;
    responses: {
        200: z.ZodObject<{
            data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>;
        403: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        404: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### errorBodySchema

Wire shape of the error envelope every Sapporta API returns for 4xx/5xx responses.

```ts
const errorBodySchema: z.ZodObject<{
    error: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
}, z.core.$strip>;
```

### exportRowsQuerySchema

Query shape shared by reads that select rows without pagination.

```ts
const exportRowsQuerySchema: z.ZodObject<{
    sort: z.ZodOptional<z.ZodString>;
    q: z.ZodOptional<z.ZodString>;
}, z.core.$catchall<z.ZodType<QueryParamValue, unknown, z.core.$ZodTypeInternals<QueryParamValue, unknown>>>>;
```

### foreignKeyRefSchema

```ts
const foreignKeyRefSchema: z.ZodObject<{
    table: z.ZodString;
    column: z.ZodString;
}, z.core.$strip>;
```

### getAuthBootstrapStatusRoute

```ts
const getAuthBootstrapStatusRoute: {
    method: "GET";
    path: "/auth-bootstrap";
    summary: "Read whether the browser should show sign-up";
    metadata: {
        tags: string[];
        openapi: {
            include: boolean;
        };
    };
    responses: {
        200: z.ZodObject<{
            shouldShowSignUp: z.ZodOptional<z.ZodLiteral<true>>;
        }, z.core.$strip>;
    };
};
```

### getAuthContextRoute

Auth endpoints used by the app UI.

```ts
const getAuthContextRoute: {
    method: "GET";
    path: "/auth-context";
    summary: "Read the current Sapporta auth context";
    metadata: {
        tags: string[];
    };
    responses: {
        200: z.ZodObject<{
            user: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodNullable<z.ZodString>;
                email: z.ZodString;
                emailVerified: z.ZodBoolean;
            }, z.core.$strip>;
            workspace: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                slug: z.ZodString;
                timeZone: z.ZodString;
                isOwner: z.ZodBoolean;
            }, z.core.$strip>;
            memberships: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                workspace: z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    slug: z.ZodString;
                    timeZone: z.ZodString;
                }, z.core.$strip>;
                role: z.ZodEnum<{
                    owner: "owner";
                    member: "member";
                }>;
                isOwner: z.ZodBoolean;
            }, z.core.$strip>>;
            role: z.ZodEnum<{
                owner: "owner";
                member: "member";
            }>;
            isOwner: z.ZodBoolean;
        }, z.core.$strip>;
        401: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        403: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### getRowRoute

```ts
const getRowRoute: {
    method: "GET";
    path: "/tables/:tableName/:id";
    summary: "Get one row by id";
    metadata: {
        tags: string[];
    };
    pathParams: z.ZodObject<{
        tableName: z.ZodString;
        id: z.ZodString;
    }, z.core.$strip>;
    responses: {
        200: z.ZodObject<{
            data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>;
        404: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### getTableRoute

```ts
const getTableRoute: {
  method: …;
  path: …;
  summary: …;
  metadata: …;
  pathParams: …;
  responses: …;
}
// 6 members; inferred types elided. Read the full type from the declaration file if needed.
```

### groupCountSchema

```ts
const groupCountSchema: z.ZodType<GroupCount>;
```

### initContract

Instantiate a ts-rest client, primarily to access `router`, `response`, and `body`

Re-exported from `@sapporta/rest-core`. See that package for its declaration.

### linkBindSchema

Maps target (table filter / report param / URL query param) name → source column name on the current row.

```ts
const linkBindSchema: z.ZodRecord<z.ZodString, z.ZodString>;
```

### linkIconSchema

Visual hint for which icon the UI should render.

```ts
const linkIconSchema: z.ZodEnum<{
    external: "external";
    "drill-up": "drill-up";
    "drill-into": "drill-into";
    report: "report";
}>;
```

### linkTargetSchema

```ts
const linkTargetSchema: z.ZodEnum<{
    _self: "_self";
    _blank: "_blank";
}>;
```

### listAuthTokensRoute

```ts
const listAuthTokensRoute: {
    method: "GET";
    path: "/auth-tokens";
    summary: "List agent access tokens";
    metadata: {
        tags: string[];
    };
    responses: {
        200: z.ZodObject<{
            tokens: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                userId: z.ZodString;
                organizationId: z.ZodString;
                name: z.ZodString;
                createdAt: z.ZodString;
                expiresAt: z.ZodNullable<z.ZodString>;
                lastUsedAt: z.ZodNullable<z.ZodString>;
                revokedAt: z.ZodNullable<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        401: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        403: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### listMetaSchema

```ts
const listMetaSchema: z.ZodObject<{
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    pages: z.ZodNumber;
}, z.core.$strip>;
```

### listRowsQuerySchema

Query shape for the paged row-listing endpoint.

```ts
const listRowsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<string>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<string>>;
    sort: z.ZodOptional<z.ZodString>;
    q: z.ZodOptional<z.ZodString>;
}, z.core.$catchall<z.ZodType<QueryParamValue, unknown, z.core.$ZodTypeInternals<QueryParamValue, unknown>>>>;
```

### listRowsRoute

```ts
const listRowsRoute: {
    method: "GET";
    path: "/tables/:tableName";
    summary: "List rows for any table";
    metadata: {
        tags: string[];
    };
    pathParams: z.ZodObject<{
        tableName: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodCoercedNumber<string>>;
        limit: z.ZodDefault<z.ZodCoercedNumber<string>>;
        sort: z.ZodOptional<z.ZodString>;
        q: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodType<import("../query-params.js").QueryParamValue, unknown, z.core.$ZodTypeInternals<import("../query-params.js").QueryParamValue, unknown>>>>;
    responses: {
        200: z.ZodObject<{
            data: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            meta: z.ZodObject<{
                total: z.ZodNumber;
                page: z.ZodNumber;
                limit: z.ZodNumber;
                pages: z.ZodNumber;
            }, z.core.$strip>;
        }, z.core.$strip>;
        400: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        404: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### listTablesRoute

```ts
const listTablesRoute: {
  method: …;
  path: …;
  summary: …;
  metadata: …;
  query: …;
  responses: …;
}
// 6 members; inferred types elided. Read the full type from the declaration file if needed.
```

### lookupEntrySchema

FK display-value lookup entries with the source row available to renderers.

```ts
const lookupEntrySchema: z.ZodObject<{
    value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    label: z.ZodString;
    meta: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
```

### lookupQuerySchema

```ts
const lookupQuerySchema: z.ZodUnion<readonly [z.ZodObject<{
    ids: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string[], string>>, z.ZodArray<z.ZodString>>;
    q: z.ZodOptional<z.ZodNever>;
    fields: z.ZodOptional<z.ZodNever>;
    limit: z.ZodOptional<z.ZodNever>;
}, z.core.$strict>, z.ZodObject<{
    ids: z.ZodOptional<z.ZodNever>;
    q: z.ZodOptional<z.ZodString>;
    fields: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodCoercedNumber<string>>;
}, z.core.$strict>]>;
```

### lookupResponseSchema

```ts
const lookupResponseSchema: z.ZodObject<{
    entries: z.ZodArray<z.ZodObject<{
        value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        label: z.ZodString;
        meta: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strip>>;
}, z.core.$strip>;
```

### lookupRoute

```ts
const lookupRoute: {
    method: "GET";
    path: "/tables/:tableName/_lookup";
    summary: "Lookup FK display values for a table";
    metadata: {
        tags: string[];
    };
    pathParams: z.ZodObject<{
        tableName: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodUnion<readonly [z.ZodObject<{
        ids: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string[], string>>, z.ZodArray<z.ZodString>>;
        q: z.ZodOptional<z.ZodNever>;
        fields: z.ZodOptional<z.ZodNever>;
        limit: z.ZodOptional<z.ZodNever>;
    }, z.core.$strict>, z.ZodObject<{
        ids: z.ZodOptional<z.ZodNever>;
        q: z.ZodOptional<z.ZodString>;
        fields: z.ZodOptional<z.ZodString>;
        limit: z.ZodDefault<z.ZodCoercedNumber<string>>;
    }, z.core.$strict>]>;
    responses: {
        200: z.ZodObject<{
            entries: z.ZodArray<z.ZodObject<{
                value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
                label: z.ZodString;
                meta: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        400: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        404: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### MAX_LOOKUP_IDS

```ts
const MAX_LOOKUP_IDS = 500;
```

### MAX_LOOKUP_LIMIT

```ts
const MAX_LOOKUP_LIMIT = 500;
```

### MAX_PAGE

```ts
const MAX_PAGE: number;
```

### MAX_PAGE_SIZE

```ts
const MAX_PAGE_SIZE = 1000;
```

### navLinkSchema

A declarative navigation link carried by schema metadata and report datasets.

```ts
const navLinkSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"table">;
    table: z.ZodString;
    bind: z.ZodRecord<z.ZodString, z.ZodString>;
    label: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodEnum<{
        external: "external";
        "drill-up": "drill-up";
        "drill-into": "drill-into";
        report: "report";
    }>>;
    target: z.ZodOptional<z.ZodEnum<{
        _self: "_self";
        _blank: "_blank";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"report">;
    report: z.ZodString;
    bind: z.ZodRecord<z.ZodString, z.ZodString>;
    label: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodEnum<{
        external: "external";
        "drill-up": "drill-up";
        "drill-into": "drill-into";
        report: "report";
    }>>;
    target: z.ZodOptional<z.ZodEnum<{
        _self: "_self";
        _blank: "_blank";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"url">;
    href: z.ZodString;
    bind: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    label: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodEnum<{
        external: "external";
        "drill-up": "drill-up";
        "drill-into": "drill-into";
        report: "report";
    }>>;
    target: z.ZodOptional<z.ZodEnum<{
        _self: "_self";
        _blank: "_blank";
    }>>;
}, z.core.$strip>], "kind">;
```

### paginatedRowsSchema

```ts
const paginatedRowsSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    meta: z.ZodObject<{
        total: z.ZodNumber;
        page: z.ZodNumber;
        limit: z.ZodNumber;
        pages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
```

### projectInfoRoute

```ts
const projectInfoRoute: {
    method: "GET";
    path: "/meta/info";
    summary: "Project identity";
    metadata: {
        tags: string[];
    };
    responses: {
        200: z.ZodObject<{
            name: z.ZodString;
            slug: z.ZodString;
        }, z.core.$strip>;
    };
};
```

### projectInfoSchema

```ts
const projectInfoSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
}, z.core.$strip>;
```

### revokeAuthTokenRoute

```ts
const revokeAuthTokenRoute: {
    method: "DELETE";
    path: "/auth-tokens/:id";
    summary: "Revoke an agent access token";
    metadata: {
        tags: string[];
    };
    pathParams: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: typeof import("@sapporta/rest-core").ContractNoBody;
    responses: {
        204: typeof import("@sapporta/rest-core").ContractNoBody;
        401: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        403: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        404: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### rowSchema

A row, as it appears on the wire.

```ts
const rowSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
```

### selectOptionsSchema

```ts
const selectOptionsSchema: z.ZodObject<{
    options: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
```

### singleRowSchema

```ts
const singleRowSchema: z.ZodObject<{
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
```

### sqlRoute

```ts
const sqlRoute: {
    method: "POST";
    path: "/meta/sql";
    summary: "Run a SQL statement (auto-dispatches reads vs writes)";
    description: "Escape hatch for ad-hoc SQL. Statements that return rows (SELECT, WITH, PRAGMA, EXPLAIN) return those rows. Mutating statements require `allowDangerous: true` and report the row-change count. Use `params` for placeholders — never string-concatenate user input into `sql`.";
    metadata: {
        tags: string[];
        extensions: {
            "x-sapporta-risk": string;
        };
    };
    body: z.ZodObject<{
        sql: z.ZodString;
        params: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        limit: z.ZodOptional<z.ZodNumber>;
        dryRun: z.ZodOptional<z.ZodBoolean>;
        allowDangerous: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
    responses: {
        200: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        400: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        403: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        409: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        422: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        500: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### switchActiveWorkspaceBodySchema

```ts
const switchActiveWorkspaceBodySchema: z.ZodObject<{
    workspaceId: z.ZodString;
}, z.core.$strip>;
```

### switchActiveWorkspaceRoute

```ts
const switchActiveWorkspaceRoute: {
    method: "POST";
    path: "/auth-context/active-workspace";
    summary: "Switch the current session's active workspace";
    metadata: {
        tags: string[];
    };
    body: z.ZodObject<{
        workspaceId: z.ZodString;
    }, z.core.$strip>;
    responses: {
        200: z.ZodObject<{
            user: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodNullable<z.ZodString>;
                email: z.ZodString;
                emailVerified: z.ZodBoolean;
            }, z.core.$strip>;
            workspace: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                slug: z.ZodString;
                timeZone: z.ZodString;
                isOwner: z.ZodBoolean;
            }, z.core.$strip>;
            memberships: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                workspace: z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    slug: z.ZodString;
                    timeZone: z.ZodString;
                }, z.core.$strip>;
                role: z.ZodEnum<{
                    owner: "owner";
                    member: "member";
                }>;
                isOwner: z.ZodBoolean;
            }, z.core.$strip>>;
            role: z.ZodEnum<{
                owner: "owner";
                member: "member";
            }>;
            isOwner: z.ZodBoolean;
        }, z.core.$strip>;
        400: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        401: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        403: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        404: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        422: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### tableIndexesRoute

```ts
const tableIndexesRoute: {
    method: "GET";
    path: "/meta/tables/:name/indexes";
    summary: "List indexes for a table";
    metadata: {
        tags: string[];
    };
    pathParams: z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>;
    responses: {
        200: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        400: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        403: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        404: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### tableSampleRoute

```ts
const tableSampleRoute: {
    method: "GET";
    path: "/meta/tables/:name/sample";
    summary: "Sample rows from a table";
    metadata: {
        tags: string[];
    };
    pathParams: z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodObject<{
        limit: z.ZodOptional<z.ZodString>;
        fields: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    responses: {
        200: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        400: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        403: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        404: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### tableSchemaSchema

```ts
const tableSchemaSchema: z.ZodObject<{
    name: z.ZodString;
    label: z.ZodString;
    immutable: z.ZodBoolean;
    columns: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        label: z.ZodString;
        kind: z.ZodEnum<{
            number: "number";
            boolean: "boolean";
            text: "text";
            date: "date";
            timestamp: "timestamp";
        }>;
        displayFormat: z.ZodOptional<z.ZodEnum<{
            currency: "currency";
            percentage: "percentage";
        }>>;
        textDisplay: z.ZodOptional<z.ZodEnum<{
            multiLine: "multiLine";
            markdown: "markdown";
        }>>;
        dataType: z.ZodOptional<z.ZodString>;
        primary: z.ZodOptional<z.ZodBoolean>;
        isUnique: z.ZodOptional<z.ZodBoolean>;
        notNull: z.ZodOptional<z.ZodBoolean>;
        hasDefault: z.ZodOptional<z.ZodBoolean>;
        foreignKey: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            table: z.ZodString;
            column: z.ZodString;
        }, z.core.$strip>>>;
        select: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            options: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>>;
        visuallyHidden: z.ZodOptional<z.ZodBoolean>;
        width: z.ZodOptional<z.ZodNumber>;
        minWidth: z.ZodOptional<z.ZodNumber>;
        maxWidth: z.ZodOptional<z.ZodNumber>;
        colorRule: z.ZodOptional<z.ZodEnum<{
            positive: "positive";
            negative: "negative";
            signed: "signed";
        }>>;
        zeroDisplay: z.ZodOptional<z.ZodEnum<{
            blank: "blank";
            dot: "dot";
        }>>;
        strong: z.ZodOptional<z.ZodBoolean>;
        notes: z.ZodOptional<z.ZodString>;
        apiWritable: z.ZodOptional<z.ZodBoolean>;
        links: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"table">;
            table: z.ZodString;
            bind: z.ZodRecord<z.ZodString, z.ZodString>;
            label: z.ZodOptional<z.ZodString>;
            icon: z.ZodOptional<z.ZodEnum<{
                external: "external";
                "drill-up": "drill-up";
                "drill-into": "drill-into";
                report: "report";
            }>>;
            target: z.ZodOptional<z.ZodEnum<{
                _self: "_self";
                _blank: "_blank";
            }>>;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"report">;
            report: z.Z
// …declaration truncated at 2500 bytes.
```

### uiContract

Aggregate router consumed by `@sapporta/ui` and any generic frontend via `createApiClient(uiContract)`.

```ts
const uiContract: {
  getAuthBootstrapStatus: …;
  getAuthContext: …;
  switchActiveWorkspace: …;
  updateWorkspaceTimeZone: …;
  listAuthTokens: …;
  createAuthToken: …;
  revokeAuthToken: …;
  projectInfo: …;
  listTables: …;
  getTable: …;
  tableSample: …;
  tableIndexes: …;
  sql: …;
  listRows: …;
  getRow: …;
  createRow: …;
  updateRow: …;
  deleteRow: …;
  lookup: …;
  count: …;
}
// 20 members; inferred types elided. Read the full type from the declaration file if needed.
```

### updateRowRoute

```ts
const updateRowRoute: {
    method: "PUT";
    path: "/tables/:tableName/:id";
    summary: "Update a row by id";
    metadata: {
        tags: string[];
    };
    pathParams: z.ZodObject<{
        tableName: z.ZodString;
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    responses: {
        200: z.ZodObject<{
            data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>;
        403: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        404: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        409: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        422: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        500: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```

### updateWorkspaceTimeZoneBodySchema

An IANA zone id, never a fixed offset.

```ts
const updateWorkspaceTimeZoneBodySchema: z.ZodObject<{
    timeZone: z.ZodString;
}, z.core.$strip>;
```

### updateWorkspaceTimeZoneRoute

Owner-only.

```ts
const updateWorkspaceTimeZoneRoute: {
    method: "PUT";
    path: "/auth-context/workspace/time-zone";
    summary: "Set the time zone the active workspace keeps its calendar in";
    metadata: {
        tags: string[];
    };
    body: z.ZodObject<{
        timeZone: z.ZodString;
    }, z.core.$strip>;
    responses: {
        200: z.ZodObject<{
            user: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodNullable<z.ZodString>;
                email: z.ZodString;
                emailVerified: z.ZodBoolean;
            }, z.core.$strip>;
            workspace: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                slug: z.ZodString;
                timeZone: z.ZodString;
                isOwner: z.ZodBoolean;
            }, z.core.$strip>;
            memberships: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                workspace: z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    slug: z.ZodString;
                    timeZone: z.ZodString;
                }, z.core.$strip>;
                role: z.ZodEnum<{
                    owner: "owner";
                    member: "member";
                }>;
                isOwner: z.ZodBoolean;
            }, z.core.$strip>>;
            role: z.ZodEnum<{
                owner: "owner";
                member: "member";
            }>;
            isOwner: z.ZodBoolean;
        }, z.core.$strip>;
        401: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        403: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
        422: z.ZodObject<{
            error: z.ZodString;
            code: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodUnknown>>;
        }, z.core.$strip>;
    };
};
```
