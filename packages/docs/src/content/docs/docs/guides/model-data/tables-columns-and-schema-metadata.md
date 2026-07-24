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
    status: select("status", ["open", "in_progress", "completed"] as const)
      .notNull()
      .default("open"),
    priority: select("priority", ["low", "medium", "high"] as const)
      .notNull()
      .default("medium"),
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
value. Generated clients and forms must not submit it. A `workspaceUserScoped`
table also needs `scoped_to_user_id`; a `systemGlobal` table needs neither
workspace column.

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
available, and the select options derived from status and priority. The
server-side row scope and full search plan are not serialized to the browser.

Change metadata when presentation or generated behavior changes. Change the
Drizzle table when stored structure or constraints change, then generate a
reviewed migration.

## Related reference

- [Table definitions](/docs/reference/schema/table-definitions/)
- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
- [Search table rows and relationships](/docs/guides/model-data/search-indexes-and-display-metadata/)
- [Table validation](/docs/reference/schema/table-validation/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
