---
title: "Migrations"
description:
  "Look up migration scripts, artifacts, and database readiness behavior."
---

## Identity

Generated API package scripts backed by Drizzle Kit.

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
  and does not apply migrations automatically.

## Minimal lookup

```bash
pnpm --filter ./packages/api db:generate --name add_field
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
```

## Related documentation

- [Schema changes and migrations](/docs/guides/model-data/schema-changes-and-migrations/)
- [Migration and startup invariants](/docs/reference/operations/migration-and-startup-invariants/)
