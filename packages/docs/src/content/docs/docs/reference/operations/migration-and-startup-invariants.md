---
title: "Migration and startup invariants"
description:
  "Look up the required ordering between schema generation, migration apply, and
  server startup."
---

## Identity

Drizzle migration artifacts, `assertMigrationsReady`, generated boot, and
container command.

## Contract

- `db:generate` creates migration SQL plus Drizzle journal/snapshot state, and
  those artifacts are reviewed before deployment.
- `db:check` validates the Drizzle snapshot chain. It does not inspect the live
  database or prove that a migration was applied.
- One deployment job applies pending migrations before new application replicas
  serve traffic.
- When registered tables exist, server startup refuses:
  - a missing or unreadable migration directory;
  - a migration file present on disk but absent from the applied ledger;
  - an applied ledger entry whose migration is missing from disk; or
  - an applied migration whose on-disk hash changed.
- Server startup validates this applied-ledger readiness and never applies
  migrations from boot or request handling.
- A failed migration or readiness mismatch is a startup/release failure.
- Database backup and application rollback do not automatically reverse
  destructive SQL.

## Related documentation

- [Schema changes and migrations](/docs/guides/model-data/schema-changes-and-migrations/)
- [Migrations](/docs/reference/schema/migrations/)
- [Run migrations in deployed environments](/docs/guides/operations/run-migrations-in-deployed-environments/)
