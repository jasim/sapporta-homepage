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
| `sapporta init` rejects the pnpm version | `pnpm --version` on the machine running `init`      | Upgrade to pnpm 11 with `corepack use pnpm@11`     |
| Frontend type error reaches the browser  | Root `typecheck` script and `tsc --noEmit` output   | Run `pnpm typecheck`; a green `vite build` is not a type check |
| `SAPPORTA_DATA_DIR is not set`       | Environment of the server or `db:*` command         | Set it to the directory that holds `sqlite.db`     |
| Migration readiness failure          | `Database:` line in the error, migration files, ledger | Fix `SAPPORTA_DATA_DIR`, restore files, or apply the reviewed migration |
| Structured 400 on a list route       | Column, operator, and semantic query value          | Fix the strict filter; keep the intended predicate |
| `unauthenticated` or token error     | Target, active workspace, expiry, revocation        | Create or pass the correct scoped token            |
| Browser CORS or callback error       | Public app URL and exact origin list                | Align the configured topology                      |
| Data disappears after restart        | `Database:` line at startup and the volume mount    | Point `SAPPORTA_DATA_DIR` at durable storage and restore backup |

Start by preserving the full error and running read-only discovery:

```bash
pnpm exec sapporta endpoints list
pnpm exec sapporta tables show tasks
SAPPORTA_DATA_DIR=data pnpm --filter ./packages/api db:check
```

For a migration readiness failure, read the database path first. The server
prints the database it opened after its ready line, and the readiness error
names the database it checked:

```text
Sapporta migrations are not ready.

Database: /srv/tasks/data/sqlite.db
```

A `SAPPORTA_DATA_DIR` that names the wrong directory produces exactly the
failure of a database that was never migrated. The value can come from
`.env.development`, from a tool such as mise or direnv, or from the shell;
confirm the path before applying a migration or restoring files. `db:migrate`
migrates the database in its own environment's `SAPPORTA_DATA_DIR`, so run it
with the value the server uses.

For a native binding failure after changing Node or reinstalling packages,
rebuild the addon where the API package installed it:

```bash
pnpm --filter ./packages/api rebuild better-sqlite3
pnpm build
```

For a frontend type error that a build did not report, run the type checker
directly:

```bash
pnpm typecheck
```

`vite build` transpiles with esbuild, which erases types without checking them,
so a successful build says nothing about whether the frontend compiles. Grid and
lookup generics fail at the type level and nowhere else. A project generated
before the root `typecheck` script existed runs
`pnpm --filter ./packages/frontend exec tsc --noEmit` and should add the script
to its root `package.json`.

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
