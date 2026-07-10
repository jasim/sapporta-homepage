---
title: "Choose an application interface"
description: "Select generated screens, table APIs, app endpoints, reports, CLI commands, or SQL for one task."
---

Select generated screens, table APIs, app endpoints, reports, CLI commands, or SQL for one task.

Sapporta exposes several interfaces over the same application. The smallest high-level surface that expresses the operation retains the most schema, validation, and security behavior.

For the programmer, the project uses generated rows for CRUD, domain endpoints for invariants, reports for summaries, and SQL only for contained administration.
For the application user, users and operators receive an interface aligned with the operation rather than a parallel data model.

## System boundary

- Use generated screens for interactive ordinary records.
- Use table APIs or row commands for programmatic CRUD.
- Use an app endpoint for multi-table transitions or external effects.
- Use a report route for reusable aggregates and SQL only as a privileged fallback.

## Task-app example

Updating task priority is generated CRUD. Completing a task with history uses the complete-task endpoint. Project totals use the progress report.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Table endpoints](/docs/reference/http/table-endpoints/)
- [API and SQL commands](/docs/reference/cli/api-and-sql-commands/)
