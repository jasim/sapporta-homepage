---
title: "Semantic value boundaries"
description:
  "Choose the exact reference for generated/client values or server write
  values and app-owned contracts."
---

Sapporta preserves semantic table values across generated forms, HTTP,
application code, Grid, and SQLite. Use the leaf that owns the boundary you are
implementing:

- [Generated and client values](/docs/reference/schema/semantic-values/generated-and-client-values/)
  covers the end-to-end value matrix, select-backed text, create-form drafts,
  and Grid editor decoding.
- [Server write values and contracts](/docs/reference/schema/semantic-values/server-write-values-and-contracts/)
  covers authoritative prepared writes, structural schemas, Temporal
  conversion helpers, app-owned contracts, and public SQL names.

For table declaration syntax, start with
[Table definitions](/docs/reference/schema/table-definitions/). For
operation-aware application issues, use
[Table validation](/docs/reference/schema/table-validation/).

## Related documentation

- [Generated record surfaces and form helpers](/docs/reference/frontend/generated-record-surfaces/)
- [Table endpoints](/docs/reference/http/table-endpoints/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
