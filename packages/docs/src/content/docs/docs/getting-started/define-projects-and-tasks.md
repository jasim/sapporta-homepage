---
title: "Define projects and tasks"
description:
  "Define the task app tables, migrate them, and inspect the generated API
  metadata."
---

The project tour identified schema files as the starting point for table-backed
features. This page defines the first task-app domain: projects contain tasks,
and both tables belong to the active workspace. You will separate database
constraints from generated product behavior, add semantic values and domain
validation, apply a reviewed migration, and inspect the API that the definitions
produce. The result enables the project and task forms, grids, lookups, search,
relationships, and CRUD routes used by the rest of the tutorial.

```text
Add workspace-scoped projects and tasks to my Sapporta app, including their relationship, useful generated screens, and validation for blank names and titles. Show me the migration before applying it.
```

## Define storage and product behavior together

Each schema module exports two related objects. The raw Drizzle table owns SQL
names, nullability, defaults, keys, foreign keys, and indexes. The
`sapportaTable()` wrapper owns labels, row scope, search, child collections,
column presentation, and application validation.

Keep both objects in the same module. Other schema files import the raw table
when they need a Drizzle reference. Sapporta registers the wrapped definition
and derives generated surfaces from both parts.

Create `packages/api/schema/projects.ts`:

```ts
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { sapportaTable, text, timestamp } from "@sapporta/server/table";
import { Temporal } from "@sapporta/shared/temporal";

export const projectsTable = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace_id: text("workspace_id").notNull(),
  name: text("name").notNull(),
  created_at: timestamp("created_at")
    .$defaultFn(() => Temporal.Now.instant())
    .notNull(),
  updated_at: timestamp("updated_at")
    .$defaultFn(() => Temporal.Now.instant())
    .notNull(),
});

export const projects = sapportaTable({
  drizzle: projectsTable,
  meta: {
    label: "Projects",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["name"],
    search: { self: ["name"] },
    children: [
      {
        table: "tasks",
        foreignKey: "project_id",
        label: "Tasks",
        columns: ["title", "status", "priority", "due_date"],
        defaultSort: "due_date",
      },
    ],
  },
  validate(value, context) {
    if (typeof value.name === "string" && value.name.trim().length === 0) {
      context.addIssue("name", "Project name is required");
    }
  },
});

export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;

export default projects;
```

`rowLabelColumns: ["name"]` gives every project a human-readable label. Task
forms use that label in their project lookup. The `children` entry defines the
reverse path from a project record to its tasks. The database foreign key in the
next module remains the source of relational integrity.

Create `packages/api/schema/tasks.ts`:

```ts
import { index, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import {
  date,
  sapportaTable,
  select,
  text,
  timestamp,
} from "@sapporta/server/table";
import { Temporal } from "@sapporta/shared/temporal";
import { projectsTable } from "./projects.js";

const TASK_STATUSES = ["open", "in_progress", "completed"] as const;
const TASK_PRIORITIES = ["low", "medium", "high"] as const;

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
    status: select("status", TASK_STATUSES).notNull().default("open"),
    priority: select("priority", TASK_PRIORITIES).notNull().default("medium"),
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
    search: { self: ["title", "description"] },
    columns: {
      project_id: { label: "Project" },
      description: { textDisplay: "multiLine" },
    },
  },
  validate(value, context) {
    if (typeof value.title === "string" && value.title.trim().length === 0) {
      context.addIssue("title", "Task title is required");
    }
  },
});

export type Task = typeof tasksTable.$inferSelect;
export type NewTask = typeof tasksTable.$inferInsert;

export default tasks;
```

The semantic factories define more than SQLite storage. `select()` declares the
allowed string values once and supplies the generated searchable combobox and
structural enum validation. `date()` and `timestamp()` own canonical storage
conversion. Application code uses Temporal for date and time work; it does not
introduce a second `Date`, dayjs, or date-fns conversion path.

The `validate()` callbacks add domain issues after Sapporta parses the
structural value. They receive a complete prepared insert or the fields in an
update patch. They can reject a submitted blank name or title without replacing
the generated enum, date, nullability, or field-presence rules. The save
pipeline persists the parsed structural value, so a validator is not a
normalization hook.

