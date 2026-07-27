---
title: "Error catalogue and diagnostics"
description:
  "Look up stable error classes, HTTP categories, and narrow diagnostic
  commands."
---

## Error ownership

Error code casing identifies different owners. Do not normalize it:

- generated project auth uses lowercase codes;
- framework generated-table handlers use uppercase codes;
- app-owned feature contracts define and export their own codes.

Status and code are the integration contract. Message text is illustrative
unless a feature explicitly pins it.

## Security and row-data matrix

| Owner/namespace                    | Condition                                                | Status/code                  | Diagnose or recover                                           |
| ---------------------------------- | -------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------- |
| Generated project auth             | No usable credential                                     | `401 unauthenticated`        | Sign in or supply a valid bearer token                        |
| Generated project auth             | Agent token revoked                                      | `401 token_revoked`          | Replace the credential                                        |
| Generated project auth             | Agent token expired                                      | `401 token_expired`          | Create a new time-bounded token                               |
| Generated project auth             | Workspace membership unavailable                         | `403 workspace_required`     | Restore membership or select a valid workspace                |
| Generated project auth             | Ability or interactive-only route denied                 | `403 forbidden`              | Review action/subject grants and credential kind              |
| Framework row security             | Request lacks the table's authority slot                 | `403 row_scope_forbidden`    | Review the route's authority-narrowing helper and table scope |
| Framework generated table          | Singular row is missing or invisible                     | `404 ROW_NOT_FOUND`          | Recheck ID and request authority without probing other scopes |
| Framework generated table          | Managed scope alias or write policy rejected             | `422 VALIDATION_FAILED`      | Remove caller-authored scope values and inspect field details |
| Framework generated table          | Ability passed but immutable update/delete was attempted | `403 FORBIDDEN`              | Use the trusted append/workflow path instead                  |
| Generated project token management | Revoke target is hidden, unknown, or already revoked     | `404 not_found`              | Recheck current browser workspace, user, and token ID         |
| App completion feature             | Task is missing or invisible                             | `404 TASK_NOT_FOUND`         | Use the feature's exported strict error schema                |
| App completion feature             | A later sequential call finds the task already completed | `409 TASK_ALREADY_COMPLETED` | Refetch authoritative task/history state                      |

Application feature contracts own feature responses such as strict
`400`/`404`/`409` branches. Shared infrastructure `401`/`403` behavior lives in
[Auth and row security](/docs/reference/server/auth-and-row-security/) and need
not be copied into every feature contract.

## Other stable error families

- `QueryParseError` maps strict query failures to structured `400` responses.
  Unsupported filter structure uses `unknown_filter_shape`.
- `ValidationError` and save-pipeline errors expose field or workflow validation
  without partial writes.
- `RowNotFoundError` and `ImmutableTableOperationError` are server-side helper
  classes adapted by generated table handlers.
- Migration readiness errors stop startup when migration files and the applied
  ledger disagree.
- Native binding errors identify the addon load that failed.

An HTTP-aware app domain-error family should carry its status and strict feature
payload on the base and be adapted once at the route edge. Catch that expected
family exhaustively and let unexpected errors reach the central error path.

## Narrow diagnostics

Use the smallest command that identifies the failing boundary:

```bash
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
pnpm exec sapporta tables show tasks
pnpm exec sapporta rows get tasks 1 --output json
pnpm --filter ./packages/api db:check
```

Endpoint discovery proves mounting and wire shape, not authorization. Repeat
security-sensitive failures through direct HTTP or CLI with the intended
credential, then read back through a scoped operation.

## Related documentation

- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Authentication and token endpoints](/docs/reference/http/authentication-and-token-endpoints/)
- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
- [Errors, uploads, and endpoint patterns](/docs/guides/app-owned-features/errors-uploads-and-endpoint-patterns/)
- [Troubleshooting](/docs/guides/operations/troubleshooting/)
