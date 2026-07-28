---
title: "Row-safe custom endpoints and reports"
description: "Apply abilities and row visibility to app-owned reads and writes."
---

Generated table routes apply action checks and row visibility for you. App-owned
code makes those decisions explicitly. The useful model has six boundaries:

| Boundary         | Question                                                 | Mechanism                                                          |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------------------ |
| Credential       | Who is calling, and in which workspace?                  | Session or agent token                                             |
| Action ability   | May this principal run the operation?                    | `forbidUnless(...)` or an authorized project helper                |
| Data authority   | Which workspace/user authority may the request exercise? | `resolveRequestDataAuthority(...)` and authority-narrowing helpers |
| Row enforcement  | Which rows satisfy table and domain predicates?          | `scopedRows(...)`, per-table guards, and `ownedRows(...)`          |
| Write integrity  | Which fields must trusted server code author?            | Managed scope fields, API metadata, and `serverValues`             |
| State transition | Which changes must commit together?                      | A synchronous database transaction                                 |

Passing one boundary does not imply another. A valid record ID, hidden input,
URL filter, report link, or Grid state never grants authority.

## Use `scopedRows()` for ordinary table work

`scopedRows(db, auth, table)` binds one table to the request. Its operations
apply visible-row predicates, reject caller-supplied scope aliases, stamp
trusted insert scope, validate references, and conceal missing and invisible
singular rows. Its read inputs are ordinary Drizzle expressions rather than HTTP
query strings, so filters and ordering stay typed until an actual route adapter
serializes or parses them.

```ts
import { eq } from "drizzle-orm";

const taskRows = scopedRows(c.get("db"), auth, tasks);

const openTasks = await taskRows.findMany({
  where: eq(tasksTable.status, "open"),
  limit: 25,
});
```

The route still checks an ability before calling the helper. `scopedRows()` does
not make that decision itself. `findMany()` requires an explicit result bound,
while `page()` adds a matching count and page metadata. Use `scan()` only when a
workflow must process the complete visible selection sequentially; it keeps one
SQLite cursor and read snapshot open until iteration finishes or stops.

The helper's `count()` and `countBy()` operations keep scalar and grouped
aggregation inside the same visible-row predicate. None of these reads turns a
data boundary into a route authorization check.

## Use one table guard for each custom query shape

Construct a guard from request auth and the registered table:

```ts
const taskAccess = auth.rowSecurity.forTable(tasks);
```

`forTable(table)` does not take a database or transaction handle.
`ownedRows(predicate?)` returns the request's row predicate and SQL-`AND`s any
supplied domain predicate with it. Pass `db` or `tx` only to operations whose
signature requires a database handle.

The complete-task implementation belongs in the
[domain workflow guide](/docs/guides/app-owned-features/domain-workflows-and-transactions/).
This security-specific fragment shows the row and write boundaries:

```ts
const taskAccess = context.auth.rowSecurity.forTable(tasks);
const eventAccess = context.auth.rowSecurity.forTable(taskEvents);

return context.db.transaction((tx) => {
  const task = tx
    .select()
    .from(tasksTable)
    .where(taskAccess.ownedRows(eq(tasksTable.id, taskId)))
    .get();

  if (!task) throw new TaskNotFoundError();
  if (task.status === "completed") {
    throw new TaskAlreadyCompletedError();
  }

  const occurredAt = Temporal.Now.instant();
  tx.update(tasksTable)
    .set({ status: "completed", updated_at: occurredAt })
    .where(taskAccess.ownedRows(eq(tasksTable.id, task.id)))
    .run();

  const event = eventAccess.insertValuesSync(
    tx,
    {},
    {
      serverValues: {
        task_id: task.id,
        event_type: "completed",
        occurred_at: occurredAt,
      },
    },
  );
  tx.insert(taskEventsTable).values(event).run();

  return { taskId: task.id, status: "completed" as const };
});
```

The empty caller object matters: this workflow accepts no caller-writable event
fields. Trusted code supplies every event value through `serverValues`.
`insertValuesSync()` prepares and validates those values; the following Drizzle
insert persists them.

The default `better-sqlite3` transaction callback is synchronous. Keep database
reads, writes, and synchronous row-security preparation inside it. Perform
email, network calls, queue publication, and other awaited effects after the
transaction commits.

For append-only history, grant the generated `read` and `export` actions when
the product needs them, but omit generated `create` when only the trusted
workflow may append. That ability policy is separate from `immutable`:
immutability blocks enforcing update/delete paths and does not authorize
creation.

With the prior scoped read and one connection's transaction serialization, a
later sequential call can observe `completed` and return the app feature's
declared `409 TASK_ALREADY_COMPLETED` branch. This pattern does not promise that
simultaneous writers in different processes always receive `409`; deployment
connection behavior may instead serialize, block, or surface another database
failure. The full HTTP-aware typed error family and strict feature error schema
remain owned by the workflow guide.

## Scope report inputs before projection

A report needs its own route ability, even if it only reads visible rows. A
generated-project helper can check that ability and narrow the context to the
workspace slot:

```ts
const auth = requireAuthorizedWorkspaceData(c, {
  action: "read",
  subject: "project-progress",
});
const db = c.get("db");

const projectAccess = auth.rowSecurity.forTable(projects);
const taskAccess = auth.rowSecurity.forTable(tasks);

const visibleProjects = db
  .select()
  .from(projectsTable)
  .where(projectAccess.ownedRows())
  .all();

const visibleTasks = db
  .select()
  .from(tasksTable)
  .where(taskAccess.ownedRows())
  .all();

return projectProgressDataset({
  projects: visibleProjects,
  tasks: visibleTasks,
  today,
});
```

`requireAuthorizedWorkspaceData(...)` is generated application infrastructure,
not an `@sapporta/server` export. The mapper receives only visible rows, so
hidden records cannot influence lines, counts, percentages, or totals.
Additional report filters go inside `ownedRows(filter)` and therefore narrow the
request's row predicate rather than replacing it.

A hidden ID returned from those scoped base reads is authorized response data
and may support a link. An ID supplied by the caller, hidden in the UI, or
embedded in a route is not authority by itself.

## Treat immutability and raw access honestly

`immutable` blocks `scopedRows().update()` and `.delete()`. It does not grant
read or create abilities, and a table guard does not enforce immutability for a
custom Drizzle mutation. Ability checks happen before generated immutable
enforcement.

Raw Drizzle or SQL is trusted authority. It bypasses row policy and immutable
helper checks unless the code explicitly composes `ownedRows(...)` and preserves
the same write rules. Keep unavoidable raw access in a narrow store module and
test its negative cases directly.

## Prove success and failure

For a workflow, test the authorized transition, sequential repeat, missing and
invisible IDs, managed-field rejection, event-insert rollback, exactly one
history row, and authoritative readback. Test direct generated event creation
separately from immutable update/delete. For a report, test authorized,
unauthorized, empty, and cross-workspace datasets and compare totals with scoped
base reads. Test an immutable update both without the ability and with the
ability so the two `403` namespaces stay distinct.

## Related documentation

- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Scoped report data](/docs/guides/reports/scoped-report-data/)
- [Error catalogue and diagnostics](/docs/reference/operations/error-catalogue-and-diagnostics/)
