---
title: "Build, test, and choose the next guide"
description:
  "Validate the completed task app and continue into the guide or reference path
  that matches the next change."
---

The tutorial now spans schema, generated records, access rules, an atomic
workflow, a typed client, a custom dashboard, a route-based report, and scoped
operator access. This page validates those pieces as one application. You will
check migrations and builds, exercise the live API's success and failure paths,
confirm transaction and row-scope invariants, and inspect the browser at two
viewports before choosing the guide for the next feature.

```text
Run a release-style validation of the task app. Check migrations and builds, exercise the generated and app-owned APIs including their failure paths, confirm the dashboard and report in the browser, and summarize anything that is not ready.
```

## Start with artifacts that can be checked offline

The database schema, shared contracts, API handlers, and frontend imports form
one dependency chain. Check them in that order:

```bash
pnpm --filter ./packages/api db:check
pnpm --filter ./packages/shared typecheck
pnpm --filter ./packages/api typecheck
pnpm build
```

`db:check` validates migration metadata. It does not apply pending migrations.
The production build compiles the browser-safe shared package before the API and
frontend consume it. A failure in `packages/shared` often means a wire contract
or exported type changed; a frontend failure can reveal a typed client that no
longer matches that contract.

Run the focused API tests from the workflow and report pages:

```bash
pnpm --filter ./packages/api exec vitest run \
  app/complete-task.test.ts \
  modules/reports/project-progress.test.ts
```

The complete-task suite should cover a successful transition, a repeated
completion conflict, a missing or invisible task, and a forced event-insert
failure. The last case proves rollback: the task remains open when the history
row cannot be inserted. The report suite should parse the full result with
`gridDatasetSchema` and fix `today` to a known `Temporal.PlainDate` when it
asserts overdue totals.

```ts
import { Temporal } from "@sapporta/shared/temporal";
import { gridDatasetSchema } from "@sapporta/shared/grid-dataset";

const dataset = projectProgressDataset({
  projects: [{ id: 1, name: "Website relaunch" }],
  tasks: [
    {
      project_id: 1,
      status: "open",
      due_date: Temporal.PlainDate.from("2026-07-09"),
    },
    {
      project_id: 1,
      status: "completed",
      due_date: Temporal.PlainDate.from("2026-07-10"),
    },
  ],
  today: Temporal.PlainDate.from("2026-07-10"),
});

gridDatasetSchema.parse(dataset);
expect(dataset.nodes[0]?.columns).toMatchObject({
  total: 2,
  completed: 1,
  overdue: 1,
  completion: 0.5,
});
```

The tutorial route and tests use the documented `2026-07-10` as-of date. A
continuing application can expose that date as report input or derive it from
`Temporal.Now.plainDateISO()`. All parsing, comparison, arithmetic, and
formatting for dates and timestamps continues to use Temporal.

## Discover the server before the smoke test

Start the built app or the development server. Then query the mounted surface:

```bash
pnpm dev
pnpm exec sapporta tables list
pnpm exec sapporta endpoints list
pnpm exec sapporta endpoints show "GET /api/tables/tasks"
pnpm exec sapporta endpoints show "PUT /api/tables/tasks/{id}"
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
pnpm exec sapporta endpoints show "GET /api/reports/project-progress"
```

This step catches two deployment mistakes that TypeScript cannot: a `TsRestApi`
sub-app that was not mounted with `route()`, and contract emitters that were not
composed with `extend()`. Direct calls come after discovery and use the mounted
`/api` paths.

Create one open task through the generated API. The request contains domain
fields only; the server derives workspace ownership:

```bash
pnpm exec sapporta rows create tasks --values '{
  "project_id": 1,
  "title": "Publish release notes",
  "status": "open",
  "priority": "medium",
  "due_date": "2026-08-01"
}'
pnpm exec sapporta rows list tasks \
  --where '{"status":{"eq":"open"}}' \
  --output json
```

A representative list response retains the generated envelope:

```json
{
  "data": [
    {
      "id": 7,
      "project_id": 1,
      "title": "Publish release notes",
      "status": "open",
      "priority": "medium",
      "due_date": "2026-08-01"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 50, "pages": 1 }
}
```

Use `PUT /api/tables/tasks/7` for another ordinary row edit. Do not substitute
`PATCH`. Use the app-owned endpoint for completion because that transition also
creates immutable history:

```bash
pnpm exec sapporta api post /api/tasks/7/complete --body '{}'
pnpm exec sapporta api post /api/tasks/7/complete --body '{}'
pnpm exec sapporta rows list task_events \
  --where '{"task_id":{"eq":7}}' \
  --output json
pnpm exec sapporta api get /api/reports/project-progress
```

