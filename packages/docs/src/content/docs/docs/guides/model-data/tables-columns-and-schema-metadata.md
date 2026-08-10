---
title: "Tables, columns, and schema metadata"
description:
  "Define stored rows and the product behavior Sapporta derives from them."
---

A Sapporta table has two sources of meaning. The Drizzle definition says what a
row can be in SQLite. Sapporta metadata says how that row behaves in generated
APIs, forms, grids, and row-security checks.

## One definition, two responsibilities

The Drizzle table defines SQL names, nullability, defaults, keys, references,
and indexes. `sapportaTable()` adds labels, row scope, search fields, column
presentation, children, API write policy, and application validation. The
resulting `TableDef` is the input to generated HTTP and frontend surfaces.

Keep both exports in the same schema module. Other schema files import the raw
table when they need a foreign key. Sapporta registers the wrapped table.

The two modules below are a complete parent/child starter. They define shared
workspace projects first, then tasks that reference them. Nothing in the example
depends on seeded rows or assumed IDs.

```ts
// packages/api/schema/projects.ts
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
});

export const projects = sapportaTable({
  drizzle: projectsTable,
  meta: {
    label: "Projects",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["name"],
    search: { self: ["name"] },
    columns: {
      created_at: { apiWritable: false },
    },
    children: [
      {
        table: "tasks",
        foreignKey: "project_id",
        label: "Tasks",
        columns: ["title", "status", "due_date"],
        defaultSort: "due_date",
      },
    ],
  },
  validate(value, context) {
    if (typeof value.name === "string" && value.name.trim() === "") {
      context.addIssue("name", "Project name is required");
    }
  },
});

export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;

export default projects;
```

```ts
// packages/api/schema/tasks.ts
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
    due_date: date("due_date"),
    created_at: timestamp("created_at")
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
      created_at: { apiWritable: false },
    },
  },
  validate(value, context) {
    if (typeof value.title === "string" && value.title.trim() === "") {
      context.addIssue("title", "Task title is required");
    }
  },
});

export type Task = typeof tasksTable.$inferSelect;
export type NewTask = typeof tasksTable.$inferInsert;

export default tasks;
```

Semantic column factories attach wire and value semantics to the Drizzle column.
The tuple passed to `select()` drives TypeScript inference, structural
validation, OpenAPI, choice controls, and enum filters. Raw primary and foreign
keys still receive a semantic `kind` when Sapporta extracts browser metadata.
Derive row types with `$inferSelect` and `$inferInsert`; a handwritten row
interface can drift from the table.

`workspace_id` is required by `workspaceGlobal`, but it is a server-managed
value. Generated clients and forms must not submit it. The default
`workspaceUserScoped` scope also requires `scoped_to_user_id`; `systemGlobal`
needs neither scope column. The
[row-visibility guide](/docs/guides/security/workspaces-ownership-and-row-visibility/)
owns the authority and access implications of those choices.

`rowLabelColumns` must be non-empty, and every entry must be a real SQL column
on that table. Choose values a person recognizes, such as `name` or `title`.
Keep an opaque key for identity rather than using it as the display label. For a
join table, `rowLabelColumns` still reads values stored on the join row; it does
not resolve labels from referenced rows. Add a real contextual domain column
when the join record needs a useful standalone label.

## Values and domain validation

Generated forms, table routes, Drizzle columns, and Grid editors derive their
value rules from the same `TableDef`. Select-backed text remains a string.
Numbers and booleans remain JSON primitives. Dates and timestamps use canonical
strings at generated write boundaries. Direct Drizzle application code uses
Temporal values, and database reads return Temporal values.

Semantic kinds provide structural constraints. Add the top-level `validate()`
callback when generated CRUD needs a cross-field or domain rule. The callback
receives the already-parsed prepared insert or submitted patch and adds issues;
it cannot replace structural validation or transform the value written to
Drizzle. Public payloads, validation fields, metadata, and row objects use SQL
column names even when the Drizzle property name differs.

Start the app, then inspect the registered definition:

```bash
pnpm dev
pnpm exec sapporta api get /api/meta/tables/tasks
```

The metadata response identifies `tasks`, its row label, whether search is
available, and the select options derived from status. The server-side row scope
and full search plan are not serialized to the browser.

Change metadata when presentation or generated behavior changes. Change the
Drizzle table when stored structure or constraints change, then generate a
reviewed migration.

## Related reference

- [Table definitions](/docs/reference/schema/table-definitions/)
- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
- [Relationships and lookup behavior](/docs/guides/model-data/relationships-and-lookup-behavior/)
- [Configure table search](/docs/guides/model-data/configure-table-search/)
- [Table validation](/docs/reference/schema/table-validation/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
