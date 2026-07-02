---
title: "Troubleshooting"
description:
  "Fix native SQLite bindings, bad filters, auth and CLI access, migrations, and
  deployment failures."
---

Use this page for operational failures. Exact lookup tables also live in
[Troubleshooting Reference](/docs/reference/troubleshooting/).

## Native SQLite bindings

If startup or CLI use fails with `Could not locate the bindings file` for
`better-sqlite3`, rebuild the native addon in the app package that installed it:

```bash
pnpm rebuild better-sqlite3
```

If rebuild fails because build tools are missing on macOS, run:

```bash
xcode-select --install
```

## Bad filters

A `400` from a table list request usually means the caller built an invalid
query. Check for missing operators, misspelled columns, unsupported operators,
bad boolean/date/timestamp values, empty `in` lists, `limit > 1000`, or `q` on a
table without `meta.search`.

See [Filter Syntax](/docs/reference/filter-syntax/) for the strict grammar.

## Auth and CLI access

Protected apps need a browser session or agent token. If CLI commands hit the
wrong app, check `SAPPORTA_API_URL` or pass `--api-url` explicitly. If auth
fails, create or replace the token from the account profile page and export it
as `SAPPORTA_API_TOKEN`.

See [Agent Access](/docs/tools-and-operations/agent-access/) for setup and
failure recovery.

## Migrations

If production boot reports migration readiness problems, apply migrations before
starting the new server version:

```bash
pnpm --filter ./packages/api db:migrate
```

Sapporta does not auto-migrate at runtime.

## Deployment

For missing data after a redeploy, verify the SQLite data directory is durable
storage. In Docker, mount a named volume or bind mount at the generated app's
data path, commonly `/app/data`.

For browser auth or API failures in split deployments, check
`SAPPORTA_PUBLIC_BASE_URL`, `SAPPORTA_FRONTEND_ORIGINS`, `VITE_API_URL`, and
whether `/api/auth/*` reaches the API host.
