---
title: "Application configuration"
description:
  "Configure local, same-origin, and split-origin application environments."
---

Configuration belongs to the process that consumes it: API runtime, frontend
build, or API client. Two variables may both contain URLs and still describe
different edges of the system.

## Give each process its own values

| Value                             | Read by             | Purpose                                                        |
| --------------------------------- | ------------------- | -------------------------------------------------------------- |
| `NODE_ENV`                        | API process         | Runtime mode; `production` requires verified email by default  |
| `SAPPORTA_REQUIRE_VERIFIED_EMAIL` | API process         | Explicit boolean override for the email-verification default   |
| `SAPPORTA_API_PORT`               | API process         | Hono listener; falls back to `PORT`, then 3000                 |
| `SAPPORTA_FRONTEND_PORT`          | Development command | Vite listener                                                  |
| `SAPPORTA_PUBLIC_APP_URL`         | API process         | Public browser origin for auth links and default trust         |
| `SAPPORTA_FRONTEND_ORIGINS`       | API process         | Additional exact origins allowed to send credentialed requests |
| `VITE_API_URL`                    | Frontend build      | API origin for a split deployment; `getApiBase()` adds `/api`  |
| `SAPPORTA_API_URL`                | CLI or automation   | Target running API; it does not configure the server listener  |

Only values prefixed with `VITE_` can enter the built browser bundle. Treat
every such value as public. `BETTER_AUTH_SECRET`, SMTP credentials, agent
tokens, and database settings belong to the API or client process that uses
them.

## Configure the common topologies

Local development uses the Vite origin as the public app URL. Vite proxies
relative `/api/*` requests to Hono.

```ini
SAPPORTA_API_PORT=3000
SAPPORTA_FRONTEND_PORT=5173
SAPPORTA_PUBLIC_APP_URL=http://localhost:5173
SAPPORTA_MAIL_TRANSPORT=stream
SAPPORTA_MAIL_FROM=Task App <no-reply@example.com>
```

Same-origin production serves the built SPA and API from one public origin. It
does not need `VITE_API_URL`.

```ini
NODE_ENV=production
SAPPORTA_API_PORT=3000
SAPPORTA_PUBLIC_APP_URL=https://tasks.example.com
SAPPORTA_MAIL_TRANSPORT=smtp
SAPPORTA_MAIL_FROM=Task App <no-reply@tasks.example.com>
```

A split deployment builds the SPA with an absolute API origin. The API still
uses the browser-facing app origin for auth links and adds any other deliberate
credentialed origins explicitly.

```ini
# API process
SAPPORTA_PUBLIC_APP_URL=https://tasks.example.com
SAPPORTA_FRONTEND_ORIGINS=https://preview.tasks.example.com

# Frontend build process
VITE_API_URL=https://api.tasks.example.com
```

`SAPPORTA_PUBLIC_APP_URL` and `VITE_API_URL` are origins. Do not include a path,
query, trailing slash, or `/api`. If both `SAPPORTA_API_PORT` and a
hosting-platform `PORT` are set, they must contain the same number.

Email verification follows `NODE_ENV` when `SAPPORTA_REQUIRE_VERIFIED_EMAIL` is
absent: production requires verification, and other modes do not. Set the
override to the literal `true` or `false` when the application needs a policy
independent of its runtime mode.

## Observe the resolved topology

Start the chosen configuration, open the app, and inspect one request in the
browser Network panel. Local and same-origin requests use `/api/...`; split
deployments resolve to the absolute API host through `getApiBase()`.

```bash
pnpm dev
pnpm exec sapporta --api-url http://localhost:3000 endpoints list
```

`VITE_API_URL` is embedded in browser code at build time. `SAPPORTA_API_URL`
selects a target for the CLI process. Neither controls the API listener.

## Related reference

- [Environment variables](/docs/reference/project/environment-variables/)
- [Configuration index](/docs/reference/indexes/configuration/)
