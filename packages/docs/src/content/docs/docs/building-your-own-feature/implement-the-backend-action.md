---
title: "Implement The Backend Action"
description:
  "Write the triage route, service, store, transaction, and row-security checks."
---

Add a route file under `packages/api/app/` that registers the triage contract.
Keep the route thin: resolve auth, parse the registered request, and pass
`{ db, auth, input }` to a service.

Backend responsibilities:

- validate allowed status and priority transitions
- read the task through row security
- validate `assignee_id` against a visible `people` row
- update `tasks` inside a transaction
- insert an optional `comments` row when `note` is present
- insert a `task_events` audit row
- return small refresh data, not a full joined row

Use a workspace-level update authority for the first version:

```ts
const auth = projectAuth.requireAuthorizedWorkspaceData(c, {
  action: "update",
  subject: "tasks",
});
```

Use `auth.rowSecurity.forTable(table)` or `scopedRows(db, auth, table)` for
table access. Do not accept or set scope fields from the client. If your role
policy later introduces a feature-specific subject, use something like
`tasks:triage`; otherwise reuse `tasks` update permission.

Next:
[Mount And Discover The Endpoint](/docs/building-your-own-feature/mount-and-discover-the-endpoint/).
