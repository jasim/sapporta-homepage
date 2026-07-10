---
title: "Scoped report data"
description: "Keep hidden rows out of report details, counts, totals, and statistics."
---

Keep hidden rows out of report details, counts, totals, and statistics.

Report routes apply the same auth and row-security model as generated records before joins or aggregation. The mapper receives only visible domain data.

For the programmer, the project uses a scoped helper or explicit guard for every table in the report read.
For the application user, users cannot infer another workspace's rows from totals or drill-through counts.

## System boundary

- Resolve the narrow report ability and data authority at the route edge.
- Scope base rows before aggregation.
- Reject workspace and user scope fields in report input.
- Compare report totals with equivalent scoped table queries.

## Task-app example

Seed a second workspace and prove its project and tasks affect neither project-progress rows nor grand totals for the first workspace.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Scoped report helpers](/docs/reference/reports/scoped-report-helpers/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
