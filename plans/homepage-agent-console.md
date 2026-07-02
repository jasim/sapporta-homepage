# Agent And Data Console Documentation Plan

## Context

The existing homepage-oriented plan framed "agent native" as an interactive
React console. The new target is written Astro Starlight documentation under:

```txt
packages/docs/src/content/docs/docs/
```

The documentation should explain how Sapporta's agent-facing surfaces actually
work: the live OpenAPI document, the project-local `sapporta` CLI, agent access
tokens, generated table APIs, report/custom endpoint discovery, row commands,
and SQL fallback. It should help builders and coding agents operate against a
running Sapporta app without implying that agents bypass application
authorization.

Do not create homepage components, terminal simulations, parser demos, command
playback, or other visual/interactive homepage assets. The deliverable is a
set of written docs and navigation/link changes only.

## Source Material To Use

Read and reconcile these sources before writing:

- Existing Starlight docs:
  - `packages/docs/src/content/docs/docs/introduction.md`
  - `packages/docs/src/content/docs/docs/work-with-records.md`
  - `packages/docs/src/content/docs/docs/use-apis-and-tools.md`
  - `packages/docs/src/content/docs/docs/control-access.md`
  - `packages/docs/src/content/docs/docs/reference.md`
- Sapporta source docs:
  - `/Users/jasim/m/a/code/sapporta/docs/cli.md`
  - `/Users/jasim/m/a/code/sapporta/docs/auth.md`
  - `/Users/jasim/m/a/code/sapporta/docs/schema-and-migrations.md`
  - `/Users/jasim/m/a/code/sapporta/docs/reports/route-based-reports.md`
  - `/Users/jasim/m/a/code/sapporta/docs/reports/scoped-report-data.md`
- Sapporta skill docs:
  - `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/SKILL.md`
  - `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/data-console/SKILL.md`
  - `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/data-console/references/cli-server-access.md`
  - `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/table-querying/SKILL.md`
  - `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/report-execution/SKILL.md`
  - `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/row-insertion/SKILL.md`
  - `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/master-detail-insertion/SKILL.md`
  - `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/meta-sql/SKILL.md`

Use the source docs for product truth and the existing Starlight docs for tone,
frontmatter, manual sidebar placement, code-block style, and link shape. Do not
copy a skill verbatim into public docs; translate agent instructions into
user-facing documentation.

## Documentation Architecture

Create a small docs cluster instead of one oversized reference page:

```txt
packages/docs/src/content/docs/docs/
  use-apis-and-tools.md              # keep as the broad overview, update links
  agent-access.md                    # new: tokens, target app, workspace scope
  agent-data-console.md              # new: discovery loop and safe CLI workflow
  agent-data-console-recipes.md      # new: task recipes with concrete commands
  reference.md                       # update only if reference anchors need expansion
```

If the docs set already has too many top-level pages, keep
`agent-data-console-recipes.md` as a section inside `agent-data-console.md`.
Prefer two focused pages over a long page that mixes setup, workflow, and
recipes.

Navigation rule:

- The current docs site uses a manual sidebar in
  `packages/docs/astro.config.mjs`; adding a Markdown file alone will not make
  it discoverable.
- Do not rely on `sidebar.order` frontmatter unless the docs site is later
  converted to generated sidebar sections.
- Coordinate with the API and LLM-assisted-engineering docs plans so `Use APIs
And Tools` remains the hub and the new pages do not create duplicate sidebar
  entries for the same topic.

Recommended manual sidebar order:

- Keep `Use APIs And Tools` near the existing API/tooling position.
- Put `Agent Access` immediately after it.
- Put `Agent Data Console` after `Agent Access`.
- Put recipes after the data-console page if implemented as a separate file.

Update `introduction.md` and `use-apis-and-tools.md` with concise links to the
new pages. Avoid duplicating whole sections across pages; the overview should
route readers to the deeper pages.

## Page 1: Agent Access

Purpose: explain how a non-browser caller targets and authenticates to a
Sapporta app.

Proposed frontmatter:

```md
---
title: "Agent Access"
description: "Connect the CLI, coding agents, CI, and scripts to protected Sapporta APIs."
---
```

Required sections:

