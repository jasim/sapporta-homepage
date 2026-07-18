---
title: "Agent access and scoped tokens"
description:
  "Give non-browser callers revocable access to one user and workspace boundary."
---

Agent access tokens let the CLI, CI jobs, scheduled work, and coding agents call
a protected Sapporta API without a browser session. This page follows a token
from creation through use and revocation. You will learn what the token
represents, how to pass it without storing it in the repository, and how to
prove its workspace boundary. The same mechanism supports read-only inspection
and app-owned workflows according to the represented user's existing abilities.

```text
Help me exercise this Sapporta app through a scoped agent token. Discover the running API, list the visible tasks, call one permitted app endpoint, confirm another workspace is absent, and remind me to revoke the token without printing or saving it.
```

## Create the token in the intended workspace

Open `/account/profile` while signed in, switch to the workspace the caller
should represent, and create an agent access token. Give it a name that
identifies the caller and purpose. Add an expiry for temporary work.

The creation response displays the raw `spat_...` token once. Later token lists
return only metadata such as its name, workspace, creation time, expiry, last
use, and revocation time. The project database stores a hash of the secret
rather than the raw value.

<!--
Screenshot brief
Suggested asset: /images/docs/security/create-agent-access-token.png
Setup: Sign in to the task app, select Workspace A, open /account/profile, and open the create-token form. Use the name `Docs task-app check` and a short expiry.
Frame: Capture the profile card immediately after creation with the active workspace name, token name, expiry, and one-time copy control visible. Redact the entire raw token and all personal email data.
Visible proof: The UI states that the secret is shown once and associates the token with the active workspace.
Alt text: The profile screen shows a newly created, expiring agent token for Workspace A with its one-time secret redacted.
-->

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

You can also pass `--api-url` and `--api-token` explicitly in automation. Prefer
the environment or the automation platform's secret input so the credential does
not appear in logs.

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

<!--
Screenshot brief
Suggested asset: /images/docs/security/revoked-agent-token.png
Setup: Use a Workspace A token successfully once, revoke it in the profile screen, then repeat the JSON task-list command with the same token in a disposable terminal session.
Frame: Capture the revoked token metadata in the browser beside the terminal's failed command. Redact the raw token, user email, cookies, and unrelated terminal history.
Visible proof: The token row shows a revoked state and the next API-backed CLI command reports `token_revoked`.
Alt text: A revoked Workspace A agent token is listed in the profile while the terminal shows that its next task-list request is rejected.
-->

The non-browser caller now uses the same OpenAPI routes, abilities, and
row-security boundary as the represented account. The token adds revocable
authentication; it does not add permission. Use separate short-lived tokens for
separate workspaces or automation jobs, rotate them after exposure, and keep
token management in the signed-in profile.

## Related reference

- [Authentication and token endpoints](/docs/reference/http/authentication-and-token-endpoints/)
- [CLI overview](/docs/reference/cli/overview-and-global-options/)
