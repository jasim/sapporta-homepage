---
title: "Application configuration"
description:
  "Configure local, same-origin, and split-origin application environments."
---

Sapporta configuration is divided between the API process, the frontend build,
and API clients such as the CLI. This guide explains which process reads each
value and how the values change across local, same-origin, and split-origin
deployments.

You will learn to configure listener ports, browser origins, auth links, API
base URLs, and mail without exposing server secrets to the browser bundle. The
result supports local development, a single production process, or a frontend
and API on separate origins.

```text
Configure this Sapporta app for <local, same-origin, or split-origin> use.
Inspect the generated env parser and deployment docs, set each value in the
process that reads it, and verify one browser API request and auth URL.
```

## Give each process its own values

| Value                       | Read by             | Purpose                                                        |
| --------------------------- | ------------------- | -------------------------------------------------------------- |
| `SAPPORTA_API_PORT`         | API process         | Hono listener; falls back to `PORT`, then 3000                 |
| `SAPPORTA_FRONTEND_PORT`    | Development command | Vite listener                                                  |
| `SAPPORTA_PUBLIC_APP_URL`   | API process         | Public browser origin for auth links and default trust         |
| `SAPPORTA_FRONTEND_ORIGINS` | API process         | Additional exact origins allowed to send credentialed requests |
| `VITE_API_URL`              | Frontend build      | Absolute API origin for a split deployment                     |
| `SAPPORTA_API_URL`          | CLI or automation   | Target running API; it does not configure the server listener  |

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

`SAPPORTA_PUBLIC_APP_URL` accepts an origin only. Do not include a path, query,
or trailing slash. If both `SAPPORTA_API_PORT` and hosting-platform `PORT` are
set, they must contain the same number.

## Observe the resolved topology

Start the chosen configuration, open the app, and inspect one request in the
browser Network panel. Local and same-origin requests use `/api/...`; split
deployments resolve to the absolute API host through `getApiBase()`.

```bash
pnpm dev
pnpm exec sapporta --api-url http://localhost:3000 endpoints list
```

<!--
Screenshot brief
Suggested asset: /assets/guides/operations/application-configuration.png
Setup: Run the task app in local development with the Vite proxy and sign in.
Frame: Show the browser Network details for one authenticated /api request, including the Vite request origin and successful response status. Keep cookies and authorization values hidden.
Visible proof: The browser stays on the configured public app origin while the relative API request succeeds through the development proxy.
Alt text: Browser network panel showing a successful Sapporta API request through the local Vite proxy.
-->

Configuration works when all public URLs describe one topology. The subtle
distinction is that `VITE_API_URL` configures built browser code while
`SAPPORTA_API_URL` configures a CLI caller; neither controls the API listener.
Continue with
[production deployment](/docs/guides/operations/production-builds-and-deployment/)
or [email services](/docs/guides/operations/email-and-runtime-services/).

## Related reference

- [Environment variables](/docs/reference/project/environment-variables/)
- [Configuration index](/docs/reference/indexes/configuration/)
