---
title: "Migrations"
description:
  "Look up migration scripts, artifacts, and database readiness behavior."
---

## Identity

Generated API package scripts backed by Drizzle Kit, plus the programmatic
ledger helpers `@sapporta/server` exports.

## Contract

- `db:generate --name <name>` writes SQL, journal, and snapshot artifacts under
  `packages/api/migrations/`. Review the generated SQL and snapshot before
  applying them.
- `db:migrate` applies pending committed artifacts to the configured SQLite
  database.
- `db:check` runs `drizzle-kit check`. It validates the Drizzle migration
  snapshot chain; it does not inspect live tables or prove that migrations were
  applied.
- Server startup separately checks migration files against the applied ledger
  and does not apply migrations automatically. An application that names its own
  migrations directory may apply them itself; see
  [Apply migrations from application code](#apply-migrations-from-application-code).
- Every `db:*` script opens `sqlite.db` in the directory named by
  `SAPPORTA_DATA_DIR`, read from the environment. The scripts never load
  `.env.development`, and `drizzle.config.ts` stops with an error when the
  variable is unset.

## Minimal lookup

```bash
SAPPORTA_DATA_DIR=data pnpm --filter ./packages/api db:generate --name add_field
SAPPORTA_DATA_DIR=data pnpm --filter ./packages/api db:migrate
SAPPORTA_DATA_DIR=data pnpm --filter ./packages/api db:check
```

## Apply migrations from application code

An application packaged as one module, which ships its migrations inside that
package and migrates the user's database itself, does not use the generated
`db:*` scripts. `@sapporta/server` exposes the same ledger logic:

```ts
import { applyMigrations, pendingMigrations } from "@sapporta/server";

const pending = pendingMigrations(sqlite, migrationsDir);
if (pending.length > 0) applyMigrations(sqlite, migrationsDir);
```

- `pendingMigrations(sqlite, migrationsDir)` lists the migrations the database
  has not applied, oldest first.
- `applyMigrations(sqlite, migrationsDir)` applies them with drizzle-orm's
  `migrate()` and returns the ones it applied. It throws, and applies nothing,
  when a pending migration is dated before the latest applied one, because
  `migrate()` would skip that migration without an error.
- `assertMigrationsReady` and `loadSapportaProject` take `migrationsDir`, which
  defaults to `packages/api/migrations` under the project root. The `pnpm
  --filter` hints in a readiness error appear only for that default.

## Related documentation

- [Schema changes and migrations](/docs/guides/model-data/schema-changes-and-migrations/)
- [Migration and startup invariants](/docs/reference/operations/migration-and-startup-invariants/)
- [Environment variables](/docs/reference/project/environment-variables/)
