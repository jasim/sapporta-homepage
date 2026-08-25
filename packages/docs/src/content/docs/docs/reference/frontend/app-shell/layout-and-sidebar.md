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

- The expanded sidebar reserves `240px` beside the route content.
- The collapse control stores the desktop preference under
  `sapporta:sidebar-expanded`.
- A collapsed sidebar has zero layout width. A fine-pointer device can reveal it
  from the left edge without changing the stored preference or moving route
  content.
- Compact screens open the complete sidebar as a modal drawer. Drawer state is
  temporary and closes after navigation, dismissal, or a move back to the
  desktop breakpoint.

The standard toggle stays inside the expanded desktop sidebar. It moves to the
content's top-left when the desktop sidebar is collapsed and on compact screens.
Route components do not need to render a toggle.

`AppShell` accepts `sidebarOptions` for `defaultExpanded` and `storageKey`. An
application with its own persistent toolbar can render `SidebarToggle` there and
pass `sidebarToggle={false}` to `AppShell`. The toolbar must remain mounted for
both desktop and compact layouts.

`SidebarProvider`, `SidebarRegion`, `SidebarShell`, `SidebarToggle`, and
`useSidebar()` are public composition primitives. `SidebarShell` renders the
navigation contents; `SidebarRegion` decides whether those contents occupy
desktop width or a compact drawer.

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
   `title`, `subtitle`, and `actions`.
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
- [TGrid](/docs/reference/frontend/tgrid/)
- [Column sizing](/docs/reference/column-sizing/)
