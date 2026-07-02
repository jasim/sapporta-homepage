---
title: "Getting Started"
description:
  "Initialize a Sapporta app, build the task-app tutorial baseline, create agent
  access, and add data with the CLI."
---

Follow this path from an empty Sapporta project to the stable task app used by
the docs and CLI examples.

## Create a project

Create a new Sapporta project with pnpm:

```bash
pnpm dlx sapporta init task-app
cd task-app
pnpm dev
```

If pnpm is not available yet, use npx for initialization:

```bash
npx sapporta init task-app
```

If the initializer does not install dependencies, run `pnpm install` before
`pnpm dev`. A lockfile alone does not prove `node_modules` exists.

The generated app is a regular TypeScript monorepo. Keep `pnpm dev` running
while you work. The frontend is usually available at:

```text
http://localhost:5173
```

The API defaults to:

```text
http://localhost:3000
```

Run future Sapporta commands from the project root, the directory that contains
`sapporta.json`, `package.json`, and `pnpm-workspace.yaml`.

### Checkpoint

Open `http://localhost:5173`. On a new project, Sapporta should take you through
signup and then into the app shell.

## Sign up and open the app

Sign up as the first user. Sapporta creates your first workspace and makes you
the owner automatically when the authenticated app context loads. If the app
asks you to verify your email, complete that step before continuing.

### Checkpoints

- First run redirects to `/signup`.
- `/verify-email` appears only when verification is required.
- You land on `/welcome` after auth and workspace context load.
- The app shell renders.
- The account/profile page is reachable at `/account/profile`.

Use "sign up and verify if prompted" as the product model. You do not need to
manually activate a current user.

## Build the task app

Open `/welcome`, choose **Task Management**, and copy the prompt into your
coding agent from the project root.

The prompt asks the agent to use stable names so the rest of the documentation
can show copyable commands.

### Canonical task-app contract

Use these exact table names:

```text
projects, people, tasks, labels, task_labels, comments
```

Use these task columns:

```text
title, description, status, priority, due_date, assignee_id, project_id
```

The tutorial app uses this table shape:

```text
people: id, name, email
projects: id, name, description, status
tasks: id, title, description, status, priority, due_date, assignee_id, project_id
labels: id, name, color
task_labels: id, task_id, label_id
comments: id, task_id, author_id, body
```

Recommended values:

```text
tasks.status: open, in_progress, blocked, done
tasks.priority: low, normal, high
projects.status: active, paused, complete
```

For the first task app, use `workspaceGlobal` tables unless a later feature
explicitly teaches private or user-owned records. That keeps one workspace with
shared projects, tasks, people, labels, and comments. Browser clients, CLI
commands, and coding agents must still omit trusted scope columns such as
`workspace_id`, `workspaceId`, `scoped_to_user_id`, and `scopedToUserId`.

After the agent finishes, verify the project:

```bash
pnpm build
pnpm dev
```

### Checkpoints

- Table navigation appears.
- Projects, People, Tasks, Labels, and Comments are visible.
- The task grid has rows.
- A task can be created or edited.

## Create an agent token

Create an agent token after the task app is built. Before task tables exist,
there is not much useful data-console work to do.

1. Open `/account/profile`.
2. Confirm your profile, workspace, and role.
3. Create an agent access token.
4. Copy the raw token once.

Set the target API and token in your shell:

```bash
export SAPPORTA_API_URL="http://localhost:3000"
export SAPPORTA_API_TOKEN="spat_..."
```

The token lets CLI and coding-agent calls act as this signed-in user in this
workspace. Expiration, revocation, target selection, and auth failure recovery
are covered in [Agent Access](/docs/tools-and-operations/agent-access/).

## Tour the running app

Run the project-local CLI from the project root while the API is running:

```bash
pnpm exec sapporta describe
pnpm exec sapporta tables
pnpm exec sapporta tables show tasks
pnpm exec sapporta tables sample tasks
```

`describe` reads the live OpenAPI surface. `tables` reads registered Sapporta
table metadata. `tables sample` uses the running app boundary, not a private
database shortcut.

Keep full OpenAPI details, filter grammar, SQL fallback, and custom endpoints
for later. At this point, the goal is to prove the browser app, API metadata,
and CLI all see the same task app.

## Add data with the CLI

Start with discovery:

```bash
pnpm exec sapporta tables show people
pnpm exec sapporta tables show projects
pnpm exec sapporta tables show tasks
pnpm exec sapporta tables sample people
pnpm exec sapporta tables sample projects
```

Create sample rows:

```bash
pnpm exec sapporta rows insert people --data '{"name":"Priya Shah","email":"priya@example.test"}'
pnpm exec sapporta rows insert projects --data '{"name":"Website launch","description":"Prepare the launch plan.","status":"active"}'
```

Resolve IDs from your own app:

```bash
pnpm exec sapporta tables sample people --fields id,name,email
pnpm exec sapporta tables sample projects --fields id,name
```

Insert a task using IDs returned by your commands:

```bash
pnpm exec sapporta rows insert tasks --data '{"title":"Draft launch checklist","description":"Create the first pass of launch tasks.","status":"open","priority":"high","due_date":"2026-07-03","assignee_id":1,"project_id":1}'
```

Do not blindly copy `1`; use the IDs returned by your own samples.

### Freeform agent example

```text
Add a high-priority task for Priya in the Website launch project, due next Friday, and add a comment explaining that this is for the first launch review.
```

A coding agent should inspect table schemas, sample rows, resolve foreign keys,
then use row commands. It must omit `workspace_id`, `workspaceId`,
`scoped_to_user_id`, and `scopedToUserId`.
