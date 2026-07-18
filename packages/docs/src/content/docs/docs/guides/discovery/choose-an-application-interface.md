---
title: "Choose an application interface"
description:
  "Select generated screens, table APIs, app endpoints, reports, CLI commands,
  or SQL for one task."
---

One Sapporta application can be used through generated screens, HTTP routes,
typed clients, CLI commands, and privileged SQL. This guide explains what each
interface preserves and how to choose the smallest one that expresses the
operation.

You will learn why ordinary record edits, domain transactions, and aggregate
questions belong on different surfaces. The same decision applies when you add a
browser workflow, an integration, an operator command, or an agent task.

```text
I need to add <outcome> to this Sapporta app. Inspect its existing screens,
tables, endpoints, and reports, then recommend the highest-level interface that
fits. Explain what validation and row scope that choice preserves.
```

## Start with the operation

The interface follows the shape of the work. A generated surface already knows
the table schema, editable fields, row labels, and request authority. An
app-owned endpoint adds a business transition. A report adds a reusable read
model. SQL operates below those application boundaries.

| Operation                  | Use first                            | Task-app example                                   |
| -------------------------- | ------------------------------------ | -------------------------------------------------- |
| Interactive record work    | Generated record screen              | Edit a task priority                               |
| Programmatic CRUD          | Table API or `rows` command          | Create or update one task                          |
| Multi-table transition     | App-owned endpoint                   | Complete a task and insert history                 |
| Reusable aggregate         | Report route and screen              | Show progress by project                           |
| Repository change          | Coding agent with the Sapporta skill | Add the completion workflow                        |
| Exceptional administration | Privileged SQL                       | Inspect a value unavailable through an app surface |

The browser, CLI, and typed client are different callers. They can still reach
the same generated or app-owned route. Choosing a caller is separate from
choosing the application operation.

## Compare the choices in the task app

Start the task app and discover its mounted surfaces before selecting one:

```bash
pnpm dev
pnpm exec sapporta tables show tasks
pnpm exec sapporta endpoints show "PUT /api/tables/tasks/{id}"
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
pnpm exec sapporta endpoints show "GET /api/reports/project-progress"
```

Changing priority is a single-table update, so the generated route is the
correct boundary:

```bash
pnpm exec sapporta rows update tasks 1 --values '{"priority":"high"}'
pnpm exec sapporta rows get tasks 1 --output json
```

Completing the same task is different. The operation changes the task and
inserts an immutable event. The app-owned endpoint can apply both writes in one
transaction and return a declared conflict if the task is already complete.

```bash
pnpm exec sapporta api post /api/tasks/1/complete --body '{}'
pnpm exec sapporta api get /api/reports/project-progress
```

<!--
Screenshot brief
Suggested asset: /assets/guides/discovery/choose-an-application-interface.png
Setup: Seed two projects and several tasks, complete one task through the app endpoint, and open the project-progress report.
Frame: Show the report beside the generated Tasks table with the completed task visible in both surfaces.
Visible proof: The report total and generated row status agree, while each surface presents the operation differently.
Alt text: Project progress report beside the generated Tasks table after completing one task.
-->

Use `sql query` only when no generated route, domain endpoint, or report answers
the question. SQL access is privileged and bypasses the generated row helpers,
so it is an administrative interface rather than a substitute for application
behavior.

The important result is not the command syntax. The task now runs through the
surface that owns its rules: CRUD through generated tables, transitions through
domain endpoints, and summaries through reports. From here, continue with the
[CLI guide](/docs/guides/discovery/use-the-sapporta-cli/) for operation or
[custom API endpoints](/docs/guides/app-owned-features/custom-api-endpoints/)
when the application needs a new business action.

## Related reference

- [Table endpoints](/docs/reference/http/table-endpoints/)
- [API and SQL commands](/docs/reference/cli/api-and-sql-commands/)
