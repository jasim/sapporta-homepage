---
title: "REST helpers"
description: "Look up standalone REST-source options, request mapping, response mapping, and reconciliation."
---

## Identity
REST data-source helpers exported from `@sapporta/grid/grid`.
### REST Source Helpers

`restLevelSource` and `restGridDataSource` use four query concepts:

- `rowQuery` stores mutable page, page-size, sort, and filter values.
- `buildRowsRequest` adds fixed constraints before a fetch runs.
- `sourceOwnedRowQuery(initial)` stores query state inside a source.
- `hostBackedRowQuery(state)` adapts application-owned query state to the same
  source command contract.

Use `sourceOwnedRowQuery` for embedded levels and child levels without visible
controls. Use `hostBackedRowQuery` when toolbar controls, URL state, exports,
and row loading must read the same query store.
## Related documentation
[Grid reference overview](/grid/reference/)
