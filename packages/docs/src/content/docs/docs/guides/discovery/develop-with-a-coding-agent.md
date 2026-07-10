---
title: "Develop with a coding agent"
description: "Give a coding agent a bounded Sapporta change and verify its artifacts."
---

Give a coding agent a bounded Sapporta change and verify its artifacts.

Generated projects expose predictable schema, migration, contract, route, auth, client, and screen boundaries. Project instructions and the Sapporta skill encode the workflow.

For the programmer, the project prompt names one outcome and its constraints; review checks source, generated artifacts, and live behavior.
For the application user, application users receive features that follow the same generated and app-owned boundaries as hand-authored work.

## System boundary

- Ask the agent to read local project instructions and use the Sapporta skill.
- Name the starting state, target result, security constraints, and validation.
- Review generated SQL and route mounting rather than accepting a summary.
- Run build, migration, discovery, and focused behavioral checks.

## Task-app example

A bounded prompt can request the complete-task endpoint at checkpoint C08, require a transaction and server-controlled scope, and require build plus endpoint discovery before completion.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Generated project layout](/docs/reference/project/generated-project-layout/)
- [Project and discovery commands](/docs/reference/cli/project-and-discovery-commands/)
