---
title: "Production builds and deployment"
description:
  "Build and run the generated application in a supported production topology."
---

A production build contains the shared package, API JavaScript, and frontend
assets. The default Hono process serves the SPA and `/api/*` from one origin.

## Use the same-origin shape first

`pnpm build` compiles project packages in workspace order. `pnpm start` runs
`packages/api/dist/boot.js`, which serves the built frontend and API from one
origin. Relative browser requests continue to use `/api/...`, and the build does
not need `VITE_API_URL`.

```bash
pnpm build
export SAPPORTA_DATA_DIR=/srv/tasks/data
pnpm --filter ./packages/api db:migrate
pnpm start
```

`db:migrate` and `pnpm start` run in the same environment, so both open the
database in the same `SAPPORTA_DATA_DIR`. Migration generation does not belong
in this sequence. The release applies SQL already generated, reviewed, and
committed during development.

Configure the API process with production values:

```ini
NODE_ENV=production
BETTER_AUTH_SECRET=<long-production-secret>
SAPPORTA_PUBLIC_APP_URL=https://tasks.example.com
SAPPORTA_API_PORT=3000
SAPPORTA_DATA_DIR=/srv/tasks/data
SAPPORTA_MAIL_TRANSPORT=smtp
SAPPORTA_MAIL_FROM=Task App <no-reply@tasks.example.com>
```

`NODE_ENV=production` requires verified email when
`SAPPORTA_REQUIRE_VERIFIED_EMAIL` is absent. Set that variable to `true` or
`false` only when the deployment needs an explicit override.

## Put the database on durable storage

The database is `sqlite.db` in the directory `SAPPORTA_DATA_DIR` names. The
directory must exist and be durable and writable; on ephemeral storage the
database disappears on the next restart.

- **Docker:** the generated image sets `SAPPORTA_DATA_DIR=/app/data`. Mount a
  named volume or a bind mount at `/app/data`.
- **systemd:** set `SAPPORTA_DATA_DIR` in the unit's environment, to a directory
  outside `/tmp` and any tmpfs mount.
- **Fly.io, Railway, and similar:** attach a persistent volume and set
  `SAPPORTA_DATA_DIR` to its mount path.

A relative value resolves against the project root, never the working directory.
Absolute paths leave no doubt about which volume holds the data.

One project can serve several databases, one process per data directory: sample
data apart from real data, or one process per customer. Each process, and each
migration job, gets its own `SAPPORTA_DATA_DIR`.

Backups live outside the application process and are tested independently from
application rollback.

## Smoke-test the released surface

The server prints the database it opened right after its ready line:

```text
Database: /srv/tasks/data/sqlite.db
```

Check that the path names the durable volume before sending traffic.

The bare health request below assumes the default public health policy. An
authenticated health policy needs credentials; a disabled policy returns 404.
Keep the token in `SAPPORTA_API_TOKEN` so it does not appear in process
arguments.

```bash
curl --fail https://tasks.example.com/health
curl --fail https://tasks.example.com/
pnpm exec sapporta \
  --api-url https://tasks.example.com \
  endpoints show "POST /api/tasks/{id}/complete"
pnpm exec sapporta \
  --api-url https://tasks.example.com \
  api get /api/reports/project-progress
```

A reverse proxy can serve static assets and forward `/api/*` while remaining
same-origin to the browser. A split deployment builds the frontend with
`VITE_API_URL`, configures exact credentialed origins, and routes public auth
callbacks correctly. Those shapes add operational parts and are appropriate when
hosting or independent scaling requires them.

Application startup runs Sapporta's migration guard. It rejects pending,
missing, or modified migration files. Application rollback does not reverse
destructive SQL, so the pre-migration backup remains a separate release
artifact.

## Related reference

- [Runtime and deployment contract](/docs/reference/operations/runtime-and-deployment-contract/)
- [Environment variables](/docs/reference/project/environment-variables/)
