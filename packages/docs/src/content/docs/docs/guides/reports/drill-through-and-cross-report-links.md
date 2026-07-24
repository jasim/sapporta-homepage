---
title: "Drill-through and cross-report links"
description:
  "Make report values explorable without placing navigation in the wire dataset."
---

Report values become navigation when a resolver can turn stable data identity
into a route. The dataset carries IDs and values. The React screen carries URL
knowledge.

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
            href: `/tables/projects?filter[id][eq]=${projectId}`,
            kind: "drill-down",
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

A resolver may return a list, but the current renderer uses only the first
entry. Put one canonical action first rather than treating a cell as a menu.

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
Relaunch row, the project name should open `/tables/projects` filtered by its
primary key. Its open count should open a task grid whose strict filters include
both `project_id` and `status`. A dedicated record page requires an app-owned
route; Sapporta does not generate `/tables/:table/:id`.

The filter URL follows generated query syntax:

```http
GET /api/tables/tasks?filter[project_id][eq]=1&filter[status][eq]=open
```

Compare the number of returned rows with the linked count. Repeat for completed
tasks and for a synthetic or identifier-less row. Resolvers return an empty link
list when no safe destination exists.


Links are navigation, not authorization. Hidden IDs remain visible to anyone who
can read the report response, URL filters are user-controlled, and every target
route applies its own ability and row-security checks.

## Related reference

- [Report links](/docs/reference/reports/report-links/)
- [Query syntax](/docs/reference/http/query-syntax/)
