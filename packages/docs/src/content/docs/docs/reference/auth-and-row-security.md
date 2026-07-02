---
title: "Auth And Row Security"
description:
  "Lookup row scopes, auth helpers, scopedRows methods, guard methods, and
  common auth errors."
---

## Auth and row security reference

For the narrative model, start with
[Control Access](/docs/subsystems/authorization/). For secure route patterns,
see [Build Product Workflows](/docs/building-your-own-feature/overview/) and
[Create Reports](/docs/subsystems/reports/).

### Row scopes

| `rowScope`            | Required columns                    | Visible to                                                    |
| --------------------- | ----------------------------------- | ------------------------------------------------------------- |
| `systemGlobal`        | none                                | Any request whose data authority includes system-global rows. |
| `workspaceGlobal`     | `workspace_id`                      | Users or tokens in the selected workspace.                    |
| `workspaceUserScoped` | `workspace_id`, `scoped_to_user_id` | One user inside the selected workspace.                       |

Clients must not send `workspace_id`, `workspaceId`, `scoped_to_user_id`, or
`scopedToUserId`. Scope fields are derived from the current session or agent
token.

### Guard helpers

| Helper                                                                      | Intended scope                                                                 |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `projectAuth.requireAuthorizedSystemData(c, requirement)`                   | System-global reference reads or writes.                                       |
| `projectAuth.requireAuthorizedWorkspaceData(c, requirement)`                | Workspace-shared data such as customers or products.                           |
| `projectAuth.requireAuthorizedWorkspaceUserData(c, requirement)`            | User-owned workspace data such as invoices or private work queues.             |
| `projectAuth.requireAuthorizedInteractiveWorkspaceUserData(c, requirement)` | Browser-session-only user/workspace workflows, such as agent token management. |
| `projectAuth.requireWorkspaceOwner(c)`                                      | Owner/admin workflows that are not primarily table row access.                 |

The `requireAuthorized*Data()` helpers check ability and return an auth context
narrowed to the requested data authority.

### `scopedRows()` methods

| Method              | Enforces                                                                             |
| ------------------- | ------------------------------------------------------------------------------------ |
| `list(query)`       | Row ownership before filters, search, sort, pagination, and count.                   |
| `get(id)`           | Primary-key lookup inside visible rows.                                              |
| `create(input)`     | Client field policy, visible references, trusted scope stamping, and persistence.    |
| `update(id, patch)` | Client field policy, visible references, and primary-key update inside visible rows. |
| `delete(id)`        | Primary-key delete inside visible rows.                                              |
| `lookup(query)`     | Autocomplete and id-to-label maps inside visible rows.                               |
| `count(query)`      | Grouped counts inside visible rows.                                                  |
| `exportRows(query)` | CSV/export rows inside the same visibility as list.                                  |

### Row-security guard methods

| Method                                         | Use                                                                                                                  |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `auth.rowSecurity.forTable(table)`             | Create a guard for one table. Use one guard per table in custom Drizzle workflows.                                   |
| `guard.ownedRows(predicate?)`                  | Compose a SQL predicate with the table's row ownership predicate.                                                    |
| `guard.insertValues(db, input, options?)`      | Prepare one insert payload: reject server-managed fields, merge server values, validate references, and stamp scope. |
| `guard.insertManyValues(db, inputs, options?)` | Prepare many insert payloads with the same policy.                                                                   |
| `guard.patchValues(db, patch)`                 | Prepare an update patch by rejecting server-managed fields and validating submitted references.                      |
| `guard.validateReferences(db, payload)`        | Low-level visible-FK check for trusted payloads.                                                                     |

### Common auth errors

| Code                 | Meaning                                                           |
| -------------------- | ----------------------------------------------------------------- |
| `unauthenticated`    | No usable browser session or bearer token was supplied.           |
| `email_not_verified` | Project policy requires a verified email before protected access. |
| `token_expired`      | The agent token expired and must be replaced.                     |
| `token_revoked`      | The agent token was revoked and must not be reused.               |
| `workspace_required` | The request has no valid active workspace membership.             |
| `forbidden`          | The principal lacks permission for the requested action.          |
