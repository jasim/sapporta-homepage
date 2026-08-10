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
- [Generated and client values](/docs/reference/schema/semantic-values/generated-and-client-values/)
- [Server write values and contracts](/docs/reference/schema/semantic-values/server-write-values-and-contracts/)

## Server row access

- [Scoped CRUD and bounded reads](/docs/reference/server/row-scoped-data/scoped-crud-and-bounded-reads/)
- [Scoped lookups and counts](/docs/reference/server/row-scoped-data/lookups-and-counts/)
- [Generated query resolvers](/docs/reference/server/row-scoped-data/generated-query-resolvers/)
- [Table row-security guards](/docs/reference/server/row-scoped-data/table-row-security-guards/)

## Frontend state and interaction

- [Application routes and navigation](/docs/reference/frontend/app-shell/application-routes-and-navigation/)
- [App shell layout and sidebar](/docs/reference/frontend/app-shell/layout-and-sidebar/)
- [Generated record surfaces and form helpers](/docs/reference/frontend/generated-record-surfaces/)
- [Table read functions and query options](/docs/reference/frontend/table-queries/read-functions-and-options/)
- [Table query cache keys and ownership](/docs/reference/frontend/table-queries/cache-keys-and-ownership/)
- [TGrid definitions, sessions, and queries](/docs/reference/frontend/tgrid/definitions-sessions-and-queries/)
- [TGrid interactions, columns, and writes](/docs/reference/frontend/tgrid/interactions-columns-and-writes/)
- [Standalone Grid interactions](/grid/reference/interactions/)
