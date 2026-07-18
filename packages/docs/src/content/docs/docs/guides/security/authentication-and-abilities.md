---
title: "Authentication and abilities"
description:
  "Resolve caller identity and grant feature actions at the server edge."
---

Authentication tells the API who made a request. Abilities decide which product
actions that identity may use. This page separates those two decisions from row
visibility, then applies an owner-only ability to the task app. You will learn
where project abilities live, how a custom route checks one, and when a route
should be public. The same pattern supports approvals, publishing, imports,
exports, and other app-owned workflows.

```text
Add an owner-only task-completion ability to this Sapporta app. Keep ordinary project and task CRUD available to workspace members, check the custom ability at the route edge, leave row scope under server control, and show me the focused checks you ran.
```

## Identity first, permission second

Project auth resolves a browser session or bearer token into `c.get("auth")`.
That context contains the principal, active membership, abilities, data
authority, and request-bound row-security helpers. A route can therefore ask a
narrow question such as `can("run", "task_completion")` without parsing roles
itself.

Abilities belong in `packages/api/authz/ability.ts`. The task app grants normal
table actions to every signed-in workspace member and grants the completion
workflow only to owners:

```ts
import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import type { AppAbility, AppAuthFacts } from "./types.js";

export function buildAbility(ctx: AppAuthFacts): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (ctx.principal.kind === "user") {
    can(
      ["read", "create", "update", "delete", "export"],
      ["projects", "tasks"],
    );
  }

  if (
    ctx.principal.kind === "user" &&
    ctx.principal.membership.roles.includes("owner")
  ) {
    can("run", "task_completion");
  }

  return build();
}
```

The completion handler checks that feature action before it reads or writes task
data:

```ts
const auth = c.get("auth");
forbidUnless(c, auth.ability.can("run", "task_completion"));

return completeTask({
  db: c.get("db"),
  auth,
  taskId: request.params.id,
});
```

An ability check does not filter rows. The workflow still uses `scopedRows()` or
one `auth.rowSecurity.forTable(...)` guard for every table it touches. This
matters even for owners: an owner-only action does not imply cross-workspace
database access.

## Private by default

App-owned routes are protected unless their mounted path is intentionally added
to `publicApiRoutes` in `packages/api/app.ts`. A public entry only lets
anonymous traffic reach the handler. The handler still checks an ability and
applies row security to table-backed data.

```ts
export const publicApiRoutes = [
  { method: "GET", path: "/api/public-status" },
] as const satisfies readonly PublicRoutePattern[];
```

The task-completion route should not appear in that array.

## Exercise the boundary

Run the app as an owner, complete an open task, and then repeat the request as a
member. Discover the mounted contract before calling it:

```bash
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
pnpm exec sapporta api post /api/tasks/1/complete --body '{}'
```

The owner call returns the declared success response. The member call reaches
authentication but fails authorization with `403`. A missing session or bearer
token fails earlier with `401`.

<!--
Screenshot brief
Suggested asset: /images/docs/security/task-completion-owner-and-member.png
Setup: Create one owner and one member in the same workspace, seed one open task, and sign in as the member after recording a successful owner call.
Frame: Show the app's task action and the browser network response for POST /api/tasks/{id}/complete. Crop out cookies, bearer tokens, email addresses, and unrelated requests.
Visible proof: The member sees the same task row but the completion request returns 403 with the stable forbidden error body.
Alt text: A workspace member can view a task but receives a forbidden response when invoking the owner-only completion action.
-->

The task app now distinguishes identity, feature permission, and data authority.
`buildAbility()` owns named product actions, route handlers enforce those
actions at the edge, and row-security helpers remain responsible for database
visibility. From here, add separate subjects for workflows such as
`project_archival` or `task_import`, and test each subject with the
least-privileged role that should use it.

## Related reference

- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Authentication and token endpoints](/docs/reference/http/authentication-and-token-endpoints/)
