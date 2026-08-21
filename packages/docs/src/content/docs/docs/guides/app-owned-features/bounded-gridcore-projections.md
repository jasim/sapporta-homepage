---
title: "Bounded GridCore projections"
description:
  "Render a small application-owned calculated row model without implying
  generated CRUD, completeness, or row security."
---

Use GridCore when the application owns temporary, composite, calculated, or
browser-owned rows. The caller must bound every source and refuse to present a
complete-looking result when a page is truncated.

## Build the calculated rows

Suppose a screen owns two generated-table reads capped at 100 rows:

```tsx
import { useMemo } from "react";
import {
  CELL_GRID_WITH_ACTIVE_ROW,
  GridLevel,
  GridRuntimeProvider,
  createGridRuntime,
  inMemoryGridDataSource,
  useGridRuntimeEffect,
  type GridSchema,
  type TreeNode,
} from "@sapporta/grid";
import { number, percentage, text } from "@sapporta/grid/column-preset";

type Project = { id: string; name: string };
type Task = { id: string; projectId: string; completed: boolean };
type BoundedPage<T> = {
  data: readonly T[];
  meta: { total: number; limit: number };
};

const ROW_CAP = 100;
declare const projectsPage: BoundedPage<Project>;
declare const tasksPage: BoundedPage<Task>;

const schema = {
  rootLevel: "projects",
  levels: {
    projects: {
      name: "projects",
      rowHeaderColumn: "none",
      childLevels: [],
      options: {},
      columns: [
        text({ id: "name", name: "Project", edit: "none" }),
        number({ id: "tasks", name: "Tasks", edit: "none" }),
        number({ id: "completed", name: "Completed", edit: "none" }),
        percentage({ id: "completion", name: "Completion", edit: "none" }),
      ],
    },
  },
} satisfies GridSchema;
```

Check completeness before calculating:

```tsx
export function ProjectProgressGrid() {
  const incomplete =
    projectsPage.meta.total > projectsPage.data.length ||
    tasksPage.meta.total > tasksPage.data.length;

  if (incomplete) {
    return (
      <p role="status">
        This summary is incomplete because a generated read exceeded the{" "}
        {ROW_CAP}-row cap. Use the scoped report for complete totals.
      </p>
    );
  }

  return <CompleteProjectProgressGrid />;
}
```

Pre-index the task rows and use stable domain identity for `rowKey`:

```tsx
function CompleteProjectProgressGrid() {
  const tree = useMemo(() => {
    const countsByProject = new Map<
      string,
      { total: number; completed: number }
    >();

    for (const task of tasksPage.data) {
      const counts = countsByProject.get(task.projectId) ?? {
        total: 0,
        completed: 0,
      };
      counts.total += 1;
      if (task.completed) counts.completed += 1;
      countsByProject.set(task.projectId, counts);
    }

    return projectsPage.data.map((project) => {
      const counts = countsByProject.get(project.id) ?? {
        total: 0,
        completed: 0,
      };
      return {
        rowKey: project.id,
        levelName: "projects",
        columns: {
          name: project.name,
          tasks: counts.total,
          completed: counts.completed,
          completion: counts.total === 0 ? 0 : counts.completed / counts.total,
        },
      };
    }) satisfies TreeNode[];
  }, []);

  const runtime = useGridRuntimeEffect(
    () =>
      createGridRuntime({
        schema,
        interaction: CELL_GRID_WITH_ACTIVE_ROW,
        dataSource: inMemoryGridDataSource({
          schema,
          tree,
          levels: {
            projects: {
              readonly: true,
              sortMode: "client",
              filterMode: "none",
              paginationMode: "none",
            },
          },
        }),
      }),
    [tree],
  );

  if (!runtime) return null;
  return (
    <GridRuntimeProvider runtime={runtime}>
      <GridLevel path={runtime.root.path} />
    </GridRuntimeProvider>
  );
}
```

The application owns the rows and calculation; Grid owns rendering and
interaction. A ratio such as `0.4` renders as `40%`. A bounded browser
projection is suitable only for small screen-local data. Reusable or complete
aggregates belong behind a scoped report route; moving the same loop to the
server changes placement, not complexity.

## Related documentation

- [Grid-first record workflows](/docs/guides/generated-surfaces/grid-first-record-workflows/)
- [Grid interaction and selection](/docs/guides/generated-surfaces/grid-interaction-and-selection/)
- [Route-based reports](/docs/guides/reports/route-based-reports/)
- [GridCore](/grid/reference/grid-core/)
