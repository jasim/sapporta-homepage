---
title: "Workspaces, ownership, and row visibility"
description:
  "Choose a row scope and keep trusted ownership values under server control."
---

Row scope answers a product question: does this row belong to the whole
application, one workspace, or one person inside a workspace? The table declares
that rule. The request's data authority supplies the trusted workspace and user
values used to enforce it.

## Choose the scope from the product rule

- `systemGlobal` is deliberately application-wide.
- `workspaceGlobal` is shared by authorized members of one workspace.
- `workspaceUserScoped` is limited to one workspace and user. It is the default
  when `rowScope` is omitted.

The schema reference owns the exact required-column and default contract:
[Table and column metadata](/docs/reference/schema/table-and-column-metadata/).

Projects and tasks shared by a workspace declare `workspaceGlobal` and include
the required workspace column:

```ts
export const tasksTable = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace_id: text("workspace_id").notNull(),
  title: text("title").notNull(),
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

A personal draft would use `workspaceUserScoped` and define both `workspace_id`
and `scoped_to_user_id`.

## Resolve request authority separately from roles

`resolveRequestDataAuthority(...)` is generated application code, not a
framework export. It maps the principal to the authority slots this app
supports:

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

The browser session's active workspace or an agent token's bound workspace
determines the principal membership passed here. Membership roles influence
`buildAbility()` separately; an owner role does not automatically grant broader
row authority.

Custom routes can narrow this authority with generated project helpers such as
`requireAuthorizedWorkspaceData(...)`. They must not accept a workspace ID from
a URL or body and turn it into authority.

## Keep caller values and authority values apart

Generated reads compose row scope into their SQL predicates. Generated creates
stamp the trusted scope values. Generated writes reject exactly these four
automatic scope aliases when a caller supplies them:

```text
workspace_id
workspaceId
scoped_to_user_id
scopedToUserId
```

Other names such as `owner_id`, `role`, or `approved_by` are not automatically
protected because they sound authoritative. Use `apiWritable: false` for a
server-owned column, `apiSettable: false` for a server-owned reference, or an
app-owned workflow that supplies the value through `serverValues`.

Filters, hidden inputs, lookup choices, URL parameters, record IDs, and Grid
state are presentation or query inputs. None of them grants authority.

## Generated and custom routes enforce the same rule

Generated table routes apply row policy automatically. App-owned routes must
choose one of the row-safe paths explicitly:

- `scopedRows(...)` for generated-style operations on one table;
- `auth.rowSecurity.forTable(table)` for custom Drizzle shapes; or
- an application helper such as `requireAuthorizedWorkspaceData(...)` to
  validate and narrow the authority before creating table guards.

A missing row and a row hidden by scope return the same generated result:
`404 ROW_NOT_FOUND`. That concealment prevents callers from probing other
workspaces' primary keys.

## The workspace also carries a calendar

A workspace is a boundary for rows and the answer to which day an instant falls
on. `AuthWorkspace.timeZone` holds an IANA identifier, and
`workspaceTimeZone(auth)` is what a handler reads it with. A new workspace
starts on the zone the browser sends at sign-up; after that the workspace owns
its own, and an owner changes it on the Workspace settings screen.

One value per workspace keeps a shared result shared: two members reading the
same dashboard group the same rows under the same day.
[Days and time zones](/docs/reference/server/days-and-time-zones/) owns the
contract.

## Test two principals and two workspaces

Use an isolated fixture rather than tutorial IDs:

1. Create visible and hidden rows for users in two workspaces.
2. Prove a same-workspace shared row is visible under `workspaceGlobal`.
3. Prove a personal row is visible only to its owning user under
   `workspaceUserScoped`.
4. Prove list results omit hidden rows and get/update/delete expose the same
   not-found branch for hidden and absent IDs.
5. Submit each of the four managed aliases and expect `422 VALIDATION_FAILED`.
6. Repeat one request with a valid ability but the wrong workspace to show that
   action authorization and row authority remain separate.

## Related documentation

- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Days and time zones](/docs/reference/server/days-and-time-zones/)
- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
- [Authentication and abilities](/docs/guides/security/authentication-and-abilities/)
