---
title: "Schema changes and migrations"
description:
  "Generate, review, apply, and preserve migration history for a schema change."
---

A schema edit is intent. A migration is the reviewed procedure that carries that
intent into an existing database. Sapporta keeps those two artifacts separate.

## Make the schema change first

Schema files are the source of truth. Start by deciding what the new table
means. A task row answers “what is its status now?” An event row answers “what
happened, and when?” Store events when that history is itself a domain fact, not
merely because a screen needs another copy of current state. A correction is
normally another deliberate event when the domain needs to preserve what
happened before.

For example, a completion-history feature adds
`packages/api/schema/task-events.ts` with a task foreign key and an index
ordered for its newest-first read path:

```ts
import { index, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { sapportaTable, text, timestamp } from "@sapporta/server/table";
import { Temporal } from "@sapporta/shared/temporal";
import { tasksTable } from "./tasks.js";

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
    rowLabelColumns: ["event_type", "occurred_at"],
    immutable: true,
  },
});

export default taskEvents;
```

`immutable: true` blocks generated update and delete operations on enforcing
paths. It does not grant create permission, choose who may read the row, or
constrain trusted raw database access. Keep ordinary clients from authoring
history by reserving event creation for an app-owned workflow. The
[security guide](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
owns those enforcement details.

Exporting the wrapped table registers its metadata; exporting only the raw
Drizzle table would create storage with no Sapporta surface.

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
  `occurred_at` text NOT NULL,
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE cascade
);

CREATE INDEX `task_events_task_occurred_at_idx`
ON `task_events` (`task_id`, `occurred_at`);
```

The generated file is authoritative; the excerpt shows the expected intent, not
byte-for-byte Drizzle Kit formatting. Rename prompts, table rebuilds, dropped
columns, and destructive statements are release decisions. Resolve them before
the SQL touches any database.

## Apply, check, and start

After reviewing the SQL and generated snapshot, apply the migration:

```bash
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
```

`db:check` runs Drizzle Kit's snapshot-chain check. It validates migration
snapshot versions, shape, and parent relationships; it does not inspect live
tables or prove that a migration was applied.

Start the app after applying the change:

```bash
pnpm dev
```

Loading the application exercises a separate Sapporta readiness guard. Startup
rejects pending migrations, applied files missing from disk, and applied files
whose contents changed. It never applies migrations automatically. Production
releases therefore run the committed migration before new code serves traffic.

Commit the schema edit, generated SQL, journal, and snapshot together. The
schema records the target state; the migration records how deployed data reaches
it. Never edit an applied migration; add another migration.

## Related reference

- [Migrations](/docs/reference/schema/migrations/)
- [Migration and startup invariants](/docs/reference/operations/migration-and-startup-invariants/)
- [Generated table APIs](/docs/guides/generated-surfaces/generated-table-apis/)
