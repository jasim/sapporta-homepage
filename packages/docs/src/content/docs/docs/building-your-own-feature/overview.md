---
title: "Task Triage Overview"
description:
  "Build one realistic app-owned feature that touches schema, endpoints, React
  screens, reports, auth, and CLI validation."
---

Task Triage is the feature used throughout this tutorial.

A project lead opens a queue of active tasks, selects one task, assigns an
owner, sets priority and due date, changes status, and optionally leaves a
triage note in one action.

This feature is small enough to follow after Getting Started, but broad enough
to show how Sapporta subsystems fit together:

- add a `task_events` table and child relationship
- define a shared triage contract
- implement a backend action with auth and row security
- mount and discover the endpoint through OpenAPI
- build a React triage screen
- add a Triage Aging report
- seed data and validate with browser and CLI checks

The tutorial starts from the stable task app with `projects`, `people`, `tasks`,
`labels`, `task_labels`, and `comments`.

Next:
[Start From The Task App](/docs/building-your-own-feature/start-from-the-task-app/).
