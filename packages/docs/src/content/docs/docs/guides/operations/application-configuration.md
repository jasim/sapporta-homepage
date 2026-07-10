---
title: "Application configuration"
description:
  "Configure local, same-origin, and split-origin application environments."
---

Configure local, same-origin, and split-origin application environments.

Generated environment parsers, Vite configuration, auth options, mailer
construction, Drizzle config, and `loadApp()` options divide build-time and
runtime settings.

For the programmer, the project keeps server secrets in API process variables
and exposes only deliberate public values through `VITE_*`. For the application
user, browser auth, API calls, email links, and origins agree on one deployed
topology.

## System boundary

- Use `SAPPORTA_API_PORT` for an explicit API listener port. Managed hosts may
  provide `PORT` instead; if both are set, they must match.
- Use `SAPPORTA_FRONTEND_PORT` for the Vite development server port.
- Use `SAPPORTA_PUBLIC_APP_URL` for the public browser-facing app origin.
- Use `SAPPORTA_FRONTEND_ORIGINS` only for additional credentialed browser
  origins.
- Use `VITE_API_URL` only when the built SPA calls a separate API origin.
- Use `SAPPORTA_API_URL` only in CLI and automation client processes.
- Keep mail and auth secrets out of frontend build variables.

## Task-app example

Development uses the Vite proxy and stream mail. A split deployment sets the
public app URL on the API and an absolute `VITE_API_URL` at frontend build time.

## Verify

1. Run the smallest build, route, table, or browser check that exercises this
   boundary.
2. Compare the result with the generated record or API surface under the same
   authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or
   authority.

## Related reference

- [Environment variables](/docs/reference/project/environment-variables/)
- [Configuration index](/docs/reference/indexes/configuration/)
