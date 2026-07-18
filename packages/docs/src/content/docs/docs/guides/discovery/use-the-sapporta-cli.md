---
title: "Use the Sapporta CLI"
description:
  "Discover and operate a running application from the project-local command
  line."
---

The Sapporta CLI is a client for a running application. It discovers mounted
endpoints and tables, performs generated row operations, calls app-owned routes,
and exposes privileged SQL commands when a higher-level interface is not enough.

This guide teaches the normal discover, act, and read-back loop. You can use it
for local development checks, deployment smoke tests, operator workflows, and
structured input for another program.

```text
Use the project-local Sapporta CLI to <inspect or change something>. Discover
the live table or endpoint first, make the narrowest call that fits, and read
the result back. Do not use SQL if a row or app command covers the operation.
```

## Target the running app

Use the project-local binary so the commands match the installed framework
version:

```bash
pnpm exec sapporta --help
pnpm exec sapporta endpoints list
pnpm exec sapporta tables list
```

API-backed commands target `http://localhost:3000` by default. A remote app or
non-default port needs an explicit URL and, for a protected app, a bearer token.
Flags override environment values.

```bash
pnpm exec sapporta \
  --api-url https://tasks.example.com \
  --api-token "$SAPPORTA_API_TOKEN" \
  endpoints list
```

Keep the token outside the repository. It represents one user in one active
workspace, so a successful call also identifies the authority used for the
result.

## Discover, change, and confirm

Inspect the task table and a representative row before changing data:

```bash
pnpm exec sapporta tables show tasks
pnpm exec sapporta tables sample tasks
pnpm exec sapporta rows list tasks \
  --where '{"status":{"eq":"open"}}' \
  --sort "due_date"
```

Use the generated row command for an ordinary field update. System-managed
fields such as `workspace_id`, `created_at`, and `updated_at` stay out of the
payload.

```bash
pnpm exec sapporta rows update tasks 1 --values '{"priority":"high"}'
pnpm exec sapporta --output json rows get tasks 1
```

Use the generic API command for an app-owned operation or report:

```bash
pnpm exec sapporta api post /api/tasks/1/complete --body '{}'
pnpm exec sapporta --output json \
  api get /api/reports/project-progress --query '{"project_id":1}'
```

JSON output is the better boundary for scripts and agents. Table output is more
readable during interactive inspection.

<!--
Screenshot brief
Suggested asset: /assets/guides/discovery/sapporta-cli-loop.png
Setup: Run the task app, create an agent token for the active workspace, and choose one open task.
Frame: Capture one terminal containing tables show tasks, rows update, and the JSON rows get result.
Visible proof: The discovered fields appear before the mutation and the final row contains priority high without client-supplied scope fields.
Alt text: Sapporta CLI discovering the Tasks table, updating one priority, and reading the row back as JSON.
-->

An `APP_SERVER_UNREACHABLE` result is a target or server problem. An auth error
is an authority problem. A structured 400 after a row or API call is a request
problem. Keeping those failures separate prevents dependency or database changes
from masking a bad URL, token, or payload.

The CLI now operates the same mounted application surface as the browser. Its
main value is the repeatable read-back loop and machine-readable output, not a
second data model. Continue with the
[agent data console](/docs/guides/discovery/use-the-agent-data-console/) for a
full operational workflow or
[endpoint discovery](/docs/guides/discovery/openapi-and-endpoint-discovery/) for
an exact contract.

## Related reference

- [CLI overview](/docs/reference/cli/overview-and-global-options/)
- [CLI command index](/docs/reference/indexes/cli-commands/)
