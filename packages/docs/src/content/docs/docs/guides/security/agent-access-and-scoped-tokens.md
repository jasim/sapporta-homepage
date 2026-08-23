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

## Decide whether the call needs a token

`sapporta endpoints list` and `sapporta endpoints show` read the application
contract at `/api/openapi.json`. The generated `.env.development` sets
`SAPPORTA_OPENAPI_POLICY=public`, so both work against a local development
server with no credential, and their output carries each route's parameters,
request body, and response schemas.

The commands that read or write workspace data need a token in
`SAPPORTA_API_TOKEN`: `rows`, `tables`, `sql`, and `api`. A deployment leaves
`SAPPORTA_OPENAPI_POLICY` unset, which keeps the contract behind sign-in, so
endpoint discovery there needs a token as well.

Only a signed-in person creates a token. A freshly scaffolded project has no
user until someone signs up, and the data commands are unavailable until then.

## Create the token in the intended workspace

An agent access token carries one user and workspace boundary into the CLI, so
the setup begins in the browser rather than the terminal. Open
`/account/profile` in an interactive browser session, switch to the workspace
the caller should represent, and create an agent access token. Give it a name
that identifies the caller and purpose, and add an expiry when the access is
temporary.

After creation, the dialog offers two ways to finish. If a coding agent will
work from this checkout, open the agent at the project root and choose **Copy
setup prompt**. The prompt already contains the application's CLI base URL and
the one-time token, so paste it into that trusted agent before closing the
dialog. If you prefer to configure the environment yourself, choose **Copy
token** and use the manual variables below. Neither route is automatic, and the
plaintext token is not available again after the dialog closes.

Later token-list requests return metadata such as the token's name, workspace,
creation time, expiry, last use, and revocation time. The project database
stores a hash of the secret rather than the raw token.

The `read`, `create`, and `delete` abilities on `agent_access_token` authorize
these interactive token-management actions. Bearer credentials may call ordinary
app APIs, but token-management endpoints reject them with `403 forbidden`.

## Hand the setup prompt to one trusted agent

The setup prompt asks the agent to verify the Sapporta skill and project-local
CLI, then reuse the project's existing directory environment tooling, such as
mise, direnv, or a dotenv runner, to provide `SAPPORTA_API_URL` and
`SAPPORTA_API_TOKEN` to every Sapporta command. If the project has no such tool,
the fallback is a private, gitignored local wrapper rather than a newly
installed environment manager.

From there, the agent records the exact authenticated invocation in `AGENTS.md`
and proves the connection with a read-only command. In a sandboxed agent, that
final check may require explicit network permission for the application URL.

Against a local development server, `endpoints list` succeeds without a
credential and therefore reports reachability rather than the token. Read the
auth context to confirm the token itself:

```bash
pnpm exec sapporta api get '/api/auth-context'
```

The generated setup prompt contains the raw credential by design, so treat the
whole prompt as a secret-bearing handoff. Paste it only into the intended agent
session. The resulting `AGENTS.md` instruction may name an environment tool or
wrapper, but it must never contain the token itself. Keep the credential out of
source files, committed configuration, screenshots, shell history, and later
task prompts.

## Configure the CLI manually

The CLI reads `SAPPORTA_API_URL` and `SAPPORTA_API_TOKEN`. The URL is the
deployment base before `/api`. The generated prompt includes the base URL
derived from the running application; the agent then places it in the project's
private environment tooling. A local development server needs no URL, because
the CLI reads the project's own `SAPPORTA_API_PORT` from `.env.development`.

```bash
export SAPPORTA_API_URL="https://tasks.example.com"
read -s SAPPORTA_API_TOKEN
export SAPPORTA_API_TOKEN

pnpm exec sapporta endpoints show "GET /api/reports/project-progress"
pnpm exec sapporta rows list tasks --output json
```

If you call HTTP directly instead, send a normal bearer header:

```http
GET /api/tables/tasks HTTP/1.1
Host: tasks.example.com
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
- [Develop with a coding agent](/docs/guides/discovery/develop-with-a-coding-agent/)
