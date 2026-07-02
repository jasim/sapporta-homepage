---
title: "Using With Sapporta"
description:
  "Know when to use standalone Sapporta Grid and when to use the full Sapporta
  framework around it."
---

Sapporta Grid is the grid package. Sapporta is the database application toolkit
that uses the grid.

Use standalone Sapporta Grid when:

- you already have a React app
- your backend already exists
- your schema is a UI schema, not a Sapporta table definition
- your save path should call application-specific endpoints
- you want the grid runtime without generated APIs or app shell routing

Use full Sapporta when:

- you want schema-as-code database tables
- you want generated CRUD APIs for each table
- row visibility needs to follow workspace, owner, role, or ability rules
- you want generated table screens and forms immediately
- reports, OpenAPI discovery, CLI access, and agent workflows are part of the
  app

In a Sapporta app, the grid becomes schema-aware. Table metadata supplies
columns, lookup labels, child relationships, search behavior, and generated row
endpoints. The browser surface still uses grid concepts, but the framework owns
more of the plumbing.

The practical split is simple: use Grid when the frontend is the thing you are
buying. Use Sapporta when the grid should sit inside a generated database app.
