---
title: "Generated record screens and forms"
description:
  "Use and predict the CRUD experience generated from table definitions."
---

Registered table metadata produces a list route with inline editing and a
separate create route. Expandable child rows expose declared relationships. The
screen is not a second model of the table; it projects the same column kinds,
labels, search fields, and write policy used by the generated API.

## Predict the screen from the schema

Registered table metadata drives the ordinary CRUD experience:

```ts
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { sapportaTable, select } from "@sapporta/server/table";

export const tasksTable = sqliteTable("tasks", {
  // Other columns omitted for focus.
  status: select("status", ["open", "in_progress", "completed"] as const)
    .notNull()
    .default("open"),
  priority: select("priority", ["low", "medium", "high"] as const)
    .notNull()
    .default("medium"),
});

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
```

Column kinds choose default inputs and formatting. Each `select()` option tuple
constrains the stored string and supplies a searchable, clearable combobox. The
text typed into that combobox filters its declared options; it is not stored as
the field value. A Drizzle foreign key plus the project `rowLabelColumns` turns
`project_id` into a scoped lookup that stores an ID and displays a name.
System-managed scope fields, generated primary keys, and columns with
`apiWritable: false` stay out of ordinary forms.

The project definition supplies the reverse navigation:

```ts
children: [
  {
    table: "tasks",
    foreignKey: "project_id",
    label: "Tasks",
    columns: ["title", "status", "due_date"],
    defaultSort: "due_date",
  },
];
```

## Run the record workflow

1. Start the app with `pnpm dev` and open `/tables/projects/new`.
2. Create a project named **Website Relaunch**, then return to
   `/tables/projects`.
3. Open `/tables/tasks/new` and create **Publish launch checklist**.
4. Choose **Website Relaunch** in the Project lookup. Set status to **open**,
   priority to **high**, and add a due date.
5. Edit the saved task inline in `/tables/tasks`, then expand the project row in
   `/tables/projects` and find the task under **Tasks**.

Lookup results contain only rows visible to the current user. Generated form
validation and generated HTTP validation use the same table definition. A hidden
field or a fixed client filter is presentation, not an authorization rule.

## Keep draft text until submit

Generated create screens use TanStack Form for draft, error, and pending state.
Sapporta supplies metadata-derived fields and the table request boundary.

Numeric, money, percentage, date, and timestamp inputs keep raw strings while a
record is being edited. Intermediate numeric text such as `-` or `12.` therefore
stays visible. The form decodes the full draft once on submit. Finite numeric
text becomes a JSON number, dates and timestamps become canonical strings, and
invalid input produces an issue beside its field without rewriting the draft.

During submit, empty optional non-text controls are omitted, empty text remains
`""`, and required empty controls become local issues. The server then applies
write policy, trusted scope values, reference visibility, and authoritative
validation.

Generated screens are the right boundary while the workflow is still
table-shaped. Build a custom screen when the interaction needs a different
composition, temporary state, or named domain action. The
[form-helper reference](/docs/reference/frontend/generated-record-surfaces/)
documents the public pieces available to that screen.

## Related reference

- [Generated record surfaces and form helpers](/docs/reference/frontend/generated-record-surfaces/)
- [Search table rows and relationships](/docs/guides/model-data/search-indexes-and-display-metadata/)
- [Table query options](/docs/reference/frontend/table-query-options/)
- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
