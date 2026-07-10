---
title: "Relationships and lookup behavior"
description: "Connect tables and make identifiers usable as labels and parent-child navigation."
---

Connect tables and make identifiers usable as labels and parent-child navigation.

Drizzle foreign keys define source-to-target integrity. Sapporta row labels, references, and child metadata define the generated lookup and detail experience.

For the programmer, the project declares each foreign key on the raw target table and exposes only useful inbound children.
For the application user, forms show project names instead of numeric identifiers, and project records expose their related tasks.

## System boundary

- Import the target's raw Drizzle table in `.references()`.
- Set `rowLabelColumns` on lookup targets.
- Declare inbound `children` on the parent when users need reverse navigation.
- Foreign-key validation stays inside the caller's active row-security boundary.

## Task-app example

`tasks.project_id` references `projectsTable.id`. The Projects table declares Tasks as a child using `project_id`, so the relationship works in both directions.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
- [Generated record surfaces](/docs/reference/frontend/generated-record-surfaces/)
