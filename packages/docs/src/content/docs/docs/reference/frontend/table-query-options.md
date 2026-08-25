---
title: "Table query options"
description:
  "Choose the generated-table read/options reference or the cache-key and
  ownership reference."
---

Sapporta's generated-table query surface has two independent responsibilities:

- [Read functions and query options](/docs/reference/frontend/table-queries/read-functions-and-options/)
  covers direct fetch functions, lossless query serialization, TanStack Query
  option builders, row decoders, cancellation, and exported types.
- [Cache keys and ownership](/docs/reference/frontend/table-queries/cache-keys-and-ownership/)
  covers the key hierarchy, invalidation scope, non-normalized record/page
  caches, TGrid reloads, and the boundary between server and form state.

New projects mount one application `QueryClientProvider`. Feature modules reuse
that client and compose the public query options rather than creating a
screen-local provider.

## Related documentation

- [Generated record surfaces and form helpers](/docs/reference/frontend/generated-record-surfaces/)
- [Custom frontend routes and screens](/docs/guides/application-code/custom-frontend-routes-and-screens/)
- [Generated table APIs](/docs/guides/generated-surfaces/generated-table-apis/)
