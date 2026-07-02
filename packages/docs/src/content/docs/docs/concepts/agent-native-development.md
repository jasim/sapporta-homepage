---
title: "Agent-Native Development"
description:
  "See why Sapporta projects expose stable handles that coding agents can
  inspect and use safely."
---

Sapporta projects are legible to coding agents because important app surfaces
are explicit and discoverable:

```text
schema -> migration -> generated table API -> grid/forms/CLI
contract -> API handler -> OpenAPI -> typed frontend client
auth context -> scopedRows()/rowSecurity -> safe data access
```

The agent can inspect table metadata, sample rows, resolve foreign keys, call
generated row commands, and verify custom endpoints through OpenAPI. Those calls
still go through the same server-side authorization and row-security gates as
browser traffic.

This does not make the client trusted. A coding agent using an agent token acts
as one user in one workspace, and it must omit trusted scope fields from
payloads.

Use [Agent Access](/docs/tools-and-operations/agent-access/) for token setup and
[Agent Data Console](/docs/tools-and-operations/agent-data-console/) for the
operating model.
