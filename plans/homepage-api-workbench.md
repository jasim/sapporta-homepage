# API Documentation Plan

## Context

The old version of this plan proposed a homepage React island that simulated
Sapporta table API calls. Do not build that. The project direction is written
Astro Starlight documentation under:

```txt
packages/docs/src/content/docs/docs/
```

The docs already contain broad pages such as `use-apis-and-tools.md`,
`work-with-records.md`, `build-product-workflows.md`, `control-access.md`, and
`reference.md`. They mention the API surface, but the coverage is spread across
workflow pages and is not yet deep enough for a builder who needs to understand
how Sapporta APIs are generated, discovered, secured, called, and extended.

This plan turns the former "API workbench" idea into a comprehensive written
documentation project. The outcome should be prose, examples, cross-links, and
small ASCII diagrams only where they clarify a flow. No homepage components,
interactive demos, screenshots, React islands, or homepage CSS changes belong in
this work.

## Goal

Create a coherent API documentation path that explains:

- how table definitions create generated REST endpoints
- the exact generated table routes and response envelopes
- filter, search, sort, pagination, lookup, count, export, and master-detail
  request shapes
- how row scope and auth affect generated API calls
- how `/api/openapi.json` and `pnpm exec sapporta describe` expose the live API
- how custom app endpoints are declared with shared ts-rest contracts and
  registered with `TsRestApi`
- how frontend code calls custom endpoints through `createApiClient`
- when to use table APIs, CLI row commands, reports, custom endpoints, or SQL
  fallback

Keep this as documentation for Sapporta builders, not as marketing copy and not
as final API reference generated from code.

## Source Material To Read

Use the current local docs first so the new pages fit the existing voice:

- `packages/docs/src/content/docs/docs/use-apis-and-tools.md`
- `packages/docs/src/content/docs/docs/work-with-records.md`
- `packages/docs/src/content/docs/docs/build-product-workflows.md`
- `packages/docs/src/content/docs/docs/control-access.md`
- `packages/docs/src/content/docs/docs/reference.md`
- `packages/docs/astro.config.mjs` for current Starlight sidebar ordering

Then verify API facts against Sapporta source docs and skills:

- `/Users/jasim/m/a/code/sapporta/docs/cli.md`
- `/Users/jasim/m/a/code/sapporta/docs/schema-metadata.md`
- `/Users/jasim/m/a/code/sapporta/docs/auth.md`
- `/Users/jasim/m/a/code/sapporta/docs/reports/route-based-reports.md`
- `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/app/SKILL.md`
- `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/table-querying/SKILL.md`
- `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/data-console/SKILL.md`
- `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/frontend/SKILL.md`

Use the app's sample implementation as a small local reference:

- `packages/shared/src/contracts/hello.ts`
- `packages/api/app/hello.ts`
- `packages/api/app.ts`
- `packages/frontend/src/api.ts`

## Information Architecture

Prefer focused pages over one oversized API page. Keep existing workflow pages,
but make `Use APIs And Tools` a hub that links to deeper pages.

Recommended page set:

```txt
packages/docs/src/content/docs/docs/
  use-apis-and-tools.md              # hub and decision guide
  generated-table-apis.md            # table route behavior and examples
  api-discovery-and-openapi.md       # describe, /api/openapi.json, CLI target/auth
  custom-api-endpoints.md            # contracts, TsRestApi, mounting, auth, errors
  typed-api-clients.md               # createApiClient and frontend call behavior
```

Update `packages/docs/astro.config.mjs` sidebar after the pages exist. The
current docs site uses this manual sidebar, so do not depend on `sidebar.order`
frontmatter for discoverability. Put the API docs near `work-with-records` and
`build-product-workflows` because the reader moves from generated records to
custom product behavior:

```txt
Work With Records
Generated Table APIs
API Discovery And OpenAPI
Build Product Workflows
Custom API Endpoints
Typed API Clients
Use APIs And Tools
Reference
```

If sidebar growth feels too large, keep `custom-api-endpoints.md` linked from
`build-product-workflows.md` instead of adding it as a top-level sidebar item.
Do not create nested directories unless Starlight sidebar grouping is updated at
the same time.

## Page Plans

### `use-apis-and-tools.md`

Turn this page into a short orientation and decision guide instead of the place
where every API detail lives.

Cover:

- "Start with `pnpm exec sapporta describe`" as the live API discovery loop.
- Decision table:
  - row-level browse/edit/export -> generated table APIs or CLI row commands
  - business action or transaction -> custom endpoint
  - summary, ledger, statement, rollup -> report route
  - frontend product call -> typed client over shared contract
  - debugging edge cases -> read-only SQL fallback
