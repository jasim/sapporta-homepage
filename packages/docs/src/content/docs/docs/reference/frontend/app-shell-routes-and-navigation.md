---
title: "App shell, routes, and navigation"
description:
  "Look up generated frontend route contributions, responsive sidebar behavior,
  page composition, navigation types, and authorization boundaries."
---

## Identity

Generated `packages/frontend/src/App.tsx`,
`packages/frontend/src/SapportaApp.tsx`, `@sapporta/frontend/shell`, and
`@sapporta/frontend/layout`.

## App-owned contributions

The generated `App.tsx` exports four values:

```tsx
import { Navigate, Route } from "react-router-dom";
import type { Navigation } from "@sapporta/frontend/shell";

export const appNavigation: Navigation = [
  {
    label: "Views",
    items: [{ label: "Progress", to: "/projects/progress" }],
  },
];

export const appHomeRoute = (
  <Route index element={<Navigate to="/projects/progress" replace />} />
);

export const appPublicRoutes = (
  <Route path="status" element={<PublicStatus />} />
);

export const appProtectedRoutes = (
  <Route path="projects/progress" element={<ProjectProgress />} />
);
```

- `appNavigation` is a readonly array of labeled sections. Each item has a
  `label`, an absolute `to`, and an optional icon.
- `appHomeRoute` is one index-route contribution. Its destination may be public
  or protected.
- `appPublicRoutes` and `appProtectedRoutes` are JSX route fragments, not route
  object arrays.

Nested React Router `path` values omit the leading slash. Navigation `to` values
are absolute. The current extension points are singular `appNavigation` and
`appHomeRoute`; there are no generated `appNavigationItems` or `appHomeRoutes`
exports.

## Bootstrap and route order

The current starter mounts one application `QueryClientProvider` around the
router. `SapportaApp.tsx` then composes routes in this order:

1. Sapporta's framework public routes, outside application bootstrap.
2. `BootLoader`, which restores the browser session and loads table metadata for
   an authenticated session before rendering the shell.
3. `appHomeRoute` and `appPublicRoutes`, inside `AppShell` but outside
   `AuthGate`.
4. `appProtectedRoutes` and Sapporta's protected routes, inside `AuthGate`.

An app-owned public route can render for a guest, but it still participates in
the application bootstrap and shell. Put it in `appPublicRoutes` only when its
page and data are intentionally anonymous. A protected contribution renders only
after session bootstrap has settled and an authenticated workspace is available.

Feature modules reuse the starter's QueryClient. A nested provider would split
cache invalidation, error handling, and DevTools state from the rest of the
application.

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

## Generated table navigation

Use `/tables/:tableName` for the generated table screen and
`/tables/:tableName/new` for its create screen. For example, the project create
target is `/tables/projects/new`.

There is no generated browser detail route at `/tables/:tableName/:id`. Record
interaction stays in the generated table workflow unless the application
contributes its own detail route. The
[generated record surfaces reference](/docs/reference/frontend/generated-record-surfaces/)
owns the complete generated-route inventory.

## Authorization boundary

`AuthGate` redirects guest and workspace-required browser sessions. It also
redirects an unverified session when the project's email-verification policy is
enabled. That protected-route boundary is application UX. It does not authorize
an API operation or enforce row visibility.

Generated table handlers and app-owned API routes must still enforce their
server-side ability, authority, row-scope, and write-integrity rules. Navigation
visibility, hidden fields, fixed filters, route parameters, and client cache
keys are not authorization.

`getApiBase` and the router bridge provide platform integration for project
screens; neither changes that server boundary.

## Related documentation

- [Custom frontend routes and screens](/docs/guides/app-owned-features/custom-frontend-routes-and-screens/)
- [Table query options](/docs/reference/frontend/table-query-options/)
