---
title: "Scoped report data"
description:
  "Keep hidden rows out of report details, counts, totals, and statistics."
---

A count can reveal a hidden row without displaying it. Percentages, empty
groups, totals, and links reveal the same kind of fact. A report must remove
invisible base rows before it joins or aggregates them.

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
  today: Temporal.Now.plainDateISO(),
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


A pure mapper makes aggregation easier to test, but purity is not security. The
route or store must remove hidden rows before the mapper receives them. Apply
the same rule to exports and summary cards, especially when they return only a
number.

## Related reference

- [Scoped report helpers](/docs/reference/reports/scoped-report-helpers/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
