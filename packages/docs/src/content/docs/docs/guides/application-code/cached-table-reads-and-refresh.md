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

## Declare the columns a screen reads

Generated table routes are name-generic: one route family serves every
registered table, so a row arrives as `Row`, an alias for
`Record<string, unknown>`, and Sapporta cannot infer an application type from
it. Declare the columns a screen reads as a row projection — a Zod schema in
`packages/shared/src/contracts/`, beside the feature's other wire shapes and
re-exported from its `index.ts`:

```ts
// packages/shared/src/contracts/task-rows.ts
import { z } from "zod";

/** The `tasks` columns the task editor reads. */
export const taskRowSchema = z.object({
  id: z.number(),
  title: z.string(),
  project_id: z.number().nullable(),
  due_date: z.string().nullable(),
});

export type TaskRow = z.output<typeof taskRowSchema>;
```

Date and timestamp columns are strings here because the routes serialize them.
The schema module's `$inferSelect` types those columns as `Temporal.PlainDate`
and `Temporal.Instant`; it describes the database row, not the wire row, so it
cannot be reused here.

A projection lists only what one screen reads. Adding a column to the table does
not change it.

## Load a record through the generated query

Parse the route parameter before mounting the record component so its query hook
can run unconditionally:

```tsx
import { useQuery } from "@tanstack/react-query";
import { useSchemaStore } from "@sapporta/frontend";
import { tableRecordQueryOptions } from "@sapporta/frontend/table/query";
import type { Row, TableSchema } from "@sapporta/shared/contracts";
import { taskRowSchema, type TaskRow } from "task-app-shared";

const decodeTask = (row: Row): TaskRow => taskRowSchema.parse(row);

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

## Check the projection against the table

`pnpm typecheck` cannot compare a projection to its table: the browser package
does not depend on the API package, and must not, because the schema module
imports Drizzle and `@sapporta/server`. A renamed or retyped column still
compiles, and the decoder reports the mismatch only at runtime, on a loaded
screen.

The API package already depends on both the schema and the shared package, so
put the check there — one test per projected table:

```ts
// packages/api/schema/tasks.test.ts
import { taskRowSchema } from "task-app-shared";
import { describe, expect, it } from "vitest";
// Read one row through the same path the generated route uses.
import { readSampleTaskRow } from "./tasks.fixtures.js";

describe("tasks projection", () => {
  it("matches the columns the task editor reads", () => {
    expect(taskRowSchema.safeParse(readSampleTaskRow())).toMatchObject({
      success: true,
    });
  });
});
```

Run these tests alongside `pnpm typecheck` and `pnpm build`.

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

- [Custom forms and validation](/docs/guides/application-code/custom-forms-and-validation/)
- [Custom workflow screens](/docs/guides/application-code/custom-workflow-screens/)
- [Shared contracts and request validation](/docs/guides/application-code/shared-contracts-and-request-validation/)
- [Tables, columns, and schema metadata](/docs/guides/model-data/tables-columns-and-schema-metadata/)
- [Table query options](/docs/reference/frontend/table-query-options/)
- [TGrid](/docs/reference/frontend/tgrid/)
