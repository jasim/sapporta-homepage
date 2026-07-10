---
title: "Contract helpers and wire types"
description: "Look up browser-safe contracts, common schemas, and shared wire types."
---

## Identity

`@sapporta/shared/contracts`, `@sapporta/rest-core`, and project shared package exports.

## Contract

- Contracts declare method, path, path parameters, query, body, response schemas, summary, and metadata.
- `errorBodySchema` is the shared structured HTTP error schema.
- Table metadata wire types and auth/report contracts remain safe for browser imports.
- The shared package contains no Hono handlers, Drizzle queries, database connections, or React components.


## Related documentation

- [Shared contracts and request validation](/docs/guides/app-owned-features/shared-contracts-and-request-validation/)
