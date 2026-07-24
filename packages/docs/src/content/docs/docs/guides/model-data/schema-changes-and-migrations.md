---
title: "Schema changes and migrations"
description:
  "Generate, review, apply, and preserve migration history for a schema change."
---

A schema edit is intent. A migration is the reviewed procedure that carries
that intent into an existing database. Sapporta keeps those two artifacts
separate.

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

export const taskEvents = sapportaTable({
  drizzle: taskEventsTable,
  meta: {
    label: "Task events",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["event_type"],
    immutable: true,
  },
});

export default taskEvents;
```

`immutable: true` keeps generated CRUD append-only: callers may create events
but cannot update or delete them. Exporting the wrapped table registers its
metadata; exporting only the raw Drizzle table would create storage with no
Sapporta surface.

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

After review, check the migration history and apply the migration:

```bash
pnpm --filter ./packages/api db:check
pnpm --filter ./packages/api db:migrate
```

`db:check` runs Drizzle Kit's migration-history check. It does not compare the
live database with the TypeScript schema. At startup, Sapporta separately
rejects pending migrations, applied files missing from disk, and applied files
whose contents changed. Never edit an applied migration; add a new migration.

Sapporta does not apply migrations automatically during ordinary startup.
Production releases run the committed migration before code that expects the
new shape.


Commit the schema edit and generated SQL together. The schema records the target
state; the migration records how deployed data reaches it.

## Related reference

- [Migrations](/docs/reference/schema/migrations/)
- [Migration and startup invariants](/docs/reference/operations/migration-and-startup-invariants/)
