---
title: "@sapporta/frontend/auth/runtime"
package: "@sapporta/frontend"
version: "0.7.0"
specifier: "@sapporta/frontend/auth/runtime"
---

> Sapporta API reference for `@sapporta/frontend@0.7.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/frontend/auth/runtime

Import from `@sapporta/frontend/auth/runtime`. Documented from `@sapporta/frontend@0.7.0`; confirm the installed version with `node -p "require('@sapporta/frontend/package.json').version"`.

12 symbols documented here.

## Types (2)

### AuthSession

```ts
type AuthSession = {
    kind: "unknown";
} | {
    kind: "loading";
} | {
    kind: "guest";
} | {
    kind: "authenticated";
    context: AuthContextResponse;
} | {
    kind: "unverified";
} | {
    kind: "workspaceRequired";
} | {
    kind: "failed";
    error: string;
};
```

### AuthState

```ts
interface AuthState {
    session: AuthSession;
    bootstrapStatus: AuthBootstrapStatus | null;
    restoreSession: () => Promise<void>;
    reloadSession: () => Promise<void>;
    loadBootstrapStatus: () => Promise<void>;
    switchWorkspace: (body: SwitchActiveWorkspaceBody) => Promise<void>;
    setWorkspaceTimeZone: (body: UpdateWorkspaceTimeZoneBody) => Promise<void>;
    logout: () => Promise<void>;
    reset: () => void;
}
```

## Functions and components (9)

### AuthGate

```ts
function AuthGate({ children }: {
    children?: ReactNode;
}): import("react").JSX.Element;
```

### createAuthToken

```ts
function createAuthToken(body: CreateAuthTokenBody): Promise<CreateAuthTokenResponse>;
```

### fetchAuthBootstrapStatus

```ts
function fetchAuthBootstrapStatus(): Promise<AuthBootstrapStatus>;
```

### fetchAuthContext

```ts
function fetchAuthContext(): Promise<AuthContextResponse>;
```

### listAuthTokens

```ts
function listAuthTokens(): Promise<AuthTokenListResponse>;
```

### PublicOnlyGate

```ts
function PublicOnlyGate({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
```

### revokeAuthToken

```ts
function revokeAuthToken(id: string): Promise<void>;
```

### signOut

```ts
function signOut(): Promise<void>;
```

### switchActiveWorkspace

```ts
function switchActiveWorkspace(body: SwitchActiveWorkspaceBody): Promise<AuthContextResponse>;
```

## Values, classes, and namespaces (1)

### useAuthStore

```ts
const useAuthStore: import('zustand').UseBoundStore<import('zustand').StoreApi<AuthState>>;
```