- Credential basics for protected apps:
  - `SAPPORTA_API_URL`
  - `SAPPORTA_API_TOKEN`
  - token is tied to one user and workspace
- Links to the four deeper API pages.

Move or condense repeated route tables from this page after
`generated-table-apis.md` exists. Keep a small example that shows the loop:

```bash
pnpm exec sapporta describe
pnpm exec sapporta describe "GET /api/tables/customers"
pnpm exec sapporta tables show customers
```

### `generated-table-apis.md`

This should be the comprehensive page for routes produced from table
definitions. It should begin from a table model and explain what API surface
Sapporta derives from it.

Required sections:

1. **From table metadata to routes**
   - A small table definition using `table({ drizzle, meta })`.
   - Explain that Drizzle columns drive storage and inferred row shape.
   - Explain that Sapporta metadata drives labels, search, selects, children,
     validation, row scope, OpenAPI shape, lookup labels, and generated screens.

2. **Generated route inventory**
   - Document these routes exactly:
     - `GET /api/tables/<table>`
     - `GET /api/tables/<table>/<id>`
     - `POST /api/tables/<table>`
     - `PUT /api/tables/<table>/<id>`
     - `DELETE /api/tables/<table>/<id>`
     - `GET /api/tables/<table>/export.csv`
     - `GET /api/tables/<table>/_lookup`
     - `GET /api/tables/<table>/_count`
   - Include what each route returns and when to use it.
   - State that table responses are envelopes and callers should read
     `body.data`, not assume a bare array.

3. **List query grammar**
   - Document `q`, `filter[col][op]`, `sort`, `page`, and `limit`.
   - Include operators:
     - `eq`, `neq`
     - `gt`, `gte`, `lt`, `lte`
     - `in`, `nin`
     - `contains`, `startswith`, `endswith`
     - `is` with `null` or `notnull`
   - Explain that malformed filters return structured `400` errors and Sapporta
     does not silently drop bad filters.
   - Explain that `q` requires `meta.search.columns` and combines with filters
     using AND.
   - Include `curl -G --data-urlencode` examples for bracketed query keys.

4. **Create, update, delete**
   - JSON object and JSON array create bodies.
   - Parent-with-`$details` create bodies for declared children.
   - Update uses `PUT /api/tables/<table>/<id>` with a partial row.
   - Delete returns the deleted row envelope.
   - Call out that clients must omit generated and server-managed ownership
     fields such as `id`, `created_at`, `updated_at`, `workspace_id`,
     `workspaceId`, `scoped_to_user_id`, and `scopedToUserId`.

5. **Lookup, count, and export**
   - `_lookup` resolves ID-to-label maps from `rowLabelColumns`.
   - `_count` groups counts by a parent foreign key.
   - `export.csv` uses the same visibility, filters, search, and sort as list.

6. **Auth-aware behavior**
   - Generated `/api/tables/*` routes resolve auth on the server and use
     row-scoped helpers.
   - A token or session chooses the workspace and user boundary; clients should
     not pass workspace IDs for ordinary calls.
   - Link to `control-access.md` for the full row-scope model.

Useful ASCII diagram, if kept short:

```txt
schema table + meta
        |
        v
generated table routes -> OpenAPI -> CLI describe / frontend screens / curl
        |
        v
row-scoped reads and writes
```

### `api-discovery-and-openapi.md`

This page should explain how builders inspect the actual running API.

Required sections:

1. **The live API contract**
   - `/api/openapi.json` includes generated table routes, metadata routes, SQL
     tooling, report routes, and app-owned `TsRestApi` routes.
   - It is generated after framework and app routes are mounted, so it reflects
     the deployed server.

2. **Using `sapporta describe`**
   - `pnpm exec sapporta describe`
   - `pnpm exec sapporta describe "GET /api/tables/customers"`
   - `pnpm exec sapporta describe "POST /api/invoices/{id}/void"` or the exact
     route selector syntax supported by the current CLI.
   - Before publishing, verify whether the CLI wants `{id}`, `:id`, or a
     concrete sample path for path params and use one style consistently.

3. **Targeting local and deployed apps**
   - Default API URL is `http://localhost:3000`.
   - `SAPPORTA_API_URL` and `--api-url`.
   - `SAPPORTA_API_TOKEN` and `--api-token` for protected apps.
   - Flags override environment variables.

4. **Protected discovery**
   - Protected apps usually protect OpenAPI, table, SQL, and custom routes.
   - Agent tokens are created from the app profile screen and belong to one user
     and one workspace.
   - Auth error codes to document:
     - `unauthenticated`
     - `token_expired`
     - `token_revoked`
     - `workspace_required`
     - `forbidden`

