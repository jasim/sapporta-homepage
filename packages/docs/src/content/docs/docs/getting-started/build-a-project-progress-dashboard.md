---
title: "Build a project progress dashboard"
description:
  "Add a protected React screen that summarizes projects and completes tasks
  through the typed client."
---

The typed complete-task client is ready, but the generated Tasks screen still
presents one record set rather than the project-level workflow. This page adds a
protected progress dashboard. You will load visible rows through generated table
APIs, render an application-owned Grid projection, invoke the typed transition,
and return users to generated screens for ordinary edits. The result supports a
small project overview and task-completion workflow without creating a second
record system.

```text
Add a protected project progress screen that summarizes visible projects in a readonly Grid, lists their tasks, completes open tasks through the typed client, and links ordinary editing back to generated tables.
```

## Keep records and projections at different layers

Projects and tasks remain persisted Sapporta tables. Their generated APIs own
row visibility, and their generated screens own ordinary create, edit, filter,
and export behavior. The dashboard owns a temporary projection: task counts and
a completion ratio grouped by project.

That projection fits `BaseGrid` with `ColumnPreset` because the browser computes
the rows and does not save them as project records. A TGrid would be the better
choice for a custom editable surface over persisted project rows. The generated
table screen remains the highest useful layer for this tutorial's record edits.

## Load row-scoped generated API data

Create `packages/frontend/src/ProjectProgress.tsx`. Start with narrow wire types
and parsers because generated table list responses are table-name-generic:

```tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchTableRows } from "@sapporta/frontend";
import {
  CELL_GRID_WITH_ACTIVE_ROW,
  GridCopyContextMenu,
  GridLevel,
  GridRuntimeProvider,
  createGridRuntime,
  inMemoryGridDataSource,
  useGridRuntimeEffect,
  type GridSchema,
  type TreeNode,
} from "@sapporta/grid";
import { number, percentage, text } from "@sapporta/grid/column-preset";
import { Button } from "@sapporta/ui";
import { Link } from "react-router-dom";
import {
  taskActionsApi,
  taskActionFailure,
  type TaskActionFailure,
} from "./api";

type Project = { id: number; name: string };
type Task = {
  id: number;
  project_id: number;
  title: string;
  status: "open" | "in_progress" | "completed";
};

function projectsFrom(rows: Record<string, unknown>[]): Project[] {
  return rows.flatMap((row) =>
    typeof row.id === "number" && typeof row.name === "string"
      ? [{ id: row.id, name: row.name }]
      : [],
  );
}

function tasksFrom(rows: Record<string, unknown>[]): Task[] {
  return rows.flatMap((row) => {
    if (
      typeof row.id !== "number" ||
      typeof row.project_id !== "number" ||
      typeof row.title !== "string" ||
      (row.status !== "open" &&
        row.status !== "in_progress" &&
        row.status !== "completed")
    ) {
      return [];
    }

    return [
      {
        id: row.id,
        project_id: row.project_id,
        title: row.title,
        status: row.status,
      },
    ];
  });
}
```

Load both tables through the generated client. The server applies the active
workspace's row predicate before either response reaches React:

```tsx
const [projects, setProjects] = useState<Project[]>([]);
const [tasks, setTasks] = useState<Task[]>([]);
const [loading, setLoading] = useState(true);
const [loadError, setLoadError] = useState<string | null>(null);

const refresh = useCallback(async () => {
  setLoading(true);
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
```

Do not send `workspace_id`, add a hidden workspace filter, or accept a workspace
from the page URL. Client filters organize visible data; they do not authorize
it. Generated table routes enforce row access on the server.

The 100-row limit makes this a bounded introductory dashboard. A production
dataset can exceed that window, so the next page moves aggregation into a scoped
report route rather than downloading every task.

## Render the calculated rows with Grid

Define a readonly Grid schema with public `ColumnPreset` constructors. The
application owns the summary row model, while Grid owns stable row identity,
keyboard focus, client sorting, rendering, and copy behavior:

