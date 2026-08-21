## Stack

Best-in-class libraries wired into a conventional pnpm workspace — nothing
proprietary, nothing hidden.

- **[TypeScript](https://www.typescriptlang.org/) on
  [Node.js](https://nodejs.org/)** for the entire application. The generated
  project is a [`pnpm`](https://pnpm.io/) workspace with separate API, frontend,
  and shared-contract packages.
- **[Hono](https://hono.dev/) and
  [`@hono/node-server`](https://github.com/honojs/node-server)** for the HTTP
  server. The same process can serve the API and the compiled frontend in
  production.
- **[Drizzle ORM](https://orm.drizzle.team/)** for schemas and database access,
  **[Drizzle Kit](https://orm.drizzle.team/docs/kit-overview)** for migrations,
  and **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)** as the
  database driver. [SQLite](https://www.sqlite.org/) is the only database
  currently supported.
- **[Zod](https://zod.dev/)** for runtime validation of shared request,
  response, and form data.
- **[sapporta-rest](https://github.com/jasim/sapporta-rest)**, a small fork of
  [ts-rest](https://ts-rest.com/), and Sapporta's
  **[Honest](https://github.com/jasim/sapporta/tree/main/packages/honest#readme)**
  [Hono](https://hono.dev/) adapter for contract-first APIs. You define an
  APIs signature once in the shared package. The backend uses that contract to parse and type each
  request. The frontend uses the same contract to serialize requests, parse and
  validate responses, and expose a fully typed API client. There is no second
  set of parsers, serializers, or request and response interfaces to keep in
  sync. The contract also becomes the
  [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0.html) document at
  `/api/openapi.json`.
- **[Better Auth](https://www.better-auth.com/)** with its
  [Drizzle adapter](https://www.better-auth.com/docs/adapters/drizzle) for
  sessions, passwords, and organizations, plus
  **[Nodemailer](https://nodemailer.com/)** for verification, password-reset,
  and application email.
- **[CASL](https://casl.js.org/)** for role-based abilities. Sapporta combines
  those abilities with table row scopes on every generated read and write.
- **[React 19](https://react.dev/) and
  [React Router](https://reactrouter.com/)** for the browser application and its
  routing.
- **[TanStack Query](https://tanstack.com/query/latest)** for server-state
  caching, **[TanStack Form](https://tanstack.com/form/latest)** for form state,
  and **[Zustand](https://zustand.docs.pmnd.rs/)** for local application and grid
  state.
- **[Tailwind CSS v4](https://tailwindcss.com/)** for styling.
  [`@sapporta/ui`](https://github.com/jasim/sapporta/tree/main/packages/ui#readme)
  follows [shadcn/ui](https://ui.shadcn.com/) composition conventions, uses
  [Base UI](https://base-ui.com/react/) primitives for accessible interactions,
  and uses [Lucide](https://lucide.dev/) for icons and
  [Sonner](https://sonner.emilkowal.ski/) for toast notifications.
- **[The Temporal
  polyfill](https://github.com/js-temporal/temporal-polyfill)** for consistent
  date and time values in the browser, the API, and their shared contracts.
- **[Vite](https://vite.dev/)** for the frontend development server and
  production build, with the
  [TypeScript compiler](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
  building the API and shared packages.
- **[Vitest](https://vitest.dev/)** and in-memory
  [SQLite](https://www.sqlite.org/) for automated tests.
- **[Docker](https://www.docker.com/)** for the production image. The included
  multi-stage
  [`Dockerfile`](https://docs.docker.com/build/building/multi-stage/) builds the
  workspace, applies [Drizzle](https://orm.drizzle.team/) migrations at startup,
  and runs the [Node.js](https://nodejs.org/) server as a non-root user.
