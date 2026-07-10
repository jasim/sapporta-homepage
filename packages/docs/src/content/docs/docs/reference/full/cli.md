---
title: "Sapporta CLI Complete Reference"
description:
  "Complete Sapporta CLI reference for local commands, API-backed data commands,
  protected apps, workspace scope, custom endpoints, and auth errors."
---

The Sapporta CLI creates projects and calls a running Sapporta app. Use it to
inspect the app's API, work with tables, and run data commands against the same
built-in routes your users call from the browser.

## Local Commands

From an existing project, local commands read project files and do not need a
running server:

```bash
pnpm exec sapporta init my-app
```

From an empty parent directory, use the published initializer:

```bash
pnpm dlx sapporta init my-app
```

If `pnpm dlx` is not available, `npx sapporta init my-app` is the fallback
initializer path.

Framework authors sometimes create test projects against a local Sapporta
checkout. When `SAPPORTA_DEV_MODE_PACKAGE_ROOT` is set, use that checkout's
initializer instead of the registry package:

```bash
export SAPPORTA_DEV_MODE_PACKAGE_ROOT=/path/to/sapporta
node "$SAPPORTA_DEV_MODE_PACKAGE_ROOT/packages/core/bin/sapporta.mjs" init my-app
```

Keep `SAPPORTA_DEV_MODE_PACKAGE_ROOT` set for initialization, dependency
installation, build, and development-server commands. Do not silently fall back
to `pnpm dlx` in this mode; that mixes registry templates with local framework
packages.

## API-Backed Commands

These commands call the selected Sapporta API server:

```bash
pnpm exec sapporta endpoints list
pnpm exec sapporta tables list
pnpm exec sapporta rows create <table> --values '[{...}]'
pnpm exec sapporta sql query "SELECT ..."
```

By default, the CLI calls `http://localhost:3000`. Set `SAPPORTA_API_URL` when
the app runs somewhere else:

```bash
export SAPPORTA_API_URL="https://app.example.com"
pnpm exec sapporta endpoints list
```

For a one-off command, pass the URL directly:

```bash
pnpm exec sapporta --api-url "https://app.example.com" endpoints list
```

Command flags override environment variables.

## Protected Apps

Auth-enabled apps usually protect table, SQL, OpenAPI, and custom app routes.
Create an agent access token from your account profile in the app, copy the raw
token once, and store it as `SAPPORTA_API_TOKEN` in your shell, CI system, or
agent secret store:

```bash
export SAPPORTA_API_URL="https://app.example.com"
export SAPPORTA_API_TOKEN="spat_..."

pnpm exec sapporta endpoints list
pnpm exec sapporta tables sample customers
```

You can also pass a token for one command:

```bash
pnpm exec sapporta --api-token "spat_..." tables list
```

Do not commit tokens to source control. Revoke tokens you no longer use from the
account profile screen.

## Workspace Scope

An agent access token belongs to one user and one workspace. CLI commands do not
send a workspace id for ordinary data work; the token selects the workspace. To
work in another workspace, switch to that workspace in the app and create a
token for it.

## Custom Endpoints

Use `sapporta endpoints show` to inspect custom endpoints:

```bash
pnpm exec sapporta endpoints show "POST /api/invoices/{id}/void"
```

The CLI can call built-in table, row, SQL, metadata, report, and custom app
routes. Use `sapporta api post` for JSON workflow calls:

```bash
pnpm exec sapporta api post /api/invoices/123/void \
  --body '{"reason":"duplicate"}'
```

Use `sapporta api get` for query-driven report routes:

```bash
pnpm exec sapporta api get /api/reports/trial-balance \
  --query '{"asOfDate":"2026-06-12"}'
```

## Auth Errors

Protected apps return structured auth errors:

- `unauthenticated`: set or replace `SAPPORTA_API_TOKEN`.
- `token_expired`: create a new token and update your secret.
- `token_revoked`: remove the revoked token and create a replacement if needed.
- `workspace_required`: the token no longer maps to a valid workspace
  membership.
- `forbidden`: the user or token cannot perform that action.

`sapporta endpoints list` uses the same API URL and token as data commands. If
discovery fails with an auth error, fix the token before composing table, SQL,
report, or custom endpoint requests.
