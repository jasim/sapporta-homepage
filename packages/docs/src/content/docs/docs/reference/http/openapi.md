---
title: "OpenAPI"
description: "Look up the live OpenAPI document and route-selector identity."
---

## Identity

Protected `GET /api/openapi.json` on the running application.

## Contract

- The document includes registered framework table, metadata, auth, report, and
  app-owned routes.
- Path parameters appear with OpenAPI braces, such as
  `/api/tasks/{id}/complete`.
- The document reflects mounted routes; unmounted route modules are absent.
- Generated table insert and patch components describe caller-controlled values
  derived from `tableApiZod`. Server-owned fields are omitted even when they are
  required in the trusted prepared insert.
- Generated table routes perform authoritative structural parsing after auth
  preparation at the save boundary. The OpenAPI body schema and trusted write
  schema are related projections of the same `TableDef`, not the same object
  shape.
- `sapporta endpoints list/show` use this contract for human-readable discovery.

## Related documentation

- [OpenAPI and endpoint discovery](/docs/guides/discovery/openapi-and-endpoint-discovery/)
