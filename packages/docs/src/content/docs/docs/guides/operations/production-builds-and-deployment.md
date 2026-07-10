---
title: "Production builds and deployment"
description: "Build and run the generated application in a supported production topology."
---

Build and run the generated application in a supported production topology.

The root build compiles shared, API, and frontend packages. The production API serves `/api/*` and can serve the built SPA for the default same-origin topology.

For the programmer, the platform supplies persistent SQLite storage, exact trusted origins, health checks, and graceful process signals.
For the application user, users receive stable browser routes, API calls, and auth callbacks from one public origin.

## System boundary

- Start with the generated same-origin production shape.
- Use a reverse proxy or split frontend only when the deployment requires it.
- Persist and back up the SQLite database path.
- Verify health, auth, static routes, API routes, and shutdown after release.

## Task-app example

Build the task app, apply migrations, start the API, and verify the app shell, task table, complete-task route, and progress report before shifting traffic.

```bash
pnpm build
pnpm --filter ./packages/api db:migrate
pnpm start
```

## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Runtime and deployment contract](/docs/reference/operations/runtime-and-deployment-contract/)
- [Environment variables](/docs/reference/project/environment-variables/)
