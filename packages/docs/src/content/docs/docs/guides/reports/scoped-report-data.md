---
title: "Scoped report data"
description:
  "Keep hidden rows out of report details, counts, totals, and statistics."
---

A report can leak a row without displaying it. Counts, percentages, empty
groups, totals, and drill-through IDs all reveal facts about their inputs. The
safe sequence is fixed: authorize the report action, resolve data authority,
scope every base read, and only then join, group, or map.

## Guard every participating table

The project-progress store receives the already-authorized workspace context. It
creates one guard for projects and another for tasks, then combines the product
filter with each table's row predicate before either query executes:

```ts
import { eq } from "drizzle-orm";
import type { SapportaEnv } from "@sapporta/server";
import type { AuthorizedWorkspaceDataContext } from "../project-auth/middleware.js";

type ReadProjectProgressRowsOptions = {
  db: SapportaEnv["Variables"]["db"];
  auth: AuthorizedWorkspaceDataContext;
  projectId?: number;
};

export async function readProjectProgressRows({
  db,
  auth,
  projectId,
}: ReadProjectProgressRowsOptions) {
  const projectAccess = auth.rowSecurity.forTable(projects);
  const taskAccess = auth.rowSecurity.forTable(tasks);

  const projectFilter =
    projectId === undefined ? undefined : eq(projectsTable.id, projectId);
  const taskFilter =
    projectId === undefined ? undefined : eq(tasksTable.project_id, projectId);

  const visibleProjects = await db
    .select()
    .from(projectsTable)
    .where(projectAccess.ownedRows(projectFilter));

  const visibleTasks = await db
    .select()
    .from(tasksTable)
    .where(taskAccess.ownedRows(taskFilter));

  return { projects: visibleProjects, tasks: visibleTasks };
}
```

`ownedRows(productFilter)` AND-composes the product filter with the trusted row
predicate. Scoping the project query does not make an unscoped task query safe.
The same rule applies to every joined table, including tables that contribute
only a count or footer value.

The store returns ordinary visible rows. The route passes those rows and its
explicit date baseline to `projectProgressDataset(...)`; the mapper contains no
auth or database code.

## Keep authority out of report input

The request may choose product filters such as `project_id`, status, or a date
range. It must not choose `workspace_id`, `workspaceId`, `scoped_to_user_id`, or
`scopedToUserId`.

```ts
export const projectProgressQuerySchema = z.object({
  project_id: z.coerce.number().int().positive().optional(),
});
```

Even a valid primary key is only a filter. The route's authorized context and
`ownedRows(...)` supply the authority boundary.

Avoid this contract:

```ts
// Wrong: the caller is selecting its own authority boundary.
z.object({
  workspace_id: z.string(),
  project_id: z.coerce.number().int().positive().optional(),
});
```

## Move large aggregation without dropping scope

The two-read example is intentionally educational and in-memory. Moving it
behind a route centralizes reuse, but it still loads every visible input row.
When a question needs only a filtered total or one-column group from one table,
`scopedRows().count()` and `.countBy()` keep that work in SQL under the table's
row predicate. When the report combines tables or calculates a reusable business
measure, move the grouping and totals into a store query.

Keep the same ordering in the store:

1. build one row guard for each base table;
2. apply `ownedRows(productFilter)` to each base relation;
3. join or aggregate only those scoped relations; and
4. return a small ordinary result for dataset mapping.

Drizzle queries should carry the predicates into the database. If a required
shape cannot be expressed safely with the scoped primitives, isolate raw SQL in
a store module and build explicit guarded base-row CTEs before joining or
grouping. Raw SQL bypasses row helpers, so its review and negative tests are
part of the security boundary.

## Prove the absence of cross-workspace input

Use a local test fixture that creates its own records:

- Workspace A has visible projects and tasks with known totals.
- Workspace B has at least one project and task that would change those totals
  if either base read leaked.
- A caller without the report ability is rejected.
- Workspace A filtering by Workspace B's project ID yields the declared empty or
  not-found behavior without identifying the hidden project.

Run the report as Workspace A before and after inserting the Workspace B rows.
Its nodes, footer totals, hidden IDs, and completion ratio must remain
byte-for-byte equivalent. Then compare the report totals with generated,
row-scoped reads of `projects` and `tasks` under the same authority.

A `200` response proves only that the route ran. It does not prove that hidden
rows contributed zero values.

## Related documentation

- [Row-safe custom endpoints and reports](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
- [Scoped report helpers](/docs/reference/reports/scoped-report-helpers/)
- [Table row-security guards](/docs/reference/server/row-scoped-data/table-row-security-guards/)
- [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
