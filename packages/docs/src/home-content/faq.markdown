## Frequently asked questions

### Why use Sapporta instead of asking an LLM to generate the whole application?

A coding agent can generate a form or endpoint quickly. But to ensure a consistent application of authorization and
validation, and to build out the rich user experience like the data grid with pagination, filtering, and sorting, and
exposing agentic capabilities that are permission-aware - all of these require a significant amount of prompting.
Prompting however is not free, even if tokens were. Prompting is work - we have to identify what we want and express it,
then manage the agent so it doesn't create duplicate sources of truth and complex, tangled, parallel abstractions, and
when something doesn't fit what we want, we have to correct the agent, and between all this is lots of waiting and
uncertainty. So the value of a well-integrated well-curated system never goes away.

Sapporta gives agents infrastructure to build within, so they behave predictably. The agent starts with working table
APIs, grids, forms, and row security, and spends its time on the parts specific to your product.

### What kinds of products can I build?

Sapporta suits any web application you want to build with a TypeScript backend and a rich React single-page frontend. It
wires best in class libraries into a pnpm workspace: a package for code shared between frontend and backend, including
ts-rest for typed APIs, and a frontend set up with state management, forms, queries, and UI.

It fits database tools especially well: personal software, internal and operational tools, and vertical SaaS. Examples
include calorie and fitness trackers, personal bookkeeping systems, and home-management databases, as well as internal
tools like CRMs, case trackers, and inspection or audit systems.

These applications need purpose-built workflows, but they also need a flexible way to work with the underlying data.
Sooner or later you will want to correct old entries, investigate a discrepancy, reorganize records, or answer a
question the original interface never anticipated. Sapporta's table grids let you do that with the freedom of a
spreadsheet rather than a static CRUD scaffold. And because the whole system is queryable and scriptable through typed
APIs, agents can work with the same data and workflows your users do.

It gives you less for products whose main content is not relational data, such as forum software, social networks, media
editors, or real-time multiplayer experiences. You can still build those features in the same TypeScript application,
but the generated grids and table APIs will not help much there.

### Can I build customer-facing SaaS applications with it?

Yes, especially vertical SaaS products whose users work with structured, relational data. Sapporta includes
authentication, workspaces, roles, and row-scoped data access. You can treat a workspace as a tenant, and the integrated
CASL bindings let you serve users across tenants with full authentication and authorization boundaries.

Sapporta is currently an early alpha and supports SQLite. That deployment model fits small applications and focused SaaS
products, but check it against the workload you expect. Nothing in the architecture ties the system to SQLite; adding
Postgres, for example, is just effort.

### Can I add custom business logic beyond generated CRUD?

Yes. The generated CRUD is only a starting point. You can add typed contracts in the shared package, Hono handlers and
domain modules in the API, transactions around multi-table changes, and custom React routes in the frontend.

That code sits beside Sapporta's generated routes in a regular TypeScript codebase, and it can use the same
authentication context, row-scoped data helpers, mailer, and typed client conventions.

### How are authentication, permissions, and tenant isolation handled?

Sapporta's built-in conventions cover personal software as well as multi-tenant applications with row-level security and
fine-grained permissions. There are three parts:

**Who is making the request?** Every request to an application or generated API route passes through auth middleware
before its handler runs. The middleware accepts either a browser session managed by Better Auth or an agent access
token, resolves the user's active workspace and membership, and builds the auth context for that request. It attaches
that trusted context to Hono—not to the client-controlled request body—so every handler can read it with
`c.get("auth")`:

```ts
app.use("/api/*", projectAuth.resolveMiddleware);

// Inside any API handler:
const auth = c.get("auth");
```

**What may that person do?** Sapporta builds a CASL ability from the authenticated principal and their workspace roles.
Generated and custom routes check an action and subject before doing the work:

```ts
forbidUnless(c, auth.ability.can("update", "invoices"));
```

**Which records may they do it to?** Every Sapporta table declares a row scope. That scope determines which ownership
columns the table must contain and which SQL predicate Sapporta adds to its queries:

| Row scope                       | Scope columns                       | Rows available to the request                  |
| ------------------------------- | ----------------------------------- | ---------------------------------------------- |
| `systemGlobal`                  | None                                | Application-wide rows                          |
| `workspaceGlobal`               | `workspace_id`                      | Rows in the active workspace                   |
| `workspaceUserScoped` (default) | `workspace_id`, `scoped_to_user_id` | Rows in the active workspace owned by the user |

The server manages the scope columns: Sapporta checks that they exist on the table, hides them from ordinary table
presentation, and does not let API callers set them directly.

Both checks apply together. A workspace member may have permission to update invoices, but that permission does not give
them every invoice in the database. The update goes through only when the CASL ability permits the action **and** the
invoice is inside the member's row scope.

For [generated table routes](/docs/guides/generated-surfaces/generated-table-apis/), Sapporta applies both checks
automatically before a query reaches Drizzle. Lists, lookups, counts, and exports leave out rows beyond the caller's
scope. Reading, updating, or deleting one record returns the same `404 ROW_NOT_FOUND` whether the record does not exist
or exists outside that scope, so the response does not reveal records from another tenant.

Creates are protected in the other direction: a client cannot choose a workspace or owner by submitting a scope field.
Sapporta rejects caller-supplied scope values, derives the correct values from the authenticated request, and checks
that referenced records are visible under the same rules. Tenant ownership therefore comes from trusted server context
rather than a form field, JSON property, or URL parameter.

Custom business logic can use the same boundary. For ordinary table CRUD,
[`scopedRows(db, auth, table)`](/docs/reference/server/row-scoped-data/scoped-crud-and-bounded-reads/) combines typed
Drizzle predicates with row visibility, trusted insert scope, protected scope fields, and reference checks. Workflows
that need joins, transactions, or custom result shapes can use
[a per-table row-security guard](/docs/reference/server/row-scoped-data/table-row-security-guards/) around direct
Drizzle operations instead.

Raw Drizzle queries do not apply any of these rules automatically. A custom route must check its CASL ability and use
Sapporta's scoped data helpers or row-security guards, which keeps the security boundary on the server, where the
authenticated identity, permitted action, and visible rows are evaluated together.

### Is Sapporta a library, framework, or hosted platform?

Sapporta is an open-source TypeScript framework made of installable libraries and project tooling. It initializes a
conventional pnpm workspace, then runs as part of the application you own.

It is not a hosted platform and runs nothing outside your application. It is a framework in the same sense as Rails and
Django, but built with TypeScript using a curated set of libraries, and with more specific conveniences for database
applications and agentic coding.
