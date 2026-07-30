---
title: "Row-scoped data helpers"
description:
  "Choose the scoped row API for ordinary CRUD, specialized reads, generated
  query translation, or custom guarded Drizzle access."
---

Use `scopedRows()` as the ordinary data boundary after a route authenticates and
authorizes its caller. Choose the leaf that matches the operation:

- [Scoped CRUD and bounded reads](/docs/reference/server/row-scoped-data/scoped-crud-and-bounded-reads/)
  covers `scopedRows()`, create/update/delete, `findMany()`, `page()`, and
  cursor-backed scans.
- [Lookups and counts](/docs/reference/server/row-scoped-data/lookups-and-counts/)
  covers disjoint lookup modes, scalar counts, and grouped counts.
- [Generated query resolvers](/docs/reference/server/row-scoped-data/generated-query-resolvers/)
  covers the bridge from parsed generated HTTP queries to Drizzle-shaped helper
  inputs.
- [Table row-security guards](/docs/reference/server/row-scoped-data/table-row-security-guards/)
  covers `ownedRows()`, trusted insert/patch preparation, `serverValues`,
  synchronous transactions, and raw/custom Drizzle responsibilities.

These helpers enforce row visibility only at the documented data boundary.
Custom routes still choose and check their ability and data authority before
touching rows.

## Related documentation

- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Table endpoints](/docs/reference/http/table-endpoints/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Scoped report helpers](/docs/reference/reports/scoped-report-helpers/)
