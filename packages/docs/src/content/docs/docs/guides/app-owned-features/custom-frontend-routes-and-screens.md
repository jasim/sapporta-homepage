---
title: "Custom frontend routes and screens"
description:
  "Add a protected workflow screen inside the generated application shell."
---

A custom screen composes generated reads and app-owned actions around one human
workflow. It does not replace the generated tables that still own ordinary
record work.

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
import {
  tableQueryKeys,
  tableRecordsPageQueryOptions,
} from "@sapporta/frontend/table/query";
import { ApiError } from "@sapporta/shared/client";
import { apiProblemFromBody } from "@sapporta/shared/validation";
import { Button } from "@sapporta/ui";
import { Link } from "react-router-dom";
import { taskActionsApi } from "./api";

type Project = { id: number; name: string };
type Task = {
  id: number;
  project_id: number;
  title: string;
  status: string;
};

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

function actionErrorMessage(error: unknown): string | undefined {
  if (error === null) return undefined;
  if (error instanceof ApiError) {
    return (
      apiProblemFromBody(error.body)?.summary ??
      "The task could not be completed."
    );
  }
  return "The task could not be completed.";
}

export function ProjectProgress() {
  const queryClient = useQueryClient();
  const projectsQuery = useQuery(
    tableRecordsPageQueryOptions({
      tableName: "projects",
      page: 1,
      limit: 100,
      decodeRow: decodeProject,
    }),
  );
  const tasksQuery = useQuery(
    tableRecordsPageQueryOptions({
      tableName: "tasks",
      page: 1,
      limit: 100,
      decodeRow: decodeTask,
    }),
  );

  const completeTask = useMutation({
    mutationFn: async (task: Task) => {
      await taskActionsApi.completeTask({
        params: { id: task.id },
        body: {},
      });
      return task;
    },
    onSuccess: async () => {
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
    },
  });

  const projects = projectsQuery.data?.data ?? [];
  const tasks = tasksQuery.data?.data ?? [];
  const loading = projectsQuery.isPending || tasksQuery.isPending;
  const loadError = projectsQuery.error ?? tasksQuery.error;
  const actionError = actionErrorMessage(completeTask.error);
  const pendingTaskId = completeTask.isPending
    ? completeTask.variables?.id
    : undefined;

  const tasksByProject = useMemo(() => {
    const grouped = new Map<number, Task[]>();
    for (const task of tasks) {
      grouped.set(task.project_id, [
        ...(grouped.get(task.project_id) ?? []),
        task,
      ]);
    }
    return grouped;
  }, [tasks]);

  if (loading) {
    return <p className="p-6 text-sm text-sap-muted">Loading progress…</p>;
  }

  if (loadError) {
    return (
      <div className="p-6">
        <p role="alert" className="text-sm text-red-700">
          Project progress could not be loaded.
        </p>
        <Button
          className="mt-3"
          onClick={() =>
            void Promise.all([
              projectsQuery.refetch(),
              tasksQuery.refetch(),
            ])
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Project progress</h1>
        <p className="mt-2 text-sm text-sap-muted">No projects are visible.</p>
        <Link className="mt-4 inline-block underline" to="/tables/projects/new">
          Create a project
        </Link>
      </div>
    );
  }

  return (
    <main className="space-y-4 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Project progress</h1>
          <p className="text-sm text-sap-muted">
            Complete tasks here. Edit records in the generated tables.
          </p>
        </div>
        <Link className="text-sm underline" to="/tables/tasks">
          Open Tasks
        </Link>
      </div>

      {completeTask.isSuccess && (
        <p role="status" className="text-sm text-green-700">
          {completeTask.data.title} is complete.
        </p>
      )}
      {actionError && (
        <p role="alert" className="text-sm text-red-700">
          {actionError}
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
    </main>
  );
}
```

`tableRecordsPageQueryOptions()` supplies stable table cache keys, passes query
cancellation to the generated HTTP request, and decodes each row at the browser
boundary. `apiProblemFromBody()` recognizes Sapporta error bodies for the typed
action. The component does not maintain a second loader or error-envelope
parser.

The completion transaction changes both `tasks` and `task_events`. Its success
handler invalidates both TanStack Query table prefixes. `reloadTGridRows()`
refreshes an affected table only when a mounted TGrid uses that table as its
root. TanStack Query and TGrid are separate server-state consumers.

Client filters, hidden fields, and route parameters are product constraints, not
authorization. Do not add `workspace_id` or `scoped_to_user_id` to this
component. The generated table APIs and custom workflow enforce authority on the
server.

## Add the protected route and navigation item

Update `packages/frontend/src/App.tsx` using the project's existing exported
values:

```tsx
import { Navigate, Route } from "react-router-dom";
import type { Navigation } from "@sapporta/frontend/shell";
import { ChartNoAxesColumnIncreasing, Sparkles } from "lucide-react";
import { ProjectProgress } from "./ProjectProgress";
import { Welcome } from "./Welcome";

const welcomePath = "/welcome";

export const appNavigation: Navigation = [
  {
    label: "Views",
    items: [
      { label: "Welcome", icon: Sparkles, to: welcomePath },
      {
        label: "Project progress",
        icon: ChartNoAxesColumnIncreasing,
        to: "/projects/progress",
      },
    ],
  },
];

export const appHomeRoute = (
  <Route index element={<Navigate to={welcomePath} replace />} />
);

export const appProtectedRoutes = (
  <>
    <Route path="projects/progress" element={<ProjectProgress />} />
  </>
);
```

Keep the existing `appPublicRoutes` export and any other routes in the file.
Protected routes render after the application has loaded the authenticated
session and active workspace. A public route belongs in `appPublicRoutes` only
when both the page and its data are intentionally anonymous.

## Exercise every screen state

Run the frontend build, then start the app:

```bash
pnpm build
pnpm dev
```

Use the canonical task dataset. Open `/projects/progress`, complete
`Audit launch checklist`, and follow the Tasks link to the generated table. The
project count should increase, the task status should read `completed`, and the
generated Task history should contain the completion event.


The screen downloads at most 100 records and aggregates them in the browser.
That bound is part of the example's meaning. Larger or reusable summaries belong
in a scoped report route.

## Related reference

- [App shell, routes, and navigation](/docs/reference/frontend/app-shell-routes-and-navigation/)
- [Generated record surfaces](/docs/reference/frontend/generated-record-surfaces/)
- [Table query options](/docs/reference/frontend/table-query-options/)
