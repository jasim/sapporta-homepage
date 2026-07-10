---
title: "Configuration"
description:
  "Find canonical owners for environment variables and project configuration
  hooks."
---

## Identity

Name-based index across API runtime, frontend build, CLI runtime, and TypeScript
config.

## Contract

- Origins/auth: `SAPPORTA_PUBLIC_APP_URL`, `SAPPORTA_FRONTEND_ORIGINS`,
  `SAPPORTA_REQUIRE_VERIFIED_EMAIL`.
- Runtime: `SAPPORTA_API_PORT`, hosting-platform `PORT`,
  `SAPPORTA_HEALTH_POLICY`, mail transport/from and SMTP variables.
- Frontend: `VITE_API_URL`, `SAPPORTA_FRONTEND_PORT`.
- CLI: `SAPPORTA_API_URL`, `SAPPORTA_API_TOKEN`, `SAPPORTA_OUTPUT_FORMAT`.
- Code hooks: Drizzle config, `loadApp()`, `publicApiRoutes`, `appNavigation`,
  and public/protected route values.

## Related documentation

- [Environment variables](/docs/reference/project/environment-variables/)
