# Authorization And Row Security Docs Plan

## Context

The existing plan described a homepage React authorization simulator. Replace
that direction with written Astro Starlight documentation under
`packages/docs/src/content/docs/docs/`.

The documentation should make Sapporta's security model concrete for app
builders: request auth resolves a user, active workspace, membership role,
ability, data authority, and row-security helper; table metadata declares row
scope; generated table APIs and custom product routes enforce both permission
checks and row predicates on the server.

Do not build visual or interactive homepage components. Do not add React
islands, simulators, homepage CSS, or demo state machines. The output of this
plan is a stronger docs section with narrative guidance, code examples,
cross-links, sidebar placement, and reference material.

## Documentation Goal

Create documentation that helps a Sapporta builder answer these questions:

- How does a signed-in request become an auth context?
- What is the difference between ability, role, data authority, row scope, and
  row security?
- Which row scope should a table use, and which scope columns are required?
- Why must clients never send `workspace_id`, `workspaceId`,
  `scoped_to_user_id`, or `scopedToUserId`?
- How do generated `/api/tables/*` routes enforce authorization and row
  visibility?
- How should custom routes, reports, transactions, and raw SQL preserve the same
  server-side boundary?
- When should a route use `requireAuthorizedSystemData()`,
  `requireAuthorizedWorkspaceData()`,
  `requireAuthorizedWorkspaceUserData()`, or
  `requireAuthorizedInteractiveWorkspaceUserData()`?
- How do public routes and agent access tokens fit without weakening workspace
  isolation?

## Source Material To Use

Use these as primary source references while writing:

- `packages/docs/src/content/docs/docs/control-access.md`
- `packages/docs/src/content/docs/docs/model-your-data.md`
- `packages/docs/src/content/docs/docs/build-product-workflows.md`
- `packages/docs/src/content/docs/docs/create-reports.md`
- `packages/docs/src/content/docs/docs/use-apis-and-tools.md`
- `packages/docs/src/content/docs/docs/reference.md`
- `/Users/jasim/m/a/code/sapporta/docs/auth.md`
- `/Users/jasim/m/a/code/sapporta/docs/reports/scoped-report-data.md`
- `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/app/SKILL.md`
- `/Users/jasim/m/a/code/skills-sapporta/skills/sapporta/user-code/SKILL.md`

Keep the public docs concise, but do not flatten important distinctions. The
source auth guide has details that should be promoted into the docs set:
request data authority, row-security guards, FK visibility, generated table
route behavior, interactive-only routes, token scope, and public route rules.

## Target Pages

### Expand `control-access.md`

Make this the conceptual spine of the auth docs. Keep the existing "Users,
workspaces, and sessions" opening, then reshape the page around this sequence:

1. Request auth resolves a principal.
2. Workspace membership selects the active workspace and role.
3. Ability answers whether an action may run.
4. Data authority answers which trusted row facts the request may use.
5. Row-security helpers turn table metadata plus data authority into SQL
   predicates, trusted insert values, and reference checks.

Add a compact ASCII flow only if it improves comprehension:

```txt
request
  -> principal
  -> active workspace + membership
  -> ability
  -> data authority
  -> row security
  -> scopedRows() / guard.ownedRows()
```

Key sections to add or deepen:

- `Auth context pieces`: define `principal`, `ability`, `dataAuthority`, and
  `rowSecurity` as separate request facts.
- `Ability is not row visibility`: make clear that owner/admin permission does
  not automatically broaden `workspaceUserScoped` rows across users or
  workspaces.
- `Choose row scope deliberately`: cover `systemGlobal`, `workspaceGlobal`, and
  `workspaceUserScoped`, including required columns and examples.
- `Generated table routes`: explain that list/get/create/update/delete/lookup/
  count/export use `scopedRows()`, check ability for the table action, reject
  client-managed scope fields, and return not-found behavior for invisible rows.
- `Reference visibility`: explain that FK validation checks target-row
  visibility, not just existence.
- `Custom route guard selection`: summarize the four
  `requireAuthorized*Data()` helpers and when to use each.
- `Agent tokens`: clarify that each token belongs to one user and one workspace,
  cannot manage tokens, and should be used by CLI/CI/agents instead of browser
  session APIs.
- `Public routes`: explain that public Better Auth routes are special, and that
  public product routes still need deliberate ability and row-security policy.

Use the invoice/customer/product example consistently:

- `invoices`: `workspaceUserScoped`
- `invoice_lines`: `workspaceUserScoped`
- `customers`: `workspaceGlobal`
- `products`: `workspaceGlobal`
- `countries` or `tax_rates`: `systemGlobal`

