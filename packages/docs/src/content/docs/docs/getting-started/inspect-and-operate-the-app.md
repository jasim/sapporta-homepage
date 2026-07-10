---
title: "Inspect and operate the app"
description: "Discover generated and app-owned routes, operate them through the CLI, and verify scoped token access."
---

OpenAPI, the project-local CLI, and scoped agent tokens expose the same mounted application surface under the same server authorization rules.

> Checkpoint: C12 → C13

## Agent approach

```text
Read the local project instructions and use the Sapporta skill. Starting at C12, implement this outcome: OpenAPI, the project-local CLI, and scoped agent tokens expose the same mounted application surface under the same server authorization rules. Reach C13, run the validation described on this page, and report changed files and checks. Preserve server-controlled scope fields and use generated APIs for ordinary CRUD.
```

## Review the agent's work

- Discovery requires the same session or bearer authority as protected data routes.
- A token represents one user in one workspace and its raw secret is displayed once.
- Revocation and workspace boundaries are verified, not inferred from successful calls.

## Code approach

```bash
pnpm exec sapporta endpoints list
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/complete"
pnpm exec sapporta api get /api/reports/project-progress
pnpm exec sapporta rows list tasks --output json
```

Create an agent token from the signed-in profile, then set `SAPPORTA_API_URL` and `SAPPORTA_API_TOKEN`. Repeat one list and one complete-task operation. Revoke the token after the check.

## Observe and verify

The browser, CLI, and token caller see the same workspace rows. Another workspace is absent, and the revoked token fails with the documented auth response.

## What you built

The app is discoverable and operable without widening its row boundary. The final page runs the complete validation sequence.

Continue with [the related guide](/docs/guides/discovery/openapi-and-endpoint-discovery/) or use [the exact reference](/docs/reference/cli/overview-and-global-options/).
