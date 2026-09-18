---
title: "Runtime and deployment contract"
description:
  "Look up build artifacts, start behavior, static/API paths, health, SQLite,
  and container entrypoint."
---

## Identity

Generated workspace scripts, API boot, Vite output, and Dockerfile.

## Contract

- `pnpm build` builds shared, docs when present, API, and frontend packages in
  project-defined order.
- The production API starts from `packages/api/dist/boot.js` and listens on
  `SAPPORTA_API_PORT`, falls back to hosting-platform `PORT`, and defaults to
  3000 when neither is set.
- API routes live under `/api`; the default production process also serves the
  built SPA and fallback routes.
- `NODE_ENV=production` requires verified email by default. An explicit
  `SAPPORTA_REQUIRE_VERIFIED_EMAIL=true` or `false` takes precedence.
- The database is `sqlite.db` in the directory named by `SAPPORTA_DATA_DIR`: an
  absolute path, or a path relative to the project root. The variable has no
  default; the server stops when it is unset, and the directory must exist.
- The data directory must live on durable writable storage and be backed up by
  the deployment platform.
- The server prints `Database: <path>` after its ready line.
- The generated container image sets `SAPPORTA_DATA_DIR=/app/data`. Its command
  migrates once, then starts the API process.
- Health access follows `SAPPORTA_HEALTH_POLICY`; shutdown closes HTTP, mail,
  and database resources.

## Related documentation

- [Production builds and deployment](/docs/guides/operations/production-builds-and-deployment/)
- [Environment variables](/docs/reference/project/environment-variables/)
