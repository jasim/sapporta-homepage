---
title: "Workspaces, ownership, and row visibility"
description:
  "Choose a row scope and keep trusted ownership values under server control."
---

Row scope determines which records a request may see and which ownership values
the server writes. This page compares Sapporta's workspace scopes and applies
`workspaceGlobal` to the task app. You will learn how table metadata activates
row security, why scope columns stay out of client payloads, and how invisible
records behave. These concepts support shared workspace data, personal queues,
private drafts, and other multi-tenant records.

```text
Review this Sapporta app's tables and choose the narrowest row scope for each one. Keep workspace and user ownership fields server-controlled, use generated APIs to exercise the result, and include a cross-workspace check.
```

## Choose the scope from the product rule

`workspaceGlobal` makes a row visible to authorized members of its workspace.
`workspaceUserScoped` narrows that boundary to the active workspace and current
user. Sapporta also has a system-global scope for intentionally application-wide
data, but normal product records usually belong to one of the workspace scopes.

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

<!--
Screenshot brief
Suggested asset: /images/docs/security/workspace-row-visibility.png
Setup: Seed the canonical tasks in Workspace A, create one member token for Workspace A and one for Workspace B, then run the same JSON task-list command with each token.
Frame: Use a split terminal view with the command and compact JSON result for each workspace. Replace token values with descriptive shell variable names.
Visible proof: Workspace A returns the seeded task rows and Workspace B returns an empty data array; neither request sends a workspace field.
Alt text: The same task-list command returns Workspace A rows and no Workspace B rows because the bearer token selects the row boundary.
-->

Missing and invisible rows intentionally share not-found behavior for get,
update, and delete. That prevents a caller from using response differences to
discover another workspace's primary keys.

The task app now expresses sharing rules in table metadata. `workspaceGlobal`
supports collaboration inside one workspace, while `workspaceUserScoped`
supports records private to one member of that workspace. Generated routes and
custom row helpers derive ownership from request authority. The next useful step
is to apply the same predicates inside app-owned transactions and reports.

## Related reference

- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
