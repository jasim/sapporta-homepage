---
title: "OpenAPI and endpoint discovery"
description: "Inspect the live generated and app-owned API contract."
---

Inspect the live generated and app-owned API contract.

The running API publishes its protected OpenAPI document at `/api/openapi.json`. The CLI converts that document into route lists and focused route descriptions.

For the programmer, the project verifies registration, mounting, request shapes, responses, and auth from the live application.
For the application user, operators and integrations can discover the exact interface deployed by the selected server.

## System boundary

- Use `endpoints list` for inventory and `endpoints show` for one method/path.
- A registered route appears only after the app mounts it.
- Protected discovery uses the same session or bearer authority as data routes.
- Contract paths omit `/api`; selectors use the final mounted URL.

## Task-app example

Inspect `POST /api/tasks/{id}/complete`, then temporarily remove its mount and confirm the route disappears from discovery.

```bash
pnpm exec sapporta endpoints list
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
```

## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [OpenAPI](/docs/reference/http/openapi/)
- [HTTP endpoint index](/docs/reference/indexes/http-endpoints/)
