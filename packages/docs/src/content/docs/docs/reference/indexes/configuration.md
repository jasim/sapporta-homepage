---
title: "Configuration"
description: "Find canonical owners for environment variables and project configuration hooks."
---

## Identity

Name-based index across API runtime, frontend build, CLI runtime, and TypeScript config.

## Contract

- Origins/auth: `SAPPORTA_PUBLIC_BASE_URL`, `SAPPORTA_FRONTEND_ORIGINS`, `SAPPORTA_REQUIRE_VERIFIED_EMAIL`.
- Runtime: `PORT`, `SAPPORTA_HEALTH_POLICY`, mail transport/from and SMTP variables.
- Frontend: `VITE_API_URL`, `FRONTEND_DEV_PORT`.
- CLI: `SAPPORTA_API_URL`, `SAPPORTA_API_TOKEN`, `SAPPORTA_OUTPUT_FORMAT`.
- Code hooks: Drizzle config, `loadApp()`, `publicApiRoutes`, `appNavigation`, and public/protected route values.


## Related documentation

- [Environment variables](/docs/reference/project/environment-variables/)
