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

## Task Management prompt

<div class="sap-doc-prompt" aria-label="Task Management starter prompt">
  <p>
    <strong>Build a simple task management application.</strong>
  </p>
  <p>
    Use Sapporta, the database framework for TypeScript, and ensure the Sapporta
    skill is installed. Follow the setup instructions at
    <a href="https://sapporta.com/docs/getting-started/introduction/">https://sapporta.com/docs/getting-started/introduction/</a>.
  </p>
  <p>
    Keep the first version focused and easy to understand: include the core
    workflows that make the app useful, and avoid exhaustive features or deep
    customization.
  </p>
  <p>
    Use workspaceGlobal tables with this exact contract: people(id, name,
    email), projects(id, name, description, status), tasks(id, title,
    description, status, priority, due_date, assignee_id, project_id),
    labels(id, name, color), task_labels(id, task_id, label_id), comments(id,
    task_id, author_id, body). Use status values open, in_progress, blocked,
    done; priorities low, normal, high; and project statuses active, paused,
    complete. Do not expose workspace_id, workspaceId, scoped_to_user_id, or
    scopedToUserId in clients, CLI commands, or agent prompts.
  </p>
  <p>
    Include workflows for creating a task, assigning it, changing its status,
    and adding a comment. Include reports for open tasks, overdue tasks, tasks
    by assignee, and tasks by project. Populate the application with realistic
    sample projects, people, tasks, labels, and comments so the first run shows
    an active todo app.
  </p>
  <p>Before changing the app, review:</p>
  <ul>
    <li>README.md</li>
    <li>AGENTS.md</li>
    <li>
      <a href="https://github.com/jasim/sapporta-skills/tree/main/skills/sapporta">
        Sapporta coding-agent skill
      </a>
    </li>
  </ul>
</div>

## Try the generated app

After the agent finishes, stop and restart the development server if needed:

```bash
pnpm build
pnpm dev
```

Add a few tasks and inspect the generated table screens. The next tutorial pages
build the same application step by step, beginning with
[Define projects and tasks](/docs/getting-started/define-projects-and-tasks/).
