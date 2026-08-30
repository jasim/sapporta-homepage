---
title: "@sapporta/frontend/layout"
package: "@sapporta/frontend"
version: "0.7.0"
specifier: "@sapporta/frontend/layout"
---

> Sapporta API reference for `@sapporta/frontend@0.7.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/frontend/layout

Import from `@sapporta/frontend/layout`. Documented from `@sapporta/frontend@0.7.0`; confirm the installed version with `node -p "require('@sapporta/frontend/package.json').version"`.

23 symbols documented here.

## Types (9)

### AppPageProps

```ts
interface AppPageProps extends Omit<PageHeaderProps, "className"> {
    children?: ReactNode;
    className?: string;
    headerClassName?: string;
    bodyClassName?: string;
}
```

### PageBodyProps

```ts
type PageBodyProps = HTMLAttributes<HTMLDivElement>;
```

### PageFrameProps

```ts
type PageFrameProps = HTMLAttributes<HTMLDivElement>;
```

### PageHeaderProps

```ts
interface PageHeaderProps {
    /** The group this view belongs to — "Tables", "Reports", etc. */
    section?: string;
    /** The view's own name. Also shown in the browser tab. */
    title: string;
    /**
     * A different browser tab title, or `false` for a header that should not
     * name the tab — for example one embedded in a side panel.
     */
    documentTitle?: string | false;
    /** Mono-styled right-of-title metadata (record counts, timing, etc.). */
    subtitle?: ReactNode;
    /** Right-aligned page actions. */
    actions?: ReactNode;
    className?: string;
}
```

### SidebarController

```ts
interface SidebarController {
    sidebarId: string;
    desktopExpanded: boolean;
    drawerOpen: boolean;
    isDesktop: boolean;
    toggleDesktop: () => void;
    expandDesktop: () => void;
    collapseDesktop: () => void;
    openDrawer: () => void;
    closeDrawer: () => void;
}
```

### SidebarProviderOptions

```ts
interface SidebarProviderOptions {
    defaultExpanded?: boolean;
    storageKey?: string;
    desktopMediaQuery?: string;
}
```

### SidebarProviderProps

```ts
interface SidebarProviderProps extends SidebarProviderOptions {
    children: ReactNode;
}
```

### SidebarRegionProps

```ts
interface SidebarRegionProps {
    children: ReactNode;
    className?: string;
}
```

### SidebarToggleProps

```ts
type SidebarToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-controls" | "aria-expanded" | "onClick" | "title">;
```

## Functions and components (10)

### AppPage

The usual fixed-header page: it combines `PageFrame`, `PageHeader`, and one scrolling `PageBody`.

```ts
function AppPage({ children, className, headerClassName, bodyClassName, ...header }: AppPageProps): import("react").JSX.Element;
```

### PageHeader

The standard header for a bounded page.

```ts
function PageHeader({ section, title, documentTitle, subtitle, actions, className, }: PageHeaderProps): import("react").JSX.Element;
```

### PageHeaderButton

Action button for the page header.

```ts
function PageHeaderButton({ tone, icon, onClick, href, download, shortcut, disabled, children, }: {
    tone?: "primary" | "ghost" | "danger";
    icon?: ReactNode;
    onClick?: () => void;
    href?: string;
    download?: boolean;
    shortcut?: string;
    disabled?: boolean;
    children: ReactNode;
}): import("react").JSX.Element;
```

### resetPageTitles

Forget all title declarations and the captured boot title.

```ts
function resetPageTitles(): void;
```

### SidebarProvider

Shares sidebar controls with the shell and any application-owned toolbar.

```ts
function SidebarProvider({ children, defaultExpanded, storageKey, desktopMediaQuery, }: SidebarProviderProps): import("react").JSX.Element;
```

### SidebarRegion

Presents the same application navigation in two useful forms.

```ts
function SidebarRegion({ children, className }: SidebarRegionProps): import("react").JSX.Element;
```

### SidebarShell

The visual contents of a sidebar: application identity, navigation, and an optional account footer.

```ts
function SidebarShell({ header, footer, children, className, onNavigate, }: {
    header: ReactNode;
    footer?: ReactNode;
    children?: ReactNode;
    className?: string;
    onNavigate?: () => void;
}): import("react").JSX.Element;
```

### SidebarToggle

Uses the control that fits the current screen: it changes the persisted desktop width preference, or opens the temporary compact drawer.

```ts
function SidebarToggle({ className, ...props }: SidebarToggleProps): import("react").JSX.Element;
```

### usePageTitle

Show `title` in the browser tab while the calling component is mounted.

```ts
function usePageTitle(title?: string | false | null): void;
```

### useSidebar

```ts
function useSidebar(): SidebarController;
```

## Values, classes, and namespaces (4)

### PageBody

The standard scrolling child of `PageFrame`.

```ts
const PageBody: import('react').ForwardRefExoticComponent<PageBodyProps & import('react').RefAttributes<HTMLDivElement>>;
```

### PageFrame

A bounded workspace for screens such as tables, reports, and editors.

```ts
const PageFrame: import('react').ForwardRefExoticComponent<PageFrameProps & import('react').RefAttributes<HTMLDivElement>>;
```

### SIDEBAR_DESKTOP_MEDIA_QUERY

```ts
const SIDEBAR_DESKTOP_MEDIA_QUERY = "(min-width: 64rem)";
```

### SIDEBAR_EXPANDED_PREF_KEY

```ts
const SIDEBAR_EXPANDED_PREF_KEY = "sapporta:sidebar-expanded";
```
