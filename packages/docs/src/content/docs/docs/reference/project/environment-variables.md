---
title: "Environment variables"
description:
  "Look up supported server, frontend-build, and CLI environment variables."
---

## Identity

Generated API env parser, Vite build environment, and Sapporta CLI runtime.

## Contract

- `NODE_ENV=production` requires verified email by default. Other values leave
  verification optional by default.
- `SAPPORTA_PUBLIC_APP_URL` is the browser-facing origin used for auth links,
  callbacks, and default trust.
- `SAPPORTA_FRONTEND_ORIGINS` adds exact credentialed browser origins.
- `SAPPORTA_REQUIRE_VERIFIED_EMAIL=true` or `false` explicitly overrides the
  environment-based email-verification default. An empty or absent value uses
  the `NODE_ENV` policy.
- `SAPPORTA_HEALTH_POLICY` configures health behavior.
- `SAPPORTA_MAIL_TRANSPORT` accepts `stream`, `smtp`, or `disabled`;
  `SAPPORTA_MAIL_FROM` supplies the sender.
- `VITE_API_URL` is public build-time configuration for a split API origin.
- `SAPPORTA_API_URL`, `SAPPORTA_API_TOKEN`, and `SAPPORTA_OUTPUT_FORMAT`
  configure CLI calls.
- `SAPPORTA_API_PORT` selects the API listener port. Hosting-platform `PORT` is
  accepted when it is absent; both values must match when set together. The API
  defaults to `3000` when neither is set.
- `SAPPORTA_FRONTEND_PORT` selects the Vite development port.

`SAPPORTA_REQUIRE_VERIFIED_EMAIL` accepts only the literal values `true` and
`false` when set.

## Related documentation

- [Application configuration](/docs/guides/operations/application-configuration/)
