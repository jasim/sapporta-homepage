---
title: "Report on project progress"
description:
  "Add a scoped route-based report with verified project totals and
  drill-through links."
---

The dashboard from the previous page calculates progress in the browser from
generated table responses. This page moves that reusable projection into a
protected report route. You will build a `GridDataset`, keep its reads inside
the active workspace, and add drill-through links in React. The same slice can
support project summaries in the browser, the CLI, and another typed client.

```text
Add a project-progress report to the task app. Return scoped totals from a typed route, render them in a protected screen, and let each project and status count open the generated records behind it.
```

## Put reusable projections behind a route

Generated table routes remain the data interface for ordinary project and task
CRUD. A project-progress result has a different shape: it joins two visible row
sets, derives status totals, and applies one definition of overdue work. That
projection belongs in an app-owned report route.

The route owns authorization and data scope. A pure mapper owns the
`GridDataset` shape. The React screen owns filter state and links because route
URLs are frontend policy. The dataset carries stable IDs, not `href` values.

Create `packages/shared/src/contracts/project-progress.ts` and re-export it from
`packages/shared/src/contracts/index.ts`:

```ts
import { initContract } from "@sapporta/rest-core";
import { errorBodySchema } from "@sapporta/shared/contracts";
import { gridDatasetSchema } from "@sapporta/shared/grid-dataset";
import { z } from "zod";

const c = initContract();

export const projectProgressQuerySchema = z.object({
  project_id: z.coerce.number().int().positive().optional(),
});

export type ProjectProgressQuery = z.output<typeof projectProgressQuerySchema>;

export const projectProgressContract = c.router({
  projectProgress: c.query({
    method: "GET",
    path: "/reports/project-progress",
    summary: "Project progress",
    metadata: { tags: ["reports"] },
    query: projectProgressQuerySchema,
    responses: {
      200: gridDatasetSchema,
      400: errorBodySchema,
      401: errorBodySchema,
      403: errorBodySchema,
    },
  }),
});
```

The shared package contains only the browser-safe wire contract. Its path omits
`/api` because `packages/api/app.ts` is already mounted under that prefix.

## Map visible rows to a GridDataset

Create `packages/api/modules/reports/project-progress.ts`. The mapper accepts
ordinary values and a `Temporal.PlainDate`, so its totals can be tested without
a database or HTTP server:

```ts
import type { GridDataset } from "@sapporta/shared/grid-dataset";
import { Temporal } from "@sapporta/shared/temporal";

type ProjectRow = { id: number; name: string };
type TaskRow = {
  project_id: number;
  status: string;
  due_date: Temporal.PlainDate | null;
};

export function projectProgressDataset(input: {
  projects: ProjectRow[];
  tasks: TaskRow[];
  today: Temporal.PlainDate;
}): GridDataset {
  const rows = input.projects.map((project) => {
    const tasks = input.tasks.filter((task) => task.project_id === project.id);
    const count = (status: string) =>
      tasks.filter((task) => task.status === status).length;
    const completed = count("completed");
    const overdue = tasks.filter(
      (task) =>
        task.status !== "completed" &&
        task.due_date !== null &&
        Temporal.PlainDate.compare(task.due_date, input.today) < 0,
    ).length;

    return {
      project,
      total: tasks.length,
      open: count("open"),
      inProgress: count("in_progress"),
      completed,
      overdue,
      completion: tasks.length === 0 ? 0 : completed / tasks.length,
    };
  });
  const sum = (
    field: "total" | "open" | "inProgress" | "completed" | "overdue",
  ) => rows.reduce((total, row) => total + row[field], 0);
  const total = sum("total");
  const completed = sum("completed");

  return {
    name: "project_progress",
    label: "Project progress",
    rootLevel: "project",
    levels: {
      project: {
        label: "Projects",
        childLevels: [],
        columns: [
          {
            id: "project_id",
            label: "Project ID",
            kind: "number",
            visuallyHidden: true,
          },
          { id: "project", label: "Project", kind: "text", minWidth: 220 },
          { id: "total", label: "Tasks", kind: "number" },
          { id: "open", label: "Open", kind: "number", zeroDisplay: "dot" },
          {
            id: "in_progress",
            label: "In progress",
            kind: "number",
            zeroDisplay: "dot",
          },
          {
            id: "completed",
            label: "Completed",
            kind: "number",
            zeroDisplay: "dot",
          },
          {
            id: "overdue",
            label: "Overdue",
            kind: "number",
            colorRule: "negative",
            zeroDisplay: "dot",
          },
          {
            id: "completion",
            label: "Completion",
            kind: "number",
            displayFormat: "percentage",
          },
        ],
      },
    },
    nodes: rows.map((row) => ({
      rowKey: `project:${row.project.id}`,
      levelName: "project",
      columns: {
        project_id: row.project.id,
        project: row.project.name,
        total: row.total,
        open: row.open,
        in_progress: row.inProgress,
        completed: row.completed,
        overdue: row.overdue,
        completion: row.completion,
      },
    })),
    footerRows: [
      {
        rowKey: "grand-total",
        columns: {
          project: "Grand total",
          total,
          open: sum("open"),
          in_progress: sum("inProgress"),
          completed,
          overdue: sum("overdue"),
          completion: total === 0 ? 0 : completed / total,
        },
      },
    ],
  };
}
```

