---
title: "Record task completion history"
description: "Add an immutable task-events child table and expose it through generated task history."
---

The task-events table records durable completion facts. Its generated child surface is useful before any custom endpoint or dashboard exists.

> Checkpoint: C07 → C08

## Agent approach

```text
Read the local project instructions and use the Sapporta skill. Starting at C07, implement this outcome: The task-events table records durable completion facts. Its generated child surface is useful before any custom endpoint or dashboard exists. Reach C08, run the validation described on this page, and report changed files and checks. Preserve server-controlled scope fields and use generated APIs for ordinary CRUD.
```

## Review the agent's work

- The table contains only `task_id`, `event_type`, `occurred_at`, IDs, and the server-owned workspace column.
- `immutable: true` prevents generated update and delete operations.
- The task definition declares Task history as an explicit child relationship.

## Code approach

Create `packages/api/schema/task-events.ts`:

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
    rowLabelColumns: ["event_type"],
    immutable: true,
  },
});

export default taskEvents;
```

Add this child entry to `tasks.meta.children`:

```ts
{
  table: "task_events",
  foreignKey: "task_id",
  label: "Task history",
  columns: ["event_type", "occurred_at"],
  defaultSort: "-occurred_at",
}
```

```bash
pnpm --filter ./packages/api db:generate --name add_task_events
# Review the generated SQL and index
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
```

## Observe and verify

The task detail screen shows an empty Task history child surface and the table metadata marks events immutable.

## What you built

The third and final domain table exists. The next page makes task status and completion history one atomic operation.

Continue with [the related guide](/docs/guides/model-data/relationships-and-lookup-behavior/) or use [the exact reference](/docs/reference/schema/table-and-column-metadata/).
