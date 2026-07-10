---
title: "Use the task app"
description: "Load a stable project and task dataset and verify the complete generated application surface."
---

The first tutorial stage ends with a useful generated task application. It contains only projects and tasks.

> Checkpoint: C05 → C06

## Agent approach

```text
Read the local project instructions and use the Sapporta skill. Starting at C05, implement this outcome: The first tutorial stage ends with a useful generated task application. It contains only projects and tasks. Reach C06, run the validation described on this page, and report changed files and checks. Preserve server-controlled scope fields and use generated APIs for ordinary CRUD.
```

## Review the agent's work

- Seed input omits IDs, workspace fields, and timestamps.
- The five canonical tasks cover every status, more than one priority, one overdue open task, and two projects.
- Generated screens, table APIs, lookups, search, filters, and relationships agree on the same rows.

## Code approach

Create the rows from the sample-data ledger with generated row commands:

```bash
pnpm exec sapporta rows create projects --values '{"name":"Website Relaunch"}'
pnpm exec sapporta rows create projects --values '{"name":"Operations"}'
pnpm exec sapporta rows create tasks --values '[{"project_id":1,"title":"Audit launch checklist","status":"open","priority":"high","due_date":"2026-07-08"},{"project_id":1,"title":"Publish release notes","status":"in_progress","priority":"medium","due_date":"2026-07-12"},{"project_id":1,"title":"Verify redirects","status":"completed","priority":"high","due_date":"2026-07-09"},{"project_id":2,"title":"Update operations runbook","status":"completed","priority":"low"},{"project_id":2,"title":"Schedule handoff","status":"open","priority":"medium","due_date":"2026-07-15"}]'
```

The documented date baseline is 2026-07-10. The dataset contains five tasks, two completed tasks, and one overdue non-completed task.

## Observe and verify

Search for launch, filter by high priority, and open each project relationship. The dataset totals match the sample-data ledger.

## What you built

C06 is a complete stopping point. Continue to add server-side access rules and one app-owned completion workflow.

Continue with [the related guide](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/) or use [the exact reference](/docs/reference/http/query-syntax/).
