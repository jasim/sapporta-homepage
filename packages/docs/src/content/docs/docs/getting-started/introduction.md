---
title: "Welcome to Sapporta"
description: "See how schemas, generated application surfaces, and app-owned TypeScript form one Sapporta project."
---

Sapporta turns TypeScript table definitions into a working database application. The generated project includes authenticated record screens, table APIs, OpenAPI discovery, reporting components, and extension points for ordinary Hono routes and React screens.

> Checkpoint: C00 → C00

## Agent approach

```text
Read the local project instructions and use the Sapporta skill. Starting at C00, implement this outcome: Sapporta turns TypeScript table definitions into a working database application. The generated project includes authenticated record screens, table APIs, OpenAPI discovery, reporting components, and extension points for ordinary Hono routes and React screens. Reach C00, run the validation described on this page, and report changed files and checks. Preserve server-controlled scope fields and use generated APIs for ordinary CRUD.
```

## Review the agent's work

- Sapporta owns the generated table, auth, query, and application-shell integrations.
- The project owns its schema files, migrations, app routes, shared contracts, workflows, and React screens.
- Hono is the generated API server. Drizzle owns SQLite schema and migrations.

## Code approach

Read the two application chains before changing a project:

- A table definition in `packages/api/schema/` produces metadata, record screens, and generated CRUD routes.
- A contract in `packages/shared/` is registered by a handler in `packages/api/app/` and called by a typed client from `packages/frontend/`.

The tutorial first builds a useful two-table application. It then adds one atomic completion workflow, a progress screen, and a report.

## Observe and verify

Identify where a new table, a multi-table action, and a protected screen belong. No project files change at this checkpoint.

## What you built

The application boundary is explicit. Continue by generating a project that exposes these extension points.

Continue with [the related guide](/docs/guides/) or use [the exact reference](/docs/reference/project/generated-project-layout/).
