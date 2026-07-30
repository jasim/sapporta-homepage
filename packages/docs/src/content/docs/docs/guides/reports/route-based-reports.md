---
title: "Route-based reports"
description:
  "Start here for a reusable aggregate: define and mount the protected typed
  report route, then continue to the focused data and screen guides."
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

After the route and dataset are in place, continue with
[Report screens and URL state](/docs/guides/reports/report-screens-and-url-state/)
for the typed client, visible screen states, routing, and shareable filters.

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

Focused route tests should cover:

- full and filtered results parsed with `gridDatasetSchema`;
- missing ability and an invisible project filter;
- another workspace contributing no rows, identifiers, or totals;
- report totals agreeing with scoped generated reads of the base tables;
- runtime and documentation composition for the mounted route.

Screen state, URL reload, and drill-through checks belong to the report-screen
and link guides.

Keep each report as a vertical slice unless two reports genuinely share domain
query logic. Sharing the renderer contract is not enough reason to couple their
queries.

## Related documentation

- [Shared contracts and request validation](/docs/guides/app-owned-features/shared-contracts-and-request-validation/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
- [Scoped report data](/docs/guides/reports/scoped-report-data/)
- [Report datasets and formatting](/docs/guides/reports/report-datasets-and-formatting/)
- [Report screens and URL state](/docs/guides/reports/report-screens-and-url-state/)
- [Report routes and registration](/docs/reference/reports/report-routes-and-registration/)
- [OpenAPI and endpoint discovery](/docs/guides/discovery/openapi-and-endpoint-discovery/)
- [Table, row, and report commands](/docs/reference/cli/table-row-and-report-commands/)
