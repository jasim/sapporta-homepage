---
title: "Relationships and lookup behavior"
description:
  "Connect tables and make identifiers usable as labels and parent-child
  navigation."
---

A relationship has three distinct meanings: the foreign key preserves stored
integrity, `rowLabelColumns` names the referenced row, and `children` exposes
the reverse path on a parent record.

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

The foreign key lets generated forms treat `project_id` as a lookup. The target
table still needs a human label:

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
    search: {
      children: {
        tasks: "allColumns",
      },
    },
  },
});
```

`rowLabelColumns: ["name"]` makes lookup results display the project name while
preserving the numeric project ID as the value. Keep that ID type through
pickers, caches, filters, and API calls. The lookup route returns entries, not
an ID-to-label map:

```json
{
  "entries": [{ "value": 1, "label": "Website Relaunch", "meta": {} }]
}
```

`children` describes the reverse path. Expanding a project row filters `tasks`
by `project_id`, shows the chosen columns, and applies the stable due-date sort.
Declare child collections only when the reverse path is part of the record
workflow. A join table may appear under both parents. A self-reference usually
needs a purpose-built hierarchy.

The `search.children.tasks` entry lets a visible task make its project appear in
the parent result. Search configuration is separate from the child grid's
display columns, and it can continue through further declared children when the
domain needs it. Child matching uses the Tasks read ability and row scope; it
cannot make an inaccessible task reveal its project.

Expanding the matching project runs the child grid's own query and shows all
visible tasks. The parent term is not inherited as a hidden child filter. Use an
explicit task-table link or an app-owned result when the workflow needs to show
only the matching children.

## Exercise both directions

Run the app and create a project named **Website Relaunch** at
`/tables/projects/new`. Create a task at `/tables/tasks/new` and choose that
project from the lookup. Return to `/tables/projects` and expand the project row
to find the task under **Tasks**.

Lookup options, child rows, and child-assisted search all use the active read
ability and row scope. Relationship metadata never widens access.

## Related reference

- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
- [Search table rows and relationships](/docs/guides/model-data/search-indexes-and-display-metadata/)
- [Generated record surfaces](/docs/reference/frontend/generated-record-surfaces/)
