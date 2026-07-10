---
title: "Use the Sapporta CLI"
description: "Discover and operate a running application from the project-local command line."
---

Discover and operate a running application from the project-local command line.

The `sapporta` CLI contains one local project command and API-backed discovery, table, row, endpoint, and SQL command groups.

For the programmer, the project uses `pnpm exec sapporta`, explicit target credentials, and JSON output when another program consumes the result.
For the application user, operators can inspect and mutate supported application surfaces without bypassing server authorization.

## System boundary

- Set the target with `--api-url` or `SAPPORTA_API_URL`.
- Set bearer authority with `--api-token` or `SAPPORTA_API_TOKEN`.
- Discover tables and routes before changing rows.
- Read the row back after every mutation.

## Task-app example

List the task endpoints and tables, inspect tasks, update one priority, call project progress, and emit one response as JSON.

```bash
pnpm exec sapporta tables show tasks
pnpm exec sapporta rows update tasks 1 --values '{"priority":"high"}'
pnpm exec sapporta api get /api/reports/project-progress
pnpm exec sapporta --output json rows get tasks 1
```

## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [CLI overview](/docs/reference/cli/overview-and-global-options/)
- [CLI command index](/docs/reference/indexes/cli-commands/)
