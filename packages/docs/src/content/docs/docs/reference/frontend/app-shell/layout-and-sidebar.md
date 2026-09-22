---
title: "App shell layout and sidebar"
description:
  "Compose responsive sidebar primitives, page headers, scrolling pages, and
  bounded grid or editor workspaces."
---

## Identity

`@sapporta/frontend/shell` owns the responsive application shell and sidebar.
`@sapporta/frontend/layout` owns page height, headers, actions, and scrolling
composition.

## Responsive sidebar

`AppShell` owns one `SidebarProvider`, the responsive navigation region, and a
sidebar toggle. Desktop screens use the sidebar breakpoint at `64rem`:

- The expanded sidebar takes the width of its contents beside the route content.
  `SidebarShell`, which `AppShell` renders, is `240px` wide.
- A collapsed sidebar becomes a rail: a column `4.25rem` (68px) wide that shows
  each navigation item's icon without its label. Every destination stays one
  click away, and the route content gets the rest of the width.
- When a mouse rests on the rail for 200ms, the full sidebar opens over the
  route content, and the content does not move. Each item keeps its row, so the
  icon under the pointer becomes the same item with its label. The sidebar
  closes 300ms after the pointer leaves it. Touch input does not open it: a tap
  on a rail icon follows the link.
- Choosing a destination puts the opened sidebar away and leaves the rail, so
  the page is not left under it. Hovering does not open it again until the
  pointer has left the rail and come back. Sidebar contents get this by passing
  `closeTemporary` from `useSidebar()` as `onNavigate`, which also dismisses the
  compact drawer and does nothing while the sidebar is expanded. Pass it to
  `AccountMenu` as `onActionComplete` so choosing Profile or Workspace settings
  does the same; opening the menu keeps the sidebar, and a failed action keeps
  the menu open with its message.
- Pressing the collapse control does not open the sidebar again under the
  pointer. It opens once the pointer has left the rail and come back to rest on
  it. Pressing a rail icon within the 200ms cancels the opening, so a quick
  click follows the link.
- The collapse control stores the desktop preference under
  `sapporta:sidebar-expanded`. The sidebar that opens over the page from the
  rail is not stored.
- Compact screens open the complete sidebar as a modal drawer. Drawer state is
  temporary and closes after navigation, dismissal, or a move back to the
  desktop breakpoint.

On desktop, the standard toggle is the first control in the sidebar header, in
the expanded sidebar and in the rail. It stays at the same screen position, so a
second click lands on the same button, and the button keeps keyboard focus. On
compact screens, the toggle sits over the content's top-left and opens the
drawer. Route components do not need to render a toggle.

`AppShell` accepts `sidebarOptions` for `defaultExpanded` and `storageKey`. An
application with its own persistent toolbar can render `SidebarToggle` there and
pass `sidebarToggle={false}` to `AppShell`. The toolbar must remain mounted for
both desktop and compact layouts.

`SidebarProvider`, `SidebarRegion`, `SidebarShell`, `SidebarToggle`, and
`useSidebar()` are public composition primitives. `SidebarShell` renders the
navigation contents; `SidebarRegion` decides whether those contents occupy
desktop width, the rail, or a compact drawer. The expanded region and the drawer
take the width of what they hold, so a sidebar of any width fits in them.

`useSidebar().rail` is `true` while the contents are shown as the rail. Sidebar
contents read it to fill the rail and to hide their text labels:

- Pass `rail` to `SidebarShell`. It then fills the rail instead of using its own
  width, including a width set through `className`.
- Keep each item's height and left padding, and hide only its label (for example
  with `sr-only`, which keeps the label as the link's accessible name). The
  icons then stay in place when the sidebar opens over the page.
- Show only the toggle in the header, and a compact form of the footer. The
  standard account menu takes `compact` for this; a trigger passed through
  `renderTrigger` chooses its own compact form.

`SidebarRegion` accepts `railWidth` for a sidebar whose icons need a different
rail width. Choose the width so the icons sit in the middle of the rail.

## Compose an application-owned shell

An application that needs a different frame renders its own shell from these
primitives in place of `AppShell`. `AppShell` carries three duties the
replacement takes on:

- **Toasts.** Sapporta's workspace settings and password screens post toasts to
  the `sonner` instance that `@sapporta/frontend` bundles. Render the `Toaster`
  exported from `@sapporta/frontend/shell` once, above `BootLoader`; a `Toaster`
  from the application's own copy of `sonner` never shows them. A workspace
  switch or a time zone change remounts everything under `BootLoader`, so an
  outlet inside it misses the toasts posted at that moment.
- **Header inset.** While a control sits over the content's top-left corner,
  such as the drawer toggle on a compact screen, set `--sap-page-header-inset`
  to that control's width on the scroll region. `PageHeader` adds the value to
  its leading padding, so the title stays clear of the control. `AppShell` sets
  `3rem` while its content-side toggle is present.
