---
title: "Report screens and URL state"
description:
  "Call a typed report route from a protected screen, preserve report input in
  the URL, and render explicit loading, error, empty, and result states."
---

This page assumes the protected report route already returns a scoped
`GridDataset`. The frontend imports the same contract and owns only calling, URL
state, presentation, and navigation.

## Create the typed client

```ts
import { getApiBase } from "@sapporta/frontend/platform";
import { createApiClient } from "@sapporta/shared/client";
import { projectProgressContract } from "task-app-shared";

export const projectProgressApi = createApiClient(projectProgressContract, {
  baseUrl: getApiBase,
});
```

Read `project_id` from `useSearchParams`, validate it with the shared query
schema, call `projectProgressApi.projectProgress({ query })`, and include that
validated query in the TanStack Query key. URL state should reconstruct the same
report input on reload.

## Render every visible state

The screen needs four explicit states:

1. loading while the request is in flight;
2. an error surface when the typed call fails;
3. an empty result when `dataset.nodes` is empty; and
4. the report result.

The mapper supplies `dataset.label` as display text. Render it above the Grid;
`ReportGridDataset` does not render the heading:

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

The same validated input is available to link resolvers through `linkContext`.
It can preserve a date range or project filter in a drill-through destination.

## Register and exercise the screen

Register the nested React route as `reports/project-progress` in
`appProtectedRoutes`, and use the absolute `/reports/project-progress` URL in
navigation. Keeping compact filters in the URL makes an authorized report
reloadable, bookmarkable, and shareable.

Focused screen tests cover:

- loading, error, empty, and result UI;
- valid and invalid URL input;
- direct reload and shared-link reconstruction;
- dataset heading and stable result identity;
- project and task/status drill-through; and
- server rejection when the caller lacks the report ability or row authority.

Protected frontend routing is a UX boundary. The report route still owns
authorization and scoped base reads.

## Related documentation

- [Route-based reports](/docs/guides/reports/route-based-reports/)
- [Report datasets and formatting](/docs/guides/reports/report-datasets-and-formatting/)
- [Drill-through and cross-report links](/docs/guides/reports/drill-through-and-cross-report-links/)
- [Typed client creation](/docs/reference/contracts/typed-client-creation/)
- [Application routes and navigation](/docs/reference/frontend/app-shell/application-routes-and-navigation/)
