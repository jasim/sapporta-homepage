---
title: "Authorization"
description:
  "Manage users, workspaces, sessions, roles, permissions, row scopes, public
  routes, and secure app-owned features."
---

## Users, workspaces, and sessions

Sapporta projects start with an auth-ready app: email/password sign-in, Better
Auth routes under `/api/auth/*`, session-backed API middleware, first workspace
provisioning, active workspace selection, role resolution, and row-scoped table
APIs.

Design access around these request facts:

- **User**: the person signed in through the browser, or the user named by an
  agent access token.
- **Workspace**: the tenant boundary for product data.
- **Active workspace**: the workspace selected for the current browser session
  or encoded into the current agent token.
- **Membership**: the user's relationship to the active workspace, including the
  role Sapporta should use for authorization.
- **Auth context**: the request-local principal, ability, data authority, and
  row-security helpers.

On first sign-in, the generated project auth code provisions an initial
workspace and makes that user an owner. If your product has its own onboarding
flow, keep that rule in mind: workspace creation is not just a UI step; it is
what gives future reads and writes a tenant boundary.

After login, the frontend loads the current session and then calls
`GET /api/auth-context`. That response gives the app enough information to show
the active workspace, workspace switcher, owner-only navigation, and account
profile actions. Switching workspace calls
`POST /api/auth-context/active-workspace` with the target `workspaceId`; the
server verifies membership before changing the session.

Configure production auth deliberately:

- Set `BETTER_AUTH_SECRET` to a real signing secret.
- Set `SAPPORTA_PUBLIC_BASE_URL` to the browser-facing origin that users open.
- Configure mail settings if you use verification or reset emails.
- Use exact credentialed CORS origins. Do not use wildcard CORS for
  authenticated browser traffic.

The generated project owns the auth code copied into `packages/api/project-auth`
and `packages/api/authz`. You can customize workspace provisioning, role
mapping, ability rules, token behavior, email policy, and error responses there
without changing `@sapporta/server`.

## Auth context pieces

A signed-in request becomes an auth context in stages:

```txt
request
  -> principal
  -> active workspace + membership
  -> ability
  -> data authority
  -> row security
  -> scopedRows() / guard.ownedRows()
```

Treat these as separate request facts:

| Piece           | Answers                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| `principal`     | Who is asking: anonymous, browser user, or agent-token user.                                                        |
| `ability`       | Whether this principal may run a feature action, such as `read` on `invoices`.                                      |
| `dataAuthority` | Which trusted row facts the request may use: system, workspace, or workspace user.                                  |
| `rowSecurity`   | How table metadata plus data authority become SQL predicates, trusted insert values, patches, and reference checks. |

Data authority is not a permission grant. Ability can say a workflow may run,
but row security still decides which rows the workflow can read or mutate.

## Choose row scope deliberately

Row visibility is a table design decision. Sapporta stores ownership facts in
the database, but clients do not get to choose them. Built-in table routes and
`scopedRows()` stamp trusted scope fields on insert and add row predicates to
reads, updates, deletes, lookups, counts, and exports.

Table route behavior is covered in
[Generated Table APIs](/docs/subsystems/generated-table-apis/).

Choose one `meta.rowScope` for each table:

| Scope                 | Use for                                   | Required columns                    | Example                                             |
| --------------------- | ----------------------------------------- | ----------------------------------- | --------------------------------------------------- |
| `systemGlobal`        | Installation-wide reference data          | none                                | countries, currencies, standard tax rates           |
| `workspaceGlobal`     | Data shared by all users in one workspace | `workspace_id`                      | customers, products, locations, accounts            |
| `workspaceUserScoped` | Data owned by one user inside a workspace | `workspace_id`, `scoped_to_user_id` | invoices, invoice lines, private notes, task queues |

Make the scope explicit in table metadata, even though Sapporta defaults a
missing `rowScope` to the strictest option:

```ts
export const invoices = sapportaTable({
  drizzle: invoicesTable,
  meta: {
    label: "Invoices",
    rowScope: "workspaceUserScoped",
    rowLabelColumns: ["invoice_number"],
  },
});
```

Workspace-scoped tables need a `workspace_id` column. User-scoped workspace
tables also need `scoped_to_user_id`:

```ts
export const invoicesTable = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace_id: text("workspace_id").notNull(),
  scoped_to_user_id: text("scoped_to_user_id").notNull(),
  invoice_number: text("invoice_number").notNull(),
  status: text("status").notNull(),
});
```

Do not ask the browser, a CLI caller, or a coding agent to submit those fields.
Generated forms omit `workspace_id`, `workspaceId`, `scoped_to_user_id`, and
`scopedToUserId`. The server derives them from the auth context.

A useful design check is to describe the same table in plain language:

