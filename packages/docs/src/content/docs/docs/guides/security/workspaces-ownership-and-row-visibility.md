---
title: "Workspaces, ownership, and row visibility"
description:
  "Choose a row scope and keep trusted ownership values under server control."
---

Row scope answers a product question: does this row belong to the application,
the workspace, or one person inside the workspace? The answer determines both
read predicates and server-authored ownership values.

## Choose the scope from the product rule

`workspaceGlobal` makes a row visible to authorized members of its workspace.
`workspaceUserScoped` narrows that boundary to the active workspace and current
user. It is the default when `rowScope` is omitted. `systemGlobal` is for
deliberately application-wide rows; for an authorized request, its ownership
predicate is unrestricted SQL `TRUE`.

Projects and tasks are shared work, so both use `workspaceGlobal` and contain a
`workspace_id` column:

```ts
export const projects = sapportaTable({
  drizzle: projectsTable,
  meta: {
    label: "Projects",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["name"],
  },
});

export const tasks = sapportaTable({
  drizzle: tasksTable,
  meta: {
    label: "Tasks",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["title"],
  },
});
```

A personal task draft would use the narrower scope and define both required
ownership columns:

```ts
export const taskDraftsTable = sqliteTable("task_drafts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace_id: text("workspace_id").notNull(),
  scoped_to_user_id: text("scoped_to_user_id").notNull(),
  title: text("title").notNull(),
});

export const taskDrafts = sapportaTable({
  drizzle: taskDraftsTable,
  meta: {
    label: "Task drafts",
    rowScope: "workspaceUserScoped",
    rowLabelColumns: ["title"],
  },
});
```

The request's data authority supplies the trusted workspace and user. Generated
create and update routes reject client-supplied `workspace_id`, `workspaceId`,
`scoped_to_user_id`, and `scopedToUserId`. Generated reads compose the same
authority into their SQL predicates.

## Exercise shared and personal rows

Create task data without either ownership field:

```bash
pnpm exec sapporta rows create projects --values '{"name":"Website Relaunch"}'
pnpm exec sapporta rows create tasks --values '{"project_id":1,"title":"Audit launch checklist","status":"open","priority":"high"}'
pnpm exec sapporta rows list tasks --output json
```

Repeat the list as another member of the same workspace. The shared task remains
visible. Repeat it with a token created in another active workspace. The task is
absent because that token supplies a different workspace authority.

Also try a direct HTTP create that attempts to choose the workspace:

```http
POST /api/tables/tasks
Content-Type: application/json

{
  "project_id": 1,
  "title": "Cross-boundary task",
  "workspace_id": "another-workspace"
}
```

The request is rejected. Scope values are server-authored data, not filters or
form fields.


Missing and invisible rows intentionally share not-found behavior for get,
update, and delete. That prevents a caller from using response differences to
discover another workspace's primary keys.

Generated routes and custom row helpers derive ownership from request authority.
Scope metadata states the sharing rule; it does not delegate that rule to a
form or filter.

## Related reference

- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
