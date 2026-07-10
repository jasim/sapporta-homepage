---
title: "Tables, columns, and schema metadata"
description: "Define stored rows and the product behavior Sapporta derives from them."
---

Define stored rows and the product behavior Sapporta derives from them.

Drizzle table declarations own SQLite storage and constraints. `sapportaTable()` metadata owns generated labels, fields, search, selects, and policy hints.

For the programmer, the project keeps one typed definition for storage and one explicit metadata layer for generated behavior.
For the application user, generated screens expose recognizable labels, inputs, and values as soon as the table is registered.

## System boundary

- Export the raw Drizzle table and the wrapped Sapporta table from the same schema module.
- Use Sapporta semantic factories for text, numbers, money, percentages, booleans, dates, and timestamps.
- Use raw Drizzle integers for primary and foreign keys.
- Derive select and insert types from the Drizzle table instead of maintaining parallel interfaces.

## Task-app example

For the task app, `projects` and `tasks` are workspace-scoped. Project names and task titles are row labels. Status and priority are controlled text values, and due dates use `Temporal.PlainDate`.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Table definitions](/docs/reference/schema/table-definitions/)
- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
