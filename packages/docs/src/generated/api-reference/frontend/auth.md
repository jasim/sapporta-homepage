---
title: "@sapporta/frontend/auth"
package: "@sapporta/frontend"
version: "0.6.0"
specifier: "@sapporta/frontend/auth"
---

> Sapporta API reference for `@sapporta/frontend@0.6.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/frontend/auth

Import from `@sapporta/frontend/auth`. Documented from `@sapporta/frontend@0.6.0`; confirm the installed version with `node -p "require('@sapporta/frontend/package.json').version"`.

20 symbols documented here.

## Types (3)

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

### ChangePasswordInput

```ts
interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
    revokeOtherSessions?: boolean;
}
```

## Functions and components (16)

### AccountProfilePage

```ts
function AccountProfilePage(): import("react").JSX.Element;
```

### AuthGate

```ts
function AuthGate({ children }: {
    children?: ReactNode;
}): import("react").JSX.Element;
```

### changePassword

```ts
function changePassword(body: ChangePasswordInput): Promise<void>;
```

### ChangePasswordPage

```ts
function ChangePasswordPage(): import("react").JSX.Element;
```

### fetchAuthBootstrapStatus

```ts
function fetchAuthBootstrapStatus(): Promise<AuthBootstrapStatus>;
```

### fetchAuthContext

```ts
function fetchAuthContext(): Promise<AuthContextResponse>;
```

### ForgotPasswordPage

```ts
function ForgotPasswordPage(): import("react").JSX.Element;
```

### LoginPage

```ts
function LoginPage(): import("react").JSX.Element;
```

### PublicOnlyGate

```ts
function PublicOnlyGate({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
```

### ResetPasswordPage

```ts
function ResetPasswordPage(): import("react").JSX.Element;
```

### signOut

```ts
function signOut(): Promise<void>;
```

### SignupPage

```ts
function SignupPage(): import("react").JSX.Element;
```

### switchActiveWorkspace

```ts
function switchActiveWorkspace(body: SwitchActiveWorkspaceBody): Promise<AuthContextResponse>;
```

### updateWorkspaceTimeZone

Sets the calendar the active workspace keeps.

```ts
function updateWorkspaceTimeZone(body: UpdateWorkspaceTimeZoneBody): Promise<AuthContextResponse>;
```

### VerifyEmailPage

```ts
function VerifyEmailPage(): import("react").JSX.Element;
```

### WorkspaceSettingsPage

The settings that belong to the workspace rather than to whoever is signed in to it.

```ts
function WorkspaceSettingsPage(): import("react").JSX.Element;
```

## Values, classes, and namespaces (1)

### useAuthStore

```ts
const useAuthStore: import('zustand').UseBoundStore<import('zustand').StoreApi<AuthState>>;
```