- **Theme.** Call `useDocumentTheme()` in the shell to apply the dark palette. A
  shell that omits it stays on the light palette. See [Theme mode](#theme-mode).

Place the `Toaster` beside the routes in `SapportaApp.tsx`:

```tsx
import { BootLoader } from "@sapporta/frontend/app";
import { Toaster } from "@sapporta/frontend/shell";

return (
  <>
    <Toaster position="top-center" richColors />
    <Routes>
      {sapportaPublicRoutes}
      <Route
        element={
          <BootLoader>
            <LedgerShell />
          </BootLoader>
        }
      >
        {/* application and Sapporta routes */}
      </Route>
    </Routes>
  </>
);
```

The shell owns the provider, the region, the toggle, and the scroll region:

```tsx
import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  SidebarRegion,
  SidebarToggle,
  useDocumentTheme,
  useSidebar,
} from "@sapporta/frontend/shell";
import { cn } from "@sapporta/ui/cn";

export function LedgerShell() {
  useDocumentTheme();
  return (
    <SidebarProvider>
      <LedgerLayout />
    </SidebarProvider>
  );
}

function LedgerLayout() {
  const sidebar = useSidebar();
  // On desktop, the toggle is part of the sidebar header, in the rail too.
  const toggleOverContent = !sidebar.isDesktop;

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarRegion>
        <LedgerSidebar
          toggle={sidebar.isDesktop ? <SidebarToggle /> : undefined}
        />
      </SidebarRegion>
      <div className="relative min-w-0 flex-1">
        {toggleOverContent && (
          <div className="absolute left-2 top-1.5">
            <SidebarToggle />
          </div>
        )}
        <main
          className={cn(
            "flex h-full min-h-0 flex-col overflow-y-auto",
            toggleOverContent && "[--sap-page-header-inset:3rem]",
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

`LedgerSidebar` puts the toggle first in its header and shows its rail form
while `rail` is `true`:

```tsx
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SidebarShell, useSidebar } from "@sapporta/frontend/shell";

function LedgerSidebar({ toggle }: { toggle?: ReactNode }) {
  const { rail, closeTemporary } = useSidebar();

  return (
    <SidebarShell
      rail={rail}
      className="w-[288px]"
      header={
        <>
          {toggle}
          {!rail && <span className="font-semibold">Ledger</span>}
        </>
      }
      onNavigate={closeTemporary}
    >
      {ledgerLinks.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} className="flex h-8 items-center gap-2.5 px-3">
          <Icon className="size-4 shrink-0" />
          <span className={rail ? "sr-only" : "truncate"}>{label}</span>
        </Link>
      ))}
    </SidebarShell>
  );
}
```

A custom `AccountMenu` trigger passed through `renderTrigger` receives
`aria-expanded` from the menu's open state.

## Theme mode

`useThemeStore` holds the theme mode, `"light"` or `"dark"`. It starts from the
visitor's saved choice, stored under the `localStorage` key `sapporta:theme`,
and otherwise from the system's `prefers-color-scheme`. `setMode()` and
`toggle()` change the mode and save the choice.

`useDocumentTheme()` sets `<html data-theme>` to the mode while the calling
component is mounted, before the first paint, so the `[data-theme="dark"]`
palette applies without a light flash. `AppShell` calls it. The store itself
never touches the document.

`forceMode(mode)` pins a mode. While a mode is pinned, `setMode()` and
`toggle()` change nothing; `forceMode(null)` returns to the saved choice or the
system preference. A light-only application pins the mode before it renders:

```ts
import { useThemeStore } from "@sapporta/frontend/shell";

useThemeStore.getState().forceMode("light");
```

Both exports are also available from `@sapporta/frontend`. The palettes
themselves are described in
[Theme tokens and scales](/docs/reference/frontend/theme-tokens-and-scales/).

## Page height and scrolling

Standard screens use `AppPage` from `@sapporta/frontend/layout`:

```tsx
import { AppPage, PageHeaderButton } from "@sapporta/frontend/layout";

export function ProjectProgress() {
  return (
    <AppPage
      section="Projects"
      title="Progress"
      subtitle="12 active"
      actions={
        <PageHeaderButton tone="primary" onClick={createProject}>
          New project
        </PageHeaderButton>
      }
      bodyClassName="p-6"
    >
      <ProjectProgressGrid />
    </AppPage>
  );
}
```

`AppPage` combines three primitives:

1. `PageFrame` fills the available shell height and clips outer overflow.
2. `PageHeader` remains in place as a flex sibling. It accepts `section`,
   `title`, `subtitle`, and `actions`. The title is set in the `sap-body` tier
   and the subtitle in the `sap-menu` tier.
3. `PageBody` owns the page's scrolling content.

Use `PageFrame`, `PageHeader`, and a custom `min-h-0 flex-1` child directly for
a bounded workspace whose grid, canvas, or editor owns overflow. An unwrapped
route grows naturally and uses the shell scroll region. The shell-owned sidebar
control remains available in both cases.

`PageHeaderButton` is the corresponding action control for `PageHeader`.
`TopBar` and `TopBarButton` are no longer public exports; existing custom
screens use `PageHeader` and `PageHeaderButton`.

## Related documentation

- [Application routes and navigation](/docs/reference/frontend/app-shell/application-routes-and-navigation/)
- [Frontend routes, navigation, and layout](/docs/guides/application-code/frontend-routes-navigation-and-layout/)
- [Theme tokens and scales](/docs/reference/frontend/theme-tokens-and-scales/)
- [TGrid](/docs/reference/frontend/tgrid/)
- [Column sizing](/docs/reference/column-sizing/)
