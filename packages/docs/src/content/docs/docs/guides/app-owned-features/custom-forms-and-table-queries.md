---
title: "Custom forms and cached table reads"
description:
  "Compose TanStack Form and TanStack Query with Sapporta table metadata,
  generated clients, validation issues, and Grid refresh boundaries."
---

Generated projects provide one TanStack Query client and the dependencies for
TanStack Form. Sapporta provides metadata-derived form fields, generated table
clients, cache-key builders, query options, and submission-error normalization.
An app-owned screen composes these pieces around its route and workflow.

## Keep state ownership explicit

Use one owner for each kind of state:

| State | Owner |
| --- | --- |
| Record and page requests, cancellation, staleness, retries, cache | TanStack Query |
| Draft values, dirty state, local validation, submit state | TanStack Form |
| Table metadata, semantic draft decoding, generated CRUD requests | Sapporta frontend APIs |
| Domain request shape, success destination, cache effects, layout | Application screen |
| Write policy, row scope, authoritative validation, transactions | Server route |

The workspace-owned `packages/frontend/src/query-client.ts` configures the
application QueryClient. The framework-owned `packages/frontend/src/main.tsx`
mounts it with `QueryClientProvider`. Feature screens reuse that provider. A
nested provider would split cache state and make invalidation depend on
component placement.

## Load a record with the generated table query

Parse the route parameter before mounting the record component. The record
component can then call its query hook unconditionally.

```tsx
import { useQuery } from "@tanstack/react-query";
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

function EditTask({
  taskId,
  table,
}: {
  taskId: number;
  table: TableSchema;
}) {
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
```

`decodeRow` establishes the browser row type at the query boundary. TanStack
Query passes its cancellation signal through Sapporta's generated table client.
The `key` creates a new editor when the route selects a different record.
Background query results do not automatically replace dirty form values.

Use `tableRecordsPageQueryOptions()` for a filtered, sorted, searched, or
paginated collection. The query result preserves `meta` and decodes every
`data` row.

## Build a metadata-derived form

```tsx
import { useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import {
  FormField,
  buildRecordFormFields,
  firstFormErrorMessage,
  useLookupStore,
} from "@sapporta/frontend";

function TaskEditor({ task, table }: { task: Task; table: TableSchema }) {
  const lookups = useLookupStore();
  const fields = useMemo(
    () => buildRecordFormFields({ table, lookups }),
    [lookups, table],
  );
  const form = useForm({
    defaultValues: {
      title: task.title,
      project_id: task.project_id,
      due_date: task.due_date,
    } as Record<string, unknown>,
    onSubmit: async ({ value }) => submitTask(value),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit().catch(() => undefined);
      }}
    >
      {fields.map((fieldModel) => (
        <form.Field key={fieldModel.column.name} name={fieldModel.column.name}>
          {(field) => (
            <FormField
              field={fieldModel}
              value={field.state.value}
              issue={firstFormErrorMessage(field.state.meta.errors)}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
      ))}
      <button type="submit">Save task</button>
    </form>
  );
}
```

`buildRecordFormFields()` derives editable fields, semantic control kinds,
select options, and scoped foreign-key lookups from the current table schema.
The form may render only a subset or arrange fields into domain sections. Use
`fieldModelForColumn()` and `foreignKeyFieldModelForColumn()` when the layout
names specific fields.

Workflow values that are not table columns remain ordinary TanStack Form
fields. Application-specific controls can consume a Sapporta field model
without using `FormField` when the default rendering does not fit.

## Decode creates at submit time

For an ordinary one-table create, keep raw form text until submit and call
`parseCreateDraft()` once:

```ts
const parsed = parseCreateDraft(table, value);
if (!parsed.ok) {
  throw new FormSubmissionError(parsed.issues);
}

await createTableRow(table.name, parsed.value);
```

This decode preserves incomplete editor text during interaction. It omits
optional empty non-text fields, preserves empty text as `""`, canonicalizes
valid semantic values, and reports required or invalid fields. It does not
replace server validation.

Update forms need an explicit patch transform. Create omission and patch
omission have different meanings. A create omission permits a default; a patch
omission leaves the stored field unchanged.

Use an app-owned typed endpoint when one submit changes several tables or
performs a named domain action. TanStack Form still owns the draft, but the
application contract owns the request shape and the server owns the
transaction.

## Map local and remote issues

```ts
try {
  await mutation();
} catch (error) {
  const issues = fieldIssuesForSubmissionError(error);
  const fields = Object.fromEntries(
    issues
      .filter((issue) => issue.field !== "form")
      .map((issue) => [issue.field, issue.message]),
  );
  const problem = error instanceof ApiError
    ? apiProblemFromBody(error.body)
    : undefined;

  formApi.setErrorMap({
    onSubmit: {
      form:
        issues.find((issue) => issue.field === "form")?.message ??
        problem?.summary ??
        (error instanceof FormSubmissionError
          ? "Review the highlighted fields."
          : "The record could not be saved."),
      fields,
    },
  });
  throw error;
}
```

`fieldIssuesForSubmissionError()` handles local `FormSubmissionError` values
and recognized Sapporta API validation details. Nested paths remain names such
as `lines.0.quantity`. Application code maps server fields when its form uses a
different field vocabulary.

After rendering a submit failure, prevent the rejected promise from becoming
an unhandled browser rejection. Clear stale submit errors when the user starts
a new attempt. Keep a form-level fallback for transport failures and server
details that do not map to one field.

## Apply both cache effects when necessary

```ts
await queryClient.invalidateQueries({
  queryKey: tableQueryKeys.table("tasks"),
});
reloadTGridRows("tasks");
```

TanStack Query and TGrid are separate server-state consumers. Invalidate the
public table query prefix when an app-owned cached record or list may be stale.
Reload mounted TGrid sessions when the same mutation affects visible table
Grids. Complete required cache effects before navigating or closing a dialog.

The browser cache and Grid reload do not grant access. Generated table routes
and app-owned handlers continue to apply authentication, abilities, row scope,
write policy, and validation on the server.

## Related reference

- [Generated record surfaces and form helpers](/docs/reference/frontend/generated-record-surfaces/)
- [Table query options](/docs/reference/frontend/table-query-options/)
- [TGrid](/docs/reference/frontend/tgrid/)
- [Typed API clients](/docs/guides/app-owned-features/typed-api-clients/)
