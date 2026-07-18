---
title: "Search, indexes, and display metadata"
description:
  "Make record surfaces findable, legible, and efficient without a custom
  screen."
---

This page covers three related choices: which values people can search, how
generated surfaces present those values, and which database paths need indexes.
You will make the task list easier to scan and keep its common
project/status/due-date query efficient. The same approach applies to customer
directories, ticket queues, and operational worklists.

```text
Tune my tasks table for real use. Add focused search, readable status and priority fields, and indexes for the queries the generated screens run.
```

## Start with the query people make

Search should cover a small set of human-entered text. IDs, booleans,
timestamps, measures, and every text field do not become more useful merely
because the toolbar can search them. In the task app, title and description
match what a person remembers:

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

`rowLabelColumns` supplies a short, stable label for record links and lookups.
Select metadata constrains controlled text to known values. Column metadata
changes labels and presentation; it does not change row authorization.

The database index should follow a demonstrated query path. The task list and
project child surface commonly filter by project and status, then sort by due
date:

```ts
export const tasksTable = sqliteTable(
  "tasks",
  {
    // Columns omitted for focus.
  },
  (table) => [
    index("tasks_project_status_due_date_idx").on(
      table.project_id,
      table.status,
      table.due_date,
    ),
  ],
);
```

That composite index is not a generic speed switch. Its column order serves this
specific filter-and-sort shape. Add or revise indexes after inspecting actual
application queries and query plans.

## See the metadata in the generated list

Run the app, open `/tables/tasks`, and create several rows across two projects.
Give them different statuses, priorities, descriptions, and due dates. Search
for a word that appears only in a title or description, then filter to one
project and status.

<!--
Screenshot brief
Suggested asset: task-list-search-display-metadata.png
Setup: Seed at least six tasks across two projects. Include launch in one title and one description, and use all three status and priority values.
Frame: Capture `/tables/tasks` with the search field containing launch, a visible project or status filter, and the resulting rows.
Visible proof: Status and priority render as controlled values, Project has a human label, descriptions use their configured presentation, and only matching title/description rows remain.
Alt text: Generated tasks grid filtered and searched with readable project, status, priority, and description columns.
-->

The task surface is now searchable by meaningful text, readable without raw
identifiers, and indexed for its common relationship query. Search and display
metadata shape the generated experience; Drizzle indexes shape database
execution; neither replaces server-side row scope. Next, carry these schema
changes into a reviewed migration.

## Related reference

- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
- [Query syntax](/docs/reference/http/query-syntax/)
