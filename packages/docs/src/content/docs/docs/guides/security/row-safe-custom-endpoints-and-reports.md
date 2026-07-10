---
title: "Row-safe custom endpoints and reports"
description: "Apply abilities and row visibility to app-owned reads and writes."
---

Apply abilities and row visibility to app-owned reads and writes.

Custom routes resolve permission and data authority at the edge, then pass scoped helpers or table guards into domain and report code.

For the programmer, the project keeps broad database access out of route bodies and gives each participating table an explicit scope boundary.
For the application user, custom actions and aggregates expose the same visible data as generated record surfaces.

## System boundary

- Use `scopedRows()` for ordinary custom table work.
- Use one row-security guard per table inside custom Drizzle queries or transactions.
- Apply scope before aggregation, not after fetching broad rows.
- Raw SQL is a contained and tested fallback.

## Task-app example

The complete-task transaction scopes both `tasks` and `task_events`. The progress report scopes projects and tasks before computing totals.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
- [Scoped report helpers](/docs/reference/reports/scoped-report-helpers/)
