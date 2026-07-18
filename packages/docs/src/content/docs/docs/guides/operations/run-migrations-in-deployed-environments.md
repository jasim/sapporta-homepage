---
title: "Run migrations in deployed environments"
description:
  "Apply committed migration SQL before a new application process serves
  traffic."
---

Sapporta treats schema authoring and migration application as separate release
stages. Development generates and reviews SQL. Deployment applies those
committed artifacts to durable storage before compatible application code serves
requests.

This guide explains the ordering, backup boundary, readiness check, and recovery
decision. You can use it for a one-process release, a container startup job, or
a deployment with several application replicas.

```text
Plan the release for this Sapporta schema change. Confirm the migration SQL is
committed, name the durable database and backup checkpoint, apply migrations
once before app startup, and stop the release if readiness fails.
```

## Prepare the artifact in development

After changing a schema file, generate a named migration and read the SQL. A
rename prompt or destructive statement is a data decision, not a build detail.

```bash
pnpm --filter ./packages/api db:generate --name add_task_events
# Review packages/api/migrations/*.sql and commit it with the schema change.
pnpm --filter ./packages/api db:check
```

Do not generate fresh SQL during deployment. The deployed artifact must be the
same artifact reviewed with the application change.

## Order the release around the database

For the task-events release, use this sequence:

1. Stop new application replicas from receiving traffic.
2. Create and identify a restorable backup of the durable SQLite database.
3. Run one migration job against that database.
4. Run the schema readiness check.
5. Start the new application code and run smoke tests.

```bash
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
pnpm start
```

The generated container follows the same ordering: its entrypoint runs the API
package's local Drizzle migration command and starts `dist/boot.js` only after
migration succeeds. With several replicas, keep migration execution in one
release job rather than every request handler or concurrently starting replica.

<!--
Screenshot brief
Suggested asset: /assets/guides/operations/deployed-migration.png
Setup: Use a staging copy of the tutorial database before and after applying the committed add_task_events migration.
Frame: Capture the release log showing the backup identifier, successful migration, db:check result, and server-ready line in chronological order.
Visible proof: One migration job completes before the new API process announces readiness.
Alt text: Sapporta deployment log showing backup, migration, schema check, and application startup in release order.
-->

If migration or readiness fails, do not start the new code. Restore or roll
forward according to the reviewed SQL and backup plan. Restarting the same
release does not make a destructive migration reversible, and rolling back
JavaScript alone does not restore removed columns or transformed data.

The task app can now introduce `task_events` without serving code against the
old schema. The key value is an explicit checkpoint between durable data and
application startup. Continue with
[schema changes](/docs/guides/model-data/schema-changes-and-migrations/) for
development authoring or
[production deployment](/docs/guides/operations/production-builds-and-deployment/)
for the surrounding release.

## Related reference

- [Migrations](/docs/reference/schema/migrations/)
- [Migration and startup invariants](/docs/reference/operations/migration-and-startup-invariants/)
