---
title: "Custom workflow screens"
description:
  "Compose bounded generated reads and app-owned actions around one human
  workflow."
---

A custom workflow screen composes generated reads and app-owned actions around
one human workflow. It does not replace generated tables that still own ordinary
record work. Register the completed component through
[Frontend routes, navigation, and layout](/docs/guides/app-owned-features/frontend-routes-navigation-and-layout/).

## Build the workflow screen

Create `packages/frontend/src/ProjectProgress.tsx`. The generated application
already mounts a TanStack Query provider. The table query option builders call
the generated `/api/tables/:tableName` routes, so server-side row visibility
still applies. The custom endpoint owns completion because it changes both task
status and history.

```tsx
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reloadTGridRows } from "@sapporta/frontend";
import { AppPage } from "@sapporta/frontend/layout";
import {
  tableQueryKeys,
  tableRecordsPageQueryOptions,
} from "@sapporta/frontend/table/query";
import { ApiError } from "@sapporta/shared/client";
import { Button } from "@sapporta/ui";
import { Link } from "react-router-dom";
import {
  taskCompletionErrorSchema,
  type TaskCompletionErrorBody,
} from "task-app-shared";
import { taskActionsApi } from "./api";

type Project = { id: number; name: string };
type Task = {
  id: number;
  project_id: number;
  title: string;
  status: string;
};

const TABLE_ROW_CAP = 100;

function decodeProject(row: Record<string, unknown>): Project {
  if (typeof row.id === "number" && typeof row.name === "string") {
    return { id: row.id, name: row.name };
  }
  throw new Error("Unexpected project row");
}

function decodeTask(row: Record<string, unknown>): Task {
  if (
    typeof row.id === "number" &&
    typeof row.project_id === "number" &&
    typeof row.title === "string" &&
    typeof row.status === "string"
  ) {
    return {
      id: row.id,
      project_id: row.project_id,
      title: row.title,
      status: row.status,
    };
  }
  throw new Error("Unexpected task row");
}

function taskActionFailure(
  error: unknown,
): TaskCompletionErrorBody | undefined {
  if (!(error instanceof ApiError)) return undefined;

  const parsed = taskCompletionErrorSchema.safeParse(error.body);
  if (!parsed.success) return undefined;

  if (
    (error.status === 404 && parsed.data.code === "TASK_NOT_FOUND") ||
    (error.status === 409 && parsed.data.code === "TASK_ALREADY_COMPLETED")
  ) {
    return parsed.data;
  }

  return undefined;
}

export function ProjectProgress() {
  const queryClient = useQueryClient();
  const projectsQuery = useQuery(
    tableRecordsPageQueryOptions({
      tableName: "projects",
      page: 1,
      limit: TABLE_ROW_CAP,
      decodeRow: decodeProject,
    }),
  );
  const tasksQuery = useQuery(
    tableRecordsPageQueryOptions({
      tableName: "tasks",
      page: 1,
      limit: TABLE_ROW_CAP,
      decodeRow: decodeTask,
    }),
  );

  async function refreshCompletionState() {
    reloadTGridRows("tasks");
    reloadTGridRows("task_events");
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: tableQueryKeys.table("tasks"),
      }),
      queryClient.invalidateQueries({
        queryKey: tableQueryKeys.table("task_events"),
      }),
    ]);
  }

  const completeTask = useMutation({
    mutationFn: async (task: Task) => {
      await taskActionsApi.completeTask({
        params: { id: task.id },
        body: {},
      });
      return task;
    },
    onSuccess: refreshCompletionState,
    onError: async (error) => {
      if (taskActionFailure(error)) {
        await refreshCompletionState();
      }
    },
    throwOnError: (error) => taskActionFailure(error) === undefined,
  });

  const projects = projectsQuery.data?.data ?? [];
  const tasks = tasksQuery.data?.data ?? [];
  const loading = projectsQuery.isPending || tasksQuery.isPending;
  const loadError = projectsQuery.error ?? tasksQuery.error;
  const actionError = taskActionFailure(completeTask.error);
  const pendingTaskId = completeTask.isPending
    ? completeTask.variables?.id
    : undefined;
  const incomplete =
    (projectsQuery.data?.meta.total ?? 0) >
      (projectsQuery.data?.data.length ?? 0) ||
    (tasksQuery.data?.meta.total ?? 0) > (tasksQuery.data?.data.length ?? 0);

  const tasksByProject = useMemo(() => {
    const grouped = new Map<number, Task[]>();
    for (const task of tasks) {
      const projectTasks = grouped.get(task.project_id) ?? [];
      projectTasks.push(task);
      grouped.set(task.project_id, projectTasks);
    }
    return grouped;
  }, [tasks]);

  if (loading) {
    return (
      <AppPage title="Project progress" bodyClassName="p-6">
        <p className="text-sm text-sap-muted">Loading progress…</p>
      </AppPage>
    );
  }

  if (loadError) {
    return (
      <AppPage title="Project progress" bodyClassName="p-6">
        <p role="alert" className="text-sm text-red-700">
          Project progress could not be loaded.
        </p>
        <Button
          className="mt-3"
          onClick={() =>
            void Promise.all([projectsQuery.refetch(), tasksQuery.refetch()])
          }
        >
          Retry
        </Button>
      </AppPage>
    );
  }

  if (incomplete) {
    return (
      <AppPage title="Project progress" bodyClassName="space-y-3 p-6">
        <p role="status" className="text-sm text-sap-muted">
          This bounded summary is incomplete because at least one generated read
          exceeded the {TABLE_ROW_CAP}-row cap. Use the scoped project-progress
          report for complete totals.
        </p>
      </AppPage>
    );
  }

  if (projects.length === 0) {
    return (
      <AppPage title="Project progress" bodyClassName="p-6">
        <p className="text-sm text-sap-muted">No projects are visible.</p>
        <Link className="mt-4 inline-block underline" to="/tables/projects/new">
          Create a project
        </Link>
      </AppPage>
    );
  }

  return (
    <AppPage
      title="Project progress"
      actions={
        <Link className="text-sm underline" to="/tables/tasks">
          Open Tasks
        </Link>
      }
      bodyClassName="space-y-4 p-6"
    >
      <p className="text-sm text-sap-muted">
        Complete tasks here. Edit records in the generated tables.
      </p>

      {completeTask.isSuccess && (
        <p role="status" className="text-sm text-green-700">
          {completeTask.data.title} is complete.
        </p>
      )}
      {actionError && (
        <p role="alert" className="text-sm text-red-700">
          {actionError.error}
        </p>
      )}

      {projects.map((project) => {
        const projectTasks = tasksByProject.get(project.id) ?? [];
        const completed = projectTasks.filter(
          (task) => task.status === "completed",
        ).length;

        return (
          <section key={project.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-medium">{project.name}</h2>
              <span className="text-sm text-sap-muted">
                {completed} of {projectTasks.length} complete
              </span>
            </div>

            <ul className="mt-3 divide-y">
              {projectTasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 py-2">
                  <span className="min-w-0 flex-1 truncate">{task.title}</span>
                  <span className="text-xs text-sap-muted">{task.status}</span>
                  {task.status !== "completed" && (
                    <Button
                      size="sm"
                      disabled={pendingTaskId === task.id}
                      onClick={() => completeTask.mutate(task)}
                    >
                      {pendingTaskId === task.id ? "Completing…" : "Complete"}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </AppPage>
  );
}
```

