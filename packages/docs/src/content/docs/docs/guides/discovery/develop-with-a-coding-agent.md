---
title: "Develop with a coding agent"
description:
  "Give a coding agent a bounded Sapporta change and review the resulting
  artifacts."
---

Sapporta projects give coding agents predictable places for schemas, migrations,
contracts, route handlers, row access, typed clients, and React screens. This
guide shows how to describe one outcome and review the complete vertical slice
the agent changes.

You will learn to write a short prompt with useful constraints, choose checks
that prove live behavior, and review generated artifacts that an agent summary
can miss. This works for tables, custom workflows, reports, and frontend pages.

```text
Add <one concrete outcome> to this Sapporta app. Read the project instructions
and use the Sapporta skill. Preserve server-owned scope, inspect existing
patterns first, run the focused checks, and report the files and behavior that
changed.
```

## Bound the outcome, not every edit

A useful request states the starting point, observable result, authority rule,
and proof. The agent can then follow local conventions instead of reproducing a
long pasted implementation.

For the task app at checkpoint C08, a complete-task request can stay compact:

```text
Add the complete-task workflow from C08. One protected call must mark a visible
task completed and insert one immutable completion event in the same
transaction. Owners may run it; repeated completion returns the declared
conflict. Build the app and show the mounted endpoint before finishing.
```

That outcome should lead the agent through these project-owned artifacts:

| Concern               | Expected location                             |
| --------------------- | --------------------------------------------- |
| Wire contract         | `packages/shared/src/contracts/`              |
| Route adapter         | `packages/api/app/`                           |
| Route mount           | `packages/api/app.ts`                         |
| Ability and row scope | `packages/api/authz/` and scoped helpers      |
| Browser client        | `packages/frontend/src/api.ts` when needed    |
| Focused checks        | Build, endpoint discovery, and behavior tests |

## Review evidence in layers

Start with the diff. Confirm that contract paths omit `/api`, the route file is
mounted, the client does not submit scope columns, and generated migration SQL
matches any schema edit.

Then run the smallest live checks that prove the outcome:

```bash
pnpm build
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
pnpm exec sapporta api post /api/tasks/1/complete --body '{}'
pnpm exec sapporta --output json rows get tasks 1
```

For schema work, generate a named migration and review its SQL before applying
it. For a transaction, test both the success and a declared conflict, and prove
that a failed second write does not leave the first write committed.

<!--
Screenshot brief
Suggested asset: /assets/guides/discovery/coding-agent-review.png
Setup: Ask a coding agent to implement the complete-task workflow in the tutorial task app and run its focused validation.
Frame: Capture the final agent summary beside the source-control diff or changed-files panel.
Visible proof: The summary names the shared contract, route handler, explicit mount, tests, and endpoint-discovery result; no secrets or token values appear.
Alt text: Coding-agent result for a Sapporta complete-task workflow with the changed vertical-slice files visible.
-->

An agent can make a correct local edit that still fails at runtime because a
route was never mounted or a migration was never applied. Live discovery and
database readiness checks close that gap. Security also needs a negative case:
an invisible row and a missing row should not leak different information.

The prompt remains small because the project and Sapporta skill carry the
workflow. The review remains concrete because it follows source, generated
artifacts, and live behavior. From here, use the specialized guide for the
feature being built, such as
[tables](/docs/guides/model-data/tables-columns-and-schema-metadata/),
[custom endpoints](/docs/guides/app-owned-features/custom-api-endpoints/), or
[reports](/docs/guides/reports/route-based-reports/).

## Related reference

- [Generated project layout](/docs/reference/project/generated-project-layout/)
- [Project and discovery commands](/docs/reference/cli/project-and-discovery-commands/)
