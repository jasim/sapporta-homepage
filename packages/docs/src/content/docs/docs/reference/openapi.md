---
title: "OpenAPI"
description:
  "Lookup the OpenAPI endpoint, discovery behavior, selectors, and protected
  discovery rules."
---

## OpenAPI reference

The running app publishes its live OpenAPI document at:

```text
GET /api/openapi.json
```

The document includes metadata routes, per-table routes, lookup/count/export
routes, reports, and app-owned feature routes. It reflects the API your running
server will accept.

Use the CLI for human-readable discovery:

```bash
pnpm exec sapporta endpoints list
pnpm exec sapporta endpoints show "GET /api/meta/tables"
pnpm exec sapporta endpoints show "POST /api/tables/customers"
```

Fetch the raw document for client generation or integration debugging:

```bash
curl -fsS \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/openapi.json"
```

In protected apps, OpenAPI discovery uses the same credentials as data commands.

For CLI target selection, route selectors, protected discovery, and missing
custom route debugging, see
[API Discovery And OpenAPI](/docs/subsystems/openapi-and-discovery/). For agent
tokens and workspace-scoped CLI access, see
[Agent Access](/docs/tools-and-operations/agent-access/).
