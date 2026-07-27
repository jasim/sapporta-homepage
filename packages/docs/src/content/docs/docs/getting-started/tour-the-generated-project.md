---
title: "Tour the generated project"
description:
  "Inspect the generated Sapporta workspace and use its welcome screen to start
  building a task management application."
---

A Sapporta app is a pnpm workspace with a Hono API, a React frontend, and a
shared package for API contracts and wire types.

```text
task-app/
  sapporta.json
  package.json
  pnpm-workspace.yaml
  CODING-PRINCIPLES.md
  VISUAL-DESIGN-GUIDELINES.md
  .env.development
  data/
  packages/
    api/
      app/
      authz/
      migrations/
      project-auth/
      schema/
    frontend/
      src/
        query-client.ts
    shared/
      src/
        contracts/
  scripts/
  Dockerfile
  DEPLOYMENT.md
```

The API and frontend can import the shared package. The shared package contains
browser-safe contracts and wire types, with no server, database, or React I/O.

The main extension points are:

- `packages/api/schema/` for table definitions
- `packages/api/migrations/` for generated SQL
- `packages/api/app.ts` for mounting project routes
- `packages/api/authz/` for abilities and request authority
- `packages/frontend/src/App.tsx` for navigation and public or protected routes
- `packages/frontend/src/query-client.ts` for application-wide TanStack Query
  defaults

The frontend already mounts TanStack Query and includes TanStack Form. Public
Sapporta query options and form helpers connect app-owned screens to generated
table routes. `CODING-PRINCIPLES.md` and `VISUAL-DESIGN-GUIDELINES.md` guide
coding-agent changes to the generated workspace.

## The welcome screen

The new project's `/welcome` screen contains starter prompts that show how to
begin building with Sapporta.

Choose **Task Management** and copy the prompt into a coding agent started from
the root of the Sapporta project.

![Task management application showing the open tasks queue](/assets/getting-started/task-app-created.png)

## Try the generated app

After the agent finishes, stop and restart the development server if needed:

```bash
pnpm build
pnpm dev
```

Add a few tasks and inspect the generated table screens. The next tutorial pages
build the same application step by step, beginning with
[Define projects and tasks](/docs/getting-started/define-projects-and-tasks/).
