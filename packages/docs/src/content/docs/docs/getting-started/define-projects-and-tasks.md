---
title: "Define projects and tasks"
description: "Define the task app tables, generate and review SQL, apply the migration, and inspect the resulting metadata."
---

The task app starts with two workspace-scoped tables. Drizzle columns define storage and constraints. Sapporta metadata defines labels, search, selects, generated surfaces, and the row boundary.

> Checkpoint: C02 → C03

## Agent approach

```text
Read the local project instructions and use the Sapporta skill. Starting at C02, implement this outcome: The task app starts with two workspace-scoped tables. Drizzle columns define storage and constraints. Sapporta metadata defines labels, search, selects, generated surfaces, and the row boundary. Reach C03, run the validation described on this page, and report changed files and checks. Preserve server-controlled scope fields and use generated APIs for ordinary CRUD.
```

## Review the agent's work

- Both tables contain a server-controlled `workspace_id` column because their row scope is `workspaceGlobal`.
- `tasks.project_id` references the raw `projectsTable` definition.
- The generated migration creates only `projects` and `tasks` domain tables.

## Code approach

Create `packages/api/schema/projects.ts`:

```ts
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { sapportaTable, text, timestamp } from "@sapporta/server/table";
import { Temporal } from "@sapporta/shared/temporal";

export const projectsTable = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace_id: text("workspace_id").notNull(),
  name: text("name").notNull(),
  created_at: timestamp("created_at").$defaultFn(() => Temporal.Now.instant()).notNull(),
  updated_at: timestamp("updated_at").$defaultFn(() => Temporal.Now.instant()).notNull(),
});

export const projects = sapportaTable({
  drizzle: projectsTable,
  meta: {
    label: "Projects",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["name"],
    search: { columns: ["name"] },
    children: [{ table: "tasks", foreignKey: "project_id", label: "Tasks", defaultSort: "due_date" }],
  },
});

export default projects;
```

Create `packages/api/schema/tasks.ts`:

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

export default tasks;
```

```bash
pnpm --filter ./packages/api db:generate --name add_projects_and_tasks
# Review packages/api/migrations/*.sql
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
```

## Observe and verify

Restart the app and run `pnpm exec sapporta tables list`. The result contains `projects` and `tasks`, with the project relationship visible in table metadata.

## What you built

Schema and metadata now produce the task app storage contract. The next page uses the record surfaces created from that contract.

Continue with [the related guide](/docs/guides/model-data/tables-columns-and-schema-metadata/) or use [the exact reference](/docs/reference/schema/table-definitions/).
