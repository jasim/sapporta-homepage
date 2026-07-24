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

The release gives one process ownership of the exact durable SQLite file during
migration. Other writers remain stopped until the new application is ready.

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

1. Quiesce every process that can write the database.
2. Create and identify a restorable backup of the durable SQLite database.
3. Run one migration job against that database.
4. Start the new application code; its startup guard checks migration
   readiness.
5. Run smoke tests and resume traffic.

```bash
pnpm --filter ./packages/api db:migrate
pnpm start
```

The generated container follows the same ordering: its entrypoint runs the API
package's local Drizzle migration command and starts `dist/boot.js` only after
migration succeeds.


If migration or readiness fails, do not start the new code. Restore or roll
forward according to the reviewed SQL and backup plan. Restarting the same
release does not make a destructive migration reversible, and rolling back
JavaScript alone does not restore removed columns or transformed data.

`db:check` may still be used during development to check Drizzle migration
history. It is not the live database readiness check. The startup guard is the
authority for pending, missing, or modified migration artifacts.

## Related reference

- [Migrations](/docs/reference/schema/migrations/)
- [Migration and startup invariants](/docs/reference/operations/migration-and-startup-invariants/)
