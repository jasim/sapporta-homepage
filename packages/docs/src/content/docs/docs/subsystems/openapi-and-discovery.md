---
title: "OpenAPI And Discovery"
description:
  "Inspect the live Sapporta API with OpenAPI, sapporta describe, protected
  credentials, and missing-route debugging."
---

Sapporta exposes the running app's API contract at `/api/openapi.json`.
`pnpm exec sapporta describe` reads that document and prints the parts builders
usually need while developing or debugging integrations.

## The live API contract

The OpenAPI document includes table routes, metadata routes, SQL tooling,
route-based reports, and custom app-owned routes. It reflects the API your
running server will accept, including routes you added to the app.

Fetch the raw document when you are wiring an HTTP client or checking a schema:

```bash
curl -fsS \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/openapi.json"
```

In protected apps, `/api/openapi.json` is protected like table, SQL, report, and
custom routes. Use the same token you use for data commands.

## Using `sapporta describe`

Run the project-local CLI from your app:

```bash
pnpm exec sapporta describe
```

Describe one endpoint by passing `METHOD /path`. Quote the selector so the shell
keeps it as one argument:

```bash
pnpm exec sapporta describe "GET /api/tables/customers"
pnpm exec sapporta describe "POST /api/invoices/{id}/void"
pnpm exec sapporta describe "GET /api/reports/trial-balance"
```

The selector matches the OpenAPI path. Use the path shape printed by
`pnpm exec sapporta describe`; path parameters usually appear with braces, such
as `{id}`. The CLI also accepts a path-only target when only one method exists
for that path, but `METHOD /path` avoids ambiguity.

## Target local and deployed apps

By default, the CLI calls `http://localhost:3000`.

Use environment variables for a shell session:

```bash
export SAPPORTA_API_URL="https://app.example.com"
export SAPPORTA_API_TOKEN="spat_..."

pnpm exec sapporta describe
```

Use flags for one command:

```bash
pnpm exec sapporta describe \
  --api-url "https://app.example.com" \
  --api-token "spat_..."
```

Flags override environment variables.

## Protected discovery

Agent access tokens are created from the account profile screen. The raw token
is shown once. Store it outside the repository as `SAPPORTA_API_TOKEN`.

An agent token belongs to one user and one workspace. Ordinary CLI, table,
report, and custom endpoint calls do not send a workspace id; the token selects
the active workspace boundary. To inspect another workspace, switch to that
workspace in the app and create a separate token.

Auth failures return structured codes:

| Code                 | Meaning                                                     |
| -------------------- | ----------------------------------------------------------- |
| `unauthenticated`    | No usable session or bearer token was supplied.             |
| `token_expired`      | Create a replacement token.                                 |
| `token_revoked`      | Stop using that token and create another if needed.         |
| `workspace_required` | The token no longer maps to a valid workspace membership.   |
| `forbidden`          | The account or token lacks permission for that API surface. |

Fix auth failures before composing data requests. A failed discovery call means
the integration does not yet know the deployed contract.

## Debug missing routes

If a custom endpoint is absent from `describe`, check the files that make the
route available:

| Symptom                                            | Check                                                                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `describe` does not list the endpoint              | The contract file is imported by the backend route and registered with `api.register(...)`.                               |
| Frontend cannot import the contract                | The contract is re-exported from `packages/shared/src/contracts/index.ts`.                                                |
| Route file exists but endpoint is absent           | The route is connected from `loadApp()` in `packages/api/app.ts`.                                                         |
| Endpoint works but is absent from `describe`       | The handler may need a shared contract registered with `api.register(...)`.                                               |
| Path appears as `/api/api/...` or cannot be called | Remove `/api` from the contract path; app contract paths should start at the product route, such as `/invoices/:id/void`. |

After changing a route, run:

```bash
pnpm exec sapporta describe
pnpm exec sapporta describe "METHOD /api/path"
```

The CLI cannot invoke custom app-owned endpoints directly. Use `describe` to
inspect them, then call the route with `curl`, a typed frontend client, or
another HTTP client.
