---
title: "OpenAPI"
description: "Look up the live OpenAPI document and route-selector identity."
---

## Identity

Protected `GET /api/openapi.json` on the running application.

## Contract

- The document includes registered framework table, metadata, auth, report, and app-owned routes.
- Path parameters appear with OpenAPI braces, such as `/api/tasks/{id}/complete`.
- The document reflects mounted routes; unmounted route modules are absent.
- `sapporta endpoints list/show` use this contract for human-readable discovery.


## Related documentation

- [OpenAPI and endpoint discovery](/docs/guides/discovery/openapi-and-endpoint-discovery/)
