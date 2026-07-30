# Deployment

## Overview

Three production-valid deployment shapes. The code is identical; only static
site/API location and the browser's path to the API differ, so promotion needs
no rewrite.

- **(a) Single process** — one Hono process serves prebuilt Astro/Vite files and
  the API on one port, via `pnpm start` by default.
- **(b) Reverse proxy** — nginx/Caddy serves the Astro/Vite files and proxies
  `/api/` to Hono, appearing same-origin to the browser.
- **(c) Split topology** — the static site runs on a CDN and the API runs on a
  separate host, cross-origin.

Start with (a) unless you have a reason not to.

The generated `Dockerfile` implements shape (a): the image contains
`packages/api/dist/`, `packages/docs/dist/`, and `packages/frontend/dist/`. At
startup it applies Drizzle migrations with the API package's local
`drizzle-kit` binary, then runs `node dist/boot.js` from `packages/api/`. Hono
serves `/api/*` and reads the same prebuilt Astro/Vite files that nginx or a CDN
would serve in another topology. Hono does not server-render documentation or
application pages. There is no nginx/Caddy proxy inside the image; any proxy is
outside the container for TLS, routing, or load balancing.

## Same-origin vs. cross-origin

The shapes split on one question: does the browser see the static site and API
on the same origin?

- (a) and (b) are same-origin; they differ only in who serves the static assets (Hono or a proxy), which the browser can't see.
- (c) is cross-origin.

Same-origin means:

- **No frontend env var for the API location** — relative `fetch("/api/foo")` works.
- **No cross-origin API URL** — the browser does not need to know a separate API host.

Shape (c) loses both; its extra configuration follows from that.

## Environment files

`sapporta init` creates two env files:

- `.env.development` — loaded by `pnpm dev` with Node's built-in `--env-file`.
  It contains local-only values, including a generated `BETTER_AUTH_SECRET`.
- `.env.production.example` — placeholder production values. Copy the values
  into your deployment environment; `pnpm start` does not load development env.

Email verification is required by default when `NODE_ENV=production` and is
not required in other modes. Set `SAPPORTA_REQUIRE_VERIFIED_EMAIL=true` or
`false` to override that default explicitly.

`SAPPORTA_API_PORT` is the explicit application setting for the Hono listener.
If it is absent, Sapporta accepts the conventional `PORT` value assigned by
managed hosting platforms. The API defaults to `3000` when neither is set. If
both variables are present, they must contain the same port so deployment
configuration cannot silently disagree.

`SAPPORTA_PUBLIC_APP_URL` is the public browser-facing app origin. Sapporta
uses it as Better Auth's public base URL and as the server-owned return URL for
auth emails. It must be an origin only, such as `https://app.example.com`, and
`/api/auth/*` must be reachable from that origin.

`SAPPORTA_FRONTEND_ORIGINS` is the list of browser origins allowed to make
credentialed API/auth requests in addition to `SAPPORTA_PUBLIC_APP_URL`.

In development, set `SAPPORTA_PUBLIC_APP_URL` to the Vite frontend-server origin
and `SAPPORTA_FRONTEND_PORT` to the same port. Vite proxies `/api/*` to Hono, so
auth links like `/api/auth/verify-email` work from the public dev origin. Set
`SAPPORTA_FRONTEND_ORIGINS` only when you need additional browser origins.

`VITE_API_URL` is different: it is baked into the browser bundle only when the
SPA and API are deployed to different origins. It is not used in development or
same-origin production.

`SAPPORTA_API_URL` belongs to API clients such as the Sapporta CLI and
automation. Set it in the client process, or pass `--api-url` for one command.
The running application does not read it to choose its own port; that is the
role of `SAPPORTA_API_PORT` or its hosting-compatible `PORT` fallback.

## The static compatibility host

`packages/api/static-site.ts` is the single-process compatibility host for the
prebuilt Astro and Vite output. Its role shifts by shape:

- **(a):** active — the mechanism that lets one Hono process answer both HTML and API.
- **(b):** inert (the proxy intercepts static requests first), but **keep it** so `pnpm start` alone still works for prod smoke tests, proxy-less Docker images, etc.
- **(c):** dead code — remove the `mountStaticSite(...)` call from `boot.ts`;
  leaving it obscures what the API process does.

## Runtime route ownership

The API process keeps only surfaces that depend on runtime state, request
identity, or the live Sapporta catalog. A reverse proxy should not replace
these with static files:

