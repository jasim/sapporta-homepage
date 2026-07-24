---
title: "Agent access and scoped tokens"
description:
  "Give non-browser callers revocable access to one user and workspace boundary."
---

An agent token represents one user in one workspace. It is scoped by identity
and workspace, not by an independent list of actions. The token inherits the
represented membership's complete ability set.

## Create the token in the intended workspace

Open `/account/profile` while signed in, switch to the workspace the caller
should represent, and create an agent access token. Give it a name that
identifies the caller and purpose. Add an expiry for temporary work.

The creation response displays the raw `spat_...` token once. Later token lists
return only metadata such as its name, workspace, creation time, expiry, last
use, and revocation time. The project database stores a hash of the secret
rather than the raw value.


Token creation, listing, and revocation require an interactive browser session.
A bearer token may call ordinary app APIs, but it cannot create, list, or revoke
other tokens.

## Call the same mounted API

Keep the token in an environment variable or secret manager. Do not paste it
into shell history, source files, documentation captures, or commits. The CLI
reads `SAPPORTA_API_URL` and `SAPPORTA_API_TOKEN`:

```bash
export SAPPORTA_API_URL="http://localhost:3000"
read -s SAPPORTA_API_TOKEN
export SAPPORTA_API_TOKEN

pnpm exec sapporta endpoints show "GET /api/reports/project-progress"
pnpm exec sapporta rows list tasks --output json
pnpm exec sapporta api get /api/reports/project-progress
```

Flags remain available, but an environment variable or automation secret input
keeps the credential out of process arguments and logs.

For direct HTTP calls, the authentication shape is a normal bearer header:

```http
GET /api/tables/tasks HTTP/1.1
Host: localhost:3000
Authorization: Bearer spat_<token-id>_<secret>
```

The token resolves to one user and the workspace active when the token was
created. It receives that context's abilities and row visibility. It does not
accept a workspace query parameter and cannot be widened by adding
`workspace_id` to a request.

## Prove the boundary and revoke it

Create the canonical five tasks in Workspace A and at least one different task
in Workspace B. The Workspace A token should return only the five Workspace A
records. To automate against Workspace B, create a separate token while
Workspace B is active.

Return to `/account/profile`, revoke the Workspace A token, and repeat one CLI
command. The next request fails with the documented token-revoked authentication
response. Revocation takes effect on the API; deleting a local environment
variable alone does not revoke a credential.

```bash
unset SAPPORTA_API_TOKEN
```


Revocation produces `token_revoked`; expiry produces `token_expired`; removal
of the represented workspace membership produces `workspace_required`. Use
separate short-lived tokens for separate workspaces or automation jobs.

## Related reference

- [Authentication and token endpoints](/docs/reference/http/authentication-and-token-endpoints/)
- [CLI overview](/docs/reference/cli/overview-and-global-options/)
