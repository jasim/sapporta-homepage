---
title: "Agent Access"
description:
  "Connect the CLI, coding agents, CI, and scripts to protected Sapporta APIs."
---

Use an agent token when a non-browser caller needs to reach protected Sapporta
APIs. The token identifies one user in one active workspace, and every request
still goes through the app's normal route permissions and row-security rules.

## When you need an agent token

Use an agent token for:

- the Sapporta CLI against a protected app
- coding agents, CI, scheduled jobs, or scripts that call table, report, or
  custom APIs
- protected local development checks that should behave like a workspace user

Local unauthenticated development may not need a token, but protected routes
should still be tested with one before you rely on their behavior.

## Select the target app

API-backed CLI commands call the selected running app. If you do not configure
anything, the CLI uses:

```txt
http://localhost:3000
```

Set `SAPPORTA_API_URL` for remote apps or non-default local ports:

```bash
export SAPPORTA_API_URL="https://app.example.com"
pnpm exec sapporta endpoints list
```

For a single command, pass `--api-url`; command flags override environment
variables:

```bash
pnpm exec sapporta --api-url "https://app.example.com" endpoints list
```

If a command fails with `APP_SERVER_UNREACHABLE`, fix the selected URL, server
state, or network path before diagnosing auth, schema, filters, or route code.

## Create and use a token

Create tokens from the account profile page while signed in to the workspace the
caller should use. In local projects, that page is usually on the frontend
origin:

```txt
http://localhost:5173/account/profile
```

The raw token is shown once. Store it outside the repository and pass it as
`SAPPORTA_API_TOKEN`:

```bash
export SAPPORTA_API_URL="https://app.example.com"
export SAPPORTA_API_TOKEN="spat_..."

pnpm exec sapporta endpoints list
pnpm exec sapporta tables list
```

For a one-off command, use `--api-token`:

```bash
pnpm exec sapporta --api-token "spat_..." tables list
```

Do not commit, print, or store agent tokens in the project repository. If a
token is lost or exposed, revoke it from the account profile page and create a
replacement.

## Workspace scope

An agent token belongs to one user and one active workspace. Ordinary CLI and
API calls do not send a workspace id; the token selects the trusted row
boundary.

To work in another workspace, switch workspace in the app and create a new token
for that workspace. Do not add `workspace_id`, `workspaceId`,
`scoped_to_user_id`, or `scopedToUserId` to request bodies or query strings. The
token selects the row boundary, and route abilities still decide which actions
are allowed inside that boundary.

## Auth failures

Fix auth failures before composing table, report, SQL, or custom endpoint
requests.

| Code                 | Next action                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `unauthenticated`    | Set `SAPPORTA_API_TOKEN`, replace the token, or check that the caller sends `Authorization: Bearer ...`.          |
| `token_expired`      | Create a new token and update the secret store.                                                                   |
| `token_revoked`      | Stop using the revoked token and create a replacement if the caller still needs access.                           |
| `workspace_required` | Sign in, switch to a valid workspace, and create a token for that active workspace.                               |
| `forbidden`          | Use an account or token whose role can call that API surface, or change the app's permission policy deliberately. |

Direct local database inspection is developer or admin debugging. It is not a
substitute for checking what a workspace user can do through protected APIs.

## Browser-only token management

Token create, list, and revoke routes are interactive browser-session workflows.
Bearer-token callers can use protected table APIs, report routes, custom product
routes, OpenAPI discovery, and SQL tooling when their permissions allow it, but
they should not manage other tokens.
