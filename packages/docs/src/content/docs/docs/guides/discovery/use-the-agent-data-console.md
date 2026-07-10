---
title: "Use the agent data console"
description: "Inspect, choose, execute, and verify data operations against a running app."
---

Inspect, choose, execute, and verify data operations against a running app.

The data-console workflow combines CLI discovery, generated row commands, table HTTP routes, reports, and app-owned endpoints under one scoped token.

For the programmer, the operator discovers the schema and a sample before selecting the narrowest supported mutation.
For the application user, data changes remain visible through the same record surfaces and access policy as browser work.

## System boundary

- Target and authenticate before discovery.
- Inspect table shape, indexes, and representative rows before writing.
- Prefer generated row commands or an existing app endpoint.
- Use SQL only when no supported surface covers the maintenance task.

## Task-app example

Inspect the tasks table, locate the intended project by label, update one task, and verify it with `rows get`. Use the complete-task route for completion history.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Table, row, and report commands](/docs/reference/cli/table-row-and-report-commands/)
- [API and SQL commands](/docs/reference/cli/api-and-sql-commands/)