Percentage values are fractions: `0.4` renders as 40%. `project_id` is part of
the dataset but `visuallyHidden`, which gives the frontend a stable link target
without adding navigation policy to the wire response.

## Read through the row-security boundary

Create `packages/api/app/project-progress.ts`. The query applies each table's
row-security predicate before the mapper sees a row:

```ts
import { eq } from "drizzle-orm";
import { Temporal } from "@sapporta/shared/temporal";
import { TsRestApi, type SapportaEnv } from "@sapporta/server";
import { projectProgressContract } from "task-app-shared";
import { requireAuthorizedWorkspaceData } from "../project-auth/index.js";
import { projects, projectsTable } from "../schema/projects.js";
import { tasks, tasksTable } from "../schema/tasks.js";
import { projectProgressDataset } from "../modules/reports/project-progress.js";

const api = new TsRestApi<SapportaEnv>();

api.register(
  "projectProgress",
  projectProgressContract.projectProgress,
  async ({ c, request }) => {
    const auth = requireAuthorizedWorkspaceData(c, {
      action: "read",
      subject: "project_progress",
    });
    const db = c.get("db");
    const projectId = request.query.project_id;
    const projectFilter =
      projectId === undefined ? undefined : eq(projectsTable.id, projectId);
    const taskFilter =
      projectId === undefined
        ? undefined
        : eq(tasksTable.project_id, projectId);

    const visibleProjects = await db
      .select()
      .from(projectsTable)
      .where(auth.rowSecurity.forTable(projects).ownedRows(projectFilter));
    const visibleTasks = await db
      .select()
      .from(tasksTable)
      .where(auth.rowSecurity.forTable(tasks).ownedRows(taskFilter));

    return {
      status: 200,
      body: projectProgressDataset({
        projects: visibleProjects,
        tasks: visibleTasks,
        today: Temporal.PlainDate.from("2026-07-10"),
      }),
    };
  },
);

export default api;
```

Grant signed-in workspace members `read` on `project_progress` in
`packages/api/authz/ability.ts`. Then mount both the runtime handlers and their
OpenAPI emitters from `loadApp()` in `packages/api/app.ts`:

```ts
import projectProgressApi from "./app/project-progress.js";

export function loadApp(app: TsRestApi<SapportaEnv>, options: LoadAppOptions) {
  app.route("/", projectProgressApi);
  app.extend(projectProgressApi);
  // Keep the existing route mounts.
}
```

`route()` mounts the Hono sub-app. `extend()` composes its contract emitters
into the combined OpenAPI document. The report remains undiscoverable if only
the file exists, and it remains absent from combined OpenAPI if only `route()`
is called.

The walkthrough fixes the report's as-of date at `2026-07-10` so every reader
can reproduce the overdue count. A continuing application should make that date
an explicit report parameter or derive it with `Temporal.Now.plainDateISO()` and
show the selected as-of date in the screen.

## Render the report and resolve links in React

Create a typed client in `packages/frontend/src/api.ts`:

```ts
import { createApiClient } from "@sapporta/shared/client";
import { getApiBase } from "@sapporta/frontend/platform";
import { projectProgressContract } from "task-app-shared";

export const projectProgressApi = createApiClient(projectProgressContract, {
  baseUrl: getApiBase,
});
```

The report screen stores `project_id` in `useSearchParams`, loads
`projectProgressApi.projectProgress({ query })`, and renders the returned body
with `ReportGridDataset`. Define links beside that screen:

