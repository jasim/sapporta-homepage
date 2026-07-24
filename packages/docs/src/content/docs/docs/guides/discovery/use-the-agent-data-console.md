---
title: "Use the agent data console"
description:
  "Inspect, choose, execute, and confirm data operations against a running app."
---

The agent data console is an operating discipline: discover live names, resolve
identity from visible rows, choose the owning operation, execute it, and read
the result back.

## Establish the boundary first

Create an agent token from `/account/profile` while the intended workspace is
active. The raw secret is shown once. Supply it to the agent process without
putting it in a prompt transcript, shell history example, or project file.

```bash
export SAPPORTA_API_URL=http://localhost:3000
export SAPPORTA_API_TOKEN=<token-shown-once>
pnpm exec sapporta endpoints list
pnpm exec sapporta tables list
```

An agent should stop on `token_expired`, `token_revoked`, or
`workspace_required`. Direct SQLite access would answer a different question:
what exists in the local database, rather than what this user can access through
the app.

## Inspect before choosing a write

Suppose the request is “raise the launch task to high priority.” Discover the
table, inspect sample values, and locate the task within visible rows:

```bash
pnpm exec sapporta tables show tasks
pnpm exec sapporta rows list tasks --q "launch" --limit 10
```

`--q` uses the table search plan. Search is enabled for visible application
columns by default and unavailable only when the table declares `search: false`.
Index inspection is a separate, owner-only unrestricted operation.

If the request names a project instead of an ID, resolve the project through
visible data. Do not guess the foreign key.

```bash
pnpm exec sapporta rows list projects --q "Website launch" --limit 10
pnpm exec sapporta rows list tasks \
  --where '{"project_id":{"eq":1}}' \
  --sort "due_date"
```

Priority is ordinary CRUD, so use the row command and confirm the exact row:

```bash
pnpm exec sapporta rows update tasks 7 --values '{"priority":"high"}'
pnpm exec sapporta --output json rows get tasks 7
```

Task completion uses the domain endpoint because it also creates history:

```bash
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
pnpm exec sapporta api post /api/tasks/7/complete --body '{}'
pnpm exec sapporta --output json rows get tasks 7
```

For a read-only question, prefer an existing report, then a filtered table
query, then an app-owned read endpoint. Privileged `sql query` is the fallback
when none of those surfaces expresses the question. Any answer should state the
route or table used, its filters, the active workspace, and the row limit.

Discovery is part of the operation. Schema names, foreign keys, and routes come
from the live app, not from guesses or direct database inspection.

## Related reference

- [Table, row, and report commands](/docs/reference/cli/table-row-and-report-commands/)
- [API and SQL commands](/docs/reference/cli/api-and-sql-commands/)
