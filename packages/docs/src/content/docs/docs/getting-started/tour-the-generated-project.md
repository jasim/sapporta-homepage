---
title: "Tour the generated project"
description:
  "Inspect the generated workspace, choose a first outcome, and review the
  evidence from a coding agent's first change."
---

A Sapporta app is a pnpm workspace with a Hono API, a React frontend, and a
shared package for API contracts and wire types.

```text
my-app/
  sapporta.json
  package.json
  pnpm-workspace.yaml
  AGENTS.md
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
table routes. `AGENTS.md`, `CODING-PRINCIPLES.md`, and
`VISUAL-DESIGN-GUIDELINES.md` tell a coding agent how to work in this generated
workspace.

## The welcome screen

The new project's `/welcome` screen offers Task Management, Invoicing, and Meal
Tracking prompts. Each one gives a coding agent product direction and points it
back to the project instructions. You can copy one, adapt it to your own domain,
or use it to identify a smaller first outcome.

For example, the Task Management prompt can produce a project and task model
with generated record surfaces:

![Task management application showing the open tasks queue](/assets/getting-started/task-app-created.png)

## Choose a bounded first outcome

Start with one result that has an obvious owner:

- Add a table and its ordinary CRUD surface with
  [Tables, columns, and schema metadata](/docs/guides/model-data/tables-columns-and-schema-metadata/).
- Change how registered or application-owned rows are presented with
  [Grid-first record workflows](/docs/guides/generated-surfaces/grid-first-record-workflows/).
- Add a named action that coordinates several records with
  [Shared contracts and request validation](/docs/guides/app-owned-features/shared-contracts-and-request-validation/).
- If the result belongs to an already-running application rather than the
  repository, first
  [choose the application interface](/docs/guides/discovery/choose-an-application-interface/).

Open the coding agent at the project root and use
[Develop with a coding agent](/docs/guides/discovery/develop-with-a-coding-agent/)
to describe the outcome, owning boundary, server-side invariants, observable
success, and relevant negative checks. Ask for a plan before edits when the
change crosses schema, authorization, API, and frontend boundaries.

## Review the evidence

When the agent finishes, inspect the result rather than relying on its summary:

- Review the focused diff and confirm that each change is in the package that
  owns it.
- Review generated migration SQL before applying it.
- Check shared contracts, mounted routes, and server-side authorization or row
  scope when the outcome uses them.
- Read the focused test output and build result.
- Start the application and read back the changed record, screen, endpoint, or
  report.
- Exercise a relevant failure, such as invalid input, missing ability, an
  invisible row, or an unapplied migration.

The generated project provides the usual build and development commands:

```bash
pnpm build
pnpm dev
```

A successful build proves that the workspace compiles. The read-back and
negative check prove that the requested behavior is present at its runtime
boundary. From here, use the [guide index](/docs/guides/) to choose the owner of
the next outcome.
