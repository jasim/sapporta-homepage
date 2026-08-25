---
title: "Frontend routes, navigation, and layout"
description:
  "Register an application screen in the generated shell with deliberate route
  protection, navigation, and page-scrolling behavior."
---

Once a screen component exists, register its URL and navigation in
`packages/frontend/src/App.tsx`. Routing decides where the screen appears; it
does not authorize the screen's API requests.

## Choose the page composition

`AppPage` gives each state the shell's standard fixed header and one scrolling
body. The shell keeps its responsive sidebar control available without adding a
second toggle to the feature screen.

A workspace that owns its own height and overflow can compose `PageFrame`,
`PageHeader`, and `PageBody` directly. A naturally growing route can omit these
wrappers and use the shell scroller. Choose one scroll owner deliberately.

## Add the route and navigation item

Update `App.tsx` using the project's existing exported values:

```tsx
import { Navigate, Route } from "react-router-dom";
import type { Navigation } from "@sapporta/frontend/shell";
import { ChartNoAxesColumnIncreasing, Sparkles } from "lucide-react";
import { ProjectProgress } from "./ProjectProgress";
import { Welcome } from "./Welcome";

const welcomePath = "/welcome";

export const appNavigation: Navigation = [
  {
    label: "Views",
    items: [
      { label: "Welcome", icon: Sparkles, to: welcomePath },
      {
        label: "Project progress",
        icon: ChartNoAxesColumnIncreasing,
        to: "/projects/progress",
      },
    ],
  },
];

export const appHomeRoute = (
  <Route index element={<Navigate to={welcomePath} replace />} />
);

export const appProtectedRoutes = (
  <>
    <Route path="projects/progress" element={<ProjectProgress />} />
  </>
);
```

Keep the existing `appPublicRoutes` export and other routes. Protected routes
render after the application loads the authenticated session and active
workspace. Put a route in `appPublicRoutes` only when both the page and every
data operation it calls are intentionally anonymous.

`appHomeRoute` is the index route at `/` and renders inside `AuthGate`, so the
screen it opens is a protected screen and is where a user arrives after signing
in. An app that opens `/` to visitors without a session fills
`appPublicHomeRoute` instead; a non-null value there takes `/` in place of
`appHomeRoute`. The
[application routes reference](/docs/reference/frontend/app-shell/application-routes-and-navigation/)
records the full bootstrap order.

Use absolute application URLs such as `/projects/progress` in navigation and
nested paths such as `projects/progress` in `appProtectedRoutes`.

## Exercise shell behavior

Verify that:

- reloading `/projects/progress` stays inside the protected shell;
- the navigation item remains correct after direct URL entry;
- loading, error, empty, incomplete, and ready layouts work at narrow and
  desktop widths;
- the page has one intended scroll owner; and
- direct negative API calls still reject missing ability or invisible rows.

## Related documentation

- [Custom workflow screens](/docs/guides/application-code/custom-workflow-screens/)
- [Application routes and navigation](/docs/reference/frontend/app-shell/application-routes-and-navigation/)
- [App shell layout and sidebar](/docs/reference/frontend/app-shell/layout-and-sidebar/)
- [Authentication and abilities](/docs/guides/security/authentication-and-abilities/)
