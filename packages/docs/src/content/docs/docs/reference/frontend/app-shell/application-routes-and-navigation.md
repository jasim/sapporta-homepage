---
title: "Application routes and navigation"
description:
  "Look up generated route contributions, navigation values, bootstrap order,
  generated table routes, and frontend authorization boundaries."
---

## Identity

Generated `packages/frontend/src/App.tsx`,
`packages/frontend/src/SapportaApp.tsx`, and
`packages/frontend/src/SapportaRoutes.tsx`.

## Application contributions

The generated `App.tsx` exports five values:

```tsx
import type { ReactElement } from "react";
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

export const appPublicHomeRoute: ReactElement | null = null;

export const appPublicRoutes = (
  <Route path="status" element={<PublicStatus />} />
);

export const appProtectedRoutes = (
  <Route path="projects/progress" element={<ProjectProgress />} />
);
```

- `appNavigation` is a readonly array of labeled sections. Each item has a
  `label`, an absolute `to`, and an optional icon.
- `appHomeRoute` is the index route at `/`. It renders inside `AuthGate`, so it
  opens for a signed-in session and is where sign-in returns.
- `appPublicHomeRoute` is an optional index route at `/` for a visitor without a
  session. It is `null` in a generated project. A non-null value takes `/` in
  place of `appHomeRoute`, so an app that needs both an anonymous landing page
  and a signed-in home screen gives the signed-in screen its own path in
  `appProtectedRoutes`.
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
3. `appPublicHomeRoute` and `appPublicRoutes`, inside `AppShell` and outside
   `AuthGate`.
4. `appHomeRoute`, `appProtectedRoutes`, and Sapporta's protected routes, inside
   `AuthGate`. `appHomeRoute` is mounted only while `appPublicHomeRoute` is
   `null`.

`SapportaApp.tsx` performs that composition. The ordinary way to change where a
screen renders is to move it between the `App.tsx` slots.

An application public route can render for a guest, but it still participates in
the application bootstrap and shell. Put it in `appPublicRoutes` only when its
page and data are intentionally anonymous. A protected contribution renders only
after session bootstrap has settled and an authenticated workspace is available.

Feature modules reuse the starter's QueryClient. A nested provider would split
cache invalidation, error handling, and DevTools state from the rest of the
application.

## Screens from `@sapporta/frontend`

`SapportaRoutes.tsx` mounts the screens the library ships. Each page is lazily
imported from `@sapporta/frontend`, so a screen's code loads when its URL is
first visited, and `SapportaApp.tsx` composes what the file exports.

- `sapportaPublicRoutes` — `login`, `signup`, `verify-email`, `forgot-password`,
  and `reset-password`. `login` and `signup` render inside `PublicOnlyGate`,
  which sends a session that already exists to the application instead.
- `sapportaProtectedRoutes` — `account/profile`, `account/password`,
  `workspace/settings`, `tables/:tableName`, and `tables/:tableName/new`. The
  workspace settings screen is where an owner changes the workspace time zone.
- `sapportaNotFoundRoute` — `*`, rendering `NotFoundView`.

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

Generated table handlers and application API routes must still enforce their
server-side ability, authority, row-scope, and write-integrity rules. Navigation
visibility, hidden fields, fixed filters, route parameters, and client cache
keys are not authorization.

`getApiBase` and the router bridge provide platform integration for project
screens; neither changes that server boundary.

## Related documentation

- [Frontend routes, navigation, and layout](/docs/guides/application-code/frontend-routes-navigation-and-layout/)
- [Layout and sidebar](/docs/reference/frontend/app-shell/layout-and-sidebar/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Table query options](/docs/reference/frontend/table-query-options/)
