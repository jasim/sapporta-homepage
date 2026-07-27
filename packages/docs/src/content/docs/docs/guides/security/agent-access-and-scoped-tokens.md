---
title: "Agent access and scoped tokens"
description:
  "Give non-browser callers revocable access to one user and workspace boundary."
---

An agent access token represents one user in one workspace. That association
selects identity and row authority; it is not an independently configurable
OAuth-style list of action scopes.

On every request, project auth reloads the token's current user/workspace
membership and builds abilities from its current roles. Removing the membership
or changing its roles therefore changes later requests. The browser session's
active workspace is irrelevant to a bearer token.

## Create the token in the intended workspace

Open `/account/profile` in an interactive browser session, switch to the
workspace the caller should represent, and create an agent access token. Give it
a name that identifies the caller and purpose. Add an expiry for temporary work.

The creation response displays the raw `spat_...` token once. Later list calls
return metadata such as its name, workspace, creation time, expiry, last use,
and revocation time. The project database stores a hash of the secret, not the
raw token.

The `read`, `create`, and `delete` abilities on `agent_access_token` authorize
these interactive token-management actions. Bearer credentials may call ordinary
app APIs, but token-management endpoints reject them with `403 forbidden`.

## Keep the credential out of durable text

Use an environment variable or secret manager. Do not paste the token into
prompts, documentation, source files, committed configuration, screenshots, or
shell history where avoidable.

The CLI reads `SAPPORTA_API_URL` and `SAPPORTA_API_TOKEN`:

```bash
export SAPPORTA_API_URL="http://localhost:3000"
read -s SAPPORTA_API_TOKEN
export SAPPORTA_API_TOKEN

pnpm exec sapporta endpoints show "GET /api/reports/project-progress"
pnpm exec sapporta rows list tasks --output json
```

For direct HTTP, send a normal bearer header:

```http
GET /api/tables/tasks HTTP/1.1
Host: localhost:3000
Authorization: Bearer spat_<token-id>_<secret>
```

The token-bound workspace supplies request authority. A query parameter, request
body, or `workspace_id` field cannot switch or widen it.

## Discover, operate, and read back

Protected apps require credentials to retrieve their OpenAPI/endpoint inventory.
The inventory proves which operation is mounted and describes its HTTP shape; it
does not encode application abilities or row policy.

Choose the narrowest mounted operation that owns the change, make the request,
and then read the affected record through an authoritative scoped operation. A
successful transport response alone does not prove that the intended row
changed.

## Prove isolation and lifecycle

Use a small fixture with one record in Workspace A and a different record in
Workspace B. A Workspace A token should see only Workspace A rows. Automation
for Workspace B gets a separate token created while Workspace B is active.

Then exercise each recovery branch:

| Condition                                       | Stable response          | Next step                                         |
| ----------------------------------------------- | ------------------------ | ------------------------------------------------- |
| Revoked token                                   | `401 token_revoked`      | Replace or remove the credential                  |
| Expired token                                   | `401 token_expired`      | Create a new time-bounded token                   |
| Membership removed                              | `403 workspace_required` | Restore membership or choose another workspace    |
| Bearer calls token-management route             | `403 forbidden`          | Use an interactive session                        |
| Revoke target belongs to another workspace/user | `404 not_found`          | Recheck the active browser workspace and token ID |

Status and code are the contract. Message wording is illustrative.

Revoking the credential invalidates the next API request. Removing a local
environment variable does not revoke it:

```bash
unset SAPPORTA_API_TOKEN
```

## Related documentation

- [Authentication and token endpoints](/docs/reference/http/authentication-and-token-endpoints/)
- [Error catalogue and diagnostics](/docs/reference/operations/error-catalogue-and-diagnostics/)
- [OpenAPI and endpoint discovery](/docs/guides/discovery/openapi-and-endpoint-discovery/)
- [Use the Sapporta CLI](/docs/guides/discovery/use-the-sapporta-cli/)
