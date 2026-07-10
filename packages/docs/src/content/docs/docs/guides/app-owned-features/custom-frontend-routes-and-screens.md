---
title: "Custom frontend routes and screens"
description: "Add a protected workflow screen inside the generated application shell."
---

Add a protected workflow screen inside the generated application shell.

Generated `App.tsx` values extend navigation, home routing, public routes, and protected routes. Protected screens render after auth and app boot complete.

For the programmer, the project owns workflow-specific React state and reuses generated records, typed clients, and `@sapporta/ui` components.
For the application user, users receive explicit loading, empty, ready, success, and actionable error states.

## System boundary

- Place protected product screens in `appProtectedRoutes`.
- Add navigation through `appNavigation`.
- Keep ordinary create and edit forms on generated table routes.
- Link workflow rows back to generated record surfaces.

## Task-app example

`ProjectProgress.tsx` shows progress and current tasks, completes a task through the typed client, refreshes the summary, and links to project, task, and event records.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [App shell, routes, and navigation](/docs/reference/frontend/app-shell-routes-and-navigation/)
- [Generated record surfaces](/docs/reference/frontend/generated-record-surfaces/)