| Surface                                                          | Why it remains dynamic                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `/api/auth/*`                                                    | Better Auth sessions, sign-in, callbacks, verification, and password workflows. |
| `/api/auth-bootstrap`                                            | Reads whether the application database already contains auth setup.             |
| `/api/auth-context*` and `/api/auth-tokens*`                     | Resolve the current principal/workspace or mutate scoped access tokens.         |
| `/api/meta/*`, `/api/tables/books/*`, and `/api/tables/quotes/*` | Expose the live Sapporta catalog and read/write the Books/Quotes database.      |
| `/api/openapi.json` and privileged framework tools               | Describe or operate the routes mounted by the running application.              |
| `/health`                                                        | Reports process/database readiness under the configured health policy.          |
| `/api/hello`                                                     | Intentional authenticated sample that proves the request ability boundary.      |
| `/api/public-api-sample`                                         | Intentional live public-API sample used by the React `/public` screen.          |

The last two responses contain constant text, but their purpose is to exercise
the API/auth integration. Remove their route, shared contract, browser client,
and sample screen together when that demonstration is no longer useful; do not
silently shadow an `/api/*` contract with a static file.

Everything else delivered by `mountStaticSite(...)` is already a build
artifact. The homepage HTML is static even though its client-only Books grid
loads live table metadata and rows after hydration.

## Shape (a) — Single process (default)

One Hono process serves `/api/*` and the prebuilt Astro/Vite site on a single
`SAPPORTA_API_PORT`; no proxy in front.

```bash
pnpm build                 # Astro/Vite static output plus compiled API
pnpm --filter ./packages/api db:migrate
SAPPORTA_API_PORT=3000 pnpm start  # node packages/api/dist/boot.js
```

The browser loads the static site from `http://your-host:3000/`, and its
relative `fetch("/api/foo")` calls hit the same process.

- **Good for:** personal projects, small/medium deployments, Fly.io, Railway, a VPS, a single Docker container.
- **Trade-off:** static and API tiers scale together. Rarely an issue; if it
  becomes one, promote to (b) or (c).

### Docker image

Scaffolded projects include a production `Dockerfile` for this same-origin
shape. It builds the shared package, Astro docs, API, and frontend, installs
production dependencies, copies both static builds into the runtime image,
exposes port `3000`, runs migrations with Drizzle Kit, starts the API, and
health-checks `/`. At runtime the image accepts either `SAPPORTA_API_PORT` or
the conventional `PORT` assigned by a host. The runtime image does not run
`pnpm`; the container starts with:

```bash
cd packages/api && ./node_modules/.bin/drizzle-kit migrate && node dist/boot.js
```

```bash
docker build -t sapporta-homepage-app .
docker run --rm \
  -p 3000:3000 \
  -v sapporta-homepage-app-data:/app/data \
  -e BETTER_AUTH_SECRET="replace-with-a-real-secret" \
  -e SAPPORTA_PUBLIC_APP_URL="http://localhost:3000" \
  -e SAPPORTA_MAIL_TRANSPORT="disabled" \
  -e SAPPORTA_MAIL_FROM="Sapporta <no-reply@example.com>" \
  sapporta-homepage-app
```

Then open `http://localhost:3000/`. The static site and API are same-origin: browser
requests to `/api/*` go to the Hono process in the same container. `VITE_API_URL`
is not needed for this Docker shape.

Keep `/app/data` on a named volume or bind mount. Without that volume, SQLite
data is tied to the container filesystem and disappears when the container is
replaced.

If you put nginx, Caddy, a platform router, or a load balancer in front of the
container, proxy the public origin to the container port. That external proxy
does not change the browser contract: `/` and `/api/*` still share one public
origin, so frontend API calls remain relative.

## Shape (b) — Reverse proxy (nginx, Caddy, etc.)

A reverse proxy serves `packages/docs/dist/` and `packages/frontend/dist/`
directly and proxies `/api/` and `/health` to Hono (still run via
`SAPPORTA_API_PORT=3000 pnpm start`).

```nginx
server {
    listen 80;
    server_name example.com;
    # See deploy/nginx.conf.example for the complete location map.
}
```

Use [`deploy/nginx.conf.example`](./deploy/nginx.conf.example) as the actual
starting configuration. This project has two static roots with different
fallback rules:

- `packages/docs/dist/` owns `/`, `/robots.txt`, `/docs/*`, `/grid/*`,
  `/_astro/*`, `/assets/*`, `/pagefind/*`, sitemaps, and the LLM indexes.
