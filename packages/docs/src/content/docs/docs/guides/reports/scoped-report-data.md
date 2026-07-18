---
title: "Scoped report data"
description:
  "Keep hidden rows out of report details, counts, totals, and statistics."
---

A report can leak hidden data without displaying a hidden row. Counts,
percentages, zero-versus-nonzero results, and drill-through links all reveal
facts. This page applies request row security before the task app joins or
aggregates anything. You will learn how to scope every base table, reject
client-selected authority, and compare report totals with generated table
queries. The pattern applies to dashboards, exports, forecasts, and every other
aggregate surface.

```text
Audit this report for row-scope leaks. Resolve its ability and data authority at the route edge, apply one row-security guard per base table before joins or aggregation, remove workspace and user scope inputs, and prove totals with two workspace tokens.
```

## Scope base rows before the report sees them

The project-progress handler narrows the request to an authorized workspace data
context, then constructs separate guards for projects and tasks:

```ts
const auth = requireAuthorizedWorkspaceData(c, {
  action: "read",
  subject: "project_progress",
});
const db = c.get("db");

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

This two-read version is easy to inspect and test. A larger report can aggregate
in SQL, but the visibility predicate must still be part of each base-table query
before grouping. For joins, build one guard per participating table and compose
both ownership predicates into the joined query. For raw SQL, use explicit
guarded base-row CTEs and keep the code in a store module with a short
explanation of why the scoped Drizzle primitives do not fit.

## Keep authority out of report input

The request may choose product filters such as `project_id`, status, or a date
range. It must not choose `workspace_id`, `workspaceId`, `scoped_to_user_id`, or
`scopedToUserId`.

```ts
export const projectProgressQuerySchema = z.object({
  project_id: z.coerce.number().int().positive().optional(),
});
```

Even a legitimate project ID is only a filter.
`projectAccess.ownedRows(eq(projectsTable.id, projectId))` combines it with the
trusted workspace predicate. A primary key alone is not an authorization rule.

Avoid this report contract:

```ts
// Wrong: the caller is selecting its own authority boundary.
z.object({
  workspace_id: z.string(),
  project_id: z.coerce.number().int().positive().optional(),
});
```

## Compare equivalent scoped surfaces

Seed the canonical two projects and five tasks in Workspace A. Seed one project
with one completed task in Workspace B. Create a token while each workspace is
active, then run the same commands with each token:

```bash
pnpm exec sapporta api get /api/reports/project-progress
pnpm exec sapporta rows list projects --output json
pnpm exec sapporta rows list tasks --output json
```

For Workspace A, the report footer and task list both total five. For Workspace
B, they both total one. The extra completed task must not change Workspace A's
completion ratio from 40% to 50%.

Also call the Workspace A report with Workspace B's project ID:

```bash
pnpm exec sapporta api get /api/reports/project-progress --query '{"project_id":3}'
```

The response contains no hidden project or task information. If the app chooses
a not-found response for this filter, that behavior should match its declared
contract and should not distinguish absent from invisible IDs.

<!--
Screenshot brief
Suggested asset: /images/docs/reports/scoped-report-workspace-comparison.png
Setup: Seed five tasks in Workspace A and one differently named completed task in Workspace B. Run the project-progress report and the JSON task-list command under each workspace token.
Frame: Use a four-pane terminal composite labeled by workspace and surface: Workspace A report/tasks and Workspace B report/tasks. Show only compact totals and row labels; redact tokens and user data.
Visible proof: Each report total matches its own generated task query, and neither output contains the other workspace's project or task names.
Alt text: Project-progress and generated task totals agree independently in two workspaces, with no cross-workspace rows or counts.
-->

The report now receives only rows visible to the request, so its details and
derived values share one authority boundary. A pure mapper is useful for
correctness, but purity alone is not security; the route or store must remove
hidden rows first. Apply the same check to exports and summary cards, especially
when they return only a number.

## Related reference

- [Scoped report helpers](/docs/reference/reports/scoped-report-helpers/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
