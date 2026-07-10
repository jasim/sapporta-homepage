---
title: "Tour the generated project"
description: "Locate schema, migration, contract, route, auth, client, and screen extension points in a generated project."
---

The generated workspace has a one-way dependency boundary: the API and frontend may import the shared package, while the shared package contains no server, database, or React I/O.

> Checkpoint: C01 → C02

## Agent approach

```text
Read the local project instructions and use the Sapporta skill. Starting at C01, implement this outcome: The generated workspace has a one-way dependency boundary: the API and frontend may import the shared package, while the shared package contains no server, database, or React I/O. Reach C02, run the validation described on this page, and report changed files and checks. Preserve server-controlled scope fields and use generated APIs for ordinary CRUD.
```

## Review the agent's work

- `packages/api/schema/` owns table definitions; `packages/api/migrations/` owns generated SQL.
- `packages/api/app.ts` mounts project routes; `packages/api/authz/` owns abilities and request authority.
- `packages/frontend/src/App.tsx` owns app navigation and public/protected routes.

## Code approach

```text
packages/
  api/       schema, migrations, auth, app routes, runtime services
  shared/    browser-safe contracts and wire types
  frontend/  typed clients, navigation, routes, and React screens
```

Run the clean baseline build before changing the schema:

```bash
pnpm build
```

## Observe and verify

The build passes and each future change has one clear package boundary. Fix baseline failures before continuing.

## What you built

The project is at C02. The next page adds the first domain tables and reviews their generated migration.

Continue with [the related guide](/docs/guides/discovery/develop-with-a-coding-agent/) or use [the exact reference](/docs/reference/project/generated-project-layout/).
