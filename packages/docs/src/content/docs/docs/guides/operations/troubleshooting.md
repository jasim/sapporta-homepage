---
title: "Troubleshoot startup, native modules, auth, and migrations"
description:
  "Diagnose common failures from their observable signal and apply a narrow
  correction."
---

Preserve the exact error before changing dependencies or data. The signal
usually belongs to one boundary: target, native runtime, migration guard,
request semantics, authority, origin policy, or storage.

## Route the signal to one boundary

| Signal                               | Inspect next                                        | Typical correction                                 |
| ------------------------------------ | --------------------------------------------------- | -------------------------------------------------- |
| `APP_SERVER_UNREACHABLE`             | Resolved CLI URL, network path, and API output       | Restore reachability or fix `--api-url`            |
| `Could not locate the bindings file` | Node version and installed `better-sqlite3` package | Rebuild the native addon in the API package        |
| Migration readiness failure          | Startup output, migration files, and ledger          | Restore files or apply the reviewed migration      |
| Structured 400 on a list route       | Column, operator, and semantic query value          | Fix the strict filter; keep the intended predicate |
| `unauthenticated` or token error     | Target, active workspace, expiry, revocation        | Create or pass the correct scoped token            |
| Browser CORS or callback error       | Public app URL and exact origin list                | Align the configured topology                      |
| Data disappears after restart        | Resolved database path and volume mount             | Move SQLite to durable storage and restore backup  |

Start by preserving the full error and running read-only discovery:

```bash
pnpm exec sapporta --api-url http://localhost:3000 endpoints list
pnpm exec sapporta --api-url http://localhost:3000 tables show tasks
pnpm --filter ./packages/api db:check
```

For a native binding failure after changing Node or reinstalling packages,
rebuild the addon where the API package installed it:

```bash
pnpm --filter ./packages/api rebuild better-sqlite3
pnpm build
```

For a bad filter, inspect the generated endpoint and keep an explicit operator:

```bash
pnpm exec sapporta endpoints show "GET /api/tables/tasks"
pnpm exec sapporta rows list tasks \
  --where '{"status":{"eq":"open"}}'
```

Dropping a rejected filter and retrying would change the data question and can
return a much larger visible result set.

For an auth failure, confirm the API URL before replacing the token. A token is
bound to one user and workspace. Do not diagnose workspace-user access by
opening the SQLite file directly.


Troubleshooting is complete when the original operation succeeds under its
intended scope. Keep rejected filters and authority checks strict; a broad retry
changes the question and may widen the result.

## Related reference

- [Error catalogue and diagnostics](/docs/reference/operations/error-catalogue-and-diagnostics/)
- [Migration and startup invariants](/docs/reference/operations/migration-and-startup-invariants/)
