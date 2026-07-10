---
title: "Run migrations in deployed environments"
description: "Apply committed migration SQL before a new application process serves traffic."
---

Apply committed migration SQL before a new application process serves traffic.

Migration generation belongs in development. Deployment applies reviewed artifacts against backed-up durable storage and starts the compatible application after success.

For the programmer, the release process serializes migration execution and records an explicit recovery checkpoint.
For the application user, users never reach a server whose code and database schema disagree.

## System boundary

- Commit generated SQL with the schema change.
- Back up the durable database before a risky migration.
- Run one migration job, then start application replicas.
- Use startup readiness errors as a stop signal, not an invitation to auto-migrate in request handling.

## Task-app example

The release that introduces `task_events` applies its migration before starting code that inserts completion events.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Migrations](/docs/reference/schema/migrations/)
- [Migration and startup invariants](/docs/reference/operations/migration-and-startup-invariants/)
