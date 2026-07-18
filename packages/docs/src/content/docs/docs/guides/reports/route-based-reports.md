---
title: "Route-based reports"
description:
  "Create a protected typed report route and screen with shareable filters."
---

A Sapporta report is an app-owned API route plus a React screen. This page
builds the project-progress report from its shared contract through its
protected UI. You will learn how the route, scoped read, pure dataset mapper,
typed client, URL filters, and renderer fit together. The same structure
supports ledgers, aging reports, operational summaries, and other read-only
projections.

```text
Build a protected project-progress report in this Sapporta app. Use a shared GET contract, scope projects and tasks on the server, map a GridDataset in a pure function, add a typed client and protected screen, keep filters in the URL, and prove the mounted route and dataset shape.
```

## Start with the wire contract

Compact, shareable filters fit a GET query. Large nested report input can use a
POST body instead. Create `packages/shared/src/contracts/project-progress.ts`
and re-export it from the shared contracts index:

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

The contract path omits `/api`. `packages/api/app.ts` mounts app routes under
that prefix.

## Register a thin protected route

Create `packages/api/app/project-progress.ts`. The route resolves permission and
workspace data authority, reads only visible base rows, and hands ordinary
objects to a pure mapper:

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
    const projectAccess = auth.rowSecurity.forTable(projects);
    const taskAccess = auth.rowSecurity.forTable(tasks);
    const projectId = request.query.project_id;

    const visibleProjects = await db
      .select()
      .from(projectsTable)
      .where(
        projectAccess.ownedRows(
          projectId === undefined ? undefined : eq(projectsTable.id, projectId),
        ),
      );
    const visibleTasks = await db
      .select()
      .from(tasksTable)
      .where(
        taskAccess.ownedRows(
          projectId === undefined
            ? undefined
            : eq(tasksTable.project_id, projectId),
        ),
      );

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
`packages/api/authz/ability.ts`. Then mount the sub-app:

```ts
import projectProgressApi from "./app/project-progress.js";

export function loadApp(app: TsRestApi<SapportaEnv>, options: LoadAppOptions) {
  app.route("/", projectProgressApi);
  app.extend(projectProgressApi);
  // Keep the existing route mounts here.
}
```

`route()` mounts the Hono handlers. `extend()` adds the sub-app's contract
emitters to the combined OpenAPI document.

## Add the typed screen

The frontend imports the same contract:

```ts
import { createApiClient } from "@sapporta/shared/client";
import { getApiBase } from "@sapporta/frontend/platform";
import { projectProgressContract } from "task-app-shared";

export const projectProgressApi = createApiClient(projectProgressContract, {
  baseUrl: getApiBase,
});
```

Keep the selected project in `useSearchParams`, call
`projectProgressApi.projectProgress({ query })`, and render the successful body
with `ReportGridDataset`:

```tsx
<ReportScreenFrame
  title="Project progress"
  subtitle="Task status and overdue work by project."
>
  <ReportToolbar>{/* project filter and Run button */}</ReportToolbar>
  {dataset ? (
    <ReportGridDataset
      dataset={dataset}
      links={projectProgressLinks}
      linkContext={{ input: query }}
    />
  ) : null}
</ReportScreenFrame>
```

Register `/reports/project-progress` in `appProtectedRoutes` and add a
navigation item. The URL query is the report state, so a filtered result can be
reloaded, bookmarked, or shared with another authorized user.

## Run the report

```bash
pnpm build
pnpm exec sapporta endpoints show "GET /api/reports/project-progress"
pnpm exec sapporta api get /api/reports/project-progress
pnpm exec sapporta api get /api/reports/project-progress --query '{"project_id":1}'
```

The unfiltered canonical dataset contains two projects, five tasks, two
completed tasks, one overdue task, and 40% completion. The filtered call
contains only the selected project's visible rows. Parse route-test responses
with `gridDatasetSchema` so the API cannot drift from the renderer contract.

<!--
Screenshot brief
Suggested asset: /images/docs/reports/project-progress-screen.png
Setup: Seed the canonical two projects and five tasks, sign in to Workspace A, open /reports/project-progress, and run the report without a project filter.
Frame: Capture the protected app shell with the report title, project filter, summary area, full two-row grid, grand-total footer, and navigation item. Use a desktop viewport wide enough to show every column.
Visible proof: The grid shows five total tasks, two completed, one overdue, and 40% completion across Website Relaunch and Operations.
Alt text: The project-progress report shows task counts, overdue work, completion percentages, and a grand-total footer for two projects.
-->

The report is now a normal typed application slice: OpenAPI describes its
mounted route, auth protects its data, a pure mapper owns its wire result, and
React owns filter state and navigation. Keep each additional report in its own
vertical slice unless two reports genuinely share domain query logic.

## Related reference

- [Report routes and registration](/docs/reference/reports/report-routes-and-registration/)
- [GridDataset](/docs/reference/reports/grid-dataset/)
