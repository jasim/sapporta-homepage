---
title: "Authentication and abilities"
description:
  "Resolve caller identity and grant feature actions at the server edge."
---

Authentication establishes a principal. Abilities answer whether that principal
may perform an action. Data authority and row security answer a different
question: which rows that action may observe or change.

## Start with the server boundary

Project auth resolves a browser session or agent bearer token into
`c.get("auth")`. The context contains four separate request facts:

1. `principal` identifies the caller and its current workspace membership.
2. `ability` contains the action/subject grants built for that principal.
3. `dataAuthority` contains the workspace and user authority slots selected by
   the application.
4. `rowSecurity` turns those authority slots into table predicates and trusted
   write values.

Generated table handlers and app-owned handlers use the same context. A typed
client or protected React route can improve the caller experience, but neither
one authorizes a server request.

## Grant generated and domain actions deliberately

Generated table handlers authorize against the registered table's SQL name.
List, get, lookup, and count require `read`; CSV download requires `export`; the
write routes require `create`, `update`, or `delete`.

App-owned workflows use their own action and subject. For example, completing a
task is a domain transition rather than another spelling of generated update:

```ts
if (
  ctx.principal.kind === "user" &&
  ctx.principal.membership.roles.includes("owner")
) {
  can("run", "task_completion");
}
```

The generated starter currently also grants owners `can("manage", "all")`. Keep
that broad owner policy. Any narrower named owner grants shown beside it are
illustrative and redundant because `manage/all` already satisfies them; they are
not cumulative setup requirements.

The signed-in-user grants for `read`, `create`, and `delete` on
`agent_access_token` have another narrow meaning: they authorize the interactive
token-management routes. They are not action scopes embedded in an agent bearer
token.

## Check the action before touching data

The route adapter checks its feature action, then passes the request context to
the domain workflow:

```ts
const auth = c.get("auth");
forbidUnless(c, auth.ability.can("run", "task_completion"));

const context = {
  db: c.get("db"),
  auth,
};
const taskId = request.params.id;

return completeTask(context, taskId);
```

The workflow still needs a scoped read and row-scoped writes. An owner-only
action does not imply cross-workspace database access.

App-owned feature contracts declare their feature-owned responses, such as
validation, not-found, and conflict branches. The shared infrastructure
`401`/`403` envelopes are documented once in
[Auth and row security](/docs/reference/server/auth-and-row-security/) instead
of being copied into every feature contract.

## Keep private routes private

App-owned routes are private unless their mounted path is intentionally added to
`publicApiRoutes` in `packages/api/app.ts`:

```ts
export const publicApiRoutes = [
  { method: "GET", path: "/api/public-status" },
] as const satisfies readonly PublicRoutePattern[];
```

Allow-listing lets an anonymous request reach the handler. It does not create an
ability grant or data authority. A public table-backed handler must still check
its action and use row-safe data access.

## Prove the boundary directly

Exercise the server without relying on hidden buttons or protected frontend
routes:

| Case                                            | What it proves                                   |
| ----------------------------------------------- | ------------------------------------------------ |
| Each role against each generated action         | The table action matrix is intentional           |
| Owner and member against `run/task_completion`  | The named workflow grant is enforced             |
| No credential                                   | The shared authentication boundary returns `401` |
| Credential without the feature ability          | The project ability boundary returns `403`       |
| Valid ability with another workspace's row ID   | Ability does not widen row visibility            |
| Direct HTTP request to a route hidden in the UI | Frontend navigation is not authorization         |

Endpoint discovery proves that a route is mounted, not that its authorization is
correct. Pair it with source review and negative requests.

## Related documentation

- [Workspaces, ownership, and row visibility](/docs/guides/security/workspaces-ownership-and-row-visibility/)
- [Row-safe custom endpoints and reports](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
- [Authentication and token endpoints](/docs/reference/http/authentication-and-token-endpoints/)
