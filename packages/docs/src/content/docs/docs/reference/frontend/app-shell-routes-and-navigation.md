---
title: "App shell, routes, and navigation"
description: "Look up generated frontend extension points and navigation types."
---

## Identity

Generated `packages/frontend/src/App.tsx` and `@sapporta/frontend` app/shell exports.

## Contract

- `appNavigation` is a `Navigation` value rendered by the generated shell.
- `appHomeRoute` chooses the signed-in landing destination.
- `appPublicRoutes` render outside the protected app gate.
- `appProtectedRoutes` render after auth bootstrap inside `AppShell`.
- `getApiBase` and router helpers provide platform integration for project screens.


## Related documentation

- [Custom frontend routes and screens](/docs/guides/app-owned-features/custom-frontend-routes-and-screens/)