```tsx
const progressSchema = {
  rootLevel: "projectProgress",
  levels: {
    projectProgress: {
      name: "projectProgress",
      rowHeaderColumn: "none",
      childLevels: [],
      columns: [
        text({ id: "name", name: "Project", edit: "none", width: "fill" }),
        number({
          id: "completed",
          name: "Completed",
          edit: "none",
          width: "numeric",
        }),
        number({
          id: "total",
          name: "Total",
          edit: "none",
          width: "numeric",
        }),
        percentage({
          id: "progress",
          name: "Progress",
          edit: "none",
          width: "numeric",
        }),
      ],
      options: {},
    },
  },
} satisfies GridSchema;

function ProjectSummaryGrid({
  projects,
  tasks,
}: {
  projects: Project[];
  tasks: Task[];
}) {
  const tree = useMemo<TreeNode[]>(
    () =>
      projects.map((project) => {
        const projectTasks = tasks.filter(
          (task) => task.project_id === project.id,
        );
        const completed = projectTasks.filter(
          (task) => task.status === "completed",
        ).length;
        const total = projectTasks.length;

        return {
          rowKey: String(project.id),
          levelName: "projectProgress",
          columns: {
            name: project.name,
            completed,
            total,
            progress: total === 0 ? 0 : completed / total,
          },
        };
      }),
    [projects, tasks],
  );

  const runtime = useGridRuntimeEffect(
    () =>
      createGridRuntime({
        schema: progressSchema,
        interaction: CELL_GRID_WITH_ACTIVE_ROW,
        dataSource: inMemoryGridDataSource({
          schema: progressSchema,
          tree,
          levels: {
            projectProgress: {
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
      <GridCopyContextMenu>
        <GridLevel path={runtime.root.path} />
      </GridCopyContextMenu>
    </GridRuntimeProvider>
  );
}
```

`useGridRuntimeEffect()` creates and disposes the React-owned runtime after
commit. A stable project ID supplies each summary row's `rowKey`; array indexes
are not stable record identity. The percentage column receives a ratio such as
`0.4` and formats it as `40%`.

## Add completion as a command beside the projection

The summary Grid is readonly. A task list below it exposes the app-owned
completion command and links ordinary editing back to `/tables/tasks`:

```tsx
export function ProjectProgress() {
  // Include the projects, tasks, loading, loadError, refresh, and effect
  // declarations from the previous section.
  const [pendingTaskId, setPendingTaskId] = useState<number | null>(null);
  const [actionFailure, setActionFailure] = useState<TaskActionFailure | null>(
    null,
  );
  const [unexpectedActionError, setUnexpectedActionError] = useState<
    string | null
  >(null);
  const [notice, setNotice] = useState<string | null>(null);

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
    setActionFailure(null);
    setUnexpectedActionError(null);
    setNotice(null);

    try {
      await taskActionsApi.completeTask({
        params: { id: task.id },
        body: {},
      });
      await refresh();
      setNotice(`${task.title} is complete.`);
    } catch (error) {
      const failure = taskActionFailure(error);
      if (failure) {
        setActionFailure(failure);
        await refresh();
      } else {
        setUnexpectedActionError("The task could not be completed.");
      }
    } finally {
      setPendingTaskId(null);
    }
  }

  if (loading) return <p className="p-6">Loading progress…</p>;

  if (loadError) {
    return (
      <div className="p-6">
        <p role="alert">{loadError}</p>
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
        <p className="mt-2">No projects are visible.</p>
        <Link className="mt-4 inline-block underline" to="/tables/projects">
          Create a project
        </Link>
      </div>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Project progress</h1>
          <p className="text-sm text-sap-muted">
            Complete tasks here. Edit records in the generated tables.
          </p>
        </div>
        <Link className="text-sm underline" to="/tables/tasks">
          Open Tasks
        </Link>
      </header>

      {notice && <p role="status">{notice}</p>}
      {actionFailure && <p role="alert">{actionFailure.error}</p>}
      {unexpectedActionError && <p role="alert">{unexpectedActionError}</p>}

      <ProjectSummaryGrid projects={projects} tasks={tasks} />

      {projects.map((project) => (
        <section key={project.id} className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-medium">{project.name}</h2>
            <Link className="text-sm underline" to="/tables/projects">
              Open Projects
            </Link>
          </div>
          <ul className="mt-3 divide-y">
            {(tasksByProject.get(project.id) ?? []).map((task) => (
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
      ))}
    </main>
  );
}
```

