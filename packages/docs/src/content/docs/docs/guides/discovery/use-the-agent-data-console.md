---
title: "Use the agent data console"
description:
  "Inspect, choose, execute, and confirm data operations against a running app."
---

The agent data console is a workflow, not a separate database tool. An agent
uses Sapporta discovery, row commands, report routes, and app-owned endpoints
against the running application with one scoped token.

This guide shows how the agent learns the live schema before it reads or writes,
resolves foreign keys from visible records, and confirms every mutation. The
same workflow supports data questions, controlled cleanup, and operator tasks
without bypassing application authorization.

```text
Work with the running Sapporta app to <answer or change something>. Confirm the
target and token, inspect the relevant tables and endpoints, use the highest-
level supported operation, and show me the read-back result.
```

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
pnpm exec sapporta tables indexes tasks
pnpm exec sapporta rows list tasks --q "launch" --limit 10
```

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

<!--
Screenshot brief
Suggested asset: /assets/guides/discovery/agent-data-console.png
Setup: Seed two projects with similarly named tasks, create a scoped token, and select one open task in the active workspace.
Frame: Capture the agent transcript or terminal from table discovery through the final JSON read-back, with the token value hidden.
Visible proof: The agent resolves the intended row from visible data, chooses rows update for priority, and reads back only the changed task.
Alt text: Agent data-console workflow discovering a task, updating its priority, and confirming the scoped result.
-->

For a read-only question, prefer an existing report, then a filtered table
query, then an app-owned read endpoint. Privileged `sql query` is the fallback
when none of those surfaces expresses the question. Any answer should state the
route or table used, its filters, the active workspace, and the row limit.

This workflow gives an agent operational access without changing Sapporta's
authority model. The non-obvious rule is that discovery is part of the
operation: schema names, foreign keys, and routes come from the live app, not
from guesses. Continue with
[scoped tokens](/docs/guides/security/agent-access-and-scoped-tokens/) or
[choosing an interface](/docs/guides/discovery/choose-an-application-interface/).

## Related reference

- [Table, row, and report commands](/docs/reference/cli/table-row-and-report-commands/)
- [API and SQL commands](/docs/reference/cli/api-and-sql-commands/)
