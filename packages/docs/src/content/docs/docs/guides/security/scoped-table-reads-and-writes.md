---
title: "Scoped table reads and writes"
description:
  "Use scopedRows and per-table guards for bounded application reads, counts,
  updates, and trusted insert values."
---

The route first checks its action ability. A row helper then enforces the
request's data authority for one registered table.

## Use `scopedRows()` for ordinary table work

`scopedRows(db, auth, table)` applies visible-row predicates, rejects
caller-supplied scope aliases, stamps trusted insert scope, validates
references, and conceals missing and invisible singular rows.

```ts
import { eq } from "drizzle-orm";

const taskRows = scopedRows(c.get("db"), auth, tasks);

const openTasks = await taskRows.findMany({
  where: eq(tasksTable.status, "open"),
  limit: 25,
});
```

Its read inputs are Drizzle expressions rather than HTTP query strings.
`findMany()` requires an explicit bound; `page()` adds a matching count and page
metadata. Use `scan()` only when a workflow must process the complete visible
selection sequentially. `count()` and `countBy()` keep aggregation inside the
same row predicate.

`scopedRows()` does not check a route ability. Authorize before calling it.

## Use a guard for a custom query shape

```ts
const taskAccess = auth.rowSecurity.forTable(tasks);
```

`forTable(table)` does not take a database or transaction handle.
`ownedRows(predicate?)` returns the request row predicate and SQL-ANDs a domain
predicate with it:

```ts
const task = tx
  .select()
  .from(tasksTable)
  .where(taskAccess.ownedRows(eq(tasksTable.id, taskId)))
  .get();
```

A custom query touching tasks and events needs a separate guard for each table.
Scoping one side of a join or transaction does not scope the other.

For trusted creates, prepare final values through the appropriate guard:

```ts
const eventValues = eventAccess.insertValuesSync(
  tx,
  {},
  {
    serverValues: {
      task_id: task.id,
      event_type: "completed",
      occurred_at,
    },
  },
);
tx.insert(taskEventsTable).values(eventValues).run();
```

The empty caller object means the workflow accepts no caller-writable event
fields. `serverValues` supplies trusted relationship and audit values.
`insertValuesSync()` prepares and validates; Drizzle performs the insert.

The default `better-sqlite3` transaction callback is synchronous. Perform mail,
network, queue, and storage effects after commit.

## Prove both boundaries

Test the route without an action ability, then with the ability against visible,
missing, and invisible rows. Test managed-field rejection, reference visibility,
result bounds, and authoritative read-back. A successful response alone does not
prove hidden rows were excluded.

## Related documentation

- [Row-safe custom endpoints and reports](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
- [Domain workflows and transactions](/docs/guides/application-code/domain-workflows-and-transactions/)
- [Parent-detail transactions](/docs/guides/application-code/parent-detail-transactions/)
- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
