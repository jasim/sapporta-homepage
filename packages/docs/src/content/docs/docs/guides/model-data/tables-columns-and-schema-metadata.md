---
title: "Tables, columns, and schema metadata"
description:
  "Define stored rows and the product behavior Sapporta derives from them."
---

This page explains the two parts of a Sapporta table: the Drizzle table that
owns storage and constraints, and the metadata that shapes generated APIs,
forms, and grids. You will define a task table, choose semantic column types,
and learn where validation and value conversion belong. The same pattern works
for inventories, case trackers, approval queues, and other record-based
applications.

```text
Use the Sapporta skill to add a workspace-scoped tasks table. Give it useful labels, search, status and priority selects, and generated CRUD. Show me the migration before applying it.
```

## One definition, two responsibilities

The raw Drizzle table is the database contract. It defines SQL names,
nullability, defaults, keys, references, and indexes. `sapportaTable()` adds the
product contract: labels, row scope, search fields, controlled values, column
presentation, children, and generated validation.

Keep both exports in the same schema module. Other schema files import the raw
table when they need a foreign key. Sapporta registers the wrapped table.

```ts
import { index, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { date, sapportaTable, text, timestamp } from "@sapporta/server/table";
import { Temporal } from "@sapporta/shared/temporal";
import { projectsTable } from "./projects.js";

export const tasksTable = sqliteTable(
  "tasks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    workspace_id: text("workspace_id").notNull(),
    project_id: integer("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").notNull().default("open"),
    priority: text("priority").notNull().default("medium"),
    due_date: date("due_date"),
    created_at: timestamp("created_at")
      .$defaultFn(() => Temporal.Now.instant())
      .notNull(),
    updated_at: timestamp("updated_at")
      .$defaultFn(() => Temporal.Now.instant())
      .notNull(),
  },
  (table) => [
    index("tasks_project_status_due_date_idx").on(
      table.project_id,
      table.status,
      table.due_date,
    ),
  ],
);

export const tasks = sapportaTable({
  drizzle: tasksTable,
  meta: {
    label: "Tasks",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["title"],
    search: { columns: ["title", "description"] },
    selects: [
      {
        type: "select",
        column: "status",
        options: ["open", "in_progress", "completed"],
      },
      {
        type: "select",
        column: "priority",
        options: ["low", "medium", "high"],
      },
    ],
    columns: {
      project_id: { label: "Project" },
      description: { textDisplay: "multiLine" },
    },
  },
});

export type Task = typeof tasksTable.$inferSelect;
export type NewTask = typeof tasksTable.$inferInsert;

export default tasks;
```

Sapporta semantic factories such as `text`, `date`, and `timestamp` attach the
standard editors, parsers, and validation behavior. Primary and foreign keys
remain raw Drizzle integers in this example. Derive TypeScript row types with
`$inferSelect` and `$inferInsert`; a separate handwritten interface can drift
from the database schema.

`workspace_id` is required by `workspaceGlobal`, but it is a server-managed
value. Generated clients and forms must not submit it. A `workspaceUserScoped`
table also needs `scoped_to_user_id`; a `systemGlobal` table needs neither
workspace column.

## Values and domain validation

Generated forms, table routes, Drizzle columns, and Grid editors use the same
semantic value boundary. Select-backed text remains a string. Numbers and
booleans remain JSON primitives. Dates and timestamps use canonical strings on
the wire, and application domain code parses them into Temporal values where it
needs date arithmetic.

Semantic kinds provide the standard generated constraints. Add `meta.validation`
when generated CRUD needs a domain rule beyond the column kind. Define the full
create shape and the partial update shape described by the validation reference.
Conversion and normalization belong in the save path unless that path explicitly
consumes the validator's transformed value.

Start the app, then inspect the registered definition:

```bash
pnpm dev
pnpm exec sapporta tables show tasks
```

The output should identify `tasks`, `workspaceGlobal`, the `title` row label,
both search columns, and the select metadata.

<!--
Screenshot brief
Suggested asset: tables-columns-task-metadata-terminal.png
Setup: Run the task app with the projects and tasks schemas migrated, then run `pnpm exec sapporta tables show tasks` in a wide terminal.
Frame: Capture the command and the complete task table summary; crop unrelated shell history.
Visible proof: The table name, workspaceGlobal row scope, title row label, title/description search fields, and status/priority select metadata are readable.
Alt text: Terminal output describing the registered tasks table and its generated metadata.
-->

The task definition now owns storage, generated behavior, and shared value
semantics in one reviewable module. Metadata changes can alter the generated
experience without duplicating the database model. From here, add relationships
and child collections, tune search and indexes, then generate a reviewed
migration for every storage change.

## Related reference

- [Table definitions](/docs/reference/schema/table-definitions/)
- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
- [Table validation](/docs/reference/schema/table-validation/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
