---
title: "Build, test, and choose the next guide"
description: "Validate the completed task app and continue into the guide or reference path that matches the next change."
---

The completed tutorial app has three tables, generated CRUD surfaces, workspace scope, one atomic endpoint, one typed client, one protected screen, one report, and one CLI/agent operating path.

> Checkpoint: C13 → C14

## Agent approach

```text
Read the local project instructions and use the Sapporta skill. Starting at C13, implement this outcome: The completed tutorial app has three tables, generated CRUD surfaces, workspace scope, one atomic endpoint, one typed client, one protected screen, one report, and one CLI/agent operating path. Reach C14, run the validation described on this page, and report changed files and checks. Preserve server-controlled scope fields and use generated APIs for ordinary CRUD.
```

## Review the agent's work

- Migration readiness, shared/API/frontend builds, endpoint discovery, access failures, transaction rollback, report totals, and browser routes all have explicit checks.
- Published examples contain no client-controlled scope fields.
- Each subsystem has one guide for explanation and one Reference destination for lookup.

## Code approach

```bash
pnpm --filter ./packages/api db:check
pnpm build
pnpm exec sapporta tables list
pnpm exec sapporta endpoints list
```

Run the endpoint success, repeated-completion, cross-workspace, and rollback tests. Open the generated tables, progress dashboard, and report at a narrow and desktop viewport.

## Observe and verify

The fixture reaches C14 from a clean generated project, all automated checks pass, and report/row totals match the sample-data ledger.

## What you built

Choose Model data for schema work, Generated surfaces for ordinary records, Security or App-owned features for workflows, Reports for analytical views, and Discovery or Operations for running systems.

Continue with [the related guide](/docs/guides/) or use [the exact reference](/docs/reference/).
