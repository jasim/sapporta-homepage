---
title: "Apply task access rules"
description: "Separate feature permission from workspace row visibility and verify both boundaries."
---

Workspace members can use ordinary project and task CRUD. Only workspace owners can run the task-completion action. Workspace scope remains server-controlled for both roles.

> Checkpoint: C06 → C07

## Agent approach

```text
Read the local project instructions and use the Sapporta skill. Starting at C06, implement this outcome: Workspace members can use ordinary project and task CRUD. Only workspace owners can run the task-completion action. Workspace scope remains server-controlled for both roles. Reach C07, run the validation described on this page, and report changed files and checks. Preserve server-controlled scope fields and use generated APIs for ordinary CRUD.
```

## Review the agent's work

- `buildAbility()` grants table actions separately from `run` on `task_completion`.
- `resolveRequestDataAuthority()` supplies the active workspace to row security.
- A client cannot widen either boundary with request fields.

## Code approach

In `packages/api/authz/ability.ts`, grant members read/create/update/export access to projects and tasks. Grant `can("run", "task_completion")` only when the active membership contains the owner role.

Keep both tables at `workspaceGlobal`. Their generated operations derive `workspace_id` from request authority and reject it in client payloads.

## Observe and verify

An owner and member in the same workspace see the same task rows. The member fails the completion ability check. A user in another workspace cannot see those rows.

## What you built

Permission and row visibility are now separate, observable controls. The next page adds completion history before adding the custom action.

Continue with [the related guide](/docs/guides/security/authentication-and-abilities/) or use [the exact reference](/docs/reference/server/auth-and-row-security/).