1. "When you need an agent token"
   - CLI against a protected app.
   - Coding agent or CI access to table/report/custom APIs.
   - Scheduled jobs or scripts.
   - Local unauthenticated development may not need a token, but protected
     routes should be tested with one.

2. "Select the target app"
   - Default API URL is `http://localhost:3000`.
   - Use `SAPPORTA_API_URL` for remote or non-default local apps.
   - `--api-url` overrides the environment for one command.
   - `APP_SERVER_UNREACHABLE` means fix the selected URL/server/network before
     diagnosing auth or schema behavior.

3. "Create and use a token"
   - Tokens are created from the app account profile page.
   - Mention `/account/profile` and how local projects commonly expose it at
     the frontend origin, such as `http://localhost:5173/account/profile`.
   - The raw token is shown once.
   - Use `SAPPORTA_API_TOKEN` or `--api-token`.
   - Do not commit, print, or store tokens in the repo.

4. "Workspace scope"
   - A token belongs to one user and one active workspace.
   - Ordinary CLI/API calls do not send a workspace id.
   - To work in another workspace, switch workspace in the app and create a new
     token for that workspace.
   - The token selects the row boundary, but route abilities still decide which
     actions are allowed.

5. "Auth failures"
   - Table of `unauthenticated`, `token_expired`, `token_revoked`,
     `workspace_required`, and `forbidden`.
   - Give concrete next action for each.
   - State that direct local database inspection is developer/admin debugging,
     not a substitute for workspace-user API behavior.

6. "Browser-only token management"
   - Token create/list/revoke routes are interactive-session workflows.
   - Bearer-token callers can use protected APIs when permitted, but should not
     manage other tokens.

Example commands to include:

```bash
export SAPPORTA_API_URL="https://app.example.com"
export SAPPORTA_API_TOKEN="spat_..."

pnpm exec sapporta describe
pnpm exec sapporta tables
```

```bash
pnpm exec sapporta describe --api-url "https://app.example.com"
pnpm exec sapporta tables --api-token "spat_..."
```

## Page 2: Agent Data Console

Purpose: document the recommended operating loop for a coding agent or builder
working with data through the running app.

Proposed frontmatter:

```md
---
title: "Agent Data Console"
description: "Use the Sapporta CLI and APIs to discover, inspect, query, and safely change app data."
---
```

Required narrative:

1. Sapporta apps expose their current API shape at `GET /api/openapi.json`.
2. `pnpm exec sapporta describe` reads the same live OpenAPI document and is
   the first human-readable discovery step.
3. Generated table APIs, report routes, custom app endpoints, metadata routes,
   and SQL tooling are all visible through discovery.
4. Most CLI data commands talk to the selected running app, not directly to
   local files.
5. Generated table and row commands use normal server validation, defaults,
   row ownership stamping, FK visibility, and authorization.
6. SQL is a fallback. It is useful for inspection and maintenance, but writes
   bypass the table save path and row helpers.

Recommended "discovery before action" flow:

```txt
target app -> authenticate -> describe API -> inspect tables -> sample rows
           -> choose report/table/row/custom endpoint -> execute -> verify
```

Use the diagram only if it helps; keep it ASCII and short.

Core command examples:

```bash
pnpm exec sapporta describe
pnpm exec sapporta describe "GET /api/tables/customers"
pnpm exec sapporta describe "POST /api/invoices/123/void"

pnpm exec sapporta tables
pnpm exec sapporta tables show customers
pnpm exec sapporta tables indexes customers
pnpm exec sapporta tables sample customers --limit 10 --fields id,name,email
```

Explain what each discovery command answers:

| Command          | Use                                                                   |
| ---------------- | --------------------------------------------------------------------- |
| `describe`       | Find route paths, methods, schemas, and mounted app APIs.             |
| `tables`         | See table names registered by the running app.                        |
| `tables show`    | Inspect columns, constraints, metadata, relationships, and row shape. |
| `tables indexes` | Check indexes before diagnosing query performance or uniqueness.      |
| `tables sample`  | See real values and resolve foreign keys before writes.               |

Data operation guidance:

- Use report routes first for business questions, balances, ledgers, summaries,
  and rollups.
- Use table list APIs for row-level questions that fit search, filters, sort,
  and pagination.
