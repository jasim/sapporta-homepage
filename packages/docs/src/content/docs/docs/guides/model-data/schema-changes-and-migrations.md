---
title: "Schema changes and migrations"
description:
  "Change schema code and carry the reviewed change into a running database."
---

This page follows a schema edit from TypeScript into a running database. You
will generate a named SQL migration, review it, apply it, and confirm that
schema code and database state agree. This loop supports additive columns and
tables, index changes, backfills, renames, and deliberately reviewed destructive
changes.

```text
Add immutable task completion events to my Sapporta app. Generate a named migration, stop so I can review the SQL, then apply it and run the schema check.
```

## Make the schema change first

Schema files are the source of truth. For example, a completion history feature
adds `packages/api/schema/task-events.ts` with a task foreign key and an index
ordered for the child history view:

```ts
export const taskEventsTable = sqliteTable(
  "task_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    workspace_id: text("workspace_id").notNull(),
    task_id: integer("task_id")
      .notNull()
      .references(() => tasksTable.id, { onDelete: "cascade" }),
    event_type: text("event_type").notNull(),
    occurred_at: timestamp("occurred_at")
      .$defaultFn(() => Temporal.Now.instant())
      .notNull(),
  },
  (table) => [
    index("task_events_task_occurred_at_idx").on(
      table.task_id,
      table.occurred_at,
    ),
  ],
);
```

Generate a migration with a name that describes the release change:

```bash
pnpm --filter ./packages/api db:generate --name add_task_events
```

Open the new file under `packages/api/migrations/` before continuing. For this
change, the SQL should create `task_events`, its task foreign key, and
`task_events_task_occurred_at_idx`. It should not drop or recreate `projects` or
`tasks`.

```sql
CREATE TABLE `task_events` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `workspace_id` text NOT NULL,
  `task_id` integer NOT NULL,
  `event_type` text NOT NULL,
  `occurred_at` integer NOT NULL,
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE cascade
);

CREATE INDEX `task_events_task_occurred_at_idx`
ON `task_events` (`task_id`, `occurred_at`);
```

The generated file is authoritative; the excerpt shows the expected intent, not
byte-for-byte Drizzle Kit formatting. Rename prompts, table rebuilds, dropped
columns, and destructive statements are release decisions. Resolve them before
the SQL touches any database.

## Apply and check

After review, apply the migration once and compare the database with the current
schema:

```bash
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
```

Sapporta checks migration readiness at startup and does not apply migrations
automatically. Production releases must run the migration step before starting
application code that expects the new shape.

<!--
Screenshot brief
Suggested asset: add-task-events-migration-review.png
Setup: Generate the add_task_events migration but pause before db:migrate. Open the generated SQL beside a terminal showing the generation command.
Frame: Capture the migration filename, CREATE TABLE statement, foreign key, and CREATE INDEX statement. Exclude unrelated migrations.
Visible proof: The named migration adds only task_events and its index, and the terminal shows that it has been generated but not silently applied.
Alt text: Generated add_task_events SQL under review before the migration is applied.
-->

The application schema and database now move through an explicit, reviewable
artifact. Committing schema code and generated SQL together preserves the reason
and mechanism for the change. Next, inspect the generated table APIs and record
surfaces produced by the migrated definition.

## Related reference

- [Migrations](/docs/reference/schema/migrations/)
- [Migration and startup invariants](/docs/reference/operations/migration-and-startup-invariants/)
