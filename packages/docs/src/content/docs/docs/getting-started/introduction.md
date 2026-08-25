---
title: "Welcome to Sapporta"
description:
  "Understand Sapporta as a TypeScript database app toolkit with generated
  tables, APIs, grids, OpenAPI, and application features."
---

Welcome to Sapporta.

Sapporta is a TypeScript toolkit for building database applications, like
operational tools, personal databases, and business software. Sapporta provides
a polished data experience for anything that revolves around relational data.

A Sapporta project is still an ordinary app. You own the Hono API, Drizzle
schema, React routes, shared API contracts, auth policy, and deployment.
Sapporta supplies the building blocks common to database apps, so that
domain-specific code—both on the front end and back end—can operate closer to
the domain.

This is made possible by the way Sapporta treats table definitions as the source
for the rest of the application surface. You describe your relational model in
TypeScript, and Sapporta uses that same schema to provide:

- a keyboard-accessible, extensible data grid that renders foreign-key and
  master-child relationships
- CRUD APIs for every table, accessible from the front end as direct function
  calls through ts-rest
- forms, lookup fields, exports, and other conveniences
- a complete drill-down reporting system based on the same data grid interface

Sapporta also publishes the resulting application surface through OpenAPI and
CLI discovery, making Sapporta apps fully agentic. Row-level security and
fine-grained CASL permissions bound the entire application surface.

Continue with [Create a Sapporta project](/docs/getting-started/create-a-project/).