### Add A Focused Custom Route Security Section To `build-product-workflows.md`

The page already shows contracts and handlers. Add a docs section that makes the
security pattern explicit before the examples become copy-paste material.

Cover:

- Resolve auth at the route edge.
- Pick the narrowest helper for the workflow's data scope.
- Use `scopedRows(db, auth, table)` for ordinary table work.
- Use `auth.rowSecurity.forTable(table)` for joins, transactions, aggregates,
  multi-table workflows, or domain invariants.
- Use one guard per table touched by a transaction.
- Never mutate by primary key alone.
- Never insert `request.body` directly into scoped tables.
- Never fetch broad rows and filter workspace/user ownership in JavaScript.
- Keep raw SQL in store modules only when the scoped helpers genuinely do not
  fit, with a short justification.

Add examples for three route scopes:

```ts
projectAuth.requireAuthorizedSystemData(c, {
  action: "read",
  subject: "countries",
});
```

```ts
projectAuth.requireAuthorizedWorkspaceData(c, {
  action: "create",
  subject: "customers",
});
```

```ts
projectAuth.requireAuthorizedWorkspaceUserData(c, {
  action: "update",
  subject: "invoices",
});
```

Then include the interactive-only variant for token/profile management:

```ts
projectAuth.requireAuthorizedInteractiveWorkspaceUserData(c, {
  action: "create",
  subject: "agent_access_token",
});
```

### Strengthen `model-your-data.md`

Add cross-links from row-scope metadata to `control-access.md`. The table-model
page should explain enough for schema authors to make the right choice without
becoming the full auth guide.

Add or tighten:

- A row-scope decision table.
- Required columns by row scope.
- A warning that missing `rowScope` defaults strict but should still be
  declared explicitly.
- A note that `visuallyHidden` only affects UI display; ownership columns remain
  server-managed data columns.
- A relationship note: FK values must point to rows visible in the active auth
  boundary.

### Strengthen `use-apis-and-tools.md`

Make the API/CLI page explicit that protected table, report, SQL, and custom
endpoint calls use the current session or agent token, and that ordinary callers
should not send workspace ids.

Add or revise:

- `sapporta describe` examples for protected apps with `SAPPORTA_API_TOKEN`.
- A short "what a token selects" explanation: one user plus one workspace.
- An auth error table for `unauthenticated`, `token_expired`, `token_revoked`,
  `workspace_required`, and `forbidden`.
- A warning that SQL inspection is not proof of what a workspace user can see
  through row-scoped APIs.
- Direct API examples should omit scope fields from create/update bodies.

### Strengthen `create-reports.md`

Reports are app-owned routes and need the same row-security story as custom
routes. Add a short "Scoped report data" section near backend report handlers.

Cover:

- Resolve auth in the report route.
- Pass `{ db, auth }` to report data functions.
- Use `scopedRows()` for ordinary table reads when possible.
- Use `auth.rowSecurity.forTable(table).ownedRows(...)` in custom Drizzle report
  queries.
- For rare raw SQL report code, make visible base tables explicit before
  composing the aggregate.
- Do not accept workspace or user scope from report query parameters.

### Expand `reference.md`

Add a compact auth reference section so readers can look up exact helpers after
reading the guide pages.

Include tables for:

- `rowScope` values and required columns.
- Guard helpers and their intended scope.
- `scopedRows()` methods and what each operation enforces.
- Row-security guard methods: `ownedRows()`, `insertValues()`,
  `insertManyValues()`, `patchValues()`, `validateReferences()`.
- Common auth error codes.

Keep this page reference-shaped. Do not duplicate long narrative from
`control-access.md`.

## Navigation And Cross-Linking

The main sidebar already includes `Control Access` after `Work With Records`.
Keep that placement if the work remains within existing pages.

If a new page is added, prefer one of these two names:

- `secure-custom-workflows.md`
- `authorization-reference.md`

Then update `packages/docs/astro.config.mjs` so the new page appears near
`Control Access` and `Build Product Workflows`. Only add a page if the existing
pages become too long or mix reference material with tutorial material.

Cross-link intentionally:

- From `model-your-data.md` row-scope sections to `control-access.md`.
- From `control-access.md` custom workflow guidance to
  `build-product-workflows.md`.
- From `build-product-workflows.md` advanced transactions to
  `create-reports.md` only when discussing report-specific scoped reads.