The first completion returns `200` with the completed task and event. The second
returns the declared conflict body, and the event query still returns one
completion event:

```json
{
  "error": "Task is already completed",
  "code": "TASK_ALREADY_COMPLETED"
}
```

The report footer should agree with the generated task and event reads. Its
exact total depends on the smoke-test rows created and completed in this pass.
The generated list, history query, and report are three views of the same state,
not independent fixtures.

## Prove the negative boundaries

Run the same read checks with a Workspace A token after seeding one visibly
named task in Workspace B. The generated list and report must omit Workspace B.
Call complete-task with that hidden task ID and with an unused ID. Both results
must follow the same declared missing-row behavior.

Authentication, feature abilities, and row visibility are separate assertions:

- no session or token receives the documented authentication error;
- a signed-in user without the workflow ability receives the declared
  authorization error;
- an authorized Workspace A caller receives only Workspace A rows; and
- clients never submit `workspace_id`, owner, role, or scope columns.

The forced transaction failure belongs in an automated test because it needs a
controlled database error. The SQLite transaction callback remains synchronous,
uses `insertValuesSync()` for the history write, and contains no awaited
external effect.

## Walk the browser states

Sign in and open each generated table once, then exercise the custom routes:

1. Open `/tables/projects`, create or edit a project, and follow its Tasks child
   relationship.
2. Open `/tables/tasks`, filter and sort the worklist, and inspect one task's
   Task history.
3. Open `/projects/progress`, complete an open task, and observe the updated
   project total and action state.
4. Open `/reports/project-progress`, run the full report, select a project
   filter, reload the URL, and follow project and status links back to generated
   records.

Check a narrow viewport and a desktop viewport. Loading, empty, ready, expected
error, and refreshed states should remain explicit. Browser Network requests for
the custom routes should use `/api/tasks/:id/complete` and
`/api/reports/project-progress`; the React routes themselves do not include
`/api`.

<!--
Screenshot brief
Suggested asset: /images/docs/getting-started/task-app-final-browser-check.png
Setup: Load the canonical two-project, five-task fixture in Workspace A, complete the overdue Audit launch checklist task from /projects/progress, then open /reports/project-progress and run the unfiltered report.
Frame: Capture the report and dashboard in two browser windows or a composed capture, including app navigation, the refreshed completion count, the report footer, and Network entries for complete-task and project-progress. Use a desktop viewport.
Visible proof: The dashboard and report agree on three completed tasks, the report footer shows five tasks and 60% completion, and both custom requests use mounted /api URLs.
Alt text: Completed task-app dashboard and project-progress report with matching totals and their API requests visible in browser Network tools.
-->

<!--
Screenshot brief
Suggested asset: /images/docs/getting-started/task-app-narrow-workflow.png
Setup: Open the task table and project-progress dashboard while signed in to Workspace A, then resize the browser to a 390-pixel-wide viewport.
Frame: Capture navigation access, the task workflow action, readable loading or ready state, and horizontal or responsive grid behavior without clipping the primary action.
Visible proof: Generated records and the custom workflow remain operable at the narrow viewport, with the complete action and current task status visible.
Alt text: Task app at a narrow viewport with generated records and the completion workflow still accessible.
-->

The finished app has three workspace-scoped tables, generated CRUD surfaces, an
atomic multi-table transition, a shared contract and typed client, a protected
workflow screen, a scoped report, and a revocable operating path. The important
constraints remain visible in the final checks: server-authored scope,
row-secured base reads, synchronous SQLite transactions, Temporal values,
declared error bodies, explicit route composition, and frontend-owned report
links.

Choose the next guide by the boundary that needs to change:

- [Model data](/docs/guides/model-data/tables-columns-and-schema-metadata/) for
  tables, relationships, validation, semantic values, and migrations.
- [Generated surfaces](/docs/guides/generated-surfaces/grid-first-record-workflows/)
  for ordinary record screens and table-aware Grid workflows.
- [Security](/docs/guides/security/authentication-and-abilities/) for abilities,
  workspaces, ownership, and row visibility.
- [App-owned features](/docs/guides/app-owned-features/custom-api-endpoints/)
  for business transitions, transactions, uploads, external effects, and custom
  response shapes.
- [Reports](/docs/guides/reports/route-based-reports/) for scoped datasets,
  filters, formatting, and drill-through links.
- [Discovery and operations](/docs/guides/discovery/choose-an-application-interface/)
  for CLI, agents, OpenAPI, configuration, builds, and deployment.

The [guide index](/docs/guides/) explains those workflows. The
[reference index](/docs/reference/) is the lookup path for exact contracts,
types, routes, and options.
