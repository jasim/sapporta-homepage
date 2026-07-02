---
title: "Project Anatomy"
description:
  "Learn the main files and packages in a generated Sapporta TypeScript
  monorepo."
---

A Sapporta app is an ordinary TypeScript monorepo. The `sapporta init` command
creates a pnpm workspace with a fully configured SPA, split into three packages
in the `packages` folder:

- `packages/api/`: a Hono web server with Drizzle and SQLite for the database,
  Better Auth for authentication, and CASL for authorization.
- `packages/frontend/`: a React app built with Vite, Tailwind, and shadcn/ui
  conventions.
- `packages/shared/`: shared API signatures and wire types. Sapporta uses a fork
  of ts-rest so the frontend can talk to the server through typed function calls
  instead of manual REST serialization.
- `data/`: local SQLite data.
- `sapporta.json`: the project marker used by the CLI.
- `Dockerfile`: a production image that serves both the backend and the static
  frontend from a single port.

Common edit points:

- `packages/api/schema/`: tables.
- `packages/shared/src/contracts/`: API contracts.
- `packages/api/app/`: backend route handlers.
- `packages/frontend/src/App.tsx`: routes and navigation.
- `packages/frontend/src/api.ts`: typed frontend clients.

Generated table endpoints, reports, and app-owned endpoints are served under
`/api`. Browser screens live in the frontend package. Shared request and
response contracts belong in `packages/shared`, which must not depend on the API
or frontend packages.

Run Sapporta CLI commands from the project root and prefer:

```bash
pnpm exec sapporta ...
```
