# LLM-Assisted Engineering Documentation Plan

## Context

The old plan proposed a visual homepage island that let visitors select a
feature request and see a checklist. Replace that direction with written Astro
Starlight documentation under:

```txt
packages/docs/src/content/docs/docs/
```

The documentation should explain why Sapporta is unusually good terrain for
LLM-assisted engineering: the framework turns common database-application work
into predictable file locations, shared contracts, schema metadata, generated
APIs, server-side row security, report routes, typed frontend clients, and
validation loops that an agent can inspect and follow.

This is not a promise that an LLM can safely invent product behavior. It is a
documentation plan for showing how Sapporta reduces ambiguity and gives human
reviewers concrete artifacts to inspect.

## Primary Deliverable

Create a written Starlight page:

```txt
packages/docs/src/content/docs/docs/llm-assisted-engineering.md
```

Working title:

```yaml
title: "LLM-Assisted Engineering"
description: "Use Sapporta's project structure, schema metadata, shared contracts, scoped data access, reports, and CLI discovery as rails for coding agents."
```

Place it after `use-apis-and-tools.md` and before `ship-your-app.md` in the
manual sidebar in `packages/docs/astro.config.mjs`, if the implementation
updates navigation at the same time. The current site uses that manual sidebar,
so do not rely on page-local `sidebar.order` frontmatter. If another
documentation plan is already reworking the sidebar, this page should still link
from `index.md`, `introduction.md`, or the final "What to read next" list.

Do not build React components, homepage demos, selectors, animated diagrams,
or visual workflow cards for this plan. The output is prose, code examples,
tables, checklists, and links.

## Reader Goal

The reader should leave with a practical mental model:

- what an agent can inspect before changing a Sapporta app
- which files an agent should touch for each kind of change
- which parts of the framework keep browser, API, database, and reports in
  sync
- which security decisions must stay server-side
- how to review an agent's work by checking generated SQL, OpenAPI output,
  typed contracts, row-scope usage, and route tests

The tone should be engineering-specific and concrete. Avoid generic AI
productivity language.

## Source Material To Reuse

Use existing docs in this repository as the canonical public voice:

- `packages/docs/src/content/docs/docs/index.md`
- `packages/docs/src/content/docs/docs/model-your-data.md`
- `packages/docs/src/content/docs/docs/control-access.md`
- `packages/docs/src/content/docs/docs/build-product-workflows.md`
- `packages/docs/src/content/docs/docs/build-screens.md`
- `packages/docs/src/content/docs/docs/use-grids.md`
- `packages/docs/src/content/docs/docs/create-reports.md`
- `packages/docs/src/content/docs/docs/use-apis-and-tools.md`
- `packages/docs/src/content/docs/docs/reference.md`

Use Sapporta source docs for technical accuracy:

- `/Users/jasim/m/a/code/sapporta/docs/schema-and-migrations.md`
- `/Users/jasim/m/a/code/sapporta/docs/schema-metadata.md`
- `/Users/jasim/m/a/code/sapporta/docs/auth.md`
- `/Users/jasim/m/a/code/sapporta/docs/reports/route-based-reports.md`
- `/Users/jasim/m/a/code/sapporta/docs/reports/grid-result-shape.md`
- `/Users/jasim/m/a/code/sapporta/docs/reports/scoped-report-data.md`
- `/Users/jasim/m/a/code/sapporta/docs/cli.md`

Use Sapporta skill docs as implementation-oriented source material:

- `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/SKILL.md`
- `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/app-framework/SKILL.md`
- `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/table-creation/SKILL.md`
- `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/app/SKILL.md`
- `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/report-creation/SKILL.md`
- `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/frontend/SKILL.md`
- `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/user-code/SKILL.md`

Do not copy skill text verbatim. Turn it into reader-facing documentation that
explains the engineering reasons behind the instructions.

## Proposed Page Structure

### 1. Why Sapporta Helps Coding Agents

