---
title: "Start From The Task App"
description:
  "Confirm the starter task tables, row scope, and generated API discovery
  before adding Task Triage."
---

Start with the task app from
[Build the Task App](/docs/getting-started/build-the-task-app/). Confirm the
starter tables before adding code:

```bash
pnpm exec sapporta tables list
pnpm exec sapporta tables show tasks
pnpm exec sapporta endpoints show "GET /api/tables/tasks"
```

The tutorial assumes these business tables:

```text
projects
people
tasks
labels
task_labels
comments
```

Important starter columns:

```text
people: id, name, email
projects: id, name, description, status
tasks: id, title, description, status, priority, due_date, assignee_id, project_id
labels: id, name, color
task_labels: id, task_id, label_id
comments: id, task_id, author_id, body
```

All tutorial task-app business tables should be `workspaceGlobal` unless your
generated starter implementation uses a different scope. If it does, adjust the
tutorial before publication rather than mixing row-scope assumptions.

Next: [Add Task Events](/docs/building-your-own-feature/add-task-events/).
