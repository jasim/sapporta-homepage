---
title: "Add Task Events"
description:
  "Add a workspace-scoped audit table for task triage events and expose it as a
  child of tasks."
---

Add a `task_events` table to record the business event produced when a task is
triaged.

Columns:

```text
id
workspace_id
task_id
event_type
from_status
to_status
from_priority
to_priority
assignee_id
note
created_at
updated_at
```

Suggested values:

```text
event_type: triaged, status_changed, assigned
```

Metadata checklist:

- `label: "Task Events"`
- `rowScope: "workspaceGlobal"`
- `rowLabelColumns: ["event_type", "note"]`
- select options for `event_type`
- hide `workspace_id`
- render `note` with multiline text display
- add `tasks.meta.children` entries for `comments`, `task_labels`, and
  `task_events`
- ensure `tasks.meta.selects` includes `status` and `priority`
- ensure task search includes `title` and `description`
- add useful indexes on `task_events.task_id`, `tasks.status`, and
  `tasks.due_date`

Generate and review a migration:

```bash
pnpm --filter ./packages/api db:generate --name add_task_triage
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
```

Next:
[Define The Triage Contract](/docs/building-your-own-feature/define-the-triage-contract/).
