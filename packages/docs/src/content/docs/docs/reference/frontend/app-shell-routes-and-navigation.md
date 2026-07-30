---
title: "App shell, routes, and navigation"
description:
  "Choose the reference for application route contributions or shell layout
  and responsive sidebar behavior."
---

The generated frontend separates application route ownership from reusable
shell layout. Use the leaf that matches the change:

- [Application routes and navigation](/docs/reference/frontend/app-shell/application-routes-and-navigation/)
  covers `App.tsx` contributions, bootstrap order, public/protected routes,
  generated table navigation, and the frontend authorization boundary.
- [Layout and sidebar](/docs/reference/frontend/app-shell/layout-and-sidebar/)
  covers responsive sidebar primitives, `AppPage`, page headers, bounded
  workspaces, height, and scrolling.

Project screens use these public extension points rather than replacing
`SapportaApp` or mounting a second application shell.

## Related documentation

- [Custom frontend routes and screens](/docs/guides/app-owned-features/custom-frontend-routes-and-screens/)
- [Generated record surfaces and form helpers](/docs/reference/frontend/generated-record-surfaces/)
- [Table query options](/docs/reference/frontend/table-query-options/)
