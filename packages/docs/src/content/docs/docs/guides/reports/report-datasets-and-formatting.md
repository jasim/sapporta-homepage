---
title: "Report datasets and formatting"
description: "Map domain rows into flat or hierarchical report data with totals and display semantics."
---

Map domain rows into flat or hierarchical report data with totals and display semantics.

`GridDataset` is a renderer wire shape. It owns columns, nodes, hierarchy, rollups, footers, statistics, formatting, hidden values, and non-fatal report errors.

For the programmer, the project maps already scoped domain rows through a pure deterministic function.
For the application user, users see legible totals and formatting while hidden identifiers remain available for navigation.

## System boundary

- Give datasets, levels, rows, and columns stable identities.
- Store source values in node columns and computed parent values in rollups.
- Use footer rows for totals and stats for compact answers.
- Parse the mapper result with `gridDatasetSchema` in tests.

## Task-app example

The project-progress dataset has one row per project, hidden `project_id`, status totals, overdue work, completion percentage, a grand-total footer, and summary stats.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [GridDataset](/docs/reference/reports/grid-dataset/)
- [Report links](/docs/reference/reports/report-links/)
