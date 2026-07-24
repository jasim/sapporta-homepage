---
title: "Choose an application interface"
description:
  "Select generated screens, table APIs, app endpoints, reports, CLI commands,
  or SQL for one task."
---

Choose the application operation before choosing its caller. A generated table
route, domain endpoint, report, and SQL query preserve different rules. The
browser, typed client, CLI, and agent are callers of those operations.

## Start with the operation

The interface follows the shape of the work. A generated surface already knows
the table schema, editable fields, row labels, and request authority. An
app-owned endpoint adds a business transition. A report adds a reusable read
model. SQL operates below those application boundaries.

| Operation                  | Use first                            | Task-app example                                   |
| -------------------------- | ------------------------------------ | -------------------------------------------------- |
| Interactive record work    | Generated record screen              | Edit a task priority                               |
| Programmatic CRUD          | Table API or `rows` command          | Create or update one task                          |
| Named domain transition    | App-owned endpoint                   | Complete a task and insert history                 |
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


Use `sql query` only when no generated route, domain endpoint, or report answers
the question. SQL access is privileged and bypasses the generated row helpers,
so it is an administrative interface rather than a substitute for application
behavior.

Use the surface that owns the rule: CRUD through generated tables, transitions
through domain endpoints, summaries through reports, and unrestricted SQL only
for deliberate administration.

## Related reference

- [Table endpoints](/docs/reference/http/table-endpoints/)
- [API and SQL commands](/docs/reference/cli/api-and-sql-commands/)
