---
title: "Auth and row security"
description:
  "Look up row scopes, request authority, trusted fields, guards, and security
  errors."
---

## Public framework surface

`@sapporta/server` exports the auth context and framework primitives:

- `SapportaAuthContext`, `SapportaAbility`, and `forbidUnless`;
- `RequestDataAuthority` and the authority-slot types and constructors;
- `RowSecurity`, `TableRowSecurity`, and `InsertValuesOptions`;
- `Principal`, `UserPrincipal`, `AuthWorkspace`, and `workspaceTimeZone`;
- row-scope names, constants, predicates, and validation errors.

The generated project owns `buildAbility(...)`,
`resolveRequestDataAuthority(...)`, `publicApiRoutes`, and helpers such as
`requireAuthorizedWorkspaceData(...)`. Those helpers are application
infrastructure, not additional `@sapporta/server` exports.

## Request context

`SapportaAuthContext` keeps four decisions distinct:

| Property        | Meaning                                                   |
| --------------- | --------------------------------------------------------- |
| `principal`     | Anonymous caller or current user and workspace membership |
| `ability`       | CASL action/subject grants built for this request         |
| `dataAuthority` | Supported row-authority slots for the request             |
| `rowSecurity`   | Request-bound table guards derived from that authority    |

`forbidUnless(c, allowed)` throws the generated project-auth `403 forbidden`
response when `allowed` is false. It does not add a row predicate.

`workspaceTimeZone(auth)` returns the calendar this request works in, read from
the workspace the request already resolved. It throws for a request with no
workspace — an anonymous public route, or one holding only `systemGlobalOnly`
authority. `AuthWorkspace` carries `timeZone` as a checked IANA identifier.
[Days and time zones](/docs/reference/server/days-and-time-zones/) owns that
contract.

`userPrincipal()` returns `UserPrincipal`, the narrowed form of `Principal` for
a caller that has already established there is a user.

## Generated table action matrix

Generated table subjects use the registered table's `sqlName`.

| Generated operation              | Ability check                   |
| -------------------------------- | ------------------------------- |
| List rows                        | `read`                          |
| Get one row                      | `read`                          |
| Lookup rows                      | `read`                          |
| Count rows                       | `read`                          |
| Create row or master/detail rows | `create` on every table written |
| Update row                       | `update`                        |
| Delete row                       | `delete`                        |
| Export CSV                       | `export`                        |

`manage` is not a generated table action. CASL can satisfy the concrete checks
through a broader rule such as the starter owner's `can("manage", "all")`. That
broad grant remains the owner policy; narrower named owner grants shown
alongside it are illustrative and redundant.

App-owned actions use an application subject, for example
`can("run", "task_completion")`, and call `forbidUnless(...)` or an authorized
generated-project helper before touching data.

The `read`/`create`/`delete` actions on `agent_access_token` authorize
interactive token management. They are not bearer-token scopes.

## Row scopes and request authority

| Row scope             | Required authority    | Row predicate               |
| --------------------- | --------------------- | --------------------------- |
| `systemGlobal`        | `systemGlobalOnly`    | SQL `TRUE`                  |
| `workspaceGlobal`     | `workspaceGlobalOnly` | Workspace equality          |
| `workspaceUserScoped` | `workspaceUserScoped` | Workspace and user equality |

`workspaceUserScoped` is the authoring default when `rowScope` is omitted.
[Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
owns the exact schema default and required-column contract.

If the request does not carry the authority slot required by a table,
row-security construction fails closed with `403 row_scope_forbidden`.
Membership roles affect `buildAbility(...)`; they do not widen `dataAuthority`.

Generated routes apply ability checks and row scope automatically. App-owned
routes explicitly select action, authority, and row enforcement. Project helpers
such as `requireAuthorizedWorkspaceData(...)` both check their action/subject
requirement and narrow `dataAuthority` and `rowSecurity` to the validated slot.

## Trusted write fields

Generated table writes automatically reject exactly four auth scope aliases:

```text
workspace_id
workspaceId
scoped_to_user_id
scopedToUserId
```

At the generated HTTP adapter, submitting one produces `422 VALIDATION_FAILED`.
The server then stamps trusted scope values from request authority.

No arbitrary `owner_id`, role, approval, or authority-like field receives this
behavior by name. Use `apiWritable: false` for a server-owned column,
`apiSettable: false` for a server-owned reference, or a domain workflow with
`serverValues`.

## Missing rows and immutability

For singular generated get, update, and delete operations, missing and
row-invisible IDs both produce `404 ROW_NOT_FOUND`. List, lookup, count, and
export filter invisible rows instead of returning a per-row error.

Generated handlers check ability before calling row operations. Therefore:

- a caller without the action receives project-auth `403 forbidden`;
- a caller with the action that updates or deletes an immutable table receives
  generated-table `403 FORBIDDEN`.

`immutable` does not grant create or read. It is enforced by
`scopedRows().update()` and `.delete()`, not by the database schema, a
`TableRowSecurity` guard, or raw Drizzle/SQL. Trusted raw access can bypass both
row policy and immutability unless application code applies the predicates and
rules itself.

## Shared infrastructure responses

Private `/api/*` routes resolve auth before feature handlers. Feature contracts
declare their feature-owned responses; they do not need to repeat these shared
infrastructure envelopes:

| Condition                                 | Status/code owner                                  |
| ----------------------------------------- | -------------------------------------------------- |
| No usable credential                      | `401 unauthenticated` — generated project auth     |
| Revoked agent token                       | `401 token_revoked` — generated project auth       |
| Expired agent token                       | `401 token_expired` — generated project auth       |
| Required workspace membership unavailable | `403 workspace_required` — generated project auth  |
| Action denied                             | `403 forbidden` — generated project auth           |
| Requested authority slot unsupported      | `403 row_scope_forbidden` — framework row security |

Status and code are stable integration points. Message wording is illustrative.

## Related documentation

- [Authentication and abilities](/docs/guides/security/authentication-and-abilities/)
- [Workspaces, ownership, and row visibility](/docs/guides/security/workspaces-ownership-and-row-visibility/)
- [Days and time zones](/docs/reference/server/days-and-time-zones/)
- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
- [Error catalogue and diagnostics](/docs/reference/operations/error-catalogue-and-diagnostics/)
