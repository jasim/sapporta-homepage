---
title: "Build a project progress dashboard"
description: "Add a protected React screen that summarizes projects and completes tasks through the typed client."
---

The progress dashboard is application-owned UI for one domain workflow. Generated record screens remain the ordinary CRUD surface.

> Checkpoint: C10 → C11

## Agent approach

```text
Read the local project instructions and use the Sapporta skill. Starting at C10, implement this outcome: The progress dashboard is application-owned UI for one domain workflow. Generated record screens remain the ordinary CRUD surface. Reach C11, run the validation described on this page, and report changed files and checks. Preserve server-controlled scope fields and use generated APIs for ordinary CRUD.
```

## Review the agent's work

- The route is in `appProtectedRoutes` and its navigation item is in `appNavigation`.
- Loading, empty, ready, action-error, and refresh states are explicit.
- Project, task, and event links point back to generated record surfaces.

## Code approach

Create `packages/frontend/src/ProjectProgress.tsx`. Load visible projects and current tasks from generated table routes, compute per-project progress for this introductory screen, and invoke `taskActionsApi.completeTask` from the task action.

Add `/projects/progress` to `appProtectedRoutes` and add its navigation item. Keep ordinary create/edit forms on generated table routes.

## Observe and verify

Completing an open task refreshes its status, project completion count, and generated Task history. Expected conflicts remain visible as actionable screen errors.

## What you built

The application now has a protected workflow screen integrated with generated records. The next page moves reusable aggregation into a report route.

Continue with [the related guide](/docs/guides/app-owned-features/custom-frontend-routes-and-screens/) or use [the exact reference](/docs/reference/frontend/app-shell-routes-and-navigation/).
