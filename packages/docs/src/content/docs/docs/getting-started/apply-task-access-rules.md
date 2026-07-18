---
title: "Apply task access rules"
description:
  "Separate feature permission from workspace row visibility and verify both
  boundaries."
---

The seeded app is ready for an explicit access policy. This page gives every
workspace member ordinary project and task CRUD while reserving the upcoming
task-completion transition for workspace owners. It also keeps the active
workspace under server control. These separate boundaries support shared task
records, owner-only workflows, and consistent behavior across generated and
app-owned APIs.

```text
Let workspace members manage projects and tasks, reserve task completion for owners, and prove that neither role can choose or cross the active workspace.
```

## Keep the three access decisions separate

Authentication identifies the caller. `buildAbility()` decides which named
actions that caller may perform. Request data authority decides which rows and
trusted ownership values are available. A successful ability check never widens
row visibility, and an owner role does not imply access to every workspace.

Define the task-app grants in `packages/api/authz/ability.ts`. Keep any existing
rules for authentication support routes, and add these domain rules:

```ts
import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import type { AppAbility, AppAuthFacts } from "./types.js";

export function buildAbility(ctx: AppAuthFacts): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // Preserve the starter's agent-token and intentionally public rules here.

  if (ctx.principal.kind === "user") {
    can(
      ["read", "create", "update", "delete", "export"],
      ["projects", "tasks"],
    );

    if (ctx.principal.membership.roles.includes("owner")) {
      can("run", "task_completion");
    }
  }

  return build();
}
```

Generated routes ask for concrete actions such as `read`, `create`, and `update`
against the table's SQL name. The custom completion route added later will ask
`can("run", "task_completion")` at its route edge. Keeping that product action
separate means a member can edit one task's ordinary fields without receiving
permission to run the two-table completion transaction.

The starter already resolves trusted row authority in
`packages/api/authz/request-data-authority.ts`. Signed-in requests receive the
active membership's workspace; request bodies and query strings do not take part
in this decision:

```ts
export async function resolveRequestDataAuthority(input: {
  principal: AppPrincipal;
  c: Context;
}): Promise<RequestDataAuthority> {
  if (input.principal.kind !== "user") {
    return requestDataAuthority({
      systemGlobalOnly: systemGlobalOnlyAuthority(),
    });
  }

  const workspace = input.principal.membership.workspace;
  return requestDataAuthority({
    systemGlobalOnly: systemGlobalOnlyAuthority(),
    workspaceGlobalOnly: workspaceGlobalOnlyAuthority(workspace),
    workspaceUserScoped: workspaceUserScopedAuthority({
      workspace,
      user: input.principal.user,
    }),
  });
}
```

Both `projects` and `tasks` declare `rowScope: "workspaceGlobal"`. Their
generated handlers combine this authority with every list, lookup, get, create,
update, delete, and export. Clients never choose `workspace_id`, owner, role, or
scope columns. Custom table code later uses `scopedRows()` for ordinary work or
`auth.rowSecurity.forTable(table)` inside the completion transaction.

Add a focused ability test so the future route has one stable policy question:

```ts
expect(buildAbility(memberFacts).can("run", "task_completion")).toBe(false);
expect(buildAbility(ownerFacts).can("run", "task_completion")).toBe(true);
expect(buildAbility(memberFacts).can("update", "tasks")).toBe(true);
```

## Exercise the generated API boundary

Use tokens for an owner and member in Workspace A and a user in Workspace B.
Discover the mounted route, then run the same query with each identity:

```bash
pnpm exec sapporta endpoints show "GET /api/tables/tasks"

curl --silent http://localhost:3000/api/tables/tasks \
  -H "Authorization: Bearer $OWNER_TOKEN"
curl --silent http://localhost:3000/api/tables/tasks \
  -H "Authorization: Bearer $MEMBER_TOKEN"
curl --silent http://localhost:3000/api/tables/tasks \
  -H "Authorization: Bearer $OTHER_WORKSPACE_TOKEN"
```

The owner and member in Workspace A receive the same five seeded rows because
they share row authority. The Workspace B response does not reveal those rows:

```json
{
  "data": [],
  "meta": { "total": 0, "page": 1, "limit": 50, "pages": 0 }
}
```

Now try to choose a workspace during an otherwise valid create:

```http
POST /api/tables/tasks
Authorization: Bearer <member-token>
Content-Type: application/json

{
  "project_id": 1,
  "title": "Cross-workspace task",
  "status": "open",
  "priority": "medium",
  "workspace_id": "another-workspace"
}
```

Payload policy rejects the server-managed field before table validation or the
database write:

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_FAILED",
  "details": [
    {
      "field": "workspace_id",
      "message": "This field is managed by Sapporta auth and cannot be submitted through the table API."
    }
  ]
}
```

Generated get, update, and delete routes return the same not-found behavior for
a missing row and a row hidden by workspace scope. That equivalence prevents an
ID probe from revealing that another workspace owns a record.

<!--
Screenshot brief
Suggested asset: task-access-workspace-comparison.png
Setup: Seed the canonical five tasks in Workspace A. Prepare owner and member tokens for Workspace A plus one token for Workspace B, then run the same generated task-list request with all three.
Frame: Capture a split terminal with compact response totals for the three calls. Replace real bearer values with descriptive environment-variable names.
Visible proof: The owner and member both receive five tasks, Workspace B receives an empty data array, and no request sends a workspace filter.
Alt text: Three authenticated task-list calls showing shared Workspace A rows and no rows for Workspace B.
-->

<!--
Screenshot brief
Suggested asset: task-access-scope-field-rejection.png
Setup: Submit the generated task create request with a valid member token and an explicit workspace_id belonging to another workspace.
Frame: Capture the browser Network request payload beside its 422 JSON response. Hide cookies, bearer tokens, and personal account data.
Visible proof: The request includes workspace_id, the response is VALIDATION_FAILED, and no cross-workspace task appears in either task list.
Alt text: Network request showing rejection of a client-supplied workspace ID in a generated task create call.
-->

The task app now treats identity, feature abilities, and row visibility as three
different controls. Members can use generated project and task CRUD. Owners also
receive the named completion ability, but their data remains bounded by the
active workspace. Next,
[record task completion history](/docs/getting-started/record-task-completion-history/)
in an immutable child table before the owner-only transition is implemented. The
broader design is covered in
[authentication and abilities](/docs/guides/security/authentication-and-abilities/)
and the
[auth and row-security reference](/docs/reference/server/auth-and-row-security/).
