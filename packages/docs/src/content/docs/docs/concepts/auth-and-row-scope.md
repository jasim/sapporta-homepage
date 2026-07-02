---
title: "Auth And Row Scope"
description:
  "Understand principals, active workspaces, abilities, data authority, and row
  security."
---

A protected request becomes scoped data access in stages:

```text
request
  -> principal
  -> active workspace + membership
  -> ability
  -> data authority
  -> row security
  -> scoped row reads and writes
```

Sapporta uses three row scopes:

```text
systemGlobal          installation-wide reference data
workspaceGlobal       rows shared by a workspace
workspaceUserScoped   rows owned by a user inside a workspace
```

Browser clients, CLI callers, and coding agents do not choose workspace or
ownership fields. The server derives those facts from the browser session or
agent token, then generated table routes and scoped helpers apply row
visibility.

Use [Authorization](/docs/subsystems/authorization/) for practical route
guidance and [Auth And Row Security](/docs/reference/auth-and-row-security/) for
exact helpers and errors.
