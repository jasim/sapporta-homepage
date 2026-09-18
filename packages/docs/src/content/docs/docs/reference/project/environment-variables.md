---
title: "Environment variables"
description:
  "Look up supported server, frontend-build, and CLI environment variables."
---

## Identity

Generated API env parser, Drizzle Kit config, Vite build environment, and
Sapporta CLI runtime.

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
- `SAPPORTA_OPENAPI_POLICY` accepts `public`, `authenticated`, or `disabled`,
  and sets who may read the application contract at `/api/openapi.json`. An
  absent value means `authenticated`. The generated `.env.development` sets
  `public`, so `sapporta endpoints list` and `endpoints show` work against a
  local development server with no access token. Deployments leave it unset or
  set `authenticated`, and endpoint discovery there needs a token.
- `SAPPORTA_MAIL_TRANSPORT` accepts `stream`, `smtp`, or `disabled`;
  `SAPPORTA_MAIL_FROM` supplies the sender.
- `SAPPORTA_ALLOW_SAMPLE_DATA_SEEDING=true` permits `pnpm seed` to create the
  sample-data account named in `packages/api/seed.ts`, and it also requires
  `NODE_ENV` to be anything other than `production`. The generated
  `.env.development` sets it. The permission is granted rather than merely not
  withheld: an environment that never heard of the setting is refused, so a
  staging box, a systemd unit, or CI against a restored snapshot is not taken
  for a developer's machine. The account's password is written in the source,
  so no deployment carries this setting.
- `VITE_API_URL` is public build-time configuration for a split API origin.
- `SAPPORTA_API_URL`, `SAPPORTA_API_TOKEN`, and `SAPPORTA_OUTPUT_FORMAT`
  configure CLI calls.
- `SAPPORTA_API_PORT` selects the API listener port. Hosting-platform `PORT` is
  accepted when it is absent; both values must match when set together. The API
  defaults to `3000` when neither is set.
- `SAPPORTA_FRONTEND_PORT` selects the Vite development port.
- `sapporta init` picks both development ports for the new project and writes
  them into `.env.development`, so that several Sapporta projects run on one
  machine without being reconfigured. A generated project's development ports
  are therefore per-project, not the defaults above. `pnpm dev` prints both as
  URLs when it starts.
- `SAPPORTA_DATA_DIR` names the directory that holds the SQLite database,
  `sqlite.db`. It has no default: the server and Drizzle Kit both stop with an
  error when it is unset or empty. An absolute path is used as given. A relative
  path resolves against the project root, the directory with `sapporta.json`,
  and never against the working directory, so `data` names the same directory
  for `pnpm dev`, Drizzle Kit, and the built server. The directory must exist.
- `sapporta init` writes `SAPPORTA_DATA_DIR=data` into `.env.development`, so a
  copy of the project opens its own copy of the database. `pnpm dev` and
  `pnpm seed` load that file. The `pnpm db:*` scripts do not: they read
  `SAPPORTA_DATA_DIR` from the environment, the same way on a laptop and on a
  server, and stop when it is unset. Pass it on the command line in development:
  `SAPPORTA_DATA_DIR=data pnpm --filter ./packages/api db:migrate`.
- The generated Docker image sets `SAPPORTA_DATA_DIR=/app/data`. Every other
  deployment sets it in the server's environment and in the environment of its
  migration job.

`SAPPORTA_REQUIRE_VERIFIED_EMAIL` accepts only the literal values `true` and
`false` when set.

## Related documentation

- [Application configuration](/docs/guides/operations/application-configuration/)
- [Production builds and deployment](/docs/guides/operations/production-builds-and-deployment/)
- [Sample data and command-line scripts](/docs/guides/operations/sample-data-and-scripts/)
