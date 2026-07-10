---
title: "Application configuration"
description: "Look up generated configuration entry points outside environment variables."
---

## Identity

Project-owned TypeScript and workspace configuration files.

## Contract

- `packages/api/drizzle.config.ts` selects schema, migration output, dialect, and database credentials.
- `packages/api/app.ts` owns `loadApp()` route mounting and `publicApiRoutes`.
- `packages/frontend/src/App.tsx` owns navigation and public/protected application routes.
- `packages/frontend/vite.config.ts` owns the development `/api` proxy and frontend build configuration.


## Related documentation

- [Application configuration guide](/docs/guides/operations/application-configuration/)
