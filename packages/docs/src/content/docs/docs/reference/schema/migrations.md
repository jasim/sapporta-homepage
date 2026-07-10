---
title: "Migrations"
description: "Look up migration scripts, artifacts, and database readiness behavior."
---

## Identity

Generated API package scripts backed by Drizzle Kit.

## Contract

- `db:generate --name <name>` writes SQL and journal artifacts under `packages/api/migrations/`.
- `db:migrate` applies pending committed artifacts to the configured SQLite database.
- `db:check` validates the migration/schema state.
- Server startup checks readiness and does not apply migrations automatically.

## Minimal lookup

```bash
pnpm --filter ./packages/api db:generate --name add_field
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
```

## Related documentation

- [Schema changes and migrations](/docs/guides/model-data/schema-changes-and-migrations/)
