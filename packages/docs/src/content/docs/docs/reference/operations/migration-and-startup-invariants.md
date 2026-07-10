---
title: "Migration and startup invariants"
description: "Look up the required ordering between schema generation, migration apply, and server startup."
---

## Identity

Drizzle migration artifacts, `assertMigrationsReady`, generated boot, and container command.

## Contract

- Migration SQL is generated and reviewed before deployment.
- One deployment job applies pending migrations before new application replicas serve traffic.
- Server startup validates readiness and never migrates from request handling.
- A failed migration or readiness mismatch is a startup/release failure.
- Database backup and application rollback do not automatically reverse destructive SQL.


## Related documentation

- [Run migrations in deployed environments](/docs/guides/operations/run-migrations-in-deployed-environments/)
