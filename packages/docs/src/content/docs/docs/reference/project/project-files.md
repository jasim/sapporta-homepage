---
title: "Project files"
description: "Look up generated root files, ownership, and supported extension points."
---

## Identity

Generated project root; scaffold contract from `@sapporta/server` 0.2.7.

## Contract

- `sapporta.json` marks the project root for Sapporta tooling.
- `package.json` and `pnpm-workspace.yaml` own workspace scripts and package membership.
- `AGENTS.md` and `CLAUDE.md` are project-local coding-agent instructions.
- `CODING-PRINCIPLES.md` and `VISUAL-DESIGN-GUIDELINES.md` define the generated
  project's implementation and interface guidance.
- `packages/frontend/src/query-client.ts` is workspace-owned. It configures the
  TanStack Query client mounted by the framework-owned `main.tsx`.
- `DEPLOYMENT.md`, `Dockerfile`, and environment examples define the generated runtime handoff.


## Related documentation

- [Generated project layout](/docs/reference/project/generated-project-layout/)
