---
title: "What To Change Next"
description: "Extend Task Triage after the first app-owned feature is working."
---

Once Task Triage is working, useful extensions include:

- SLA columns for response and resolution targets
- blocked reason and unblock owner fields
- notification emails or in-app notifications when assignment changes
- project-level filters and saved report views
- feature-specific permission subjects such as `tasks:triage`
- richer report links into overdue task lists

Keep the same shape as the first version: model durable facts in schema, put
wire shapes in shared contracts, authorize at the route edge, enforce row scope
in stores, expose the route through OpenAPI, call it through a typed frontend
client, and verify with both browser and CLI checks.
