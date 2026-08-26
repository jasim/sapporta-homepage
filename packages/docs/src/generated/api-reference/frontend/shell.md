---
title: "@sapporta/frontend/shell"
package: "@sapporta/frontend"
version: "0.6.0"
specifier: "@sapporta/frontend/shell"
---

> Sapporta API reference for `@sapporta/frontend@0.6.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/frontend/shell

Import from `@sapporta/frontend/shell`. Documented from `@sapporta/frontend@0.6.0`; confirm the installed version with `node -p "require('@sapporta/frontend/package.json').version"`.

44 symbols documented here.

## Types (19)

### AccountMenuAction

```ts
interface AccountMenuAction {
    id: string;
    label: string;
    description?: string;
    icon?: ReactNode;
    disabled?: boolean;
    variant?: "default" | "danger";
    pendingLabel?: string;
    onSelect: () => void | Promise<void>;
}
```

### AccountMenuProps

```ts
interface AccountMenuProps {
    context: AuthContextResponse;
    sections?: AccountMenuSection[];
    onLogout?: () => void | Promise<void>;
    footer?: ReactNode;
    triggerAriaLabel?: string;
    renderTrigger?: (props: AccountMenuTriggerRenderProps) => ReactElement;
}
```

### AccountMenuSection

```ts
interface AccountMenuSection {
    id: string;
    label?: string;
    actions: AccountMenuAction[];
}
```

### AccountMenuTriggerRenderProps

```ts
interface AccountMenuTriggerRenderProps {
    displayName: string;
    initials: string;
    secondaryLabel: string;
    open: boolean;
}
```

### AppPageProps

```ts
interface AppPageProps extends Omit<PageHeaderProps, "className"> {
    children?: ReactNode;
    className?: string;
    headerClassName?: string;
    bodyClassName?: string;
}
```

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
    /**
     * Replace what sits under the sidebar navigation, which is the account menu
     * unless this says otherwise. `null` leaves the footer out.
     */
    sidebarFooter?: ReactNode;
}
```

### AuthAccountMenuProps

```ts
interface AuthAccountMenuProps extends Omit<ComponentProps<typeof AccountMenu>, "context" | "onLogout"> {
    onLogout?: () => void | Promise<void>;
}
```

### Navigation

```ts
type Navigation = readonly NavigationSection[];
```

### NavigationIcon

```ts
type NavigationIcon = ComponentType<{
    className?: string;
    strokeWidth?: number | string;
}>;
```

### NavigationItem

```ts
interface NavigationItem {
    label: string;
    to: string;
    icon?: NavigationIcon;
}
```

### NavigationSection

```ts
interface NavigationSection {
    label: string;
    items: readonly NavigationItem[];
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

## Functions and components (21)

### AccountMenu

```ts
function AccountMenu({ context, sections, onLogout, footer, triggerAriaLabel, renderTrigger, }: AccountMenuProps): import("react").JSX.Element;
```

### AppPage

The usual fixed-header page: it combines `PageFrame`, `PageHeader`, and one scrolling `PageBody`.

```ts
function AppPage({ children, className, headerClassName, bodyClassName, ...header }: AppPageProps): import("react").JSX.Element;
```

### AppShell

The standard shell keeps navigation reachable without asking each route to render a particular header.

```ts
function AppShell({ navigation, showFrameworkNavigation, sidebarOptions, sidebarToggle, sidebarFooter, }: AppShellProps): import("react").JSX.Element;
```

### AuthAccountMenu

```ts
function AuthAccountMenu(props: AuthAccountMenuProps): import("react").JSX.Element | null;
```

### formatAuthRole

```ts
function formatAuthRole(role: AuthRole): string;
```

### getAccountDisplayName

```ts
function getAccountDisplayName(user: AuthCurrentUser): string;
```

### getAccountInitials

```ts
function getAccountInitials(user: AuthCurrentUser): string;
```

### getAccountSecondaryLabel

```ts
function getAccountSecondaryLabel(context: AuthContextResponse): string;
```

### isNavigationItemActive

Marks a navigation item active on its own page and on the pages nested under it.

```ts
function isNavigationItemActive(item: NavigationItem, location: Location): boolean;
```

### navigationItems

```ts
function navigationItems(navigation: Navigation): NavigationItem[];
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

### SapportaMark

```ts
function SapportaMark({ size }: {
    size?: number;
}): import("react").JSX.Element;
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

### StatusBar

Terminal-style 24px status bar pinned to the bottom of the app.

```ts
function StatusBar(): import("react").JSX.Element;
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
