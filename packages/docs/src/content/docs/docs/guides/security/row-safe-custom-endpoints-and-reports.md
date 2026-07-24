---
title: "Row-safe custom endpoints and reports"
description: "Apply abilities and row visibility to app-owned reads and writes."
---

Generated table routes apply row visibility for you. App-owned endpoints and
reports must make that boundary explicit. This page shows the two supported
levels: `scopedRows()` for ordinary table operations and
`auth.rowSecurity.forTable()` for custom Drizzle work. You will learn how to
scope reads, writes, joins, aggregates, and transactions. The result is custom
behavior that exposes the same records as Sapporta's generated surfaces.

```text
Make this custom Sapporta endpoint and report row-safe. Check the narrow feature ability at the route edge, create a scoped helper or guard for every table, apply scope before joins or totals, reject client scope fields, and add cross-workspace tests.
```

## Use `scopedRows()` for ordinary table work

`scopedRows(db, auth, table, { searchPlan })` binds one table and its
catalog-compiled search plan to the current request authority. Its operations
apply visible-row predicates, reject client ownership fields, stamp trusted
insert ownership, validate references, and return not found for missing or
invisible rows. Capture the catalog returned by `loadSapportaProject()` when
assembling app-owned routes.

```ts
import { scopedRows } from "@sapporta/server";
import { tasks } from "../schema/tasks.js";

api.register(
  "reopenTask",
  reopenTaskContract.reopenTask,
  async ({ c, request }) => {
    const auth = c.get("auth");
    forbidUnless(c, auth.ability.can("run", "task_reopening"));

    const taskRows = scopedRows(c.get("db"), auth, tasks, {
      searchPlan: catalog.searchPlanFor(tasks.sqlName),
    });
    const task = await taskRows.update(request.params.id, {
      status: "open",
    });

    return { status: 200, body: task };
  },
);
```

The client supplies the intended change. It does not supply `workspace_id`, a
user scope, or an owner id.

## Use one guard per table for custom SQL shapes

The complete-task workflow changes `tasks` and `task_events` atomically. It
therefore builds a guard for each table against the transaction handle:

```ts
import { and, eq } from "drizzle-orm";
import { Temporal } from "@sapporta/shared/temporal";

const result = db.transaction((tx) => {
  const taskAccess = auth.rowSecurity.forTable(tasks);
  const eventAccess = auth.rowSecurity.forTable(taskEvents);

  const task = tx
    .select()
    .from(tasksTable)
    .where(taskAccess.ownedRows(eq(tasksTable.id, taskId)))
    .get();

  if (!task) throw new TaskNotFoundError();
  if (task.status === "completed") throw new TaskAlreadyCompletedError();

  tx.update(tasksTable)
    .set({ status: "completed", updated_at: Temporal.Now.instant() })
    .where(
      taskAccess.ownedRows(
        and(eq(tasksTable.id, taskId), eq(tasksTable.status, task.status)),
      ),
    )
    .run();

  const event = eventAccess.insertValuesSync(
    tx,
    {
      event_type: "completed",
      occurred_at: Temporal.Now.instant(),
    },
    { serverValues: { task_id: taskId } },
  );

  tx.insert(taskEventsTable).values(event).run();
  return { taskId, status: "completed" as const };
});
```

The default Sapporta SQLite transaction callback is synchronous.
`insertValuesSync()` keeps reference validation and trusted ownership inside
that transaction. `serverValues` is the correct place for the route-authored
`task_id`; it does not bypass foreign-key visibility checks.

Reports follow the same rule. Scope every base table before mapping or
aggregating:

```ts
const projectAccess = auth.rowSecurity.forTable(projects);
const taskAccess = auth.rowSecurity.forTable(tasks);

const visibleProjects = await db
  .select()
  .from(projectsTable)
  .where(projectAccess.ownedRows());

const visibleTasks = await db
  .select()
  .from(tasksTable)
  .where(taskAccess.ownedRows());

return projectProgressDataset({
  projects: visibleProjects,
  tasks: visibleTasks,
  today: Temporal.PlainDate.from("2026-07-10"),
});
```

The pure mapper never receives hidden rows, so hidden rows cannot affect detail
lines, counts, percentages, or footer totals. Raw SQL is a fallback when these
primitives cannot express the query. Keep it in a store module and preserve the
same visible-row predicates there.

## Run the focused checks

```bash
pnpm build
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
pnpm exec sapporta api get /api/reports/project-progress
```

Exercise success, repeated completion, and cross-workspace task IDs. A
cross-workspace ID returns the same not-found response as an absent ID. For the
report, compare its totals with generated task queries under the same token.

<!--
Screenshot brief
Suggested asset: /images/docs/security/scoped-endpoint-and-report-output.png
Setup: Seed the canonical five-task dataset in Workspace A and one additional completed task in Workspace B. Run the complete-task endpoint and project-progress report with a Workspace A token.
Frame: Show two terminal panes: the endpoint success body and the report JSON footer or visible report grid. Keep the commands and API path visible; hide the raw token.
Visible proof: The completion creates one event, and the report total remains five tasks before that action or reflects only Workspace A after it. The Workspace B task never appears.
Alt text: A scoped task-completion response and project-progress result contain only records from the active workspace.
-->

The custom workflow now preserves generated-route semantics across multiple
tables, and the report scopes data before it computes anything. The non-obvious
rule is that a primary key is never a security boundary: updates and deletes
need both the key and `ownedRows(...)`. Use `scopedRows()` until the workflow
requires a custom query shape, then move to explicit per-table guards.

## Related reference

- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
- [Scoped report helpers](/docs/reference/reports/scoped-report-helpers/)
