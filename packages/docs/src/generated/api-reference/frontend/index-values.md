---
title: "@sapporta/frontend — Values, classes, and namespaces"
package: "@sapporta/frontend"
version: "0.6.0"
specifier: "@sapporta/frontend"
---

> Sapporta API reference for `@sapporta/frontend@0.6.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/frontend — Values, classes, and namespaces

Import from `@sapporta/frontend`. Documented from `@sapporta/frontend@0.6.0`; confirm the installed version with `node -p "require('@sapporta/frontend/package.json').version"`.

7 of 189 symbols published from `@sapporta/frontend`. Other groups: [Types](https://sapporta.com/api-reference/frontend/index-types.md), [Functions and components](https://sapporta.com/api-reference/frontend/index-functions.md).

### NARROW_TABLE_PAGE_MAX_WIDTH

```ts
const NARROW_TABLE_PAGE_MAX_WIDTH = 760;
```

### tgridCellContext

```ts
const tgridCellContext: import('react').Context<TGridCellContext<TGridUnknownRowsByLevel, unknown, string> | undefined>;
```

### tgridCellEditorContext

```ts
const tgridCellEditorContext: import('react').Context<TGridCellEditorContext<TGridUnknownRowsByLevel, unknown, string, string> | undefined>;
```

### tgridSessionContext

```ts
const tgridSessionContext: import('react').Context<TGridSessionContext<TGridUnknownRowsByLevel, unknown> | undefined>;
```

### uiClient

```ts
const uiClient: import('@sapporta/shared/client').ThrowingClient<{
    getAuthBootstrapStatus: {
        summary: "Read whether the browser should show sign-up";
        metadata: {
            tags: string[];
            openapi: {
                include: boolean;
            };
        };
        method: "GET";
        path: "/auth-bootstrap";
        responses: {
            200: import('zod').ZodObject<{
                shouldShowSignUp: import('zod').ZodOptional<import('zod').ZodLiteral<true>>;
            }, import('zod/v4/core').$strip>;
        };
    };
    getAuthContext: {
        summary: "Read the current Sapporta auth context";
        metadata: {
            tags: string[];
        };
        method: "GET";
        path: "/auth-context";
        responses: {
            200: import('zod').ZodObject<{
                user: import('zod').ZodObject<{
                    id: import('zod').ZodString;
                    name: import('zod').ZodNullable<import('zod').ZodString>;
                    email: import('zod').ZodString;
                    emailVerified: import('zod').ZodBoolean;
                }, import('zod/v4/core').$strip>;
                workspace: import('zod').ZodObject<{
                    id: import('zod').ZodString;
                    name: import('zod').ZodString;
                    slug: import('zod').ZodString;
                    timeZone: import('zod').ZodString;
                    isOwner: import('zod').ZodBoolean;
                }, import('zod/v4/core').$strip>;
                memberships: import('zod').ZodArray<import('zod').ZodObject<{
                    id: import('zod').ZodString;
                    workspace: import('zod').ZodObject<{
                        id: import('zod').ZodString;
                        name: import('zod').ZodString;
                        slug: import('zod').ZodString;
                        timeZone: import('zod').ZodString;
                    }, import('zod/v4/core').$strip>;
                    role: import('zod').ZodEnum<{
                        owner: "owner";
                        member: "member";
                    }>;
                    isOwner: import('zod').ZodBoolean;
                }, import('zod/v4/core').$strip>>;
                role: import('zod').ZodEnum<{
                    owner: "owner";
                    member: "member";
                }>;
                isOwner: import('zod').ZodBoolean;
            }, import('zod/v4/core').$stri
// …declaration truncated at 2500 bytes.
```

### useHintsStore

Status-bar keyboard-hints registry.

```ts
const useHintsStore: import('zustand').UseBoundStore<import('zustand').StoreApi<HintsStore>>;
```

### useThemeStore

```ts
const useThemeStore: import('zustand').UseBoundStore<import('zustand').StoreApi<ThemeStore>>;
```
