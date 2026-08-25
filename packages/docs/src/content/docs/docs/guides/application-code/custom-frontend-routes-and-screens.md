---
title: "Custom frontend routes and screens"
description:
  "Choose the focused guide for implementing a workflow screen or registering
  it in the generated application shell."
---

A custom frontend feature has two separate owners. The screen owns query,
mutation, and interaction state. The application shell owns URL registration,
navigation, public or protected placement, and page layout.

- [Custom workflow screens](/docs/guides/application-code/custom-workflow-screens/)
  covers generated reads, typed actions, bounded projections, loading and error
  states, and cache refresh.
- [Frontend routes, navigation, and layout](/docs/guides/application-code/frontend-routes-navigation-and-layout/)
  covers `App.tsx`, shell page composition, protected and public routes,
  navigation entries, reload, and responsive checks.

A protected frontend route is a UX boundary. The generated table routes and
application endpoint must still enforce authentication, abilities, and row scope
on the server.

## Related documentation

- [Cached table reads and refresh](/docs/guides/application-code/cached-table-reads-and-refresh/)
- [Typed API clients](/docs/guides/application-code/typed-api-clients/)
- [App shell, routes, and navigation](/docs/reference/frontend/app-shell-routes-and-navigation/)
