---
title: "Drill-through and cross-report links"
description: "Make report values explorable without placing navigation in the wire dataset."
---

Make report values explorable without placing navigation in the wire dataset.

Datasets carry stable hidden identifiers. Frontend link resolvers convert row, cell, footer, ancestor, and report-input context into application navigation.

For the programmer, the project keeps hrefs and router policy out of report responses.
For the application user, users can open a project record or the exact filtered tasks behind a displayed count.

## System boundary

- Resolve links in the frontend rather than serializing them in `GridDataset`.
- Guard optional identifiers on synthetic and footer rows.
- Preserve report filter state in cross-report URLs.
- Let every destination enforce its own authorization.

## Task-app example

Project names open generated project records. Open and completed counts open `/tables/tasks` with matching project and status filters.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Report links](/docs/reference/reports/report-links/)
- [Query syntax](/docs/reference/http/query-syntax/)
