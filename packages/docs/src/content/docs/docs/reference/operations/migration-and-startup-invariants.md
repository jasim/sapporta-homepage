---
title: "Migration and startup invariants"
description:
  "Look up the required ordering between schema generation, migration apply, and
  server startup."
---

## Identity

Drizzle migration artifacts, `assertMigrationsReady`, `pendingMigrations`,
`applyMigrations`, generated boot, `SAPPORTA_DATA_DIR`, and container command.

## Contract

- `db:generate` creates migration SQL plus Drizzle journal/snapshot state, and
  those artifacts are reviewed before deployment.
- `db:check` validates the Drizzle snapshot chain. It does not inspect the live
  database or prove that a migration was applied.
- The server, Drizzle Kit, and every `db:*` script open `sqlite.db` in the
  directory named by `SAPPORTA_DATA_DIR`, and stop when it is unset. A migration
  job runs with the same value as the server it prepares.
- One deployment job applies pending migrations before new application replicas
  serve traffic.
- When registered tables exist, server startup refuses:
  - a missing or unreadable migration directory;
  - a migration file present on disk but absent from the applied ledger;
  - an applied ledger entry whose migration is missing from disk; or
  - an applied migration whose on-disk hash changed.
- Server startup validates this applied-ledger readiness and never applies
  migrations from boot or request handling. An application that keeps its
  migrations outside `packages/api/migrations` and migrates its own database at
  startup calls `pendingMigrations()` and `applyMigrations()` itself; see
  [apply migrations from application code](/docs/reference/schema/migrations/#apply-migrations-from-application-code).
- The readiness error names the database it checked. A successful start prints
  `Database: <path>` after the ready line.
- A failed migration or readiness mismatch is a startup/release failure.
- Database backup and application rollback do not automatically reverse
  destructive SQL.

## Related documentation

- [Schema changes and migrations](/docs/guides/model-data/schema-changes-and-migrations/)
- [Migrations](/docs/reference/schema/migrations/)
- [Run migrations in deployed environments](/docs/guides/operations/run-migrations-in-deployed-environments/)