- From `use-apis-and-tools.md` protected CLI/API calls to `control-access.md`
  agent-token guidance.
- From every page that mentions raw SQL to the SQL fallback section in
  `use-apis-and-tools.md`.
- From `reference.md` helper tables back to the narrative pages.

## Example Strategy

Use one coherent domain across the docs instead of unrelated snippets:

```txt
Workspace A
  user owner@example.com
  user cashier@example.com
  customers: Acme
  products: Paper, Ink
  invoices owned by cashier@example.com

Workspace B
  customers: Globex
  products: Tape
  invoices owned by another user
```

Examples should demonstrate these outcomes in prose and code:

- Listing invoices as the cashier only returns that cashier's
  `workspaceUserScoped` invoices in the active workspace.
- Listing customers returns `workspaceGlobal` rows in the active workspace.
- Reading an invoice id from another workspace behaves as not found through
  generated table APIs.
- Creating an invoice stamps `workspace_id` and `scoped_to_user_id` from auth.
- A submitted `customer_id` must reference a visible customer.
- A multi-table invoice creation route uses one guard for `invoices` and one
  guard for `invoice_lines`.
- Token-management routes use interactive-only auth and reject bearer-token
  callers.

Avoid simulated status panels. These are written examples, code snippets, and
callouts in docs pages.

## Security Invariants To State Clearly

The docs should make these rules hard to miss:

- Server-side authorization is the boundary; UI hiding is not security.
- Roles and abilities decide whether a feature action may run.
- Data authority and row scope decide which rows the request may touch.
- Workspace ownership is not global cross-workspace authorization.
- Owners/admins still need explicit data-authority policy for cross-user or
  cross-workspace workflows.
- Scope columns are server-managed.
- Primary key existence is not authorization.
- FK existence is not enough; the target row must be visible.
- Lists, lookups, counts, exports, and report queries must not post-filter
  broad results in JavaScript.
- Public product routes must be explicitly designed; do not make table-backed
  data public by skipping auth and then trusting request parameters.
- Raw SQL bypasses the normal save path and row helpers; use it only as a
  deliberate fallback.

## Implementation Steps

1. Audit the current pages for duplicated or shallow auth claims.
2. Draft the expanded `control-access.md` outline and move advanced details out
   of other pages if they belong there.
3. Update `model-your-data.md` row-scope guidance and link to the auth page.
4. Update `build-product-workflows.md` with route-edge guard selection,
   `scopedRows()`, row-security guards, and anti-patterns.
5. Update `create-reports.md` with scoped report data guidance.
6. Update `use-apis-and-tools.md` with agent-token and protected API behavior.
7. Update `reference.md` with concise auth helper tables.
8. Add a new docs page and sidebar entry only if the expanded material no
   longer fits cleanly in the existing pages.
9. Run the docs build and fix Starlight link, frontmatter, and Markdown errors.

## Acceptance Criteria

- No homepage or React component work is introduced.
- All target content lives in written Starlight docs pages under
  `packages/docs/src/content/docs/docs/`, except a sidebar update in
  `packages/docs/astro.config.mjs` if a new page is added.
- `Control Access` explains principal, active workspace, membership, ability,
  data authority, and row security as distinct concepts.
- Row-scope guidance covers `systemGlobal`, `workspaceGlobal`, and
  `workspaceUserScoped`, including required scope columns.
- Generated table route behavior is documented for list, get, create, update,
  delete, lookup, count, and export.
- Custom route examples use the appropriate `requireAuthorized*Data()` helper
  before `scopedRows()` or `auth.rowSecurity.forTable(table)`.
- Docs explicitly warn against client-supplied scope fields, primary-key-only
  mutations, broad fetches followed by JavaScript ownership filtering, and raw
  SQL as a default path.
- Agent token docs state that tokens are tied to one user and one workspace and
  cannot manage other tokens.
- Public route guidance explains that public product routes still need
  deliberate ability and row-security policy.
- Cross-links connect schema modeling, access control, product workflows,
  reports, APIs/tools, and reference material.
- The docs build succeeds.

## Verification

After implementing the docs changes, run:

```bash
pnpm --filter ./packages/docs build
```

If the package does not expose that exact script, run the repository's docs or
site build script shown in `packages/docs/package.json`.

Also inspect rendered pages locally to verify:

- Sidebar ordering is sensible.
- Cross-links resolve.
- Code blocks use valid TypeScript syntax.
- Tables are readable on narrow screens.
- The written examples do not imply that clients choose workspace, owner, role,
  or scope columns.
