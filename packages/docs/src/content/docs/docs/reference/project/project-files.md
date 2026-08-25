---
title: "Project file map"
description:
  "Look up every file in a generated project and the file to edit for a given
  change."
---

## Identity

Generated pnpm workspace from `@sapporta/server` 0.2.7.

## Layout


```text
my-app/
  sapporta.json                marks the project root for Sapporta tooling
  package.json                 root scripts
  pnpm-workspace.yaml          package membership
  AGENTS.md                    coding-agent instructions; routes work to the two files below
  CLAUDE.md                    coding-agent instructions
  CODING-PRINCIPLES.md         code-organization and trust-boundary rules
  VISUAL-DESIGN-GUIDELINES.md  interface design rules
  .env.development             development environment values
  .env.production.example      deployment environment template
  DEPLOYMENT.md                production handoff
  Dockerfile                   container build
  data/                        development SQLite database
  scripts/                     project scripts
  packages/api/                schema, migrations, auth, routes, boot, mail, database I/O
    schema/                    table definitions
    migrations/                SQL from db:generate; review before applying
    authz/                     ability rules and request data authority
    project-auth/              sign-in, sessions, workspaces, tokens, auth emails
    app/                       route handlers; not mounted automatically
    app.ts                     loadApp() route mounting and publicApiRoutes
    seed.ts                    sample rows written by pnpm seed
    drizzle.config.ts          schema path, migration output, dialect, credentials
    runtime.ts                 openProjectRuntime()
    boot.ts                    mounts Hono on openProjectRuntime()
    script-runtime.ts          openScriptRuntime()
    seed-runtime.ts            openSeedRuntime()
    mailer.ts                  createSapportaMailer()
  packages/shared/             browser-safe contracts, wire types, parsers, serializers, constants
    src/contracts/             one file per request and response contract
    src/contracts/index.ts     re-exports every contract
    src/index.ts               re-exports contracts/index.ts
  packages/frontend/           typed clients, navigation, routes, screens, table integration
    src/App.tsx                navigation, public and protected application routes
    src/api.ts                 typed browser clients
    src/query-client.ts        application QueryClient
    src/SapportaRoutes.tsx     Sapporta's sign-in, account, workspace, and table screens
    src/SapportaApp.tsx        composes the route files
    src/main.tsx               mounts QueryClientProvider above the router
    vite.config.ts             development /api proxy and build configuration
```

Files that a command regenerates are the one place to edit the input instead of
the output: `migrations/` comes from `db:generate`, and an applied migration is
never edited — add another one.

## Where a change goes

| To change                        | Edit                                       | Then                                          |
| -------------------------------- | ------------------------------------------ | --------------------------------------------- |
| Stored row shape                 | `packages/api/schema/<table>.ts`           | `db:generate`, review the SQL, `db:migrate`    |
| Ability, authority, or row scope | `packages/api/authz/`                      | —                                             |
| Browser-safe wire shape          | `packages/shared/src/contracts/<name>.ts`  | re-export from `contracts/index.ts`           |
| Business invariant across rows   | `packages/api/modules/<domain>/<action>.ts` | call it from a route or a script              |
| HTTP endpoint                    | `packages/api/app/<name>.ts`               | mount it in `packages/api/app.ts`             |
| Browser caller                   | `packages/frontend/src/api.ts`             | —                                             |
| Navigation or a route            | `packages/frontend/src/App.tsx`            | —                                             |
| A screen                         | `packages/frontend/src/<Screen>.tsx`       | mount it from `App.tsx`                       |
| Sample rows                      | `packages/api/seed.ts`                     | `pnpm seed`                                   |
| Query cache defaults             | `packages/frontend/src/query-client.ts`    | —                                             |
| Ports, origins, mail, policy     | `.env.development`                         | —                                             |

## Rules the tree does not show

- API and frontend may import shared. Shared must not import either I/O package.
- Each workspace package declares the `@sapporta/*` packages it imports, and
  the workspace root declares none. `packages/api` declares `@sapporta/server` and
  `@sapporta/honest`; `packages/frontend` declares `@sapporta/frontend`,
  `@sapporta/ui`, and `@sapporta/grid`; all three declare `@sapporta/shared` and
  `@sapporta/rest-core`.
- `runtime.ts` is the single open path. `boot.ts` mounts Hono on top of it and
  `script-runtime.ts` opens it directly; both call the `close()` it returns, so
  the HTTP server and a command-line script cannot drift apart. It defaults mail
  off for a script, and takes the anonymous-route list as an option rather than
  importing `app.ts`.
- One `QueryClientProvider`, mounted by `main.tsx` above the router. Feature
  modules reuse it through TanStack Query hooks and public Sapporta query
  options rather than creating a second client for one screen. The generated
  defaults are a 30-second `staleTime`, one retry, and no refetch on window
  focus.
- `pnpm typecheck` runs `tsc --noEmit` in all three packages and is the check
  that reports TypeScript errors in frontend code.
- `pnpm seed` runs with no server. It requires applied migrations and
  `SAPPORTA_ALLOW_SAMPLE_DATA_SEEDING=true`.

## Not present

- No root `node_modules/@sapporta`. An `@sapporta/*` package resolves from the
  workspace package that imports it.
- No browser detail route at `/tables/:tableName/:id`.
- No `appNavigationItems` or `appHomeRoutes` exports. The extension points are
  singular `appNavigation` and `appHomeRoute`.
- A file added under `packages/api/app/` is not exposed until `app.ts` mounts
  it.
- `vite build` does not typecheck. It transpiles with esbuild and erases types,
  so it completes on a type-broken `.tsx`.

## Related documentation

- [Develop with a coding agent](/docs/guides/discovery/develop-with-a-coding-agent/)
- [Environment variables](/docs/reference/project/environment-variables/)
- [Application configuration](/docs/guides/operations/application-configuration/)
- [Application routes and navigation](/docs/reference/frontend/app-shell/application-routes-and-navigation/)
- [Sample data and command-line scripts](/docs/guides/operations/sample-data-and-scripts/)
