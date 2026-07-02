---
title: "Deployment"
description:
  "Configure, deploy, and operate your Sapporta application in production."
---

## Configure environments

Treat production configuration as part of the release, not as an afterthought. A
Sapporta app is an ordinary TypeScript workspace, but the API process owns
secrets, auth policy, mail delivery, health policy, and the SQLite connection.
The frontend only receives values that are intentionally baked into the Vite
bundle.

The generated app gives you two starting points:

- `.env.development` for local `pnpm dev`.
- `.env.production.example` as a checklist for the variables your deployment
  platform should provide.

Do not deploy `.env.development`. It contains local defaults such as a
development `BETTER_AUTH_SECRET`, a Vite-facing `SAPPORTA_PUBLIC_BASE_URL`, and
`SAPPORTA_MAIL_TRANSPORT=stream`.

Set these values for the API host in production:

| Variable                          | Required               | Purpose                                                                                                                          |
| --------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                            | Optional               | Port for the Hono server. Defaults to `3000`.                                                                                    |
| `BETTER_AUTH_SECRET`              | Yes                    | Better Auth signing secret. Generate a real production secret.                                                                   |
| `SAPPORTA_PUBLIC_BASE_URL`        | Yes                    | Browser-facing app origin, such as `https://app.example.com`. Auth links, callbacks, and default trusted origins use this value. |
| `SAPPORTA_FRONTEND_ORIGINS`       | Optional               | Comma-separated extra browser origins allowed to make credentialed API requests. Use exact origins only.                         |
| `SAPPORTA_REQUIRE_VERIFIED_EMAIL` | Optional               | `true` or `false`. Defaults to requiring verified email.                                                                         |
| `SAPPORTA_HEALTH_POLICY`          | Optional               | `public`, `authenticated`, or `disabled`. Defaults to `public`.                                                                  |
| `SAPPORTA_MAIL_TRANSPORT`         | Yes for mail           | `smtp`, `stream`, or `disabled`. Use `smtp` for delivered production mail.                                                       |
| `SAPPORTA_MAIL_FROM`              | Yes for mail           | Sender address for auth and app email.                                                                                           |
| `SMTP_URL` or `SMTP_*`            | When using SMTP        | SMTP connection settings for delivered email.                                                                                    |
| `VITE_API_URL`                    | Split deployments only | Absolute API origin baked into the frontend bundle. Do not put secrets in `VITE_*` variables.                                    |

`SAPPORTA_PUBLIC_BASE_URL` must be an origin only: `https://app.example.com`,
not `https://app.example.com/anything`. The generated auth environment parser
rejects paths, query strings, fragments, and malformed origins.

Credentialed browser requests also require exact origins. Do not use wildcard
CORS for authenticated traffic. In same-origin deployments you usually do not
need an extra origin at all. In split deployments, set the public app origin and
any preview origins explicitly.

For CLI, CI, or agent access to a protected deployed app, create an agent access
token from the account profile screen and store it outside source control:

```bash
export SAPPORTA_API_URL="https://app.example.com"
export SAPPORTA_API_TOKEN="spat_..."

pnpm exec sapporta describe
pnpm exec sapporta tables
```

Each token belongs to one user and one workspace. Revoke and replace tokens when
workspace membership, role, or automation ownership changes.

## Deploy with one server

Start here unless you have a clear reason to split the app. In the default
production shape, one Hono process serves both `/api/*` and the built React app
from one public origin.

Build the workspace, apply migrations, then start the API package:

```bash
pnpm build
pnpm --filter ./packages/api db:migrate
PORT=3000 pnpm start
```

The generated `packages/api/boot.ts` finds the project root, opens
`data/sqlite.db`, loads tables and reports, checks migration readiness, mounts
auth and app routes under `/api`, exposes the OpenAPI document, and serves
`packages/frontend/dist/` with an SPA fallback.

In this shape the browser never needs to know a separate API host. Frontend code
calls relative paths such as `/api/tables/customers`, and those requests hit the
same origin that served the page. Do not set `VITE_API_URL` for this deployment
shape.

If you put a platform router, load balancer, Caddy, or nginx in front of the
Node process, keep the public contract the same:

- `/` and React routes serve the frontend.
- `/assets/*` serves Vite's content-hashed assets.
- `/api/*` forwards to the Sapporta API process.
- `/health` is available according to `SAPPORTA_HEALTH_POLICY`.

A reverse proxy can serve `packages/frontend/dist/` directly and proxy only
`/api/*` to Node. That is still a same-origin deployment from the browser's
point of view, so frontend API calls stay relative.

For nginx, the important shape is:

```nginx
server {
    listen 80;
    server_name app.example.com;
    root /var/www/my-app/packages/frontend/dist;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /assets/ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        try_files $uri /index.html;
        add_header Cache-Control "no-cache";
    }
}
```

Keep `index.html` fresh and let `/assets/*` cache aggressively. Vite hashes
asset filenames, but `index.html` points at the current hashes for the active
release.

## Deploy frontend and API separately

Use a split deployment when the React app belongs on a CDN or static host and
the API belongs on a separate service, for example:

