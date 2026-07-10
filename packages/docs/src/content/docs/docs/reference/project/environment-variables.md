---
title: "Environment variables"
description:
  "Look up supported server, frontend-build, and CLI environment variables."
---

## Identity

Generated API env parser, Vite build environment, and Sapporta CLI runtime.

## Contract

- `SAPPORTA_PUBLIC_APP_URL` is the browser-facing origin used for auth links,
  callbacks, and default trust.
- `SAPPORTA_FRONTEND_ORIGINS` adds exact credentialed browser origins.
- `SAPPORTA_REQUIRE_VERIFIED_EMAIL` and `SAPPORTA_HEALTH_POLICY` configure auth
  and health behavior.
- `SAPPORTA_MAIL_TRANSPORT` accepts `stream`, `smtp`, or `disabled`;
  `SAPPORTA_MAIL_FROM` supplies the sender.
- `VITE_API_URL` is public build-time configuration for a split API origin.
- `SAPPORTA_API_URL`, `SAPPORTA_API_TOKEN`, and `SAPPORTA_OUTPUT_FORMAT`
  configure CLI calls.
- `SAPPORTA_API_PORT` selects the API listener port. Hosting-platform `PORT` is
  accepted when it is absent; both values must match when set together. The API
  defaults to `3000` when neither is set.
- `SAPPORTA_FRONTEND_PORT` selects the Vite development port.

## Related documentation

- [Application configuration](/docs/guides/operations/application-configuration/)
