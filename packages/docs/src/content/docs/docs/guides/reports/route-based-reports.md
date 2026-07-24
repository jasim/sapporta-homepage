---
title: "Route-based reports"
description:
  "Create a protected typed report route and screen with shareable filters."
---

A Sapporta report is an app-owned read model. A shared contract names its input
and `GridDataset` output. The API applies authority before computing it. A React
route owns filters, execution state, rendering, and navigation.

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
        today: Temporal.Now.plainDateISO(),
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
completed tasks, and 40% completion. Overdue counts depend on the date at the
route boundary. Mapper tests inject a fixed `Temporal.PlainDate`; production
routes use the current date or an application clock.

Parse route-test responses with `gridDatasetSchema` so the wire shape cannot
drift from the renderer contract.


Keep each report as a vertical slice unless two reports genuinely share domain
query logic. Sharing the renderer contract is not enough reason to couple their
queries.

## Related reference

- [Report routes and registration](/docs/reference/reports/report-routes-and-registration/)
- [GridDataset](/docs/reference/reports/grid-dataset/)
