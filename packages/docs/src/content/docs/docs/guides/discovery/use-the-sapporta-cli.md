---
title: "Use the Sapporta CLI"
description:
  "Discover and operate a running application from the project-local command
  line."
---

The Sapporta CLI is a client for a running application. It discovers tables and
documented endpoints, performs generated row operations, calls app-owned
routes, and exposes owner-only SQL for exceptional administration.

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
  endpoints list
```

Prefer `SAPPORTA_API_TOKEN` to `--api-token`; the environment keeps the secret
out of process arguments. A token represents one user in one active workspace.

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

JSON output is the stable boundary for scripts and agents. Table output is more
readable during interactive inspection. Non-TTY output defaults to JSON, but an
explicit `--output json` makes the contract visible in automation.


An `APP_SERVER_UNREACHABLE` result is a target or server problem. An auth error
is an authority problem. A structured 400 after a row or API call is a request
problem. Keeping those failures separate prevents dependency or database changes
from masking a bad URL, token, or payload.

The CLI operates the same mounted application surface as the browser. Its value
is a repeatable read-back loop and machine-readable output, not a second data
model.

## Related reference

- [CLI overview](/docs/reference/cli/overview-and-global-options/)
- [CLI command index](/docs/reference/indexes/cli-commands/)
