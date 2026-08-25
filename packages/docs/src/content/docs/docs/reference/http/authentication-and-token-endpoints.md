---
title: "Authentication and token endpoints"
description:
  "Look up auth context, workspace, session, and agent-token route contracts."
---

## Route ownership

Browser sign-in and session lifecycle use the Better Auth handler mounted at
`GET|POST /api/auth/*`. The exact child paths under that mount belong to the
configured Better Auth provider.

The generated project mounts these app auth contracts under `/api`:

| Method and path                           | Caller                                                       | Success                              | Declared failure statuses         |
| ----------------------------------------- | ------------------------------------------------------------ | ------------------------------------ | --------------------------------- |
| `GET /api/auth-bootstrap`                 | Public                                                       | `200` bootstrap state                | —                                 |
| `GET /api/auth-context`                   | Browser session or bearer token                              | `200` current user/workspace context | `401`, `403`                      |
| `POST /api/auth-context/active-workspace` | Interactive browser session                                  | `200` new active context             | `400`, `401`, `403`, `404`, `422` |
| `PUT /api/auth-context/workspace/time-zone` | Interactive browser session, workspace owner                 | `200` fresh auth context             | `401`, `403`, `422`               |
| `GET /api/auth-tokens`                    | Interactive browser session with `read/agent_access_token`   | `200` token metadata list            | `401`, `403`                      |
| `POST /api/auth-tokens`                   | Interactive browser session with `create/agent_access_token` | `201` token plus one-time plaintext  | `400`, `401`, `403`, `422`        |
| `DELETE /api/auth-tokens/:id`             | Interactive browser session with `delete/agent_access_token` | `204`                                | `401`, `403`, `404`               |

Bearer tokens are valid for ordinary protected application APIs. They are
rejected by list/create/revoke token-management routes with `403 forbidden`. The
`agent_access_token` ability subject authorizes those interactive management
routes; it is not a set of scopes stored in the credential.

## Workspace time zone

`PUT /api/auth-context/workspace/time-zone` takes `{ "timeZone": "<IANA id>" }`
and answers with the same auth-context body `GET /api/auth-context` returns, so
a browser publishes the new calendar from the response it already knows how to
read. The server checks the identifier against its own time zone database and
refuses one it cannot render.

The route is owner-only. The zone belongs to the workspace, so changing it
changes what "August 24" means for every member, not for whoever asked. The
handler resolves the request again rather than patching the context it holds: a
request carries its workspace in more than one place, and one path to the answer
costs one extra resolution on an action an owner performs rarely.

## Token record and one-time secret

Creation binds the token to the signed-in user and current workspace. The
response returns:

```text
spat_<token-id>_<secret>
```

exactly once. The database stores the token ID, user ID, organization/workspace
ID, name, a SHA-256 secret hash, and creation/expiry/last-use/revocation
metadata. List responses expose metadata but never return the raw secret or
stored hash.

Create and list are constrained to the current signed-in user and active
workspace. Revoke additionally constrains the target ID and requires it not to
be already revoked. An unknown, other-user, other-workspace, or already-revoked
target is concealed as `404 not_found`.

## Bearer request resolution

For each bearer request, project auth:

1. parses the token ID and secret;
2. reads the token and compares its stored hash;
3. checks revocation, then expiry;
4. reloads the user and current membership in the token-bound workspace;
5. builds the current principal, data authority, abilities, and row security;
6. records last use only after all checks pass.

The current membership is authoritative. Role changes affect later abilities,
membership removal fails closed, and the browser session's active workspace does
not affect the bearer request.

## Stable lifecycle failures

| Condition                                                | Status/code              |
| -------------------------------------------------------- | ------------------------ |
| Missing, malformed, unknown, or wrong-secret credential  | `401 unauthenticated`    |
| Revoked token                                            | `401 token_revoked`      |
| Expired token                                            | `401 token_expired`      |
| Token user no longer belongs to its workspace            | `403 workspace_required` |
| Bearer caller attempts token management                  | `403 forbidden`          |
| Cross-workspace, other-user, unknown, or repeated revoke | `404 not_found`          |

Status and code are stable. Message wording is not the contract.

## Discovery

In a protected app, `/api/openapi.json` and endpoint discovery require the same
credential boundary as other private APIs. The document describes mounted HTTP
operations; it does not describe application ability rules or row policy.

## Related documentation

- [Agent access and scoped tokens](/docs/guides/security/agent-access-and-scoped-tokens/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Days and time zones](/docs/reference/server/days-and-time-zones/)
- [Error catalogue and diagnostics](/docs/reference/operations/error-catalogue-and-diagnostics/)
