---
title: "Relationships and lookup behavior"
description:
  "Connect tables and make identifiers usable as labels and parent-child
  navigation."
---

This page connects foreign-key integrity to the generated lookup and
parent-child experience. You will make a task choose a project by name, then
expose related tasks on the project record. These concepts support order lines,
case comments, invoice payments, and any workflow that moves between related
records.

```text
Connect tasks to projects in my Sapporta app. Show project names in task lookups and add a Tasks collection to each project record.
```

## Define the forward relationship

The database relationship starts with a Drizzle foreign key. Import the target's
raw table and reference its primary key:

```ts
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { projectsTable } from "./projects.js";

export const tasksTable = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  project_id: integer("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  // Other task columns...
});
```

The reference gives the database and generated API a real source-to-target
relationship. Generated create and edit forms can now present a lookup for
`project_id`. The lookup still needs a human label, because the stored
identifier is useful to the database and rarely useful to the person completing
the form.

```ts
export const projects = sapportaTable({
  drizzle: projectsTable,
  meta: {
    label: "Projects",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["name"],
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
});
```

`rowLabelColumns: ["name"]` makes lookup results display the project name while
preserving the numeric project ID as the value. Keep that ID type through
pickers, caches, filters, and API calls. The lookup route returns entries, not
an ID-to-label map:

```json
{
  "entries": [{ "value": 1, "label": "Website Relaunch" }]
}
```

`children` describes the reverse path. The project detail route filters `tasks`
by `project_id`, shows the chosen columns, and applies the stable due-date sort.
Declare only child collections that help a user inspect or create related
records. Join tables can appear under both parents when both directions matter;
self-references usually need a deliberately designed hierarchy rather than a
recursive default child list.

## Exercise both directions

Run the app and create a project named **Website Relaunch** at
`/tables/projects`. Create a task at `/tables/tasks/new` and choose that project
from the lookup. Then open the project record and find the task under **Tasks**.

<!--
Screenshot brief
Suggested asset: relationships-project-task-round-trip.png
Setup: Create a Website Relaunch project and one task named Publish launch checklist linked to it. Open the project detail route after saving both records.
Frame: Capture the project heading and the Tasks child section, including the task title, status, and due date. If space permits, include the project lookup open in an inset capture.
Visible proof: The UI uses Website Relaunch instead of a numeric project ID, and the related task appears on the project record.
Alt text: Project detail screen showing a task child row and a project-name lookup rather than a numeric identifier.
-->

The foreign key now enforces the stored relationship, while row labels and child
metadata make it navigable in both directions. Lookup options and child rows are
still evaluated inside the active row-security boundary, so metadata never
widens access. Next, tune search and indexes for the paths users actually take
through these related records.

## Related reference

- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
- [Generated record surfaces](/docs/reference/frontend/generated-record-surfaces/)