The screen renders explicit loading, retry, empty, ready, pending, success, and
declared action-error states. Completion refreshes both generated lists, which
rebuilds the Grid projection from committed server data.

## Put the screen inside the protected app shell

Add the route and navigation item to `packages/frontend/src/App.tsx` while
preserving the existing exports and routes:

```tsx
import { Navigate, Route } from "react-router-dom";
import type { Navigation } from "@sapporta/frontend/shell";
import { ChartNoAxesColumnIncreasing, Sparkles } from "lucide-react";
import { ProjectProgress } from "./ProjectProgress";

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
  <Route path="projects/progress" element={<ProjectProgress />} />
);
```

Keep `appPublicRoutes` and any existing route fragments. Protected routes render
after the app has loaded the session, active workspace, and `/api/auth-context`.
Putting the component in a protected route does not replace server checks; the
generated APIs and completion endpoint still enforce their own boundaries.

## Exercise the generated reads and command

Build, start the app, and discover the generated reads before opening the
dashboard:

```bash
pnpm build
pnpm dev
pnpm exec sapporta endpoints show "GET /api/tables/projects"
pnpm exec sapporta endpoints show "GET /api/tables/tasks"
```

The browser issues row-scoped requests equivalent to:

```http
GET /api/tables/projects?limit=100 HTTP/1.1
GET /api/tables/tasks?limit=100 HTTP/1.1
```

A project response uses the generated list envelope:

```json
{
  "data": [
    { "id": 1, "name": "Website Relaunch" },
    { "id": 2, "name": "Operations" }
  ],
  "meta": { "total": 2, "page": 1, "limit": 100, "pages": 1 }
}
```

Open `/projects/progress`, complete one open task, and inspect Network. The
screen sends `POST /api/tasks/1/complete` with `{}` and receives:

```json
{
  "task_id": 1,
  "event_id": 4,
  "status": "completed"
}
```

The following GET refreshes update the task status and the calculated project
ratio. Follow the Tasks link to confirm that the same completed record appears
on the generated surface.

<!--
Screenshot brief
Suggested asset: project-progress-grid-ready.png
Setup: Seed the canonical two projects and five tasks, sign in as a workspace owner, open `/projects/progress`, and wait for both generated API reads to finish.
Frame: Capture the protected app shell, selected Project progress navigation item, readonly summary Grid, project task lists, statuses, Complete actions, and generated-table links.
Visible proof: The screen combines row-scoped generated records with an application-owned Grid projection and one domain command.
Alt text: Protected project progress dashboard with a readonly summary Grid and per-project task actions.
-->

<!--
Screenshot brief
Suggested asset: project-progress-completion-refresh.png
Setup: Complete one open task from the dashboard and wait for the success notice and both generated-table refresh requests.
Frame: Show the success notice, completed task status, updated project total in the Grid, and the selected POST request plus response in browser Network.
Visible proof: The typed command commits the workflow, and refreshed generated API data changes both the task row and calculated progress.
Alt text: Project progress dashboard and Network panel after a successful task completion refresh.
-->

<!--
Screenshot brief
Suggested asset: project-progress-empty-state.png
Setup: Use an authenticated workspace with no visible project rows and open `/projects/progress`.
Frame: Show the page title, `No projects are visible` message, Create a project link, and surrounding app shell.
Visible proof: The zero-row API result becomes a useful empty state with a route to the generated Projects screen.
Alt text: Empty project progress dashboard with a link to create the first project.
-->

The application now has one protected workflow screen without replacing its
generated record surfaces. Generated table routes supply row-scoped source data,
BaseGrid renders the bounded browser-owned projection, and the typed endpoint
owns the multi-table transition. The 100-row window is the deliberate limit of
this version. Next,
[report on project progress](/docs/getting-started/report-on-project-progress/)
to move scalable aggregation behind a scoped app-owned route. The
[custom screen guide](/docs/guides/app-owned-features/custom-frontend-routes-and-screens/)
and
[Grid-first workflow guide](/docs/guides/generated-surfaces/grid-first-record-workflows/)
cover larger frontend compositions.
