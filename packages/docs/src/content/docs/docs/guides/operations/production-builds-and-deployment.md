---
title: "Production builds and deployment"
description:
  "Build and run the generated application in a supported production topology."
---

A Sapporta production build contains the shared package, API JavaScript, and
frontend assets. The default Hono process serves both the SPA and `/api/*`, so
the first deployment can use one process and one public origin.

This guide explains the build artifacts, release order, durable SQLite storage,
health checks, and the point at which a proxy or split frontend becomes useful.
You can apply it to a VM, a managed Node host, or the generated Docker image.

```text
Prepare this Sapporta app for a same-origin production release. Build it,
identify durable database storage, apply reviewed migrations once, start the
API, and smoke-test health, auth, one generated route, and one app route.
```

## Use the same-origin shape first

`pnpm build` compiles project packages in workspace order. `pnpm start` runs
`packages/api/dist/boot.js`, which serves the built frontend and API from one
origin. Relative browser requests continue to use `/api/...`, and the build does
not need `VITE_API_URL`.

```bash
pnpm build
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
pnpm start
```

Migration generation does not belong in this sequence. The release applies SQL
already generated, reviewed, and committed during development.

Configure the API process with production values:

```ini
BETTER_AUTH_SECRET=<long-production-secret>
SAPPORTA_PUBLIC_APP_URL=https://tasks.example.com
SAPPORTA_API_PORT=3000
SAPPORTA_MAIL_TRANSPORT=smtp
SAPPORTA_MAIL_FROM=Task App <no-reply@tasks.example.com>
```

SQLite must live on a durable writable volume. Replacing a container or
ephemeral instance must not replace the database. Backups also live outside the
application process and are tested independently from application rollback.

## Smoke-test the released surface

Check the public health policy and browser shell, then use authenticated
discovery for protected routes:

```bash
curl --fail https://tasks.example.com/health
curl --fail https://tasks.example.com/
pnpm exec sapporta \
  --api-url https://tasks.example.com \
  --api-token "$SAPPORTA_API_TOKEN" \
  endpoints show "POST /api/tasks/{id}/complete"
pnpm exec sapporta \
  --api-url https://tasks.example.com \
  --api-token "$SAPPORTA_API_TOKEN" \
  api get /api/reports/project-progress
```

<!--
Screenshot brief
Suggested asset: /assets/guides/operations/production-smoke-test.png
Setup: Deploy the tutorial task app to a temporary same-origin environment with durable SQLite storage and a test workspace.
Frame: Show the loaded project-progress screen with the browser address bar and a terminal containing the successful health check and endpoint discovery.
Visible proof: The SPA and API share one public origin, the report renders, and the custom endpoint is mounted in the released process.
Alt text: Same-origin Sapporta production deployment with a working project report, health check, and discovered custom endpoint.
-->

A reverse proxy can serve static assets and forward `/api/*` while remaining
same-origin to the browser. A split deployment builds the frontend with
`VITE_API_URL`, configures exact credentialed origins, and routes public auth
callbacks correctly. Those shapes add operational parts and are appropriate when
hosting or independent scaling requires them.

The release is complete when code, schema, public URLs, and durable storage
agree. The subtle operational fact is that application rollback does not reverse
destructive migration SQL, which makes the pre-migration backup a separate
release artifact. Continue with
[deployed migrations](/docs/guides/operations/run-migrations-in-deployed-environments/)
and
[application configuration](/docs/guides/operations/application-configuration/).

## Related reference

- [Runtime and deployment contract](/docs/reference/operations/runtime-and-deployment-contract/)
- [Environment variables](/docs/reference/project/environment-variables/)
