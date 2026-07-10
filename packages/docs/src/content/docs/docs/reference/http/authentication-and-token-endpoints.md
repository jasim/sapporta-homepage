---
title: "Authentication and token endpoints"
description: "Look up auth context, workspace, session, and agent-token route contracts."
---

## Identity

Generated project-auth routes and their OpenAPI contracts.

## Contract

- Browser auth uses session cookies and exact trusted origins.
- Auth context and bootstrap routes return the current user, session, membership, and active workspace state.
- Workspace switching changes the active request authority for later calls.
- Agent-token creation reveals the raw secret once; list returns metadata and revoke invalidates later bearer calls.
- Token management is browser/session-only; bearer callers use the represented account and workspace authority.


## Related documentation

- [Agent access and scoped tokens](/docs/guides/security/agent-access-and-scoped-tokens/)
