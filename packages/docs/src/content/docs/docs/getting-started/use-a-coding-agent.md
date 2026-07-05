---
title: "Use a Coding Agent with the Sapporta Application"
description:
  "Create an agent access token, connect a coding agent to the task app API, and
  add sample data through the running Sapporta application."
---

The task app now has tables, generated CRUD APIs, table metadata, and generated
browser screens. The table screens can create records directly. This step uses a
coding agent instead, so sample data is written through the same Sapporta API
that the browser app uses.

## Create an agent token

The coding agent needs a token before it can talk to the Sapporta API. Create
the token from the signed-in browser session for the app you just built.

1. Open `/account/profile`.
2. Confirm the profile, workspace, and role.
3. Create an agent access token.
4. Copy the raw token once.

Set the target API and token in the shell where the coding agent runs:

```bash
export SAPPORTA_API_URL="http://localhost:3000"
export SAPPORTA_API_TOKEN="spat_..."
```

The token lets CLI and coding-agent calls act as this signed-in user in this
workspace. Expiration, revocation, target selection, and auth failure recovery
are covered in [Agent Access](/docs/tools-and-operations/agent-access/).

## Confirm the app boundary

Run the project-local CLI from the `task-app` project root while the API is
running:

```bash
pnpm exec sapporta describe
pnpm exec sapporta tables
pnpm exec sapporta tables show tasks
pnpm exec sapporta tables sample tasks
```

`describe` reads the live OpenAPI surface. `tables` reads registered Sapporta
table metadata. `tables sample` uses the running app boundary, not a private
database shortcut.

At this point, the browser app, API metadata, and CLI should all see the same
task app.

## Ask the agent to add sample data

Give the coding agent a natural-language task from the project root:

<div class="sap-doc-prompt" aria-label="Sample data agent prompt">
  <p>
    Add realistic sample data to this Sapporta task app. Create people,
    projects, labels, tasks, task-label relationships, and comments. Use the
    existing table schemas and generated APIs. Inspect the tables first, resolve
    foreign keys from the rows you create, and omit workspace_id, workspaceId,
    scoped_to_user_id, and scopedToUserId from every client or CLI payload.
  </p>
  <p>
    Include at least two active projects, three people, several open and
    in-progress tasks, one blocked task, one done task, useful labels, and
    comments that make the task history readable.
  </p>
</div>

The agent should inspect table schemas, insert rows through the `pnpm exec sapporta rows insert` command, read returned IDs, and use those IDs when it creates related tasks, labels, and comments.

## Verify the sample data

Use the CLI to inspect the rows created by the agent:

```bash
pnpm exec sapporta tables sample people --fields id,name,email
pnpm exec sapporta tables sample projects --fields id,name,status
pnpm exec sapporta tables sample tasks --fields id,title,status,priority,assignee_id,project_id
pnpm exec sapporta tables sample comments --fields id,task_id,author_id,body
```

Open the browser app after the rows are inserted. The generated table screens
should show the same people, projects, tasks, labels, and comments returned by
the CLI.

Next:
[Start From The Task App](/docs/building-your-own-feature/start-from-the-task-app/).
