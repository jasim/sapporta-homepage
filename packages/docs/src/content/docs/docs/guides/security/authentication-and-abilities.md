---
title: "Authentication and abilities"
description: "Resolve caller identity and grant feature actions at the server edge."
---

Resolve caller identity and grant feature actions at the server edge.

Project auth resolves sessions or bearer tokens into an auth context. CASL abilities answer whether that identity may perform a named product or table action.

For the programmer, the project centralizes feature permissions in `packages/api/authz/ability.ts` and checks the narrow action at protected routes.
For the application user, users receive only navigation and operations their verified identity and active membership allow.

## System boundary

- Authentication establishes identity; authorization grants actions.
- Abilities do not filter database rows.
- Custom routes check permission before running the workflow.
- Anonymous routes are added to `publicApiRoutes` only when intentional.

## Task-app example

Task CRUD is available to workspace members. `run` on `task_completion` is granted only to workspace owners and checked by the complete-task route.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Authentication and token endpoints](/docs/reference/http/authentication-and-token-endpoints/)