Both tables use `workspaceGlobal` because projects and tasks are shared among
authorized members of one workspace. Their `workspace_id` columns are required
storage, but the server derives those values from request authority. Forms,
scripts, and clients never choose workspace or owner fields.

## Generate and review the migration

Generate a named migration after both files are present:

```bash
pnpm --filter ./packages/api db:generate --name add_projects_and_tasks
```

Open the new SQL file under `packages/api/migrations/` before continuing. It
should create the `projects` and `tasks` tables, the task-to-project foreign
key, and `tasks_project_status_due_date_idx`. It should not rebuild unrelated
authentication tables or drop existing application data.

After the SQL matches that intent, apply it and compare the database with the
current schema:

```bash
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
```

Sapporta checks migration readiness when the server starts. It does not apply
migrations automatically, so the reviewed SQL remains an explicit release
artifact.

<!--
Screenshot brief
Suggested asset: getting-started-project-task-migration-review.png
Setup: Generate the add_projects_and_tasks migration and pause before running db:migrate. Open the generated SQL beside a terminal that shows the generation command.
Frame: Capture the migration filename, both CREATE TABLE statements, the task foreign key, and the composite index. Exclude unrelated migrations and shell history.
Visible proof: The named migration creates projects and tasks, preserves the project relationship, adds the intended index, and has been generated without being silently applied.
Alt text: Generated SQL for the projects and tasks tables under review before migration.
-->

## Inspect the live schema API

Start the application after the migration and discover the mounted metadata
route before calling it:

```bash
pnpm dev
pnpm exec sapporta endpoints show "GET /api/meta/tables/tasks"
pnpm exec sapporta tables show tasks
```

The CLI output confirms the registered SQL columns. The HTTP metadata response
shows the generated behavior consumed by the frontend. In an authenticated
browser session, open `/api/meta/tables/tasks`, or call the same route with an
API token appropriate for the app:

```bash
curl -H 'Authorization: Bearer <token>' \
  http://localhost:3000/api/meta/tables/tasks
```

The relevant part of the response has this shape:

```json
{
  "name": "tasks",
  "label": "Tasks",
  "rowLabelColumns": ["title"],
  "searchable": true,
  "columns": [
    { "name": "project_id", "label": "Project", "kind": "number" },
    {
      "name": "status",
      "kind": "text",
      "select": { "options": ["open", "in_progress", "completed"] }
    },
    { "name": "due_date", "kind": "date" }
  ]
}
```

The metadata response is a presentation and schema catalog. It exposes the
boolean search capability needed by the toolbar, not the server's selected
columns or relationship plan. It does not expose or replace request data
authority. The `workspaceGlobal` boundary stays in the server-side table
definition and applies to generated row operations.

<!--
Screenshot brief
Suggested asset: getting-started-task-schema-api.png
Setup: Run the migrated app, execute `pnpm exec sapporta endpoints show "GET /api/meta/tables/tasks"`, and load the metadata route with valid authentication.
Frame: Capture the discovered GET route and the formatted response in a terminal or browser JSON viewer. Keep the task label, searchable capability, project label, status options, and due_date kind visible.
Visible proof: The running API exposes metadata derived from the schema, including the task search capability, project relationship field, controlled status values, and date semantics.
Alt text: Live task table metadata returned by the discovered Sapporta API route.
-->

The task app now has a reviewable storage contract and one generated product
contract. The foreign key, semantic values, row boundary, and validation all
feed the generated API and UI. Continue to
[Work with tasks in generated screens](/docs/getting-started/work-with-tasks-in-generated-screens/)
to create the first records. The
[tables and schema metadata guide](/docs/guides/model-data/tables-columns-and-schema-metadata/),
[table search guide](/docs/guides/model-data/search-indexes-and-display-metadata/),
[table definitions reference](/docs/reference/schema/table-definitions/),
[table validation reference](/docs/reference/schema/table-validation/), and
[semantic value boundaries reference](/docs/reference/schema/semantic-value-boundaries/)
cover the same boundaries in more depth.