- "Every workspace sees the same rows" means `systemGlobal`.
- "Everyone in this workspace sees the same rows" means `workspaceGlobal`.
- "Only the creator or assigned workspace user sees the row" means
  `workspaceUserScoped`.

If a workflow references another table, Sapporta validates reference visibility,
not just primary-key existence. A foreign key to a row in another workspace, or
to another user's user-scoped row, is rejected even if that id exists.

For schema-authoring details, see
[Model Your Data](/docs/subsystems/data-modeling/).

## Roles and permissions

Roles answer "what may this requester do?" Row visibility answers "which rows
may this requester touch?" Keep those separate.

Generated projects map Better Auth organization roles into Sapporta roles. By
default, `owner` and `admin` become `owner`; other members become `member`.
Customize that mapping in `packages/api/project-auth/workspace.ts` when your
product has a different membership model.

Define feature permissions in `packages/api/authz/ability.ts`. Use ability rules
for actions such as:

- Owners can manage framework/admin screens.
- Members can read and update product records they are allowed to use.
- Only accounting users can post journal entries.
- Only support users can open internal diagnostic routes.

Ability checks do not widen row predicates. An owner may be allowed to run an
action, but `workspaceUserScoped` rows still remain limited to the data
authority selected for that request. If an owner workflow needs to act across
users inside a workspace, model that as an intentional server-side workflow with
the right data-authority policy. Do not rely on a broad role check and then
fetch rows by primary key alone.

Use the generated guard helpers at route edges:

```ts
const auth = projectAuth.requireAuthorizedWorkspaceUserData(c, {
  action: "create",
  subject: "invoices",
});
```

The `requireAuthorized*Data()` helpers check `auth.ability.can(action, subject)`
and return an auth context narrowed to the row authority the workflow requested:

- `requireAuthorizedSystemData()` for `systemGlobal` data.
- `requireAuthorizedWorkspaceData()` for `workspaceGlobal` data.
- `requireAuthorizedWorkspaceUserData()` for `workspaceUserScoped` data.
- `requireAuthorizedInteractiveWorkspaceUserData()` for browser-session-only
  workflows, such as token management.

Use `requireWorkspaceOwner()` for owner/admin workflows that are not primarily
about row access. For table-backed product data, prefer the
`requireAuthorized*Data()` helpers because they combine permission checks with
server-side row scope.

## Generated table routes

Generated `/api/tables/*` routes enforce permission and row visibility on the
server. The list, get, create, update, delete, lookup, count, and export
handlers check the table action against `auth.ability`, create
`scopedRows(db, auth, table)`, and run the operation inside the resolved data
authority.

The generated handlers reject client-managed scope fields on create and update:
`workspace_id`, `workspaceId`, `scoped_to_user_id`, and `scopedToUserId`.
Trusted values come from the auth context. Rows outside the active auth boundary
behave like missing rows for get, update, and delete.

Reference validation uses the same boundary. A submitted `customer_id` or
`product_id` must point to a visible row, not merely an existing primary key.
Lookup and autocomplete routes use the same visibility predicate as writes.

## Agent access tokens

Use an agent access token when a non-browser caller needs protected API access:
the Sapporta CLI, CI, a scheduled job, or a coding agent.

Create tokens from the account profile screen while signed in to the workspace
you want the caller to use. The raw token is shown once. Store it in the
caller's secret store as `SAPPORTA_API_TOKEN`, not in the repository:

```bash
export SAPPORTA_API_URL="https://app.example.com"
export SAPPORTA_API_TOKEN="spat_..."

pnpm exec sapporta describe
pnpm exec sapporta tables
```

An agent token belongs to one user and one workspace. Ordinary CLI data commands
do not send a workspace id; the token selects the workspace. To work against
another workspace, switch to that workspace in the app and create a separate
token.

Token list routes return metadata only. They never return the raw token or the
stored secret hash. If a token is lost, revoke it and create another one.

Bearer-token callers can use protected table APIs, SQL APIs, OpenAPI discovery,
custom product endpoints, and report routes when their permissions allow it.
They cannot create, list, or revoke other tokens; token management is an
interactive browser-session workflow.

For one-off commands, you can pass the token directly:

```bash
pnpm exec sapporta tables --api-url "https://app.example.com" --api-token "spat_..."
```

For custom endpoints and reports, use `sapporta describe` to inspect the route,
then call it with an HTTP client:

```bash
pnpm exec sapporta describe "POST /api/invoices/{id}/void"

curl -fsS \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"reason":"duplicate"}' \
  "${SAPPORTA_API_URL}/api/invoices/123/void"
```

Treat auth errors as operational signals:

