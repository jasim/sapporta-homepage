---
title: "Cached table reads and refresh"
description:
  "Load generated table records and pages through TanStack Query, then refresh
  the query and TGrid consumers affected by a mutation."
---

TanStack Query owns record and page requests, cancellation, staleness, retries,
and cache state. Reuse the QueryClient mounted by the generated application; a
nested provider would split cache state and make invalidation depend on
component placement.

## Load a record through the generated query

Parse the route parameter before mounting the record component so its query hook
can run unconditionally:

```tsx
import { useQuery } from "@tanstack/react-query";
import { useSchemaStore } from "@sapporta/frontend";
import { tableRecordQueryOptions } from "@sapporta/frontend/table/query";
import type { Row, TableSchema } from "@sapporta/shared/contracts";

type Task = {
  id: number;
  title: string;
  project_id: number | null;
  due_date: string | null;
};

function decodeTask(row: Row): Task {
  if (
    typeof row.id !== "number" ||
    typeof row.title !== "string" ||
    (row.project_id !== null && typeof row.project_id !== "number") ||
    (row.due_date !== null && typeof row.due_date !== "string")
  ) {
    throw new Error("The task response is invalid.");
  }
  return {
    id: row.id,
    title: row.title,
    project_id: row.project_id,
    due_date: row.due_date,
  };
}

function EditTask({ taskId, table }: { taskId: number; table: TableSchema }) {
  const task = useQuery(
    tableRecordQueryOptions({
      tableName: "tasks",
      recordId: String(taskId),
      decodeRow: decodeTask,
    }),
  );

  if (task.isPending) return <p>Loading task…</p>;
  if (task.isError) return <p role="alert">The task could not be loaded.</p>;
  return <TaskEditor key={task.data.id} task={task.data} table={table} />;
}

export function EditTaskRoute({ taskId }: { taskId: number }) {
  const table = useSchemaStore((state) =>
    state.tables.find((candidate) => candidate.name === "tasks"),
  );
  if (!table) return <p role="alert">The tasks schema is unavailable.</p>;
  return <EditTask taskId={taskId} table={table} />;
}
```

`decodeRow` establishes the browser row type at the query boundary. Cancellation
passes through the generated table client. `useSchemaStore()` reuses the shell's
metadata catalog. The editor `key` resets the form when the route selects a
different record; background results do not automatically replace dirty draft
values.

Use `tableRecordsPageQueryOptions()` for a filtered, sorted, searched, or
paginated collection. It preserves `meta` and decodes every returned row.

## Refresh every affected owner

TanStack Query and TGrid are separate server-state consumers:

```ts
await queryClient.invalidateQueries({
  queryKey: tableQueryKeys.table("tasks"),
});
reloadTGridRows("tasks");
```

Invalidate the public table prefix when a cached record or page may be stale.
Reload mounted TGrid sessions when the same mutation affects visible table
Grids. Complete required effects before navigating or closing a dialog.

For a multi-table workflow, invalidate every affected table prefix. Apply the
same refresh after a declared stale-state response when the authoritative data
may already have changed. A validation error does not imply committed state
changed.

Neither cache invalidation nor Grid reload grants access. The server still owns
authentication, abilities, row scope, write policy, validation, and
transactions.

## Related documentation

- [Custom forms and validation](/docs/guides/app-owned-features/custom-forms-and-validation/)
- [Custom workflow screens](/docs/guides/app-owned-features/custom-workflow-screens/)
- [Table query options](/docs/reference/frontend/table-query-options/)
- [TGrid](/docs/reference/frontend/tgrid/)
