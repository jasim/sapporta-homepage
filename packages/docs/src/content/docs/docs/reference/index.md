---
title: "Reference"
description:
  "Look up the canonical Sapporta package, HTTP, CLI, configuration, and runtime
  contracts."
---

Reference covers the public Sapporta 0.2.7 package surface, generated project
contract, HTTP routes, CLI, configuration, runtime behavior, and diagnostics.
The server row-query, shared HTTP, frontend table-query, and Grid interaction
contracts include changes through framework source revision
`c15d8a8c8fc8276c86774d4d8e6b7c862f54c9c6`.

## Lookup indexes

- [Public symbols](/docs/reference/indexes/public-symbols/)
- [HTTP endpoints](/docs/reference/indexes/http-endpoints/)
- [CLI commands](/docs/reference/indexes/cli-commands/)
- [Configuration](/docs/reference/indexes/configuration/)

## Package boundaries

`@sapporta/server` owns server schema, auth, row helpers, and route
registration. `@sapporta/shared` owns browser-safe contracts and wire values.
`@sapporta/frontend` owns the app shell, generated record surfaces, TGrid, and
report rendering. Standalone `@sapporta/grid` has its own
[Grid Reference](/grid/reference/).

## Schema and value boundaries

- [Table validation](/docs/reference/schema/table-validation/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)

## Frontend state and interaction

- [Generated record surfaces and form helpers](/docs/reference/frontend/generated-record-surfaces/)
- [Table query options](/docs/reference/frontend/table-query-options/)
- [TGrid](/docs/reference/frontend/tgrid/)
- [Standalone Grid interactions](/grid/reference/interactions/)
