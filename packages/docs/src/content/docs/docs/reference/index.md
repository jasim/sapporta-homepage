---
title: "Reference"
description:
  "Look up the canonical Sapporta package, HTTP, CLI, configuration, and runtime
  contracts."
---

Reference covers the public Sapporta package surface, generated project
contract, HTTP routes, CLI, configuration, runtime behavior, and diagnostics.
The hand-written pages follow framework source revision
`213c4b88a6fe28cf019f880bd97393f21a8b5a69`. Published package versions come from
the generated symbol reference, which names the release it describes.

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
- [Table lookups and record ids](/docs/reference/frontend/lookups/)
- [Table read functions and query options](/docs/reference/frontend/table-queries/read-functions-and-options/)
- [Table query cache keys and ownership](/docs/reference/frontend/table-queries/cache-keys-and-ownership/)
- [TGrid definitions, sessions, and queries](/docs/reference/frontend/tgrid/definitions-sessions-and-queries/)
- [TGrid interactions, columns, and writes](/docs/reference/frontend/tgrid/interactions-columns-and-writes/)
- [Standalone Grid interactions](/grid/reference/interactions/)
