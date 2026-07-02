---
title: "Build The Triage Screen"
description:
  "Add a protected /tasks/triage React screen with a task queue, side panel, and
  typed triage action."
---

Add a protected frontend route:

```text
/tasks/triage
```

Navigation:

```text
Section: Tasks
Item: Triage
```

Layout:

- top toolbar with status filter, project picker, and refresh button
- main queue of active tasks
- side panel for the selected task
- status select
- priority select
- assignee combobox
- due date input
- note textarea
- submit button

Use the typed client from `packages/frontend/src/api.ts`. Use generated table
pages for ordinary CRUD. This feature does not need a standalone grid; a simple
task queue that links back to generated task records is enough.

Handle loading, empty queue, validation errors, successful refresh, and stale
selected task states deliberately.

Next:
[Add The Triage Aging Report](/docs/building-your-own-feature/add-the-triage-aging-report/).
