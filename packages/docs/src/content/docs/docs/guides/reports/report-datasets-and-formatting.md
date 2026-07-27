---
title: "Report datasets and formatting"
description:
  "Map domain rows into flat or hierarchical report data with totals and display
  semantics."
---

`GridDataset` is the wire shape consumed by Sapporta's report renderer. The
report read owns authorization and row scope. The mapper receives ordinary
visible rows and turns them into stable nodes, raw values, presentation
metadata, and footers.

## Keep the mapper pure

Pass the date baseline explicitly along with the visible rows:

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
  asOf: Temporal.PlainDate;
};

export function projectProgressDataset({
  projects,
  tasks,
  asOf,
}: ProjectProgressInput): GridDataset {
  const tasksByProject = new Map<number, TaskRow[]>();
  for (const task of tasks) {
    const projectTasks = tasksByProject.get(task.project_id) ?? [];
    projectTasks.push(task);
    tasksByProject.set(task.project_id, projectTasks);
  }

  const rows = projects.map((project) => {
    const projectTasks = tasksByProject.get(project.id) ?? [];
    const completed = projectTasks.filter(
      (task) => task.status === "completed",
    ).length;
    const open = projectTasks.filter((task) => task.status === "open").length;
    const inProgress = projectTasks.filter(
      (task) => task.status === "in_progress",
    ).length;
    const overdue = projectTasks.filter(
      (task) =>
        task.status !== "completed" &&
        task.due_date !== null &&
        Temporal.PlainDate.compare(task.due_date, asOf) < 0,
    ).length;

    return {
      project,
      total: projectTasks.length,
      open,
      inProgress,
      completed,
      overdue,
      completion:
        projectTasks.length === 0 ? 0 : completed / projectTasks.length,
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
    label: `Project progress as of ${asOf.toString()}`,
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
          { id: "project", label: "Project", kind: "text", minWidth: 40 },
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

The overdue rule is readable from the function: a task is not completed, has a
due date, and that date is before `asOf`. The mapper does not read the database,
auth context, HTTP request, or `Temporal.Now`, so the same inputs always produce
the same dataset.

The `name` remains `project-progress`; the renderer uses it with the level name
for persisted column-sizing identity. The `label` can vary because it is display
text. Render that label as the screen heading above `ReportGridDataset`.

## Preserve values before presentation

Percentage values are ratios, so `0.4` renders as 40%. `visuallyHidden` keeps
`project_id` in each node for link resolvers without displaying it. Hidden data
is still present in the response and must already be authorized. Both `rowKey`
and the hidden ID derive from stable domain identity, not the project label or
the row's array position.

`displayFormat`, `textDisplay`, `zeroDisplay`, `colorRule`, and the width hints
describe presentation. They do not replace source numbers, booleans, dates, or
timestamps with formatted strings. Widths are approximate displayed-character
counts, not pixels; `minWidth: 40` is a reasonable starting point for a project
name.

Wire dates use canonical strings. Decode them to Temporal values at the domain
boundary, then use Temporal for comparison and arithmetic.

For hierarchical reports, add named child levels, put source values in each
node's `columns`, put computed parent values in `rollup`, and attach child
arrays through `children`. Root totals belong in `footerRows`; totals inside a
child collection belong in `childFooterRows`.

## Define the fixture inside the test

A standalone mapper test owns every row and its fixed baseline:

```ts
import { gridDatasetSchema } from "@sapporta/shared/grid-dataset";
import { Temporal } from "@sapporta/shared/temporal";

it("maps visible project progress rows deterministically", () => {
  const projects = [
    { id: 1, name: "Website relaunch" },
    { id: 2, name: "Mobile refresh" },
  ];
  const tasks = [
    {
      id: 1,
      project_id: 1,
      status: "completed" as const,
      due_date: Temporal.PlainDate.from("2026-07-01"),
    },
    {
      id: 2,
      project_id: 1,
      status: "open" as const,
      due_date: Temporal.PlainDate.from("2026-07-09"),
    },
    {
      id: 3,
      project_id: 1,
      status: "in_progress" as const,
      due_date: Temporal.PlainDate.from("2026-07-20"),
    },
    {
      id: 4,
      project_id: 2,
      status: "completed" as const,
      due_date: null,
    },
    {
      id: 5,
      project_id: 2,
      status: "open" as const,
      due_date: Temporal.PlainDate.from("2026-07-30"),
    },
  ];

  const result = gridDatasetSchema.parse(
    projectProgressDataset({
      projects,
      tasks,
      asOf: Temporal.PlainDate.from("2026-07-10"),
    }),
  );

  expect(result.name).toBe("project-progress");
  expect(result.label).toBe("Project progress as of 2026-07-10");
  expect(result.nodes).toHaveLength(2);
  expect(result.nodes[0]).toMatchObject({
    rowKey: "project:1",
    columns: { project_id: 1, overdue: 1 },
  });
  expect(result.footerRows?.[0]).toMatchObject({
    rowKey: "grand-total",
    columns: {
      total: 5,
      completed: 2,
      overdue: 1,
      completion: 0.4,
    },
  });
});
```

The schema parse validates the complete wire result, including the footer. The
focused assertions prove the math, hidden ID, stable row key, explicit date, and
ratio semantics. Add hierarchy-specific tests when levels have children; schema
validity alone does not prove that a hierarchy is coherent.

## Related documentation

- [GridDataset](/docs/reference/reports/grid-dataset/)
- [Column sizing](/docs/reference/column-sizing/)
- [Route-based reports](/docs/guides/reports/route-based-reports/)
