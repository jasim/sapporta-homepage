# sapporta-homepage-app

Homepage for [Sapporta](https://sapporta.com/), the
[open-source TypeScript database application framework](https://github.com/jasim/sapporta).
The site runs a Hono API, SQLite database, and React frontend.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:12339`.

## Commands

- `pnpm dev` - start backend and frontend in watch mode
- `pnpm build` - compile the shared package, API, and frontend
- `pnpm start` - run the production server after `pnpm build`
- `pnpm exec sapporta describe` - inspect the running API
- `pnpm generate:api-reference` - rebuild the generated Sapporta API reference
- `pnpm check:api-reference` - fail if the committed API reference is stale

## Project layout

```
sapporta.json           project marker used by the Sapporta CLI
data/                   application SQLite database
packages/api/           backend entry point, schema, migrations, and app routes
packages/frontend/      React app, routes, styles, and browser API clients
packages/shared/        API contracts and types shared by backend and frontend
packages/docs/          Astro + Starlight documentation site
packages/api-reference/ generates the agent-facing Sapporta symbol reference
```

## API reference

`/api-reference/` serves a generated index of every symbol the `@sapporta/*`
packages publish, so coding agents can look up a signature and its import
specifier instead of reading declaration files out of `node_modules`.

It is generated from the `@sapporta/*` versions installed in
`packages/api-reference/`, and the generated Markdown is committed under
`packages/docs/src/generated/api-reference/`. Rebuild it after changing those
versions:

```bash
pnpm generate:api-reference
```

See [packages/api-reference/README.md](packages/api-reference/README.md) for how
it works and how to document newer package versions.

## Environment

- `.env.development` is for local development and is ignored by git.
- `.env.production.example` lists the production variables to set in your
  deployment environment.
- Email verification is required by default when `NODE_ENV=production` and is
  not required otherwise. Set `SAPPORTA_REQUIRE_VERIFIED_EMAIL=true` or `false`
  to override that default.
- `SAPPORTA_API_PORT` controls the API server port. Managed hosts may provide
  the conventional `PORT` variable instead. If both are set, they must match.
- `SAPPORTA_FRONTEND_PORT` controls the Vite frontend server port.
- `SAPPORTA_PUBLIC_APP_URL` must match the browser-facing app origin.
- `SAPPORTA_MAIL_TRANSPORT=stream` prints development emails to the API console.

To run several Sapporta projects at the same time, assign each project a stable
port pair and update its public app URL to match the frontend port:

```env
SAPPORTA_API_PORT=12333
SAPPORTA_FRONTEND_PORT=12339
SAPPORTA_PUBLIC_APP_URL=http://localhost:12339
```

Vite fails when the configured frontend port is occupied instead of silently
selecting another one. API-backed CLI commands are clients of the running app;
set `SAPPORTA_API_URL=http://localhost:12333` in the CLI process or pass
`--api-url http://localhost:12333` when the API is not on the default port.

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## More docs

- [Sapporta overview](https://github.com/jasim/sapporta#readme)
- [Schema and migrations](https://github.com/jasim/sapporta/blob/main/docs/schema-and-migrations.md)
- [Auth and row security](https://github.com/jasim/sapporta/blob/main/docs/auth.md)
- [CLI](https://github.com/jasim/sapporta/blob/main/docs/cli.md)
- [Reports](https://github.com/jasim/sapporta/tree/main/docs/reports)
