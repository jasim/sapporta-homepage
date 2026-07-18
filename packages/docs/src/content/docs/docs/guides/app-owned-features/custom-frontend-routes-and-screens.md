---
title: "Custom frontend routes and screens"
description:
  "Add a protected workflow screen inside the generated application shell."
---

A custom screen combines generated records and app-owned actions into one domain
workflow. The generated table routes remain the standard create, edit, filter,
and export surfaces; the custom route adds only the interaction the application
needs.

This page builds a protected project-progress screen, loads row-scoped table
data, invokes the typed completion endpoint, and connects the screen to
application navigation. The same structure supports dashboards, review queues,
import wizards, master-detail workspaces, and other multi-record workflows.

```text
Add a protected project-progress screen. Load visible projects and tasks through Sapporta's table client, show explicit loading, empty, ready, pending, success, and error states, complete tasks through the typed client, and link back to generated tables.
```

## Build the workflow screen

Create `packages/frontend/src/ProjectProgress.tsx`. `fetchTableRows()` calls the
generated `/api/tables/:tableName` routes, so server-side row visibility still
applies. The custom endpoint owns completion because it changes both task status
and history.

```tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchTableRows } from "@sapporta/frontend";
import { ApiError } from "@sapporta/shared/client";
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

type ErrorBody = { error: string; code: string };

function isErrorBody(value: unknown): value is ErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string" &&
    "code" in value &&
    typeof value.code === "string"
  );
}

function projectsFrom(rows: Record<string, unknown>[]): Project[] {
  return rows.flatMap((row) =>
    typeof row.id === "number" && typeof row.name === "string"
      ? [{ id: row.id, name: row.name }]
      : [],
  );
}

function tasksFrom(rows: Record<string, unknown>[]): Task[] {
  return rows.flatMap((row) =>
    typeof row.id === "number" &&
    typeof row.project_id === "number" &&
    typeof row.title === "string" &&
    typeof row.status === "string"
      ? [
          {
            id: row.id,
            project_id: row.project_id,
            title: row.title,
            status: row.status,
          },
        ]
      : [],
  );
}

export function ProjectProgress() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setLoadError(null);
    try {
      const [projectResult, taskResult] = await Promise.all([
        fetchTableRows({ tableName: "projects", limit: 100 }),
        fetchTableRows({ tableName: "tasks", limit: 100 }),
      ]);
      setProjects(projectsFrom(projectResult.data));
      setTasks(tasksFrom(taskResult.data));
    } catch {
      setLoadError("Project progress could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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

  async function handleComplete(task: Task) {
    setPendingTaskId(task.id);
    setActionError(null);
    setNotice(null);
    try {
      await taskActionsApi.completeTask({
        params: { id: task.id },
        body: {},
      });
      await refresh();
      setNotice(`${task.title} is complete.`);
    } catch (error) {
      if (error instanceof ApiError && isErrorBody(error.body)) {
        setActionError(error.body.error);
      } else {
        setActionError("The task could not be completed.");
      }
    } finally {
      setPendingTaskId(null);
    }
  }

  if (loading) {
    return <p className="p-6 text-sm text-sap-muted">Loading progress…</p>;
  }

  if (loadError) {
    return (
      <div className="p-6">
        <p role="alert" className="text-sm text-red-700">
          {loadError}
        </p>
        <Button className="mt-3" onClick={() => void refresh()}>
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
        <Link className="mt-4 inline-block underline" to="/tables/projects">
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

      {notice && (
        <p role="status" className="text-sm text-green-700">
          {notice}
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
                      onClick={() => void handleComplete(task)}
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

The screen intentionally loads at most 100 records for an introductory
dashboard. A larger dataset should move aggregation and pagination into a report
or custom endpoint instead of downloading every row.

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

<!--
Screenshot brief
Suggested asset: project-progress-screen.png
Setup: Seed the canonical two projects and five tasks, sign in as a workspace owner, complete one open task from `/projects/progress`, and wait for the refresh and success notice.
Frame: Capture the application shell, selected Project progress navigation item, both project cards, completion totals, task statuses, and the success notice. Use a desktop viewport wide enough to avoid truncating task names.
Visible proof: The custom route is integrated into protected navigation, displays generated records, exposes the domain action, and refreshes the aggregate after success.
Alt text: Protected project progress screen with task lists, completion totals, and a successful completion notice.
-->

Capture the empty state separately only if that state needs documentation:

<!--
Screenshot brief
Suggested asset: project-progress-empty-state.png
Setup: Use a fresh authenticated workspace with no project rows and open `/projects/progress`.
Frame: Show the page heading, `No projects are visible` message, and Create a project link inside the app shell.
Visible proof: The empty state explains why no cards render and provides a route back to the generated Projects surface.
Alt text: Empty project progress screen with a link to create the first project.
-->

The application now has one protected workflow screen without replacing the
generated record system. Table reads remain row-scoped, completion remains a
server transaction, and ordinary editing stays on generated routes. The less
obvious design boundary is scale: client-side aggregation is suitable for a
bounded tutorial dataset, while larger workloads belong in report routes. From
here, add report-backed summaries, role-aware action visibility, or a Grid-based
worklist when selection and bulk commands become central to the workflow.

## Related reference

- [App shell, routes, and navigation](/docs/reference/frontend/app-shell-routes-and-navigation/)
- [Generated record surfaces](/docs/reference/frontend/generated-record-surfaces/)
