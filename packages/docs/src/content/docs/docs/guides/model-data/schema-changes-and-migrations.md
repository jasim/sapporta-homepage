---
title: "Schema changes and migrations"
description: "Change schema code and carry the reviewed change into a running database."
---

Change schema code and carry the reviewed change into a running database.

Schema files are the source of truth. Drizzle Kit generates SQL artifacts, and Sapporta startup checks require the database to be ready without applying migrations automatically.

For the programmer, the project commits schema code and generated SQL together after reviewing the data impact.
For the application user, the application starts against the intended schema, with additive and destructive changes made explicit in review.

## System boundary

- Generate a named migration after changing schema code.
- Review generated SQL before it touches a database.
- Apply the migration once, then run the schema check.
- Treat rename prompts and destructive SQL as release decisions.

## Task-app example

Adding `task_events` is a separate migration after the two-table task app is stable. The migration creates the event table and its task lookup index.

```bash
pnpm --filter ./packages/api db:generate --name add_task_events
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
```

## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Migrations](/docs/reference/schema/migrations/)
- [Migration and startup invariants](/docs/reference/operations/migration-and-startup-invariants/)
