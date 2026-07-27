---
title: "Route-based reports"
description:
  "Start here for a reusable aggregate: define the protected typed route and
  screen, then scope base rows, map the dataset, and add drill-through."
---

Generated table screens and endpoints remain the shortest path for ordinary
record work. As soon as one result joins rows or calculates totals for more than
one caller, it becomes an app-owned read model. A report route gives the
browser, CLI, and typed clients one authoritative result.

That boundary centralizes reuse and authorization, but it does not make an
all-row JavaScript loop scalable. Keep a small, screen-local aggregate in the
browser only when every input is explicitly bounded. Use a scoped report route
for reusable results, and move large grouping work into scoped SQL or a store
module.

## Start with the wire contract

Compact, shareable filters fit a GET query. Larger nested inputs can use a POST
body instead. Put the browser-safe contract in
`packages/shared/src/contracts/project-progress.ts` and re-export it from the
shared contracts index:

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
    },
  }),
});
```

The contract path is deliberately bare. The parent API mount supplies `/api`, so
the deployed route is `/api/reports/project-progress`.

This contract declares its feature-owned response. Authentication and ability
failures use the application's shared `401`/`403` auth envelope rather than
being copied into every feature contract. If this report deliberately returns a
feature-specific not-found response for an invisible `project_id`, add that
response to the shared contract; returning an empty filtered dataset is also a
valid product choice when it does not reveal whether the ID exists.

## Keep the protected adapter thin

The handler chooses the ability and data authority, asks a store function for
already-visible rows, calculates one date baseline, and calls the pure mapper:

```ts
import type { Temporal } from "@sapporta/shared/temporal";
import { TsRestApi, type SapportaEnv } from "@sapporta/server";
import { projectProgressContract } from "task-app-shared";
import { requireAuthorizedWorkspaceData } from "../project-auth/index.js";
import { projectProgressDataset } from "../modules/reports/project-progress.js";
import { readProjectProgressRows } from "../stores/project-progress.js";

type ProjectProgressRouteOptions = {
  today(): Temporal.PlainDate;
};

export function createProjectProgressApi(
  options: ProjectProgressRouteOptions,
): TsRestApi<SapportaEnv> {
  const api = new TsRestApi<SapportaEnv>();

  api.register(
    "projectProgress",
    projectProgressContract.projectProgress,
    async ({ c, request }) => {
      const auth = requireAuthorizedWorkspaceData(c, {
        action: "read",
        subject: "project-progress",
      });
      const rows = await readProjectProgressRows({
        db: c.get("db"),
        auth,
        projectId: request.query.project_id,
      });
      const asOf = options.today();

      return {
        status: 200,
        body: projectProgressDataset({ ...rows, asOf }),
      };
    },
  );

  return api;
}
```

Grant the intended roles `read` on the application-owned `project-progress`
subject. The frontend's protected route is a UX boundary; this server check and
the row predicates remain authoritative.

The application clock is injected where the route is assembled:

```ts
import { Temporal } from "@sapporta/shared/temporal";
import { createProjectProgressApi } from "./app/project-progress.js";

const projectProgressApi = createProjectProgressApi({
  today: () => Temporal.Now.plainDateISO(),
});

export function loadApp(app: TsRestApi<SapportaEnv>, options: LoadAppOptions) {
  app.route("/", projectProgressApi);
  app.extend(projectProgressApi);
  // Keep the existing route mounts here.
}
```

`route()` mounts the Hono handlers. `extend()` copies the sub-app's current
documentation emitters. Register operations before those calls, and complete
both calls before the combined OpenAPI document is generated. The general
registration contract belongs in
[TsRestApi and route registration](/docs/reference/server/ts-rest-api-and-route-registration/).

The mapper never calls `Temporal.Now`. Tests inject a fixed
`Temporal.PlainDate`; production wiring decides what “today” means. A product
that needs shareable historical results should add a validated `as_of` query and
include it in URL state instead.

## Add the typed client and protected screen

The frontend imports the same contract:

```ts
import { getApiBase } from "@sapporta/frontend/platform";
import { createApiClient } from "@sapporta/shared/client";
import { projectProgressContract } from "task-app-shared";

export const projectProgressApi = createApiClient(projectProgressContract, {
  baseUrl: getApiBase,
});
```

Read `project_id` from `useSearchParams`, call
`projectProgressApi.projectProgress({ query })`, and use that query in the
screen's query key. The screen needs four visible states:

1. loading while the request is in flight;
2. an error surface when the typed call fails;
3. an empty result when `dataset.nodes` is empty; and
4. the report result.

The dataset label is display text supplied by the mapper. Render it above the
Grid; `ReportGridDataset` does not render the heading:

```tsx
<>
  <h1>{dataset.label}</h1>
  {dataset.nodes.length === 0 ? (
    <EmptyReport message="No visible projects match this filter." />
  ) : (
    <ReportGridDataset
      dataset={dataset}
      links={projectProgressLinks}
      linkContext={{ input: query }}
    />
  )}
</>
```

Register the nested React route as `reports/project-progress` in
`appProtectedRoutes`, and use the absolute `/reports/project-progress` URL in
navigation. Keeping the filter in the URL makes an authorized result reloadable,
bookmarkable, and shareable. Follow
[Typed client creation](/docs/reference/contracts/typed-client-creation/) and
[App shell, routes, and navigation](/docs/reference/frontend/app-shell-routes-and-navigation/)
for the exhaustive client and shell APIs.

## Prove runtime and documentation agree

In a project that implements and runs this report, use these commands from the
repository root:

```bash
pnpm exec sapporta endpoints show "GET /api/reports/project-progress"
pnpm exec sapporta api get /api/reports/project-progress
pnpm exec sapporta api get /api/reports/project-progress --query '{"project_id":1}'
```

The endpoint must appear in runtime discovery and the merged OpenAPI document.
An OpenAPI entry alone does not prove `route()` mounted the handler, and a
successful call alone does not prove `extend()` published it.

Focused route and screen tests should cover:

- full and filtered results parsed with `gridDatasetSchema`;
- missing ability and an invisible project filter;
- another workspace contributing no rows, identifiers, or totals;
- report totals agreeing with scoped generated reads of the base tables;
- loading, error, empty, and result UI;
- URL filter reload and share behavior; and
- project and task/status drill-through.

Keep each report as a vertical slice unless two reports genuinely share domain
query logic. Sharing the renderer contract is not enough reason to couple their
queries.

## Related documentation

- [Shared contracts and request validation](/docs/guides/app-owned-features/shared-contracts-and-request-validation/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
- [Scoped report data](/docs/guides/reports/scoped-report-data/)
- [Report routes and registration](/docs/reference/reports/report-routes-and-registration/)
- [OpenAPI and endpoint discovery](/docs/guides/discovery/openapi-and-endpoint-discovery/)
- [Table, row, and report commands](/docs/reference/cli/table-row-and-report-commands/)
