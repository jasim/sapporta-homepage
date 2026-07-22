---
title: "Generated record screens and forms"
description:
  "Use and predict the CRUD experience generated from table definitions."
---

This page traces table metadata into generated list, create, detail, and edit
screens. You will create a project and related task without adding React code,
then identify which schema choices control each field. The same surfaces can
provide the first usable record workflow for asset registers, team directories,
cases, and approval queues.

```text
Set up generated project and task screens. I want named project lookups, status and priority selects, search, and a Tasks section on each project.
```

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
    search: { columns: ["title", "description"] },
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

1. Start the app with `pnpm dev` and open `/tables/projects`.
2. Create a project named **Website Relaunch**.
3. Open `/tables/tasks/new` and create **Publish launch checklist**.
4. Choose **Website Relaunch** in the Project lookup. Set status to **open**,
   priority to **high**, and add a due date.
5. Edit the saved task, then open its project record and find the task in the
   **Tasks** child section.

Lookup results contain only rows visible to the current user. Generated form
validation and generated HTTP validation use the same table definition. A hidden
field or a fixed client filter is presentation, not an authorization rule.

## Keep draft text until submit

Generated create screens use TanStack Form for draft state, submit validation,
field errors, form errors, and pending state. Sapporta supplies the
metadata-derived fields and the table request boundary. Application-owned forms
can compose the same public pieces without creating a second form store.

Numeric, money, percentage, date, and timestamp inputs keep raw strings while a
record is being edited. Intermediate numeric text such as `-` or `12.` therefore
stays visible. The form decodes the full draft once on submit. Finite numeric
text becomes a JSON number, dates and timestamps become canonical strings, and
invalid input produces an issue beside its field without rewriting the draft.

Create presence rules are applied during that decode. Empty optional non-text
controls are omitted so database defaults and nullable insert rules still apply.
Empty text remains `""`, which is distinct from `null`. Required empty controls
produce local issues. The server then applies API write policy, adds trusted
scope values, checks reference visibility, and performs authoritative structural
and application validation immediately before the Drizzle write.

The generated submit path converts recognized `422` response details into
field errors. Direct field details use the public SQL column name. Nested issue
paths use dot notation such as `lines.0.quantity`. The response summary remains
available as a form-level error, and unrecognized failures use a generic save
message.

For a custom form, derive field models with `buildRecordFormFields()`, connect
each model to a TanStack `form.Field`, and decode one-table creates with
`parseCreateDraft()` immediately before `createTableRow()`. Use
`fieldIssuesForSubmissionError()` to map local or generated API issues and
`firstFormErrorMessage()` to render TanStack field errors. The complete API and
its create-versus-patch invariants are in
[Generated record surfaces and form helpers](/docs/reference/frontend/generated-record-surfaces/).

<!--
Screenshot brief
Suggested asset: generated-task-create-form.png
Setup: Create the Website Relaunch project first, then open `/tables/tasks/new`. Fill the task title, open the Project lookup, and set status and priority.
Frame: Capture the full generated form with the project-name lookup and both select comboboxes visible. Open one combobox with a search query. Exclude browser developer tools.
Visible proof: The form displays Project rather than project_id, shows Website Relaunch rather than its numeric ID, filters the declared status or priority options, and omits workspace_id.
Alt text: Generated task creation form with a named project lookup and searchable status and priority comboboxes.
-->

<!--
Screenshot brief
Suggested asset: generated-project-detail-children.png
Setup: Save the task and open the Website Relaunch project detail route.
Frame: Capture the project heading and Tasks child section with the newly created row.
Visible proof: The related task is reachable from the parent record and carries the configured title, status, and due date columns.
Alt text: Generated project detail screen with its related task in the Tasks child collection.
-->

The project and task schemas now provide a complete ordinary record workflow:
create, edit, search, lookup, detail, child navigation, copy, and export. Start
with metadata when the behavior is still table-shaped. Add a custom React screen
only when the workflow needs a different composition, temporary state, or domain
interaction model. The next guide compares those Grid layers.

## Related reference

- [Generated record surfaces and form helpers](/docs/reference/frontend/generated-record-surfaces/)
- [Table query options](/docs/reference/frontend/table-query-options/)
- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