- `unauthenticated`: no usable session or bearer token was supplied.
- `token_expired`: create a replacement token.
- `token_revoked`: stop using that token.
- `workspace_required`: the token's user no longer belongs to that workspace.
- `forbidden`: the user or token cannot perform that action.

## Public routes

Better Auth public routes under `/api/auth/*` are special: they must be
reachable before a user has a session. Do not treat that exception as a general
rule for product data.

If your app adds a public product route, add it to `publicApiRoutes` only after
you have an explicit public-data policy. Public routes that read table-backed
data should still choose deliberate ability and row-security behavior, such as
system-global reference data or a verified public workspace catalog. Never let
anonymous callers select `workspace_id`, `workspaceId`, `scoped_to_user_id`, or
`scopedToUserId`.

## Secure app-owned features

Generated `/api/tables/*` routes already authorize the action and use
`scopedRows()` for row access. Custom product routes should follow the same
shape:

1. Resolve auth at the route edge.
2. Choose the narrowest guard helper for the workflow's data scope.
3. Use `scopedRows(db, auth, table)` for ordinary table operations.
4. Use `auth.rowSecurity.forTable(table)` for custom Drizzle queries,
   transactions, joins, aggregates, or multi-table workflows.
5. Return explicit, actionable errors for expected business failures.

For endpoint contracts, route wiring, uploads, and verification, see
[Build Product Workflows](/docs/building-your-own-feature/overview/) and
[Custom API Endpoints](/docs/subsystems/custom-api-endpoints/). For a
coding-agent review checklist focused on these boundaries, see
[LLM-Assisted Engineering](/docs/tools-and-operations/llm-assisted-engineering/).

For a normal table-backed action, keep the handler small:

```ts
import { scopedRows } from "@sapporta/server";

api.register("voidInvoice", contract.voidInvoice, async ({ c, request }) => {
  const auth = projectAuth.requireAuthorizedWorkspaceUserData(c, {
    action: "update",
    subject: "invoices",
  });
  const rows = scopedRows(c.get("db"), auth, invoices);

  const invoice = await rows.update(request.params.id, { status: "void" });
  return { status: 200, body: { data: invoice } };
});
```

`scopedRows()` rejects client-managed scope fields, validates reference
visibility, stamps trusted ownership fields, and scopes reads and mutations.
Rows outside the active auth boundary behave like missing rows for get, update,
and delete.

For multi-table workflows, create a row-security guard for each table touched by
the transaction:

```ts
const auth = projectAuth.requireAuthorizedWorkspaceUserData(c, {
  action: "create",
  subject: "invoice_workflow",
});
const invoiceGuard = auth.rowSecurity.forTable(invoices);
const lineGuard = auth.rowSecurity.forTable(invoiceLines);

const created = await db.transaction(async (tx) => {
  const invoice = await tx
    .insert(invoicesTable)
    .values(await invoiceGuard.insertValues(tx, request.body.invoice))
    .returning()
    .get();

  const lines = await lineGuard.insertManyValues(tx, request.body.lines, {
    serverValues: () => ({ invoice_id: invoice.id }),
  });

  await tx.insert(invoiceLinesTable).values(lines);
  return { invoice, lines };
});
```

Pass server-authored values, such as a newly created parent id, through
`serverValues`. Do not merge them into the client body before policy checks.

For custom reads and mutations, compose row ownership into SQL:

```ts
const guard = auth.rowSecurity.forTable(invoices);

await db
  .update(invoicesTable)
  .set(await guard.patchValues(db, { status: "void" }))
  .where(guard.ownedRows(eq(invoicesTable.id, request.params.id)));
```

Avoid these patterns:

- Filtering by `workspace_id` or `scoped_to_user_id` by hand when a scoped
  helper can do it.
- Accepting workspace or user scope from request parameters.
- Fetching broadly and filtering in JavaScript.
- Updating or deleting by primary key alone.
- Inserting `request.body` directly into a scoped table.
- Letting browser-only routes accept bearer-token callers.

For expected workflow failures that the caller can fix, return typed domain
errors instead of a generic 500. Define an error family near the workflow, throw
it where the business fact is first known, and catch it once in the route
handler so the contract declares the exact status and response body. Use
ordinary 400 or 404 responses for simple one-off handler checks; use typed
errors when failures originate deeper in workflow code.

Before releasing an auth-sensitive workflow, test the boundaries directly:

- Unauthenticated and unverified users are rejected according to project policy.
- Non-owner users cannot perform owner-only actions.
- User-scoped rows are invisible to other users in the same workspace.
- Workspace rows are invisible across workspaces.
- Clients cannot submit `workspace_id` or `scoped_to_user_id`.
- Foreign keys must point to rows visible in the active auth boundary.
- Interactive-only routes reject bearer tokens.
- Reports and custom SQL compose row-security predicates before reading data.
