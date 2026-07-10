---
title: "Filtering, sorting, search, and pagination"
description: "Build shareable table queries that behave consistently in UI, HTTP, and export."
---

Build shareable table queries that behave consistently in UI, HTTP, and export.

The table query parser owns strict filters, configured search, multi-column sort, and bounded pagination. Generated screens serialize the same state in the URL.

For the programmer, the project can compose deterministic queries without implementing a parallel parser.
For the application user, users can bookmark, share, refresh, and export the current task query.

## System boundary

- Use `filter[column][operator]=value` for HTTP filters.
- Use `q` only on tables with configured search columns.
- Prefix descending sort columns with `-`.
- Treat malformed columns, operators, values, pages, and limits as 400 errors.

## Task-app example

Filter tasks by project and status, search titles for `launch`, sort by due date, and compare the browser result with the generated list route.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Query syntax](/docs/reference/http/query-syntax/)
- [Table endpoints](/docs/reference/http/table-endpoints/)