- Frontend: `https://app.example.com`
- API: `https://api.example.com`

This is a cross-origin browser deployment, so you must configure both halves.

On the API host, set the public app origin and any additional browser origins:

```text
SAPPORTA_PUBLIC_BASE_URL=https://app.example.com
SAPPORTA_FRONTEND_ORIGINS=https://preview.example.com
```

On the frontend build, set the API origin before running Vite:

```text
VITE_API_URL=https://api.example.com
```

Sapporta frontend clients use `getApiBase()`. With no `VITE_API_URL`, it returns
relative `/api` paths for development and same-origin production. With
`VITE_API_URL`, the production bundle calls the absolute API origin.

Do not put secrets in `VITE_API_URL` or any other `VITE_*` variable. Vite
inlines those values into browser JavaScript.

Auth callbacks need special attention. Better Auth email links are generated
from `SAPPORTA_PUBLIC_BASE_URL`, so verification and reset links look like:

```text
https://app.example.com/api/auth/verify-email
```

In a split deployment, configure the CDN or frontend host to proxy `/api/auth/*`
to the API host. That keeps auth email links on the public app origin while the
SPA can still call the API with `VITE_API_URL`.

For the frontend host, upload `packages/frontend/dist/` and configure an SPA
fallback so hard reloads of React routes return `index.html`. For the API host,
run only the compiled API with production environment variables:

```bash
pnpm --filter ./packages/shared build
pnpm --filter ./packages/api build
pnpm --filter ./packages/api db:migrate
node packages/api/dist/boot.js
```

When the API is permanently split from the frontend, you can remove the
`serveStatic` block from `packages/api/boot.ts`. Leaving it does not help the
split runtime, and removing it makes the API process' responsibility clearer.

## Run with Docker

Generated projects include a production `Dockerfile` for the default same-origin
shape. The image builds the shared package, compiles the API, builds the
frontend, installs runtime dependencies, copies migrations and assets, exposes
`PORT=3000`, and starts:

```bash
cd packages/api && ./node_modules/.bin/drizzle-kit migrate && node dist/boot.js
```

Build and run it with a persistent volume mounted at `/app/data`:

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

For production, set `SAPPORTA_PUBLIC_BASE_URL` to the HTTPS origin users open,
set a real mail transport if the app sends verification or reset emails, and
store secrets in your platform's secret manager.

The volume is not optional. The default SQLite database lives at
`/app/data/sqlite.db` in the container. Without a named volume or bind mount,
replacing the container replaces the database.

The generated Docker healthcheck calls `/api/openapi.json`. That endpoint proves
the Hono process booted, Sapporta loaded the project, and OpenAPI discovery is
available. If you want a lighter liveness probe for your platform, use `/health`
and choose its access policy with `SAPPORTA_HEALTH_POLICY`.

## Operate SQLite safely

Sapporta's default database is SQLite through `better-sqlite3`. That is a good
fit for many production apps, but it makes file durability an operational
responsibility.

Keep `data/sqlite.db` on durable storage:

- In Docker, mount `/app/data` as a named volume or bind mount.
- On a VPS or systemd host, keep the project on a normal persistent disk, not
  under `/tmp` or a tmpfs mount.
- On app platforms with ephemeral filesystems, attach a persistent volume before
  accepting production traffic.

Back up the database out of band. SQLite's backup API and the `sqlite3`
`.backup` command produce a consistent snapshot while the app is running:

```bash
sqlite3 data/sqlite.db ".backup '/backups/sqlite-$(date +%F-%H%M).db'"
```

Copy backups to storage outside the host or volume you are protecting. Practice
restores before you need one.

Run migrations before the new server version accepts requests. Sapporta checks
migration readiness while loading the project, but it does not mutate schema at
runtime. The normal release sequence is:

```bash
pnpm --filter ./packages/api db:generate --name add_feature
pnpm --filter ./packages/api db:check
pnpm build
pnpm --filter ./packages/api db:migrate
pnpm start
```

Commit generated migration SQL with the schema change. Review it like
application code, especially for destructive table or column changes.

Use health checks deliberately:

- `/health` returns `{ "status": "ok" }` when enabled.
- `SAPPORTA_HEALTH_POLICY=public` makes `/health` usable by ordinary platform
  probes.
- `SAPPORTA_HEALTH_POLICY=authenticated` requires an authenticated principal.
- `SAPPORTA_HEALTH_POLICY=disabled` returns a not-found response.
- `/api/openapi.json` is a stronger readiness check for internal probes and CLI
  access because protected apps require the same credentials there as they
  require for data commands.

The generated `boot.ts` handles `SIGINT` and `SIGTERM`. On shutdown it closes
the HTTP server, closes the SQLite connection, and re-raises the signal so the
process exits with the expected status. Docker stop, systemd stop, and
interactive `Ctrl-C` all follow that path.

Keep operations boring:

- Build once, then promote the same artifact with environment-specific values.
- Run migrations as a release step, not from request handlers.
- Keep the SQLite file and backups off ephemeral storage.
- Use exact browser origins for credentialed requests.
- Verify the deployed API with `pnpm exec sapporta describe` using an agent
  token when the app is protected.
