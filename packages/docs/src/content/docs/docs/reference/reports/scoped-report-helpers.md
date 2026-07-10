---
title: "Scoped report helpers"
description: "Look up supported row-security helpers used by report reads and aggregates."
---

## Identity

`scopedRows()` and request row-security guards from `@sapporta/server` and generated project auth.

## Contract

- Use `scopedRows()` for table-shaped reads before mapping a report.
- Use `auth.rowSecurity.forTable(table)` to build predicates and trusted values for custom Drizzle reads.
- Construct guards for each joined table and against the active database or transaction handle.
- Scope base rows before grouping and aggregation; the mapper remains auth-free.


## Related documentation

- [Scoped report data](/docs/guides/reports/scoped-report-data/)
