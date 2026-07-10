---
title: "Report on project progress"
description: "Add a scoped route-based report with verified project totals and drill-through links."
---

The project-progress report returns a GridDataset with one row per project, status totals, overdue work, a completion percentage, and hidden identifiers for frontend links.

> Checkpoint: C11 → C12

## Agent approach

```text
Read the local project instructions and use the Sapporta skill. Starting at C11, implement this outcome: The project-progress report returns a GridDataset with one row per project, status totals, overdue work, a completion percentage, and hidden identifiers for frontend links. Reach C12, run the validation described on this page, and report changed files and checks. Preserve server-controlled scope fields and use generated APIs for ordinary CRUD.
```

## Review the agent's work

- The contract path is `/reports/project-progress` and the mounted URL is under `/api`.
- The read function applies row security before aggregation; the mapper remains pure.
- Link resolvers live in the frontend. The dataset contains IDs, not hrefs.

## Code approach

Add a shared GET contract with an optional project filter, a protected route, a scoped read function, a pure dataset mapper, a typed client, and a protected report screen.

Use Temporal.PlainDate for the documentation baseline 2026-07-10. A task is overdue when it is not completed, has a due date, and that due date is earlier than the baseline.

Link the project name to its generated record. Link each status count to a filtered task table URL.

## Observe and verify

The report returns five tasks, two completed tasks, one overdue task, and 40% completion across both projects. Each linked table query returns the displayed count.

## What you built

The app now owns a typed, scoped report while reusing Sapporta rendering and generated detail surfaces.

Continue with [the related guide](/docs/guides/reports/route-based-reports/) or use [the exact reference](/docs/reference/reports/grid-dataset/).
