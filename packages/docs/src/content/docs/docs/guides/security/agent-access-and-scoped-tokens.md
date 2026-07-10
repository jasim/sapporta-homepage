---
title: "Agent access and scoped tokens"
description: "Give non-browser callers revocable access to one user and workspace boundary."
---

Give non-browser callers revocable access to one user and workspace boundary.

Agent tokens authenticate API-backed CLI, CI, scheduled, and coding-agent work as one user in one active workspace.

For the programmer, the project stores only token metadata and hashes; the raw secret is displayed once and supplied through `SAPPORTA_API_TOKEN`.
For the application user, token callers receive the same abilities and row visibility as the represented account context.

## System boundary

- Create and revoke tokens from the signed-in profile.
- Use a separate token for a different workspace boundary.
- Token list responses never reveal the raw secret.
- Bearer callers cannot use browser-only token-management operations.

## Task-app example

Create a token in Workspace A, list visible tasks, verify Workspace B is absent, revoke the token, and confirm the next request fails.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Authentication and token endpoints](/docs/reference/http/authentication-and-token-endpoints/)
- [CLI overview](/docs/reference/cli/overview-and-global-options/)
