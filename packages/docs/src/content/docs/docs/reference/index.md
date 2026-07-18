---
title: "Reference"
description: "Look up the canonical Sapporta package, HTTP, CLI, configuration, and runtime contracts."
---

Reference covers the public Sapporta 0.2.6 package surface, generated project contract, HTTP routes, CLI, configuration, runtime behavior, and diagnostics audited from framework source revision `98b33341d3aa63a4dd02e7a6e5edc2f6dbe54413`.

## Lookup indexes

- [Public symbols](/docs/reference/indexes/public-symbols/)
- [HTTP endpoints](/docs/reference/indexes/http-endpoints/)
- [CLI commands](/docs/reference/indexes/cli-commands/)
- [Configuration](/docs/reference/indexes/configuration/)

## Package boundaries

`@sapporta/server` owns server schema, auth, row helpers, and route registration. `@sapporta/shared` owns browser-safe contracts and wire values. `@sapporta/frontend` owns the app shell, generated record surfaces, TGrid, and report rendering. Standalone `@sapporta/grid` has its own [Grid Reference](/grid/reference/).

## Schema and value boundaries

- [Table validation](/docs/reference/schema/table-validation/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
