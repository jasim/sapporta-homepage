---
title: "Query tasks through the generated API"
description: "Read and update task rows through generated routes under the same authorization boundary as the UI."
---

Generated table routes are the programmatic counterpart to generated record screens. Both surfaces use the same query parser and row-security boundary.

> Checkpoint: C04 → C05

## Agent approach

```text
Read the local project instructions and use the Sapporta skill. Starting at C04, implement this outcome: Generated table routes are the programmatic counterpart to generated record screens. Both surfaces use the same query parser and row-security boundary. Reach C05, run the validation described on this page, and report changed files and checks. Preserve server-controlled scope fields and use generated APIs for ordinary CRUD.
```

## Review the agent's work

- List responses use `{ data, meta }`; single-row responses use `{ data }`.
- Filters use the strict `filter[column][operator]` grammar.
- Create and update payloads omit `workspace_id`.

## Code approach

```bash
pnpm exec sapporta rows list tasks --where '{"status":{"eq":"open"}}'
pnpm exec sapporta rows update tasks 1 --values '{"priority":"high"}'
```

The equivalent list route is `GET /api/tables/tasks?filter[status][eq]=open`. Use the authenticated CLI or browser session established earlier.

## Observe and verify

The API result and browser grid show the same row and updated priority. An invalid filter returns a structured 400 response.

## What you built

Ordinary row reads and edits use the generated API. The later completion action will use an app-owned endpoint because it changes two tables atomically.

Continue with [the related guide](/docs/guides/generated-surfaces/generated-table-apis/) or use [the exact reference](/docs/reference/http/table-endpoints/).
