---
title: "Scoped report helpers"
description:
  "Look up the row predicates used before report reads, joins, and aggregates."
---

## Public surfaces

- Ordinary table-shaped access and single-table totals: `scopedRows(...)`,
  `.count()`, and `.countBy()` from `@sapporta/server`.
- Custom Drizzle shapes: `auth.rowSecurity.forTable(table)` from the request
  auth context.

Use the general row-helper reference for the full read/write API. Reports need
the narrower contracts below.

## Per-table guard

```ts
const projectAccess = auth.rowSecurity.forTable(projects);
const taskAccess = auth.rowSecurity.forTable(tasks);
```

`forTable(table)` binds the request data authority and loaded table catalogue to
that table. It does not accept a database or transaction handle. The database or
transaction belongs to the Drizzle query and to write helpers whose signatures
explicitly require it.

Create a separate guard for every base table that can contribute a row, count,
identifier, rollup, or footer.

## `ownedRows(productFilter?)`

```ts
const visibleTasks = await db
  .select()
  .from(tasksTable)
  .where(
    taskAccess.ownedRows(
      projectId === undefined
        ? undefined
        : eq(tasksTable.project_id, projectId),
    ),
  );
```

`ownedRows()` returns the trusted row-visibility predicate.
`ownedRows(productFilter)` AND-composes the supplied SQL filter with that
predicate. Apply the combined predicate before the query reads rows.

Scope each base relation before joining, grouping, mapping, or calculating
totals. Applying a predicate after aggregation is too late.

## Aggregation boundary

Use `scopedRows().count()` for a scalar total and `.countBy()` for a bounded
one-column group when one table owns the question. Both compose a Drizzle
`where` expression with the request's row predicate.

Small report routes may map already-visible rows in memory. Large reports should
push grouping into a store query while retaining one scoped predicate per base
relation. If raw SQL is necessary, construct explicit guarded base-row CTEs
before joins or aggregates; raw SQL does not gain row-scope enforcement
automatically.

Ability checks remain separate. The route first authorizes the report action and
resolves data authority; these helpers then constrain the data visible to that
authorized action.

## Related documentation

- [Scoped report data](/docs/guides/reports/scoped-report-data/)
- [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
- [Row-safe custom endpoints and reports](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
