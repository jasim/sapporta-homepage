---
title: "Record task completion history"
description:
  "Add an immutable task-events child table and expose it through generated task
  history."
---

The access policy is in place, but a completed status still records only the
task's current state. This page adds an immutable `task_events` table and a
generated Task history child collection. The table provides durable completion
facts for audit views, dashboards, reports, and the atomic owner-only workflow
on the next page.

```text
Add immutable completion history to tasks, expose it on each task record, and keep history writes reserved for server-owned workflow code.
```

## Model an event as a separate fact

A task row answers what the current status is. An event row answers what
happened and when. Keeping those concerns in separate tables lets a later
transaction change `tasks.status` and append one history fact without making the
mutable task row carry an audit trail.

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

`workspaceGlobal` gives event reads the same workspace boundary as tasks. The
client never submits `workspace_id`; the workflow will derive it from request
authority. `Temporal.Now.instant()` supplies the timestamp default and the HTTP
wire value is a canonical instant string. `immutable: true` allows insert and
read operations but rejects generated update and delete operations. It does not
by itself decide who may insert, so the ability policy should expose history as
read-only to ordinary users:

```ts
if (ctx.principal.kind === "user") {
  can(["read", "export"], "task_events");
}
```

The completion endpoint will append events with a row-security guard inside its
transaction. Granting generated `create` on `task_events` would let a client
author history without completing a task, so this app deliberately omits that
grant.

Add the reverse relationship to `tasks.meta.children` in
`packages/api/schema/tasks.ts`:

```ts
children: [
  {
    table: "task_events",
    foreignKey: "task_id",
    label: "Task history",
    columns: ["event_type", "occurred_at"],
    defaultSort: "-occurred_at",
  },
],
```

The Drizzle foreign key enforces the stored relationship. The child metadata
controls the generated task-detail surface and its default newest-first order.
It does not widen access; the child query still applies `task_events` row
visibility.

## Generate, review, and apply the migration

Generate a named migration and open the resulting SQL before it touches the
database:

```bash
pnpm --filter ./packages/api db:generate --name add_task_events
# Review the new file under packages/api/migrations/
```

The generated migration should create only `task_events`, its task foreign key,
and `task_events_task_occurred_at_idx`. The exact Drizzle Kit formatting is
authoritative, but its intent should match this excerpt:

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

After review, apply the change and confirm that schema code and database state
agree:

```bash
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
pnpm exec sapporta tables show task_events
```

Sapporta checks migration readiness at startup and does not apply migrations
automatically. A deployed app must run the reviewed migration before starting
code that expects `task_events`.

<!--
Screenshot brief
Suggested asset: add-task-events-migration-review.png
Setup: Generate the add_task_events migration and pause before running db:migrate. Open the new SQL file beside the terminal command output.
Frame: Capture the migration filename, CREATE TABLE statement, task foreign key, and CREATE INDEX statement. Exclude unrelated migrations.
Visible proof: The named migration creates only task_events and its task/occurred-at index, and it has not been silently applied.
Alt text: Generated add_task_events SQL under review before migration.
-->

## Read history through the generated API

Restart the app and discover the child table routes before calling them:

```bash
pnpm exec sapporta endpoints show "GET /api/tables/task_events"
pnpm exec sapporta endpoints show "PUT /api/tables/task_events/{id}"
pnpm exec sapporta rows list task_events --where '{"task_id":{"eq":1}}' --output json
```

Before the completion workflow exists, the canonical tasks have no events. The
generated child query used by the task detail screen therefore returns an empty
collection:

```http
GET /api/tables/task_events?filter[task_id][eq]=1&sort=-occurred_at
Authorization: Bearer <token>
```

```json
{
  "data": [],
  "meta": { "total": 0, "page": 1, "limit": 50, "pages": 0 }
}
```

After the next page completes task `1`, the same request will return a durable
fact such as:

```json
{
  "data": [
    {
      "id": 1,
      "task_id": 1,
      "event_type": "completed",
      "occurred_at": "2026-07-10T10:15:30Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 50, "pages": 1 }
}
```

A generated `PUT /api/tables/task_events/1` request is not a supported way to
correct that fact. With update permission it reaches immutable-table policy and
returns `403` with
`{"error":"Records in this table are immutable","code":"FORBIDDEN"}`; with this
app's read-only event ability it is rejected at the earlier ability boundary.
Corrections should be represented as another deliberate domain event when the
product requires them.

<!--
Screenshot brief
Suggested asset: task-history-empty-generated-surface.png
Setup: Apply the migration, restart the app, and open the Audit launch checklist task before implementing the completion endpoint.
Frame: Capture the task heading and the empty Task history child collection. Include the browser Network request for the filtered task_events list if it fits without obscuring the screen.
Visible proof: The Task history relationship exists, is empty before any completion action, and reads through GET /api/tables/task_events with a task_id filter.
Alt text: Task detail screen with an empty generated Task history collection after the task-events migration.
-->

The task app now has an append-only place for completion facts, a reviewed
migration, and a generated read surface scoped to the active workspace. The
important constraint is that immutability blocks changes to existing events; the
ability policy still reserves event creation for trusted workflow code. Next,
[add the complete-task endpoint](/docs/getting-started/add-a-complete-task-endpoint/)
so the task update and history insert occur in one synchronous SQLite
transaction. See
[relationships and lookup behavior](/docs/guides/model-data/relationships-and-lookup-behavior/),
[schema changes and migrations](/docs/guides/model-data/schema-changes-and-migrations/),
and the
[table metadata reference](/docs/reference/schema/table-and-column-metadata/)
for the underlying contracts.
