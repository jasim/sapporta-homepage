---
title: "Use the task app"
description:
  "Load a stable project and task dataset and verify the complete generated
  application surface."
---

The task app now has generated project and task screens plus matching CRUD
routes. This page loads a small, repeatable dataset and follows it through the
CLI, HTTP API, lookups, filters, and project relationships. The result is a
useful first version of the app and a stable baseline for the access rules and
completion workflow that follow.

```text
Load the tutorial projects and tasks into my Sapporta app, then show me that the generated screens and API expose the same records.
```

## Start from a known dataset

Generated screens are already enough for ordinary project and task work. They
create, read, update, and delete rows through the same generated routes used by
the CLI. A fixed dataset makes that whole surface easier to inspect and gives
the later dashboard and report exact totals to reproduce.

Start the application and inspect the two table contracts before writing data:

```bash
pnpm dev
pnpm exec sapporta tables show projects
pnpm exec sapporta tables show tasks
pnpm exec sapporta endpoints show "POST /api/tables/projects"
pnpm exec sapporta endpoints show "POST /api/tables/tasks"
```

Create the two projects first. Each command returns the new row in a `{ data }`
envelope. Record the returned IDs rather than guessing foreign keys when the
database already contains records.

```bash
pnpm exec sapporta rows create projects --values '{"name":"Website Relaunch"}'
pnpm exec sapporta rows create projects --values '{"name":"Operations"}'
```

The remaining commands use project IDs `1` and `2`, which are the values in a
fresh tutorial database. Substitute the IDs returned above when they differ. The
input omits IDs, timestamps, and `workspace_id`. Sapporta supplies generated
values and derives the workspace from the authenticated request.

```bash
pnpm exec sapporta rows create tasks --values '[{"project_id":1,"title":"Audit launch checklist","status":"open","priority":"high","due_date":"2026-07-08"},{"project_id":1,"title":"Publish release notes","status":"in_progress","priority":"medium","due_date":"2026-07-12"},{"project_id":1,"title":"Verify redirects","status":"completed","priority":"high","due_date":"2026-07-09"},{"project_id":2,"title":"Update operations runbook","status":"completed","priority":"low"},{"project_id":2,"title":"Schedule handoff","status":"open","priority":"medium","due_date":"2026-07-15"}]'
```

The tutorial evaluates due dates against `2026-07-10`. The resulting ledger has
five tasks, two completed tasks, and one overdue task that is still open. Dates
cross the API as canonical date strings. Application code that later compares or
formats them uses Temporal rather than `Date`, `dayjs`, or `date-fns`.

## Follow the same rows through the API

Inspect the mounted list route before composing a direct request:

```bash
pnpm exec sapporta endpoints show "GET /api/tables/tasks"
pnpm exec sapporta rows list tasks --where '{"priority":{"eq":"high"}}' --output json
```

The equivalent HTTP request combines the generated search and strict filter
grammar:

```http
GET /api/tables/tasks?q=launch&filter[priority][eq]=high
Authorization: Bearer <token>
```

It returns a row collection and pagination metadata:

```json
{
  "data": [
    {
      "id": 1,
      "project_id": 1,
      "title": "Audit launch checklist",
      "status": "open",
      "priority": "high",
      "due_date": "2026-07-08"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 50, "pages": 1 }
}
```

Open `/tables/tasks` in the browser. Search for **launch**, select **high** in
the priority filter, and open the returned task. Then open both project records
from `/tables/projects`. The Website Relaunch relationship contains three tasks
and Operations contains two. The project lookup also uses the same visible
project rows:

```http
GET /api/tables/projects/_lookup
```

```json
{
  "entries": [
    { "value": 1, "label": "Website Relaunch" },
    { "value": 2, "label": "Operations" }
  ]
}
```

<!--
Screenshot brief
Suggested asset: task-app-filtered-grid.png
Setup: Load the canonical two projects and five tasks, open /tables/tasks, search for launch, and filter priority to high.
Frame: Capture the browser route, active search and filter controls, and the resulting Audit launch checklist row. Exclude unrelated browser chrome and personal account details.
Visible proof: The generated grid exposes the task fields, preserves the active query, and returns the same high-priority launch task as the API request.
Alt text: Generated Tasks grid filtered to the high-priority Audit launch checklist task.
-->

<!--
Screenshot brief
Suggested asset: task-app-project-relationships.png
Setup: Open the Website Relaunch project after loading all five canonical tasks.
Frame: Capture the project heading and its Tasks child collection with title, status, and due-date columns visible.
Visible proof: Website Relaunch resolves by name and contains its three related task rows rather than exposing a raw project ID as the primary label.
Alt text: Website Relaunch project record with three tasks in its generated child collection.
-->

The first task-app stage is now complete. The browser, CLI, lookup route, and
generated table API all describe the same workspace-scoped rows. The fixed
ledger also supplies the later progress totals: five tasks, two complete, and
one overdue as of the documented baseline. Next,
[apply task access rules](/docs/getting-started/apply-task-access-rules/) so
feature permission and row visibility are explicit before adding a business
transition. For deeper query behavior, see
[filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)
and the [query syntax reference](/docs/reference/http/query-syntax/).
