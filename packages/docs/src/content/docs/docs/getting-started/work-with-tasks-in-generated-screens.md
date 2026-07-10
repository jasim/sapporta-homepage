---
title: "Work with tasks in generated screens"
description: "Create, edit, search, filter, and relate task records through generated screens."
---

Registered table metadata produces list, create, detail, and edit behavior without a project-owned React screen.

> Checkpoint: C03 → C04

## Agent approach

```text
Read the local project instructions and use the Sapporta skill. Starting at C03, implement this outcome: Registered table metadata produces list, create, detail, and edit behavior without a project-owned React screen. Reach C04, run the validation described on this page, and report changed files and checks. Preserve server-controlled scope fields and use generated APIs for ordinary CRUD.
```

## Review the agent's work

- Project lookups display `projects.name` because it is the row label.
- Task status and priority render as controlled selects.
- Workspace fields and timestamps remain server-managed or visually hidden.

## Code approach

Open `/tables/projects` and create a project named Website Relaunch. Open `/tables/tasks/new` and create a related task. Edit its status and priority from the generated record surface.

Use the table search field to search task title and description. Open the project record and confirm that its Tasks child surface contains the new row.

## Observe and verify

One project and one related task can be created, edited, searched, and reached in both relationship directions.

## What you built

The application user now has generated CRUD surfaces. The next page uses the matching generated HTTP routes.

Continue with [the related guide](/docs/guides/generated-surfaces/record-screens-and-forms/) or use [the exact reference](/docs/reference/frontend/generated-record-surfaces/).
