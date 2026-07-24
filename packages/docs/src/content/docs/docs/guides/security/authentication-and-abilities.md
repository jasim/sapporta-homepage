---
title: "Authentication and abilities"
description:
  "Resolve caller identity and grant feature actions at the server edge."
---

Authentication establishes a principal. Abilities permit named product
actions. Data authority and row security determine which records the permitted
action may observe.

## Identity first, permission second

Project auth resolves a browser session or bearer token into `c.get("auth")`.
That context contains the principal, active membership, abilities, data
authority, and request-bound row-security helpers. A route can therefore ask a
narrow question such as `can("run", "task_completion")` without parsing roles
itself.

Abilities belong in `packages/api/authz/ability.ts`. Add the domain rule inside
the generated `buildAbility()` without removing its starter grants for
authentication, token management, and sample routes:

```ts
// Keep the generated grants above this addition.
if (
  ctx.principal.kind === "user" &&
  ctx.principal.membership.roles.includes("owner")
) {
  can("run", "task_completion");
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


`buildAbility()` owns named product actions. Route handlers enforce those
actions at the edge. Row-security helpers remain responsible for database
visibility.

## Related reference

- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Authentication and token endpoints](/docs/reference/http/authentication-and-token-endpoints/)