Open with the core claim:

Sapporta makes database-app work legible because product behavior is organized
around a small set of typed surfaces:

- schema files in `packages/api/schema/`
- shared route contracts in `packages/shared/src/contracts/`
- backend route adapters in `packages/api/app/`
- optional domain modules in `packages/api/modules/<domain>/`
- typed browser clients in `packages/frontend/src/api.ts`
- custom screens and report screens in `packages/frontend/src/`
- generated OpenAPI and CLI discovery from the running app

Explain that these surfaces help because an agent can inspect existing code,
make a narrow change, and run targeted validation. The page should say plainly
that business rules still need human review.

### 2. The Project Shape Agents Should Follow

Add a compact ASCII map only if it improves scanability:

```txt
schema -> migration -> generated table API -> grid/forms/CLI
shared contract -> API handler -> OpenAPI -> typed frontend client
report contract -> report route -> GridDataset -> report screen
auth context -> scopedRows()/rowSecurity -> row-safe data access
```

Then expand each line with links:

- [Model Your Data](./model-your-data/) for schema-as-code and migrations.
- [Build Product Workflows](./build-product-workflows/) for shared contracts
  and custom endpoints.
- [Control Access](./control-access/) for row scope and authorization.
- [Create Reports](./create-reports/) for route-based reports.
- [Build Screens](./build-screens/) and [Use Grids](./use-grids/) for frontend
  work.
- [Use APIs And Tools](./use-apis-and-tools/) for OpenAPI and CLI discovery.

### 3. Schema-As-Code Gives The Agent One Source Of Truth

Explain that a Sapporta table is both storage definition and product metadata.
Include a short code sample adapted from existing docs:

- raw Drizzle table export for SQL columns, constraints, foreign keys, and
  `$inferSelect` / `$inferInsert`
- Sapporta `table()` wrapper for `label`, `rowScope`, `rowLabelColumns`,
  `search`, `selects`, `children`, and column display/editing metadata

Make these review points explicit:

- migrations are generated with Drizzle Kit and reviewed before application
- the server checks migration readiness at startup and does not auto-migrate
- semantic column factories (`money`, `percentage`, `date`, `timestamp`,
  `bool`, `text`, `number`) keep parsing, filtering, and rendering consistent
- row types should be derived from Drizzle exports, not hand-written in
  parallel
- nullable numeric fields need either non-null defaults for additive values or
  `additive: false` metadata when `null` has meaning