- `packages/frontend/dist/` owns `/app-assets/*` and the React Router fallback
  for application routes such as `/welcome`, `/tables/*`, and `/reports/*`.
- Hono owns `/api/*` and `/health`.

The example also supplies Markdown content types, documentation discovery
headers, a conservative `Accept: text/markdown` rewrite, and the correct cache
policy. Only `/_astro/*` and `/app-assets/*` are content-hashed and immutable.
Astro public `/assets/*`, Pagefind files with stable names, HTML, Markdown, and
index files revalidate.

- **Good for:** multi-site hosts, TLS via Let's Encrypt, HTTP/2, asset cache headers, gzip/brotli, standard ops hygiene.
- **Trade-off:** extra config surface, but stock nginx carries over to any project.

## Shape (c) — Split topology: static site on a CDN, API on its own host

The Astro/Vite builds ship to a CDN (Cloudflare Pages, Netlify, Vercel, S3 +
CloudFront, …) and the Hono API runs on a separate host — e.g.
`https://app.example.com` for the static site and `https://api.example.com` for
the API.

### 1. Public app origin and trusted origins

Set `SAPPORTA_PUBLIC_APP_URL` on the API server:

```env
SAPPORTA_PUBLIC_APP_URL=https://app.example.com
```

Sapporta includes that origin in Better Auth `trustedOrigins` and uses it for
verification/reset email return URLs. Set `SAPPORTA_FRONTEND_ORIGINS` only for
additional browser origins:

```env
SAPPORTA_FRONTEND_ORIGINS=https://preview.example.com
```

Sapporta's generated `boot.ts` installs exact-origin credentialed CORS and passes
the public origin plus any extra origins to Better Auth as `trustedOrigins`.

### 2. Absolute backend URL baked into the SPA

Relative requests would hit the CDN and 404. Set `VITE_API_URL` in `packages/frontend/.env.production`:

```
VITE_API_URL=https://api.example.com
```

That's the only change needed in the SPA — application code is untouched. `@sapporta/frontend` reads `VITE_API_URL` at build time and exposes `${VITE_API_URL}/api` via `getApiBase()`; both the framework's `uiClient` and your project's client (`createApiClient(yourContract, { baseUrl: getApiBase })` in `packages/frontend/src/api.ts`) take `getApiBase` as their `baseUrl`, so every typed call becomes absolute automatically. Dev mode keeps using relative URLs through Vite's proxy (`packages/frontend/vite.config.ts`), so only the production bundle is affected.

Only `VITE_`-prefixed env vars reach the client bundle — Vite's rule. Don't smuggle secrets through `VITE_*`; they ship in the JS.

### 3. Route auth callbacks from the public origin

Auth email links are generated on `SAPPORTA_PUBLIC_APP_URL`, for example
`https://app.example.com/api/auth/verify-email`. In split topology, configure
the CDN or frontend host to proxy `/api/auth/*` to the API host. This keeps
email links and post-verification redirects on the app's public origin while the
SPA can still call the full API at `VITE_API_URL`.

### 4. Remove the static compatibility mount

Remove the `mountStaticSite(...)` call from `packages/api/boot.ts`. The API
process then exposes only dynamic runtime surfaces.

### 5. Deploy in two halves

- **Static site:** upload both `packages/docs/dist/` and
  `packages/frontend/dist/` with the same route ownership described in shape
  (b). A single unconditional `/* → /index.html` fallback is incorrect because
  it would shadow the Astro homepage and documentation.
- **API:** `tsc` → `packages/api/dist/`. Run `node packages/api/dist/boot.js` with `SAPPORTA_API_PORT`, `BETTER_AUTH_SECRET`, `SAPPORTA_PUBLIC_APP_URL`, and any extra `SAPPORTA_FRONTEND_ORIGINS` set.

Fit:

- **Good for:** global CDN delivery of the static site, independent scaling of
  the static and API tiers, edge caching, separate frontend and backend deploy
  cadences.
- **Trade-offs:** the most moving parts, and CORS misconfiguration is the single most common failure mode. Cookie-based auth gets awkward — `SameSite=None`, `Secure`, and matching origin lists are mandatory and strictly enforced. If you're not sure you need this shape, don't start here.

## Environment variables, by shape

