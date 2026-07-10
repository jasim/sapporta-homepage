---
title: "Route-based reports"
description: "Create a protected typed report route and screen with shareable filters."
---

Create a protected typed report route and screen with shareable filters.

Reports are app-owned routes and screens. The application owns the contract, scoped read, pure mapper, typed client, URL state, renderer, and navigation.

For the programmer, the project separates data access from `GridDataset` construction and uses `ReportGridDataset` for rendering.
For the application user, users can reload, bookmark, and share a report state without losing filters.

## System boundary

- Use GET for compact shareable filters and POST for large nested input.
- Resolve auth and input in a thin route handler.
- Keep query and mapping code in separate functions.
- Validate both the route response and dataset shape.

## Task-app example

`GET /api/reports/project-progress` accepts an optional project filter and renders at `/reports/project-progress` inside protected routes.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Report routes and registration](/docs/reference/reports/report-routes-and-registration/)
- [GridDataset](/docs/reference/reports/grid-dataset/)