Link to [Model Your Data](./model-your-data/) and
[Reference](./reference/#table-definitions).

### 4. Migrations Make Database Changes Reviewable

Add a short implementation sequence:

```bash
pnpm --filter ./packages/api db:generate --name add_invoices
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
pnpm exec sapporta tables show invoices
```

Frame this as useful for LLM-assisted work because the generated SQL and table
metadata are inspectable artifacts. The agent should not silently change the
database at runtime, and reviewers should check generated SQL before applying
it.

### 5. Shared Contracts Prevent Client/Server Drift

Describe the typed custom endpoint workflow:

1. define a ts-rest contract in `packages/shared/src/contracts/<feature>.ts`
2. re-export it from `packages/shared/src/contracts/index.ts`
3. register it with `TsRestApi` in `packages/api/app/<feature>.ts`
4. mount it from `packages/api/app.ts`
5. add a typed frontend client in `packages/frontend/src/api.ts`
6. confirm it appears with `pnpm exec sapporta describe "METHOD /api/path"`

Explain why this matters for agents:

- Zod schemas validate params, query, body, and response status shapes
- handler inputs are typed from the shared contract
- OpenAPI output and `sapporta describe` come from the same declaration
- browser calls use `createApiClient(contract, { baseUrl: getApiBase })`
- the shared package stays browser-safe and must not import React, Hono,
  Drizzle, database access, or file I/O

Use a small invoice action example, such as "void invoice" or "approve invoice",
but keep it shorter than the full `build-product-workflows.md` tutorial. Link
to that page for the complete endpoint walkthrough.

### 6. Row Security Gives Agents Non-Negotiable Boundaries

Explain row visibility as a design decision, not a UI filter:

- `systemGlobal` for installation-wide reference data
- `workspaceGlobal` for records shared by a workspace
- `workspaceUserScoped` for records owned by a user inside a workspace

State the required columns:

| Row scope             | Required scope columns              |
| --------------------- | ----------------------------------- |
| `systemGlobal`        | none                                |
| `workspaceGlobal`     | `workspace_id`                      |
| `workspaceUserScoped` | `workspace_id`, `scoped_to_user_id` |

Then describe the rule for custom code:

- resolve auth at the route edge using the narrowest
  `projectAuth.requireAuthorized*Data()` helper
- use `scopedRows(db, auth, table)` for ordinary row operations
- use `auth.rowSecurity.forTable(table)` for joins, transactions,
  aggregates, reports, and multi-table workflows
- do not accept, submit, manually stamp, or manually filter `workspace_id`,
  `workspaceId`, `scoped_to_user_id`, or `scopedToUserId`
- do not mutate scoped rows by primary key alone
- do not fetch broadly and filter ownership in JavaScript

This should be the strongest section on why Sapporta is suitable for
LLM-assisted engineering: the docs should teach agents what they must not
improvise.

Link to [Control Access](./control-access/).

### 7. Reports Are Typed Product Routes, Not A Separate Mystery System

Show that reports follow the same agent-friendly shape as product endpoints:

- shared report contract in `packages/shared/src/contracts/`
- backend handler under `packages/api/app/`
- scoped query/store logic
- pure mapper returning the canonical `GridDataset` shape
- React screen rendering the report result
- frontend-owned link resolvers for drill-down navigation

Cover review points:

- report filters should not include workspace/user scope fields
- date ranges should use the shared flat query shape and Temporal-aware helpers
- hidden IDs belong in report result columns when the frontend needs drill-down
  links
- links are resolved by the frontend because route state and navigation policy
  live there
- raw SQL in reports needs explicit visible base rows or row-security guards
  before aggregation

Link to [Create Reports](./create-reports/), and note that report rows should
link back to source records or ledger/detail reports when that helps explain a
number.

### 8. Frontend Work Stays Typed And Scoped

Explain how agents should decide between frontend surfaces:

- use generated table screens for ordinary record browsing and editing
- use `SchemaTableGridView` when a custom route still works with Sapporta table
  records
- use TGrid when the route needs custom columns, toolbar actions, selection, or
  nested layouts while still relying on table APIs
- use report components for route-based reports
- use typed app API clients for product workflows that require custom backend
  behavior

Mention the route/navigation files:

- `packages/frontend/src/App.tsx` for `appNavigation`, `appHomeRoute`,
  `appPublicRoutes`, and `appProtectedRoutes`
- `packages/frontend/src/api.ts` for typed clients

Security note: hidden form inputs and frontend filters are not authorization.
Generated table APIs and custom backend routes must enforce scope server-side.

Link to [Build Screens](./build-screens/) and [Use Grids](./use-grids/).

### 9. The Agent Validation Loop

Add a practical checklist that reviewers and coding agents can run after a
change:

```txt
[ ] table definitions use explicit rowScope and required scope columns
[ ] generated SQL migration was reviewed before db:migrate
[ ] shared contract declares every request and response status shape
[ ] custom route is mounted and appears in sapporta describe
[ ] route resolves auth at the edge with the narrowest data authority
[ ] ordinary row work uses scopedRows()
[ ] custom joins/transactions/aggregates use rowSecurity.forTable()
[ ] frontend imports a typed client instead of hand-writing fetch shapes
[ ] reports return the shared report/grid result shape and include needed hidden IDs
[ ] tests or CLI/API checks cover the changed route, report, or table behavior
```

Keep the checklist written for implementation review, not marketing.

### 10. Example: One Feature Request, Many Guardrails

Include one narrative example to replace the old interactive homepage selector.
Use prose and a compact file map rather than UI state:

```txt
Feature request: "Add an approval action for draft invoices."

packages/shared/src/contracts/invoices.ts
  Defines POST /invoices/:id/approve request and response schemas.

packages/api/app/invoices.ts
  Registers the route, resolves auth, loads the row through scopedRows(), and
  returns explicit 404/409 errors for missing rows or invalid status.

packages/api/modules/invoices/services/approve-invoice.ts
  Holds the domain invariant: only draft invoices can be approved.

packages/frontend/src/api.ts
  Exposes invoicesApi.approveInvoice from the shared contract.

packages/frontend/src/screens/Invoices.tsx
  Calls the typed client and refreshes the current row/grid state.
```

Then list the guardrails:

- the browser never sends `workspace_id`
- the route does not update by primary key alone
- the status invariant is tested outside React
- the contract makes client/server drift visible at build time
- `sapporta describe` proves the route is mounted

This example should be short enough to fit inside the page without becoming a
second full tutorial.

## Link And Navigation Work

Implementation should add links from existing docs so the new page is discoverable:

- Add a "LLM-Assisted Engineering" entry to `packages/docs/astro.config.mjs`
  near the APIs/tools and shipping pages.
- Coordinate with the API and agent-console documentation plans so the sidebar
  has one clear API/tools cluster instead of several competing top-level
  sequences.
- Add a short link in the "What to read next" section of
  `packages/docs/src/content/docs/docs/index.md`.
- Add contextual links from:
  - `build-product-workflows.md` near the shared contract discussion
  - `control-access.md` near secure custom workflows
  - `create-reports.md` near report validation or scoped report data
  - `use-apis-and-tools.md` near `sapporta describe` and CLI discovery

Keep reciprocal links concise. Do not turn every page into an AI page.

## Writing Constraints

- Write documentation, not a homepage demo.
- Prefer short code samples that prove the shape of a workflow.
- Link to deeper existing docs instead of duplicating full tutorials.
- Use ASCII diagrams only when they clarify file flow or validation flow.
- Avoid generated images, screenshots, React islands, animated components, or
  homepage CSS.
- Keep examples consistent with Temporal usage; do not introduce `Date`,
  `dayjs`, or `date-fns`.
- Do not present row filters, hidden fields, or client-side checks as security.
- Do not claim agents can safely infer business rules; say where humans must
  specify and review invariants.

## Implementation Steps

1. Create `packages/docs/src/content/docs/docs/llm-assisted-engineering.md`
   with Starlight frontmatter and the structure above.
2. Draft the page around the concrete Sapporta file map and validation loop.
3. Add short code examples for schema metadata, a contract route, and scoped
   row access only where they carry the explanation.
4. Add the invoice approval narrative example.
5. Add navigation and reciprocal links from existing docs.
6. Run the docs build or the project's normal docs validation command.
7. Review the rendered page for heading hierarchy, table width, code wrapping,
   and link targets.

## Acceptance Criteria

- The plan results in written Starlight documentation under
  `packages/docs/src/content/docs/docs/`, not a visual homepage component.
- The new page explains the relationship between schema-as-code, migrations,
  generated table APIs, shared contracts, OpenAPI, typed frontend clients,
  reports, and row security.
- The page contains at least one concrete feature file map and one reviewer
  checklist.
- The page links to the existing core docs instead of duplicating them.
- The row-security section explicitly says clients and agents must not submit
  or choose workspace/user scope fields.
- The report section covers route-based contracts, scoped data access, result
  shape, frontend rendering, and drill-down links.
- Navigation makes the page discoverable from the docs sidebar or existing
  overview pages.
- No React component, homepage CSS, selector state, or visual interactive demo
  is introduced.
