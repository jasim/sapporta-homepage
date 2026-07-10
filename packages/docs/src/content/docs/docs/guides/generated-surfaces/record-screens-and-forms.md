---
title: "Generated record screens and forms"
description: "Use and predict the CRUD experience generated from table definitions."
---

Use and predict the CRUD experience generated from table definitions.

Registered table metadata drives list, create, detail, edit, lookup, child, copy, and export surfaces inside the Sapporta app shell.

For the programmer, the project changes ordinary record behavior through schema and metadata before adding React code.
For the application user, application users can work with projects and tasks through consistent generated screens.

## System boundary

- Column kinds choose default inputs and formatting.
- Select metadata constrains controlled values.
- References load labels only from visible rows.
- System-managed scope and timestamp fields stay out of ordinary forms.

## Task-app example

Create a project at `/tables/projects`, then create a task at `/tables/tasks/new`. The project lookup shows the project name and the project detail screen shows the new task.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Generated record surfaces](/docs/reference/frontend/generated-record-surfaces/)
- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