- Use `rows insert/update/delete` for ordinary table mutations.
- Use custom endpoints for domain actions such as voiding, importing,
  approving, reserving, or multi-table workflows.
- Use read-only SQL only when no report, table query, or custom endpoint fits.
- Use SQL writes only for explicit maintenance tasks after safer surfaces are
  ruled out.

Security and auth explanation:

- Built-in table APIs apply row visibility for list, get, create, update,
  delete, lookup, count, and export.
- In auth-enabled apps, omit `workspace_id`, `workspaceId`,
  `scoped_to_user_id`, and `scopedToUserId`; the server supplies trusted scope
  values.
- Foreign keys should be resolved from visible rows, not guessed.
- A route permission check does not widen row visibility; data authority still
  determines the row predicate.
- Generated routes return `404` for rows outside the active boundary on get,
  update, and delete.

## Page 3: Agent Data Console Recipes

Purpose: give concrete, copyable command patterns for common agent tasks. Keep
recipes short and grounded in the real CLI/API surfaces.

Proposed frontmatter:

```md
---
title: "Agent Data Console Recipes"
description: "Copyable patterns for inspecting tables, answering questions, changing rows, and calling app routes."
---
```

Required recipes:

1. "Inspect a table before writing"

```bash
pnpm exec sapporta tables show products
pnpm exec sapporta tables sample products --limit 10 --fields id,sku,name,price
```

Explain that `tables show` gives schema/metadata and `tables sample` gives real
ids and values.

2. "Create one row"

```bash
pnpm exec sapporta rows insert customers \
  --data '{"name":"Acme Co","email":"ops@example.com"}'
```

Mention omitting generated and ownership columns.

3. "Create parent and child rows in one transaction"

```bash
pnpm exec sapporta rows insert orders --data '{
  "customer_id": 7,
  "status": "draft",
  "$details": {
    "table": "order_items",
    "fk": "order_id",
    "rows": [
      { "product_id": 11, "quantity": 3, "unit_price": 29.99 }
    ]
  }
}'
```

Explain that Sapporta inserts the parent, backfills the child FK, and rolls
back the transaction if validation fails.

4. "Update and delete ordinary rows"

```bash
pnpm exec sapporta rows update customers 7 \
  --data '{"email":"billing@example.com"}'

pnpm exec sapporta rows delete customers 7
```

Mention that both operate inside row visibility.

5. "Filter a table through HTTP"

```bash
curl -fsS -G \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  --data-urlencode "filter[status][eq]=sent" \
  --data-urlencode "filter[due_date][lte]=2026-06-30" \
  --data-urlencode "sort=-due_date" \
  --data-urlencode "page=1" \
  --data-urlencode "limit=50" \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/tables/invoices"
```

Link to the reference filter syntax. Warn that malformed filters return `400`
and should not be retried without the filter.

6. "Call a report route"

```bash
pnpm exec sapporta describe "GET /api/reports/trial-balance"

curl -fsS \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/reports/trial-balance?asOfDate=2026-06-30"
```

Explain that reports are app-owned routes, inspected with `describe` and called
with HTTP clients.

7. "Call a custom product endpoint"

```bash
pnpm exec sapporta describe "POST /api/invoices/123/void"

curl -fsS \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"reason":"duplicate"}' \
  "${SAPPORTA_API_URL}/api/invoices/123/void"
```

State that the CLI does not directly invoke arbitrary user-defined endpoints.

8. "Use structured output in scripts"

```bash
pnpm exec sapporta tables --output-format json
pnpm exec sapporta rows get customers 7 --output-format json
```

9. "Use SQL as a fallback"

```bash
pnpm exec sapporta db exec-sql \
  "SELECT id, name FROM customers ORDER BY id DESC LIMIT 10"

pnpm exec sapporta db exec-sql \
  --input-body-json '{"sql":"SELECT id, name FROM customers","limit":50}'
```

For risky maintenance SQL, include dry-run guidance:

```bash
pnpm exec sapporta db exec-sql \
  --input-body-json '{"sql":"DELETE FROM customers WHERE id = 7","dryRun":true}'
```

Emphasize that SQL writes bypass normal table save hooks, default handling,
ownership stamping, and scoped row helpers.

