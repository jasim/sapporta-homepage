---
title: "Add a complete-task endpoint"
description: "Register a protected domain endpoint that completes one task and records one event transactionally."
---

Ordinary status editing remains available through generated CRUD. The completion endpoint exists because status and history must change together.

> Checkpoint: C08 → C09

## Agent approach

```text
Read the local project instructions and use the Sapporta skill. Starting at C08, implement this outcome: Ordinary status editing remains available through generated CRUD. The completion endpoint exists because status and history must change together. Reach C09, run the validation described on this page, and report changed files and checks. Preserve server-controlled scope fields and use generated APIs for ordinary CRUD.
```

## Review the agent's work

- The shared contract path is `/tasks/:id/complete`; mounting under `/api` produces the public URL.
- The handler checks `task_completion` at the route edge and passes scoped dependencies into the workflow.
- A missing or invisible task returns 404; a completed task returns 409; failures insert no event.

## Code approach

Define and export `completeTaskContract` in the shared package. Register it from `packages/api/app/complete-task.ts` with `TsRestApi`, then mount that sub-app from `packages/api/app.ts`.

Inside one Drizzle transaction, construct row-security guards for tasks and task events. Read the task inside the boundary, reject an already-completed row, update status to completed, and insert one server-authored event.

```bash
pnpm build
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
```

## Observe and verify

A successful call changes the task and creates exactly one event. A repeated call returns 409. An injected insert failure rolls back the task update.

## What you built

The app now exposes one protected, discoverable domain transaction. The next page derives a browser client from the same contract.

Continue with [the related guide](/docs/guides/app-owned-features/domain-workflows-and-transactions/) or use [the exact reference](/docs/reference/server/ts-rest-api-and-route-registration/).