5. **Debugging missing routes**
   - If a custom route is absent from describe:
     - contract is not imported
     - handler was not registered with `api.register(...)`
     - route app was not mounted in `loadApp()`
     - route used plain Hono instead of a registered contract
     - path accidentally repeated `/api`

### `custom-api-endpoints.md`

This page should be deeper and more implementation-oriented than the existing
`build-product-workflows.md`. Keep `build-product-workflows.md` as the product
workflow narrative and link here for exact mechanics.

Required sections:

1. **When to create a custom endpoint**
   - Business actions, transactions, file uploads, external services, custom
     response shapes, report routes, state transitions.
   - Keep using generated table APIs for ordinary row CRUD, lookup, count, and
     export.

2. **Contract file**
   - Lives in `packages/shared/src/contracts/<feature>.ts`.
   - Uses `initContract()` from `@sapporta/rest-core`.
   - Uses `c.query(...)` for `GET`.
   - Uses `c.mutation(...)` for `POST`, `PUT`, `PATCH`, and `DELETE`.
   - Declares `path`, `pathParams`, `query`, `body`, `responses`, `summary`,
     `metadata.tags`, and `contentType` as needed.
   - Re-export from `packages/shared/src/contracts/index.ts`.
   - Shared package must remain browser-safe: Zod, constants, and types only.

3. **Route handler**
   - Lives in `packages/api/app/<feature>.ts` for small apps, or imports thin
     route adapters from `packages/api/modules/<domain>/routes/` for larger
     domains.
   - Uses `const api = new TsRestApi<SapportaEnv>()`.
   - Uses `api.register("routeId", contract.route, async ({ c, request, files }) => ...)`.
   - Request values are parsed and typed before the handler runs.
   - Zod request failures return `400`; handlers do not need manual JSON parsing.
   - Return `{ status, body }` and declare every returned status in the contract.

4. **Mounting**
   - Import the route app in `packages/api/app.ts`.
   - `app` is already under `/api`.
   - `app.route("/", invoicesApi)` serves contract path `/invoices/:id/void` at
     `/api/invoices/:id/void`.
   - Files in `packages/api/app/` are not exposed automatically.
   - Only add `publicApiRoutes` entries for intentionally anonymous endpoints.

5. **Auth and data access**
   - Resolve auth at the route edge with the narrowest helper that fits.
   - Use `scopedRows(db, auth, table)` for ordinary row work.
   - Use `auth.rowSecurity.forTable(table)` inside custom Drizzle joins,
     transactions, aggregates, or multi-table workflows.
   - Raw SQL is a justified escape hatch and should live in a domain `db/` file.
   - Never hand-stamp or trust client-provided scope fields.
   - Never update or delete scoped tables by primary key alone.

6. **Multipart and non-JSON responses**
   - For uploads, set `contentType: "multipart/form-data"` and declare file
     fields with `z.instanceof(File)`.
   - On the server, read files from the `files` handler argument and non-file
     fields from `request.body`.
   - For CSV or other content types, use `c.otherResponse(...)`.
   - Mention raw `Response` as an escape hatch for streaming/custom headers.

7. **Errors**
   - Use declared non-2xx responses for expected domain failures.
   - Suggested meanings:
     - `404` missing or invisible row
     - `409` state conflict
     - `422` parsed but unacceptable workflow input
     - `502` upstream service failed
   - For deep service errors, catch typed domain errors at the route edge and
     translate them into declared response shapes.

8. **Verification**
   - `pnpm exec sapporta describe`
   - `pnpm exec sapporta describe "METHOD /api/path"`
   - Example `curl` call for the route.
   - Type-check frontend imports after re-exporting the contract.

### `typed-api-clients.md`

This page should explain how browser code calls app-owned contracts.

Required sections:

1. **Client setup**
   - In `packages/frontend/src/api.ts`:

```ts
import { createApiClient } from "@sapporta/shared/client";
import { getApiBase } from "@sapporta/frontend/platform";
import { invoicesContract } from "your-app-shared";

export const invoicesApi = createApiClient(invoicesContract, {
  baseUrl: getApiBase,
});
```

2. **Call shapes**
   - Show examples for:
     - query route with `query`
     - path route with `params`
     - mutation with `body`
     - multipart upload using `FormData` behavior through the generated client,
       if supported by the current client API; verify before documenting.
   - The method names come from contract route IDs.

3. **Response behavior**
   - Successful 2xx calls return the response body directly.
   - Non-2xx responses throw `ApiError` with `status` and response body.
   - Show handling a declared `409` or `422`.
   - Link to custom endpoint error contracts.

