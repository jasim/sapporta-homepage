---
title: "Custom forms and cached table reads"
description:
  "Choose the focused guide for form drafts and validation or cached generated
  table reads and refresh."
---

A custom record editor composes two independent browser owners. TanStack Form
owns draft and submit state. TanStack Query owns loaded server state. Sapporta
metadata and generated clients connect both owners to the registered table
without creating a second schema or cache.

- [Custom forms and validation](/docs/guides/application-code/custom-forms-and-validation/)
  covers metadata-derived fields, create versus patch decoding, and local or
  remote field issues.
- [Cached table reads and refresh](/docs/guides/application-code/cached-table-reads-and-refresh/)
  covers record and page queries, row decoding, cancellation, query
  invalidation, and TGrid reload boundaries.

Use an application typed endpoint when one submit changes several tables or runs a
named domain action. Form still owns the draft; the shared contract owns the
request; the server owns authorization and the transaction.

## Related documentation

- [Generated record surfaces and form helpers](/docs/reference/frontend/generated-record-surfaces/)
- [Table query options](/docs/reference/frontend/table-query-options/)
- [Typed API clients](/docs/guides/application-code/typed-api-clients/)
