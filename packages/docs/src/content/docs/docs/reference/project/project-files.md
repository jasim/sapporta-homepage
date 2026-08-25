---
title: "Project files"
description: "Look up generated root files, ownership, and supported extension points."
---

## Identity

Generated project root; scaffold contract from `@sapporta/server` 0.2.7.

## Contract

- `sapporta.json` marks the project root for Sapporta tooling.
- `package.json` and `pnpm-workspace.yaml` own workspace scripts and package membership.
- `pnpm typecheck` runs `tsc --noEmit` in `packages/shared`, `packages/api`, and
  `packages/frontend`. It is the check that reports TypeScript errors in
  frontend code. `vite build` transpiles with esbuild and erases types without
  checking them, so it completes on a type-broken `.tsx`.
- `AGENTS.md` and `CLAUDE.md` are project-local coding-agent instructions.
- `CODING-PRINCIPLES.md` and `VISUAL-DESIGN-GUIDELINES.md` define the generated
  project's implementation and interface guidance.
- `packages/frontend/src/query-client.ts` is workspace-owned. It configures the
  TanStack Query client mounted by the framework-owned `main.tsx`.
- `packages/api/seed.ts` is workspace-owned. It holds the sample rows `pnpm seed`
  writes. `runtime.ts`, `script-runtime.ts`, `seed-runtime.ts`,
  `project-auth/sample-data.ts`, and `project-auth/user.ts` are framework-owned.
- `pnpm seed` runs `packages/api/seed.ts` against the development database with
  no server running. It requires applied migrations and
  `SAPPORTA_ALLOW_SAMPLE_DATA_SEEDING=true`.
- `DEPLOYMENT.md`, `Dockerfile`, and environment examples define the generated runtime handoff.


## Related documentation

- [Generated project layout](/docs/reference/project/generated-project-layout/)
- [Sample data and command-line scripts](/docs/guides/operations/sample-data-and-scripts/)
