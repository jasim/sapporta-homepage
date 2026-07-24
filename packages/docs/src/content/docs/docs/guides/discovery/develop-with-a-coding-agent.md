---
title: "Develop with a coding agent"
description:
  "Give a coding agent a bounded Sapporta change and review the resulting
  artifacts."
---

Sapporta projects give a coding agent stable ownership boundaries: schema,
migration, contract, route, authorization, client, and screen. A useful request
names the observable outcome and the invariant that must survive the change.

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


An agent can make a correct local edit that still fails at runtime because a
route was never mounted or a migration was never applied. Live discovery and
the startup migration guard close that gap. Security also needs a negative
case: an invisible row and a missing row should not leak different information.

Project instructions carry local workflow. When the Sapporta skill is
installed, it adds framework-specific checks and conventions. Review still
follows source, generated artifacts, and live behavior rather than the agent's
summary.

## Related reference

- [Generated project layout](/docs/reference/project/generated-project-layout/)
- [Project and discovery commands](/docs/reference/cli/project-and-discovery-commands/)
