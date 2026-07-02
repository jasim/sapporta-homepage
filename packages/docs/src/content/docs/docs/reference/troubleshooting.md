---
title: "Troubleshooting Reference"
description:
  "Lookup fixes for native SQLite bindings, bad filters, auth, migrations, and
  deployment failures."
---

## Troubleshooting

### Native SQLite bindings

If startup or CLI use fails with `Could not locate the bindings file` for
`better-sqlite3`, rebuild the native addon in the app package that installed it:

```bash
pnpm rebuild better-sqlite3
```

If rebuild fails because build tools are missing on macOS, run:

```bash
xcode-select --install
```

### Bad filters

A `400` from a table list request usually means the caller built an invalid
query. Check for missing operators, misspelled columns, unsupported operators,
bad boolean/date/timestamp values, empty `in` lists, `limit > 1000`, or `q` on a
table without `meta.search`.

### Auth and CLI access

Protected apps return structured auth codes:

| Code                 | Fix                                                    |
| -------------------- | ------------------------------------------------------ |
| `unauthenticated`    | Set or replace `SAPPORTA_API_TOKEN`.                   |
| `token_expired`      | Create a new agent token.                              |
| `token_revoked`      | Stop using the revoked token and create a replacement. |
| `workspace_required` | Create the token while a valid workspace is active.    |
| `forbidden`          | Use an account or token with permission for the route. |

The CLI target is selected by `SAPPORTA_API_URL` or `--api-url`. If commands hit
the wrong server, print the variable and pass `--api-url` explicitly. For token
setup and auth-error recovery, see
[Agent Access](/docs/tools-and-operations/agent-access/).

### Migrations

If production boot reports migration readiness problems, apply migrations before
starting the new server version:

```bash
pnpm --filter ./packages/api db:migrate
```

Sapporta does not auto-migrate at runtime.

### Deployment

For missing data after a redeploy, verify the SQLite data directory is on
durable storage. In Docker, mount a named volume or bind mount at the generated
app's data path, commonly `/app/data`.

For browser auth or API failures in split deployments, check:

- `SAPPORTA_PUBLIC_BASE_URL` is the public app origin only.
- `SAPPORTA_FRONTEND_ORIGINS` includes every browser origin that sends
  credentialed requests.
- `VITE_API_URL` is set only for the frontend build and points to the API
  origin.
- `/api/auth/*` from the public app origin reaches the API host for auth email
  callbacks.