## Updates To Existing Pages

### `use-apis-and-tools.md`

Keep this as the overview. Refactor only enough to avoid duplication:

- Add a short "For agent setup, start with Agent Access" link.
- Add a short "For the operating loop and recipes, use Agent Data Console" link.
- Keep the existing sections for OpenAPI, table APIs, filters, reports,
  custom endpoints, and SQL fallback.
- If a section becomes too detailed after adding links, move the detailed
  command sequence to the new page and leave a concise summary.

### `introduction.md`

Update the "Inspect the app as you build" and "What to read next" sections:

- Link to `./agent-access/` for protected CLI/API access.
- Link to `./agent-data-console/` for CLI discovery and data work.
- Keep `./use-apis-and-tools/` as the broader API reference/workflow page.

### `reference.md`

Only update this file if needed to add anchors or concise reference rows. Do
not turn it into a second agent guide. The likely updates are:

- Ensure CLI reference mentions `SAPPORTA_OUTPUT_FORMAT`.
- Ensure OpenAPI reference says protected apps use the same credentials as data
  commands.
- Ensure troubleshooting links readers to `Agent Access` for token failures.

## Narrative And Style Requirements

- Use written documentation, not demo-copy.
- Use concrete Sapporta examples: `customers`, `orders`, `order_items`,
  `invoices`, `products`, and `trial-balance`.
- Prefer `pnpm exec sapporta ...` everywhere.
- Use `curl -fsS -G` plus `--data-urlencode` for bracketed filter examples.
- Keep warnings direct and operational:
  - fix auth before composing data requests
  - do not guess foreign keys
  - do not submit system-managed scope columns
  - do not retry failed filters by dropping the filter
  - do not use raw SQL as the default mutation path
- Do not use chatbot framing. The reader is a builder, coding agent operator,
  or integration author.
- Keep diagrams ASCII-only and only where they clarify sequencing.
- Maintain existing Starlight frontmatter style and relative links such as
  `[Reference](./reference/)`.

## Implementation Steps

1. Audit the existing docs pages and confirm there is no duplicate page already
   covering agent access or the data-console loop.
2. Draft `agent-access.md` with setup, token lifecycle, workspace scope, and
   auth-error recovery.
3. Draft `agent-data-console.md` with the discovery-before-action workflow,
   command explanations, tool selection guidance, and safety model.
4. Draft `agent-data-console-recipes.md` if the recipes would make the main
   page too long; otherwise add a "Recipes" section to `agent-data-console.md`.
5. Update `use-apis-and-tools.md` to link to the new pages and remove any
   newly redundant long setup material.
6. Update `introduction.md` so the docs entry points route readers to the new
   pages.
7. Make only minimal `reference.md` updates if the new pages need a stable
   reference anchor.
8. Run formatting/build checks that are available in the docs package.

## Verification

Run the lightest checks that prove the docs build and links are valid. Preferred
commands, depending on package scripts:

```bash
pnpm --filter ./packages/docs build
pnpm build
```

Also perform a manual content pass:

- Every new page has frontmatter with `title` and `description`.
- `packages/docs/astro.config.mjs` includes any new top-level pages in the
  intended manual sidebar order.
- All relative links resolve.
- Commands consistently use `pnpm exec sapporta`.
- Token examples never include a real secret.
- Protected-app guidance says to fix auth failures before continuing.
- The docs clearly distinguish CLI-discovered app routes from endpoints the CLI
  can invoke directly.
- SQL fallback guidance states the behavior it bypasses.
- No React component, homepage CSS, `index.astro`, or interactive demo files
  are introduced by this work.

## Acceptance Criteria

- The implementation creates or updates written Starlight documentation under
  `packages/docs/src/content/docs/docs/`.
- The docs explain agent access tokens, target app selection, workspace scope,
  OpenAPI discovery, CLI command surfaces, table APIs, report/custom endpoint
  calling, row commands, and SQL fallback.
- The examples are concrete and copyable.
- The security model is explicit: agents use normal protected APIs and
  server-side row authorization; they do not supply trusted workspace/user
  fields or bypass the server.
- Existing overview/reference pages link readers into the deeper agent/data
  console pages.
- No visual or interactive homepage component work remains in this plan.
