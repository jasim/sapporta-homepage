---
title: "Drill-through and cross-report links"
description:
  "Make report values explorable without placing navigation in the wire dataset."
---

Report values become useful navigation when a user can open the record or
filtered rows behind them. This page adds links to the project-progress screen
without adding hrefs to its API response. You will learn how hidden IDs, cell
link resolvers, ancestors, and report input create record, table, and
cross-report destinations. The same approach works for ledgers, subtotals,
exception queues, and dashboard summaries.

```text
Add drill-through links to this Sapporta report. Keep stable IDs hidden in the GridDataset, resolve hrefs in the React screen, preserve current report filters where needed, guard optional IDs, and confirm every destination enforces its own authorization.
```

## Keep IDs in data and routes in the screen

The backend mapper includes `project_id` as a visually hidden column. The
frontend imports the public report link types and decides what each visible cell
should do:

```tsx
import type { ReportCellLinkResolvers } from "@sapporta/frontend/report";
import type { ProjectProgressQuery } from "task-app-shared";

function taskTableHref(projectId: number, status?: string): string {
  const query = new URLSearchParams();
  query.set("filter[project_id][eq]", String(projectId));
  if (status) query.set("filter[status][eq]", status);
  return `/tables/tasks?${query.toString()}`;
}

export const projectProgressLinks = {
  project: {
    cell: {
      project: ({ node }) => {
        const projectId = node.columns.project_id;
        if (typeof projectId !== "number") return [];
        return [
          {
            label: "Open project",
            href: `/tables/projects/${projectId}`,
            kind: "record",
            icon: "drill-up",
          },
        ];
      },
      open: ({ node }) => {
        const projectId = node.columns.project_id;
        if (typeof projectId !== "number") return [];
        return [
          {
            label: "Open tasks",
            href: taskTableHref(projectId, "open"),
            kind: "drill-down",
            icon: "drill-into",
          },
        ];
      },
      completed: ({ node }) => {
        const projectId = node.columns.project_id;
        if (typeof projectId !== "number") return [];
        return [
          {
            label: "Completed tasks",
            href: taskTableHref(projectId, "completed"),
            kind: "drill-down",
            icon: "drill-into",
          },
        ];
      },
    },
  },
} satisfies ReportCellLinkResolvers<ProjectProgressQuery>;
```

The resolver record is keyed first by `levelName` and then by column ID. Its
context also contains the current value, column, ancestors, dataset, and
optional report input. A hierarchical report can therefore link a child cell
using its own hidden ID plus an ancestor account or project ID.

Pass the resolvers and current query to the renderer:

```tsx
<ReportGridDataset
  dataset={dataset}
  links={projectProgressLinks}
  linkContext={{ input: query }}
/>
```

Cross-report links use that input to preserve relevant state:

```ts
completion: ({ node, input }) => {
  const projectId = node.columns.project_id;
  if (typeof projectId !== "number") return [];

  const targetProjectId = input?.project_id ?? projectId;
  const query = new URLSearchParams({
    project_id: String(targetProjectId),
  });

  return [{
    label: "Open completion history",
    href: `/reports/task-completion-history?${query.toString()}`,
    kind: "route",
    icon: "report",
  }];
},
```

Only use `target: "_blank"` for deliberately external destinations. Internal
report and generated-table navigation should keep the normal app-shell behavior.

## Exercise the links

Open `/reports/project-progress` and use each linked value. For the Website
Relaunch row, the project name should open `/tables/projects/1`. Its open count
should open a task grid whose strict filters include both `project_id` and
`status`.

The filter URL follows generated query syntax:

```http
GET /api/tables/tasks?filter[project_id][eq]=1&filter[status][eq]=open
```

Compare the number of returned rows with the linked count. Repeat for completed
tasks and for a synthetic or identifier-less row. Resolvers return an empty link
list when no safe destination exists.

<!--
Screenshot brief
Suggested asset: /images/docs/reports/project-progress-drill-through.png
Setup: Open the canonical project-progress report, click the Website Relaunch open-task count, and let the generated Tasks table load with project and status filters.
Frame: Capture the report in one browser tab and the filtered generated Tasks table in another, or use a side-by-side composite. Keep the report count, destination URL, filter chips, and returned rows visible.
Visible proof: The task table's row count matches the clicked report value and the URL contains strict project_id and status filters.
Alt text: A project-progress count links to the generated Tasks table filtered to the same project and open status, with matching row counts.
-->

Links are navigation, not authorization. Hidden IDs remain visible to anyone who
can read the report response, URL filters are user-controlled, and every target
route must apply its own ability and row-security checks. The report now
supports exploration without coupling backend datasets to React Router or
generated table URLs.

## Related reference

- [Report links](/docs/reference/reports/report-links/)
- [Query syntax](/docs/reference/http/query-syntax/)