| Variable                          | Read from            | Dev      | (a)      | (b)      | (c)      | Purpose                                                                       |
| --------------------------------- | -------------------- | -------- | -------- | -------- | -------- | ----------------------------------------------------------------------------- |
| `NODE_ENV`                        | API host process env | —        | yes      | yes      | yes      | Runtime mode. `production` requires verified email by default.                |
| `SAPPORTA_API_PORT`               | API host process env | yes      | yes      | yes      | yes      | Port Hono binds to. Defaults to `3000`.                                       |
| `PORT`                            | API host process env | —        | yes      | yes      | yes      | Hosting-platform fallback when `SAPPORTA_API_PORT` is absent.                 |
| `SAPPORTA_FRONTEND_PORT`          | Dev process env      | yes      | —        | —        | —        | Vite frontend-server port. Match it to `SAPPORTA_PUBLIC_APP_URL` in dev.      |
| `BETTER_AUTH_SECRET`              | API host process env | yes      | yes      | yes      | yes      | Better Auth signing secret. Generated only for local development.             |
| `SAPPORTA_PUBLIC_APP_URL`         | API host process env | yes      | yes      | yes      | yes      | Public app origin used for Better Auth links, callbacks, and default trust.   |
| `SAPPORTA_FRONTEND_ORIGINS`       | API host process env | yes      | yes      | yes      | yes      | Extra browser origins trusted for credentialed API/auth requests.             |
| `SAPPORTA_REQUIRE_VERIFIED_EMAIL` | API host process env | optional | optional | optional | optional | Explicit override for the environment-based email verification default.       |
| `SAPPORTA_HEALTH_POLICY`          | API host process env | yes      | optional | optional | optional | Access policy for health endpoints: `public`, `authenticated`, or `disabled`. |
| `SAPPORTA_MAIL_TRANSPORT`         | API host process env | yes      | yes      | yes      | yes      | Mail transport: `stream`, `smtp`, or `disabled`.                              |
| `SAPPORTA_MAIL_FROM`              | API host process env | yes      | yes      | yes      | yes      | Default sender address for Better Auth and custom app emails.                 |
| `SMTP_URL`                        | API host process env | —        | optional | optional | optional | SMTP connection URL. Takes precedence over individual SMTP fields.            |
| `SMTP_HOST`                       | API host process env | —        | optional | optional | optional | SMTP host when `SMTP_URL` is not set and mail transport is `smtp`.            |
| `SMTP_PORT`                       | API host process env | —        | optional | optional | optional | SMTP port when `SMTP_URL` is not set and mail transport is `smtp`.            |
| `SMTP_SECURE`                     | API host process env | —        | optional | optional | optional | Whether SMTP uses TLS from connection start. Must be `true` or `false`.       |
| `SMTP_USER`                       | API host process env | —        | optional | optional | optional | SMTP username.                                                                |
| `SMTP_PASS`                       | API host process env | —        | optional | optional | optional | SMTP password.                                                                |
| `VITE_API_URL`                    | Frontend build env   | —        | —        | —        | yes      | Absolute API origin inlined into the SPA bundle for split deployments.        |

### Email delivery

Generated projects use Nodemailer from `packages/api/mailer.ts`. The development
default is `SAPPORTA_MAIL_TRANSPORT=stream`, which does not deliver mail. It
logs the complete generated email source to the API console for every message,
including Better Auth verification/reset emails and custom app emails.

Production should use `SAPPORTA_MAIL_TRANSPORT=smtp` with `SAPPORTA_MAIL_FROM`
set to an address on a verified sending domain. Configure either `SMTP_URL` or
the individual `SMTP_*` fields. Most providers expose SMTP settings; if you want
a provider-specific SDK, edit `packages/api/mailer.ts` in the generated project.

## Operational concerns (shape-independent)

### Database persistence

`better-sqlite3` stores the database under the project's data directory (resolved by `fromProjectRoot` at boot). In production that directory **must** be on a persistent volume, or the database vanishes on every restart — the single most common deployment bug.

- **Docker:** named volume or bind mount at the data directory.
- **systemd on a VPS:** the default filesystem is already persistent; just don't place the project under `/tmp` or a tmpfs mount.
- **Fly.io / Railway / similar:** attach a persistent volume and point the project root at it.

Back up out-of-band (e.g. `sqlite3 db.sqlite .backup /backups/db-$(date +%F).sqlite`, synced to object storage); SQLite gives a consistent snapshot even while Hono is writing.

### Graceful shutdown

`packages/api/boot.ts` handles `SIGINT` and `SIGTERM`: it closes the HTTP server and the SQLite connection, then re-raises the signal so the process exits with the right status. Docker's stop signal, systemd's `ExecStop`, and `Ctrl-C` all drain in-flight requests cleanly — nothing to change.