4. **Base URL behavior**
   - `getApiBase` keeps local Vite proxy and production deployments aligned.
   - Split frontend/API deployments use `VITE_API_URL` at frontend build time.
   - Do not put secrets in `VITE_*` variables.

5. **Boundaries**
   - Use generated table screens/routes for ordinary table workflows.
   - Use typed clients for app-owned workflow endpoints and reports.
   - Do not import backend code, Drizzle, or Hono handlers into frontend code.

## Cross-Linking Work

Add links from existing pages after the new pages exist:

- `model-your-data.md`: link `meta.search`, `rowLabelColumns`, `children`, and
  `rowScope` concepts to `generated-table-apis.md`.
- `work-with-records.md`: link direct API examples to
  `generated-table-apis.md`.
- `control-access.md`: link generated route behavior and custom route auth
  sections to the API pages.
- `build-product-workflows.md`: keep the narrative, but link exact contract,
  mounting, multipart, and typed client mechanics to
  `custom-api-endpoints.md` and `typed-api-clients.md`.
- `reference.md`: keep concise lookup tables and point readers to the deeper
  pages for examples and decision guidance.
- `introduction.md` or `index.md`: add one "APIs" next-step link only if the
  sidebar order changes make it necessary.

Avoid repeating full examples in every page. Put the authoritative details in
the focused page and link to it.

## Example Strategy

Use concrete examples, but keep them small and consistent:

- `customers` or `invoices` for table routes
- `orders` plus `order_items` for `$details`
- `invoices/:id/void` for custom workflow endpoints
- `imports/statements` for multipart upload
- `trial-balance` only when explaining report routes as app-owned endpoints

Every code block should either be:

- a minimal file snippet with a path comment
- a CLI command the reader can adapt
- a JSON request/response shape
- a short HTTP/curl example

Do not include simulated UI output, component state machines, or fake in-page
interaction flows.

## Technical Facts To Verify Before Writing Final Docs

- Exact `sapporta describe "METHOD /path"` selector syntax for path params.
- Whether generated table update is currently `PUT` only or also supports
  `PATCH`; document only supported methods.
- Current `_lookup` query parameters and response shape.
- Current `_count` query parameters and response shape.
- Exact `ApiError` export path and properties exposed by
  `@sapporta/shared/client`.
- Current multipart behavior in `createApiClient`, especially whether callers
  pass `File` values in `body` or manually build `FormData`.
- Whether protected `/api/openapi.json` requires bearer token in all default app
  templates or varies by configured public routes.

If verification finds differences from older docs, update the plan examples and
write the docs from the current Sapporta behavior.

## Implementation Steps

1. Read the existing docs and source materials listed above.
2. Decide final page names and sidebar placement.
3. Create the new Starlight Markdown pages with frontmatter:

```md
---
title: "Generated Table APIs"
description: "Call Sapporta's generated row-scoped table endpoints for list, filters, writes, lookup, count, and export."
---
```

4. Refactor `use-apis-and-tools.md` into a hub and remove duplicated deep
   sections that now live in focused pages.
5. Add cross-links from existing docs without changing their main purpose.
6. Update `packages/docs/astro.config.mjs` sidebar for any top-level pages.
7. Run:

```bash
pnpm --filter ./packages/docs build
```

8. Fix broken links, Starlight frontmatter errors, TypeScript/Astro build
   errors, and code fence formatting.
9. Manually scan generated pages in the dev server only if build passes and the
   navigation needs visual confirmation.

## Acceptance Criteria

- No homepage React component, homepage section, homepage CSS, or interactive
  simulator is added.
- Written docs under `packages/docs/src/content/docs/docs/` explain the API
  surface in enough depth to build and debug real integrations.
- Generated table APIs have a dedicated page with route inventory, envelopes,
  filters, search, sort, pagination, lookup, count, export, writes, and
  row-scope behavior.
- OpenAPI and CLI discovery have a dedicated page with local/deployed targeting,
  auth tokens, `describe`, raw `/api/openapi.json`, and missing-route debugging.
- Custom endpoint docs cover shared contracts, `TsRestApi`, mounting,
  request validation, auth, scoped rows, row-security helpers, multipart,
  response content types, errors, and verification.
- Typed frontend client docs cover `createApiClient`, `getApiBase`, call
  shapes, 2xx returns, `ApiError`, and deployment base URL behavior.
- Existing docs link to the focused API pages instead of duplicating long
  sections.
- `pnpm --filter ./packages/docs build` passes.

## Non-Goals

- Do not build a homepage API workbench.
- Do not add client-side docs demos.
- Do not document APIs as if they were unauthenticated by default.
- Do not encourage raw SQL as a normal write path.
- Do not move Sapporta source docs into this site verbatim; adapt them into the
  local Starlight narrative and link structure.
