---
title: "Report datasets and formatting"
description:
  "Map domain rows into flat or hierarchical report data with totals and display
  semantics."
---

`GridDataset` is the wire shape consumed by Sapporta's report renderer. It
describes level topology, columns, nodes, rollups, and footers without importing
React or a database handle.

## Map scoped domain rows

The report read owns authentication and database scope. The mapper receives
ordinary visible rows plus an explicit date baseline:

```ts
import { Temporal } from "@sapporta/shared/temporal";
import type { GridDataset } from "@sapporta/shared/grid-dataset";

type ProjectRow = { id: number; name: string };
type TaskRow = {
  id: number;
  project_id: number;
  status: "open" | "in_progress" | "completed";
  due_date: Temporal.PlainDate | null;
};

type ProjectProgressInput = {
  projects: readonly ProjectRow[];
  tasks: readonly TaskRow[];
  today: Temporal.PlainDate;
};

export function projectProgressDataset(
  input: ProjectProgressInput,
): GridDataset {
  const rows = input.projects.map((project) => {
    const tasks = input.tasks.filter((task) => task.project_id === project.id);
    const completed = tasks.filter(
      (task) => task.status === "completed",
    ).length;
    const open = tasks.filter((task) => task.status === "open").length;
    const inProgress = tasks.filter(
      (task) => task.status === "in_progress",
    ).length;
    const overdue = tasks.filter(
      (task) =>
        task.status !== "completed" &&
        task.due_date !== null &&
        Temporal.PlainDate.compare(task.due_date, input.today) < 0,
    ).length;

    return {
      project,
      total: tasks.length,
      open,
      inProgress,
      completed,
      overdue,
      completion: tasks.length === 0 ? 0 : completed / tasks.length,
    };
  });

  const totals = rows.reduce(
    (sum, row) => ({
      total: sum.total + row.total,
      open: sum.open + row.open,
      inProgress: sum.inProgress + row.inProgress,
      completed: sum.completed + row.completed,
      overdue: sum.overdue + row.overdue,
    }),
    { total: 0, open: 0, inProgress: 0, completed: 0, overdue: 0 },
  );

  return {
    name: "project-progress",
    label: "Project progress",
    rootLevel: "project",
    levels: {
      project: {
        label: "Projects",
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
        childLevels: [],
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
          total: totals.total,
          open: totals.open,
          in_progress: totals.inProgress,
          completed: totals.completed,
          overdue: totals.overdue,
          completion: totals.total === 0 ? 0 : totals.completed / totals.total,
        },
      },
    ],
  };
}
```

Percentage values are ratios, so `0.4` renders as 40%. `visuallyHidden` keeps
`project_id` in the node for link resolvers without displaying it; hidden data
is still present in the response.
`zeroDisplay`, `colorRule`, width hints, and text display settings describe
presentation without converting source numbers into formatted strings.

For hierarchical reports, add named child levels, put source values in each
node's `columns`, put computed parent values in `rollup`, and attach child
arrays through `children`. Root totals belong in `footerRows`; totals inside a
child collection belong in `childFooterRows`.

## Test the contract, not the pixels

```ts
import { gridDatasetSchema } from "@sapporta/shared/grid-dataset";
import { Temporal } from "@sapporta/shared/temporal";

it("maps the canonical project progress totals", () => {
  const result = projectProgressDataset({
    projects: canonicalProjects,
    tasks: canonicalTasks,
    today: Temporal.PlainDate.from("2026-07-10"),
  });

  expect(() => gridDatasetSchema.parse(result)).not.toThrow();
  expect(result.nodes).toHaveLength(2);
  expect(result.footerRows?.[0]?.columns).toMatchObject({
    total: 5,
    completed: 2,
    overdue: 1,
    completion: 0.4,
  });
});
```

The schema check validates the wire shape. It does not prove that level names,
child placement, or row identities form a coherent hierarchy; focused
assertions and renderer tests cover those semantics.

Run the mapper test and then inspect the route output:

```bash
pnpm --filter ./packages/api exec vitest run project-progress
pnpm exec sapporta api get /api/reports/project-progress
```


Keep navigation out of the dataset, keep date arithmetic in Temporal, and add a
child level only when expanding a row reveals a meaningful lower level.

## Related reference

- [GridDataset](/docs/reference/reports/grid-dataset/)
- [Report links](/docs/reference/reports/report-links/)
