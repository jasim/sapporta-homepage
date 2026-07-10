---
title: "Workspaces, ownership, and row visibility"
description: "Choose a row scope and keep trusted ownership values under server control."
---

Choose a row scope and keep trusted ownership values under server control.

Request data authority identifies the active workspace and user. Row security converts a table's scope into predicates and trusted insert/update values.

For the programmer, the project declares scope in table metadata and lets server helpers apply it to every read and write.
For the application user, users see rows from the active boundary without choosing workspace or owner identifiers in requests.

## System boundary

- `workspaceGlobal` shares rows across members of one workspace.
- `workspaceUserScoped` additionally limits rows to the current user.
- Trusted scope columns are omitted from client payloads.
- Invisible rows use not-found behavior where disclosure would leak information.

## Task-app example

Projects, tasks, and task events use `workspaceGlobal`. Two members of one workspace see the same rows; another workspace sees none of them.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