`AppPage` gives every state the shell's standard fixed header and one scrolling
body. The shell keeps its responsive sidebar control available without adding a
toggle to `ProjectProgress`. A workspace that owns its own height and overflow
can compose `PageFrame`, `PageHeader`, and `PageBody` directly; a naturally
growing route can omit these wrappers and use the shell scroller.

`tableRecordsPageQueryOptions()` supplies stable table cache keys, passes query
cancellation to the generated HTTP request, and decodes each row at the browser
boundary. `taskCompletionErrorSchema` narrows only the feature's declared
recovery bodies. The component does not maintain a second loader or hand-copy
the error envelope.

The completion transaction changes both `tasks` and `task_events`. Success,
`404 TASK_NOT_FOUND`, and `409 TASK_ALREADY_COMPLETED` all make the visible
collections potentially stale, so those declared branches invalidate both
TanStack Query table prefixes. The `409` contract describes a sequential repeat
after the task is already complete; it does not promise a cross-process
simultaneous-writer conflict.

Malformed declared bodies, transport and response-validation failures, and
unexpected errors do not become local action messages. `throwOnError` keeps them
on the application's central error-boundary path.

`reloadTGridRows()` signals an affected mounted, registered TGrid root and is a
no-op when that session is absent. TanStack Query and TGrid are separate
server-state consumers.

Client filters, hidden fields, and route parameters are product constraints, not
authorization. Do not add `workspace_id` or `scoped_to_user_id` to this
component. The generated table APIs and custom workflow enforce authority on the
server.

## Exercise every screen state

Use rows created inside the test or test session; do not depend on a previous
guide's seed data or fixed IDs. Cover these states and boundaries:

1. Loading, retryable read error, empty, ready, per-task pending, success,
   declared stale failure, and the central unexpected-error path.
2. Only the task being submitted is disabled; the rest of the screen remains
   readable.
3. An aborted query publishes no replacement page, and one malformed row fails
   the query instead of producing a smaller aggregate.
4. When either response has `meta.total > data.length`, the 100-row incomplete
   state appears and no complete-looking counts are rendered.
5. Success and declared stale `404`/repeat `409` branches invalidate the `tasks`
   and `task_events` TanStack Query prefixes.
6. Only mounted TGrids registered for those affected root tables reload.
7. Stable project and task IDs survive sort and refresh; no interaction state
   depends on an array index.
8. A completion ratio of `0.4` displays as `40%`.
9. The empty-state action navigates to `/tables/projects/new`, while the Tasks
   link returns to `/tables/tasks`.
10. Negative API tests still prove server ability and row-scope enforcement.

Route reload and responsive shell checks belong to the
[routing and layout guide](/docs/guides/app-owned-features/frontend-routes-navigation-and-layout/).

This screen intentionally reads at most 100 records from each table. It is for a
small, screen-local projection. Put reusable or complete authoritative totals
behind a scoped [report route](/docs/guides/reports/route-based-reports/); large
datasets need scoped SQL grouping or another store-level implementation.

## Related reference

- [App shell layout and sidebar](/docs/reference/frontend/app-shell/layout-and-sidebar/)
- [Generated record surfaces](/docs/reference/frontend/generated-record-surfaces/)
- [Table query options](/docs/reference/frontend/table-query-options/)
- [Cached table reads and refresh](/docs/guides/app-owned-features/cached-table-reads-and-refresh/)
