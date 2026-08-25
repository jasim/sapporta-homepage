---
title: "Drill-through and cross-report links"
description:
  "Make report values explorable without placing navigation in the wire dataset."
---

A report value becomes navigation only when the frontend can turn authorized,
stable data identity into a route. The dataset carries IDs and values. The React
screen carries URL policy.

## Keep IDs in data and routes in the screen

The backend mapper includes `project_id` as a visually hidden column. It does
not serialize `href` values. The frontend decides what each visible cell should
do:

```tsx
import type { ReportCellLinkResolvers } from "@sapporta/frontend/report";
import type { ProjectProgressQuery } from "task-app-shared";

function generatedTableHref(
  table: string,
  filters: ReadonlyArray<readonly [column: string, value: string | number]>,
): string {
  const query = new URLSearchParams();
  for (const [column, value] of filters) {
    query.set(`filter[${column}][eq]`, String(value));
  }
  return `/tables/${table}?${query.toString()}`;
}

function taskTableHref(projectId: number, status?: string): string {
  const filters: Array<readonly [string, string | number]> = [
    ["project_id", projectId],
  ];
  if (status !== undefined) filters.push(["status", status]);
  return generatedTableHref("tasks", filters);
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
            href: generatedTableHref("projects", [["id", projectId]]),
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
context contains the current node, value, column, ancestors, dataset, and
optional report input. A hierarchical report can therefore resolve a child cell
from its own hidden ID plus an ancestor ID.

A resolver may return a list, but the current renderer follows only the first
link. Put one canonical action first; later entries are not rendered as a menu.

Pass the resolvers and current query to the renderer:

```tsx
<ReportGridDataset
  dataset={dataset}
  links={projectProgressLinks}
  linkContext={{ input: query }}
/>
```

Cross-report links can use the same input to preserve relevant state:

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
report and generated-table navigation should keep normal app-shell behavior.

## Choose a destination the application actually owns

The generated project destination is the filtered table route:

```text
/tables/projects?filter[id][eq]=<project-id>
```

`URLSearchParams` percent-encodes the bracket characters, but it represents the
same strict filter grammar. Sapporta generates `/tables/:tableName` and
`/tables/:tableName/new`; it does not generate `/tables/:tableName/:id`. An
application `/projects/:id` route is valid only when the application explicitly
registers it.

Task links use the same generated query syntax:

```http
GET /api/tables/tasks?filter[project_id][eq]=1&filter[status][eq]=open
```

## Exercise links and missing identities

Open `/reports/project-progress` and check each linked value:

- a project name opens the project table filtered by primary key;
- open and completed counts open task tables with both `project_id` and
  `status`;
- the returned task count agrees with the linked report value;
- a cross-report link preserves the intended `project_id`; and
- a synthetic or identifier-less node returns `[]` and renders no link.

Footer rows do not invoke cell resolvers in the current renderer. There are no
general public row or footer resolver slots to configure.

Links are navigation, not authorization. Hidden IDs remain visible to anyone who
can read the report response, URL filters are user-controlled, and every
destination must repeat its own ability and row-security checks.

Also reload and share the filtered report URL before following its links. That
browser check proves the screen reconstructs both the report input and its
drill-through context from URL state.

## Related documentation

- [Report links](/docs/reference/reports/report-links/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Generated record surfaces](/docs/reference/frontend/generated-record-surfaces/)
- [Application routes and navigation](/docs/reference/frontend/app-shell/application-routes-and-navigation/)
