---
title: "@sapporta/frontend/app"
package: "@sapporta/frontend"
version: "0.5.0"
specifier: "@sapporta/frontend/app"
---

> Sapporta API reference for `@sapporta/frontend@0.5.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/frontend/app

Import from `@sapporta/frontend/app`. Documented from `@sapporta/frontend@0.5.0`; confirm the installed version with `node -p "require('@sapporta/frontend/package.json').version"`.

9 symbols documented here.

## Types (1)

### AppShellProps

```ts
interface AppShellProps {
    navigation?: Navigation;
    showFrameworkNavigation?: boolean;
    /** Configure the responsive sidebar controller used by the standard shell. */
    sidebarOptions?: Omit<SidebarProviderOptions, "desktopMediaQuery">;
    /**
     * Replace the shell-owned sidebar control, or set this to `false` when your
     * application places `SidebarToggle` in its own persistent UI.
     */
    sidebarToggle?: ReactNode | false;
}
```

## Functions and components (8)

### AppShell

The standard shell keeps navigation reachable without asking each route to render a particular header.

```ts
function AppShell({ navigation, showFrameworkNavigation, sidebarOptions, sidebarToggle, }: AppShellProps): import("react").JSX.Element;
```

### BootLoader

Loads app metadata and restores the browser session before rendering shell routes.

```ts
function BootLoader({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
```

### getNavigate

```ts
function getNavigate(): NavigateFunction;
```

### HomeRedirect

```ts
function HomeRedirect(): import("react").JSX.Element | null;
```

### loadAdminMetadata

```ts
function loadAdminMetadata(): void;
```

### navigateToTable

```ts
function navigateToTable(tableName: string): void;
```

### NotFoundView

```ts
function NotFoundView(): import("react").JSX.Element;
```

### setNavigate

```ts
function setNavigate(fn: NavigateFunction): void;
```
