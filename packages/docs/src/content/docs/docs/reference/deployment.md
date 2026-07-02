---
title: "Deployment Reference"
description:
  "Lookup deployment shapes, environment variables, release order, Docker notes,
  and health checks."
---

## Deployment reference

Sapporta apps support three deployment shapes:

| Shape          | Browser contract                                | Notes                                      |
| -------------- | ----------------------------------------------- | ------------------------------------------ |
| Single process | SPA and `/api/*` served by one Hono process.    | Default generated app and Docker image.    |
| Reverse proxy  | Proxy serves SPA and forwards `/api/*` to Hono. | Still same-origin to the browser.          |
| Split topology | SPA and API have different origins.             | Set `VITE_API_URL` and exact CORS origins. |

Production release order:

```bash
pnpm build
pnpm --filter ./packages/api db:migrate
PORT=3000 pnpm start
```

For split deployments, build and deploy the frontend separately, then run the
compiled API:

```bash
pnpm --filter ./packages/shared build
pnpm --filter ./packages/api build
pnpm --filter ./packages/api db:migrate
node packages/api/dist/boot.js
```

Important environment variables:

| Variable                                                          | Where               | Purpose                                                                               |
| ----------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------- |
| `PORT`                                                            | API process         | Hono port. Defaults to `3000`.                                                        |
| `BETTER_AUTH_SECRET`                                              | API process         | Better Auth signing secret. Use a real production secret.                             |
| `SAPPORTA_PUBLIC_BASE_URL`                                        | API process         | Browser-facing app origin, such as `https://app.example.com`. Must be an origin only. |
| `SAPPORTA_FRONTEND_ORIGINS`                                       | API process         | Comma-separated extra exact origins for credentialed browser requests.                |
| `SAPPORTA_REQUIRE_VERIFIED_EMAIL`                                 | API process         | `true` or `false`; defaults to `true`.                                                |
| `SAPPORTA_HEALTH_POLICY`                                          | API process         | `public`, `authenticated`, or `disabled`; defaults to `public`.                       |
| `SAPPORTA_MAIL_TRANSPORT`                                         | API process         | `stream`, `smtp`, or `disabled`; `stream` logs mail instead of delivering it.         |
| `SAPPORTA_MAIL_FROM`                                              | API process         | Sender address for auth and app email.                                                |
| `SMTP_URL`                                                        | API process         | SMTP connection URL; takes precedence over individual SMTP fields.                    |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | API process         | SMTP settings when `SMTP_URL` is not set.                                             |
| `VITE_API_URL`                                                    | Frontend build only | Absolute API origin for split deployments. Never put secrets in `VITE_*`.             |

Credentialed CORS must use exact origins. Do not deploy authenticated browser
traffic with wildcard CORS.

The generated Dockerfile builds the API and frontend into one same-origin image.
Mount persistent storage for SQLite data:

```bash
docker build -t my-app .
docker run --rm \
  -p 3000:3000 \
  -v my-app-data:/app/data \
  -e BETTER_AUTH_SECRET="replace-with-a-real-secret" \
  -e SAPPORTA_PUBLIC_BASE_URL="http://localhost:3000" \
  -e SAPPORTA_MAIL_TRANSPORT="disabled" \
  -e SAPPORTA_MAIL_FROM="Sapporta <no-reply@example.com>" \
  my-app
```

Health checks can call `/health` according to `SAPPORTA_HEALTH_POLICY` or
`/api/openapi.json` with credentials when the app is protected.
