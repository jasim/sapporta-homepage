---
title: "Seed And Validate"
description:
  "Add realistic task data and verify Task Triage through migrations, build, CLI
  discovery, and browser checks."
---

Use realistic test data:

- projects: Website Launch, Customer Portal
- four people
- twelve tasks across status and priority values
- several unassigned tasks
- several overdue open tasks
- labels: bug, docs, frontend, backend
- comments on at least three tasks
- task events for a few previously triaged tasks

Run the validation loop:

```bash
pnpm --filter ./packages/api db:generate --name add_task_triage
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
pnpm build
pnpm dev
pnpm exec sapporta tables list
pnpm exec sapporta tables show task_events
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/triage"
pnpm exec sapporta endpoints show "GET /api/reports/triage-aging"
```

Browser checklist:

- sign in
- open `/tasks/triage`
- select an open task
- change assignee, priority, due date, and note
- confirm the task row updates
- open the task generated record page
- confirm comment and task event child rows appear
- open Triage Aging report
- verify report links navigate correctly

Next:
[What To Change Next](/docs/building-your-own-feature/what-to-change-next/).
