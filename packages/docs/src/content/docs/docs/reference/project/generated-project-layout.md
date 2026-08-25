---
title: "Generated project layout"
description: "Look up package responsibilities, dependency direction, and extension locations."
---

## Identity

Generated pnpm workspace with `packages/api`, `packages/shared`, and `packages/frontend`.

## Contract

- API owns schema, migrations, auth adapters, app routes, boot, mail, and database I/O.
- `packages/api/runtime.ts` owns `openProjectRuntime()`, which opens the
  database, loads the table schema, and configures auth and mail. `boot.ts`
  mounts Hono on top of it and `script-runtime.ts` opens it directly; both call
  the `close()` it returns, so the HTTP server and a command-line script cannot
  drift apart. It defaults mail off for a script, and takes the anonymous-route
  list as an option rather than importing `app.ts`.
- `packages/api/script-runtime.ts` owns `openScriptRuntime()`, which signs in
  with an address and password and returns that person's `rows(table)`.
  `seed-runtime.ts` is the same call with the sample-data account wired in, and
  `seed.ts` is the workspace-owned file where sample rows are written.
- Shared owns browser-safe contracts, wire types, parsers, serializers, and constants.
- Frontend owns typed clients, navigation, routes, screens, and generated table integration.
- API and frontend may import shared; shared must not import either I/O package.
- Each workspace package declares the framework packages it imports, and the
  workspace root declares none. `packages/api` declares `@sapporta/server` and
  `@sapporta/honest`; `packages/frontend` declares `@sapporta/frontend`,
  `@sapporta/ui`, and `@sapporta/grid`; all three declare `@sapporta/shared` and
  `@sapporta/rest-core`. A framework package therefore resolves from the
  workspace package that imports it, and a generated project has no root
  `node_modules/@sapporta` directory.
- The frontend installs `@tanstack/react-form` and
  `@tanstack/react-query`. The workspace-owned `query-client.ts` creates the
  application `QueryClient`. The framework-owned `main.tsx` mounts
  `QueryClientProvider` above the router and `SapportaApp`.
- The generated query defaults use a 30-second `staleTime`, one retry, and no
  refetch on window focus. The project owns this policy and may change it in
  `packages/frontend/src/query-client.ts`.
- `CODING-PRINCIPLES.md` records the generated project's code-organization and
  trust-boundary rules. `VISUAL-DESIGN-GUIDELINES.md` records its UI design
  rules. The root `AGENTS.md` routes coding-agent work to these files.

The provider is application infrastructure. Feature modules reuse it through
TanStack Query hooks and public Sapporta query options. They do not create a
second client for one screen.


## Related documentation

- [Develop with a coding agent](/docs/guides/discovery/develop-with-a-coding-agent/)
- [Sample data and command-line scripts](/docs/guides/operations/sample-data-and-scripts/)
- [Table query options](/docs/reference/frontend/table-query-options/)
