---
title: "Generated table APIs"
description: "Use generated row routes and identify when an app-owned endpoint is required."
---

Use generated row routes and identify when an app-owned endpoint is required.

Each registered table receives row-scoped list, get, create, update, delete, lookup, count, and export routes under `/api/tables/<table>`.

For the programmer, the project uses generated routes for ordinary record operations and reserves custom endpoints for domain transactions or external effects.
For the application user, browser screens, scripts, and agents observe the same visible rows and validation rules.

## System boundary

- List responses use `{ data, meta }`; single-row responses use `{ data }`.
- Create and update bodies omit trusted workspace and owner columns.
- Lookup, count, and export apply the same row boundary as list routes.
- A multi-table completion action belongs in an app-owned endpoint.

## Task-app example

List open tasks, then update one priority. The generated API and record grid should show the same row after refresh.

```bash
pnpm exec sapporta rows list tasks --where '{"status":{"eq":"open"}}'
pnpm exec sapporta rows update tasks 1 --values '{"priority":"high"}'
```

## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Table endpoints](/docs/reference/http/table-endpoints/)
- [Query syntax](/docs/reference/http/query-syntax/)
