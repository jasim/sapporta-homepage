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
```

Column kinds choose default inputs and formatting. Select metadata constrains
controlled values. A Drizzle foreign key plus the project `rowLabelColumns`
turns `project_id` into a lookup that stores an ID and displays a name.
System-managed scope and timestamp fields stay out of ordinary forms.

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

<!--
Screenshot brief
Suggested asset: generated-task-create-form.png
Setup: Create the Website Relaunch project first, then open `/tables/tasks/new`. Fill the task title, open the Project lookup, and set status and priority.
Frame: Capture the full generated form with the project-name lookup and both select controls visible. Exclude browser developer tools.
Visible proof: The form displays Project rather than project_id, shows Website Relaunch rather than its numeric ID, constrains status and priority, and omits workspace_id.
Alt text: Generated task creation form with a named project lookup and controlled status and priority fields.
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

- [Generated record surfaces](/docs/reference/frontend/generated-record-surfaces/)
- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
