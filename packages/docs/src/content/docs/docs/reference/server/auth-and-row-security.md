---
title: "Auth and row security"
description: "Look up row scopes, request authority, trusted fields, guards, and security errors."
---

## Identity

Auth exports and row-security primitives from `@sapporta/server` plus generated project auth adapters.

## Contract

- Abilities authorize named actions; data authority supplies the active workspace and user boundary.
- `workspaceGlobal` requires the server-owned workspace column.
- `workspaceUserScoped` additionally requires the server-owned user scope column.
- Row guards create predicates, trusted insert values, trusted update patches, and foreign-key visibility checks.
- Clients cannot stamp or widen workspace, owner, role, or scope values.


## Related documentation

- [Workspaces, ownership, and row visibility](/docs/guides/security/workspaces-ownership-and-row-visibility/)
