---
title: "What Is Sapporta"
description:
  "Understand Sapporta as a TypeScript database app toolkit with generated
  tables, APIs, grids, OpenAPI, and app-owned features."
---

Sapporta is a TypeScript toolkit for building database applications, like
operational tools, personal databases, and business software. Sapporta can help
provide a polished data experience for anything that revolves around relational
data.

A Sapporta project is still an ordinary app. You own the Hono API, Drizzle
schema, React routes, shared API contracts, auth policy, and deployment.
Sapporta supplies the repeatable database-app surface so domain-specific code -
both on the front end and back end - can operate closer to the domain.

This is made possible by the way Sapporta treats table definitions as the source
for the rest of the application surface. You describe your relational model in
TypeScript, and Sapporta uses that same schema to provide:

- a keyboard accessible, extensible datagrid, that can render foreign-key and
  master-child relationships seamlessly
- CRUD APIs for every table, accessible from the front-end as direct function
  calls, thanks to ts-rest
- forms, lookup fields, exports, and other conveniences
- a complete drill-down reporting system based on the same datagrid interface

It also publishes the resulting application surface through OpenAPI and CLI
discovery, making Sapporta apps fully agentic. And all of this is bounded by
row-level security as well as fine-grained CASL permissions.

Next:
[The Grid And Record Surfaces](/docs/concepts/the-grid-and-record-surfaces/).
