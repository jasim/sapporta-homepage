---
title: "Search, indexes, and display metadata"
description: "Make record surfaces findable, legible, and efficient without a custom screen."
---

Make record surfaces findable, legible, and efficient without a custom screen.

Sapporta search and display metadata shape generated surfaces. Drizzle indexes shape database access. Visual metadata does not grant or remove authorization.

For the programmer, the project chooses a small set of human search fields and indexes the queries it actually runs.
For the application user, task lists show controlled status and priority values, multiline descriptions, and useful row labels.

## System boundary

- Configure two to four useful search columns rather than every text field.
- Keep row labels short and stable.
- Use display hints for labels, long text, visibility, widths, and additive values.
- Create database indexes for demonstrated filter, sort, and relationship patterns.

## Task-app example

The task app searches `title` and `description`, labels rows by `title`, and indexes the project/status/due-date paths used by its screens and report.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
- [Query syntax](/docs/reference/http/query-syntax/)
