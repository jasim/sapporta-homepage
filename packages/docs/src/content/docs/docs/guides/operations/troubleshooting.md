---
title: "Troubleshoot startup, native modules, auth, and migrations"
description:
  "Diagnose common failures from their observable signal and apply a narrow
  correction."
---

Sapporta surfaces different failures at different boundaries: process startup,
native SQLite loading, migration readiness, HTTP parsing, authentication, origin
checks, and persistent storage. This guide maps each signal to the next useful
inspection.

You will learn to separate target, authority, request, schema, and runtime
problems before changing dependencies or data. The same sequence helps diagnose
a local dev server, a CLI call, or a production release.

```text
Diagnose this Sapporta failure from the exact error output. Identify whether it
comes from startup, native SQLite, migrations, target selection, auth, query
parsing, or origins, then run the narrowest confirming check before changing it.
```

## Route the signal to one boundary

| Signal                               | Inspect next                                        | Typical correction                                 |
| ------------------------------------ | --------------------------------------------------- | -------------------------------------------------- |
| `APP_SERVER_UNREACHABLE`             | Resolved CLI URL and API process output             | Start the server or fix `--api-url`                |
| `Could not locate the bindings file` | Node version and installed `better-sqlite3` package | Rebuild the native addon in the API package        |
| Migration readiness failure          | Committed migrations and `db:check`                 | Apply the reviewed pending migration               |
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

<!--
Screenshot brief
Suggested asset: /assets/guides/operations/troubleshooting-signal.png
Setup: Intentionally call the local task app on the wrong port, then repeat with the correct URL and an expired test token.
Frame: Capture the two concise CLI errors and the successful endpoint discovery after correcting target and authority. Redact all token values.
Visible proof: Unreachable server and authentication failures are visibly distinct, and each correction changes only its own boundary.
Alt text: Sapporta CLI showing distinct server-target and authentication failures followed by successful discovery.
-->

Troubleshooting is complete when the observed signal disappears and the original
operation succeeds under the intended scope. The non-obvious safety rule is to
keep failed filters and auth checks strict; broad retry behavior can turn a
narrow error into an unintended read. Continue with
[CLI operation](/docs/guides/discovery/use-the-sapporta-cli/) or
[deployed migrations](/docs/guides/operations/run-migrations-in-deployed-environments/)
for the affected boundary.

## Related reference

- [Error catalogue and diagnostics](/docs/reference/operations/error-catalogue-and-diagnostics/)
- [Migration and startup invariants](/docs/reference/operations/migration-and-startup-invariants/)