```tsx
import type { ReportCellLinkResolvers } from "@sapporta/frontend/report";
import { ReportGridDataset } from "@sapporta/frontend/report";
import type { ProjectProgressQuery } from "task-app-shared";

function taskHref(projectId: number, status?: string) {
  const query = new URLSearchParams();
  query.set("filter[project_id][eq]", String(projectId));
  if (status) query.set("filter[status][eq]", status);
  return `/tables/tasks?${query.toString()}`;
}

const projectProgressLinks = {
  project: {
    cell: {
      project: ({ node }) => {
        const id = node.columns.project_id;
        return typeof id === "number"
          ? [
              {
                label: "Open project",
                href: `/tables/projects/${id}`,
                kind: "record",
                icon: "drill-up",
              },
            ]
          : [];
      },
      open: ({ node }) => {
        const id = node.columns.project_id;
        return typeof id === "number"
          ? [
              {
                label: "Open tasks",
                href: taskHref(id, "open"),
                kind: "drill-down",
                icon: "drill-into",
              },
            ]
          : [];
      },
      completed: ({ node }) => {
        const id = node.columns.project_id;
        return typeof id === "number"
          ? [
              {
                label: "Completed tasks",
                href: taskHref(id, "completed"),
                kind: "drill-down",
                icon: "drill-into",
              },
            ]
          : [];
      },
    },
  },
} satisfies ReportCellLinkResolvers<ProjectProgressQuery>;

<ReportGridDataset
  dataset={dataset}
  links={projectProgressLinks}
  linkContext={{ input: query }}
/>;
```

Add `/reports/project-progress` to `appProtectedRoutes` and `appNavigation`.
Each link target applies its own authorization. Hidden IDs and generated-table
URL filters provide navigation context; they do not grant access.

## Exercise the report API before the screen

Discover the mounted operation, then run the full and filtered reports:

```bash
pnpm exec sapporta endpoints show "GET /api/reports/project-progress"
pnpm exec sapporta api get /api/reports/project-progress
pnpm exec sapporta api get /api/reports/project-progress \
  --query '{"project_id":1}'
```

A representative successful body is:

```json
{
  "name": "project_progress",
  "label": "Project progress",
  "rootLevel": "project",
  "levels": {
    "project": {
      "label": "Projects",
      "childLevels": [],
      "columns": [
        {
          "id": "project_id",
          "label": "Project ID",
          "kind": "number",
          "visuallyHidden": true
        },
        { "id": "project", "label": "Project", "kind": "text" },
        { "id": "total", "label": "Tasks", "kind": "number" },
        {
          "id": "completion",
          "label": "Completion",
          "kind": "number",
          "displayFormat": "percentage"
        }
      ]
    }
  },
  "nodes": [
    {
      "rowKey": "project:1",
      "levelName": "project",
      "columns": {
        "project_id": 1,
        "project": "Website Relaunch",
        "total": 3,
        "open": 0,
        "in_progress": 1,
        "completed": 2,
        "overdue": 0,
        "completion": 0.6666666666666666
      }
    }
  ],
  "footerRows": [
    {
      "rowKey": "grand-total",
      "columns": {
        "project": "Grand total",
        "total": 5,
        "open": 1,
        "in_progress": 1,
        "completed": 3,
        "overdue": 0,
        "completion": 0.6
      }
    }
  ]
}
```

The abbreviated `levels.project.columns` array above shows the hidden ID and
representative visible columns; the actual response also contains the status and
overdue column definitions from the mapper. Route tests should parse the
complete response with `gridDatasetSchema` and mapper tests should fix `today`
to a known `Temporal.PlainDate`.

<!--
Screenshot brief
Suggested asset: /images/docs/getting-started/project-progress-report.png
Setup: Seed the canonical two projects and five tasks, complete the overdue Audit launch checklist task from the dashboard, sign in to Workspace A, open /reports/project-progress, and run the report without a project filter.
Frame: Capture the protected app shell, report title and filter, the complete two-project grid, grand-total footer, and the report navigation item at a desktop viewport.
Visible proof: The report shows five tasks, three completed tasks, no overdue tasks, and 60% completion; project and status cells display link affordances.
Alt text: Project-progress report with scoped task totals, completion percentages, drill-through cells, and a grand-total footer.
-->

The app now exposes one scoped projection through OpenAPI, the CLI, and a
protected report screen. The server owns visible base rows and report math. The
frontend owns URL state and link resolution. Continue with
[Inspect and operate the app](/docs/getting-started/inspect-and-operate-the-app/)
to use these generated and app-owned routes as an operator, or read the
[route-based reports guide](/docs/guides/reports/route-based-reports/) and
[GridDataset reference](/docs/reference/reports/grid-dataset/).
