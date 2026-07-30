## Frequently asked questions

### Why use Sapporta instead of asking an LLM to generate the whole application?

A coding agent can generate a form or endpoint quickly. But to ensure a consistent application of authorization and
validation, and to build out the rich user experience like the data grid with pagination, filtering, and sorting, and
exposing agentic capabilities that are permission-aware - all of these require a significant amount of prompting.
Prompting however is not free, even if tokens were. Prompting is work - we have to identify what we want and express it,
then manage the agent so it doesn't create duplicate sources of truth and complex, tangled, parallel abstractions, and
when something doesn't fit what we want, we have to correct the agent, and between all this is lots of waiting and
uncertainty. So the value of a well-integrated well-curated system never goes away.

Sapporta helps agentic development because it provides a robust infrastructure within which the agents can build in a
predictable manner. It gets working table APIs, grids, forms, and row security, then spends its time on the
domain-specific parts of the product.

### Is Sapporta only for internal tools?

No. Internal and operational tools are a natural fit because Sapporta gives every table an editable grid, forms, and
permission-aware APIs. But those are building blocks, not a constrained design space.You can keep the generated screens
where they are useful and add customer-facing React routes and workflows, without any constraints. Sapporta is a great
fit for any web application that you want to build with a TypeScript backend and rich React single-page applications. It
wires best in class libraries into a pnpm workspace: a package for shared code between front-end and back-end code,
which includes ts-rest for typed APIs, and a front-end setup with state management, forms, queries, and UI.

### Can I build customer-facing SaaS applications with it?

Yes, especially vertical SaaS products whose users work with structured, relational data. Sapporta includes
authentication, workspaces, roles, and row-scoped data access. A workspace in a Sapporta project can be treated as a
Tenant, and the integrated CASL bindings can let you serve serve different users across tenants with full authentication
and authorization boundaries.

Sapporta is currently an early alpha and supports SQLite. That makes the deployment model a good fit for small
applications and focused SaaS products, but it is a constraint to evaluate against your expected workload. However there
is nothing inherent about the architecture that binds the system to SQLite; adding Postgres, for example, is just
effort.

### What kinds of products can I build?

Sapporta works well for products built around records and relationships: inventory and asset systems, CRMs, project and
case tracking, approval workflows, field-service software, personal databases, and vertical SaaS applications.

It is less opinionated about products whose main surface is not relational data, such as forum software, social
networks, media editors or real-time multiplayer experiences. You can still build those features in the same TypeScript
application, but the generated grids and table APIs will provide less leverage there.

### How does Sapporta work with Claude, Codex, and other coding agents?

Sapporta is not tied to one model or agent. Claude, Codex, and other agents that can work in a repository and follow the [Sapporta skill](https://github.com/jasim/sapporta-skills) to learn the framework's project
structure and workflow.

The skill has guidance on building data-oriented applications - like how to ensure a great search experience in a
domain-aware manner, where to use nested data-grids, and how to setup master-detail forms, and so on.

And for running applications - locally in development, or hosted as a public SaaS, the agent can discover the exact API
surface at `/api/openapi.json` or through the project-local Sapporta CLI. That gives it real contracts and table
metadata instead of asking it to guess routes or JSON shapes. It also lets users generate agent tokens that can securely
represent the user's authorizations to the agent.

### Can I add custom business logic beyond generated CRUD?

Yes. Generated CRUD is only a starting surface. You can add typed contracts in the shared
package, Hono handlers and domain modules in the API, transactions around multi-table changes, and custom React routes
in the frontend.

Those custom features live beside Sapporta's generated routes in a regular TypeScript codebase. They can also use the
same authentication context, row-scoped data helpers, mailer, and typed client conventions.

### How are authentication, permissions, and tenant isolation handled?

Better Auth handles identities, sessions, and organizations. CASL abilities decide which actions a principal may
perform. Sapporta's row scopes separately decide which application-wide, workspace, or user-owned rows that action may
read or change.

On [generated table routes](/docs/guides/generated-surfaces/generated-table-apis/), Sapporta checks the table action and
adds the request's row predicate before it touches Drizzle. Lists, lookups, counts, and exports omit rows outside that
scope. A single-row read, update, or delete returns the same `404 ROW_NOT_FOUND` for an absent ID and an ID the caller
cannot see. Creates reject caller-supplied `workspace_id` / `workspaceId` and `scoped_to_user_id` / `scopedToUserId`,
stamp the applicable values from authenticated request authority, and verify that referenced rows are visible too.

For ordinary custom table work, [`scopedRows(db, auth, table)`](/docs/reference/server/row-scoped-data-helpers/) keeps
those row and write rules while accepting typed Drizzle predicates. The route still checks its own ability;
`scopedRows()` handles row visibility, managed-field rejection, reference validation, trusted insert scope, and
immutable update and delete behavior.

When a workflow needs joins, transactions, or a custom result shape, use
[a per-table guard](/docs/guides/security/row-safe-custom-endpoints-and-reports/):
`auth.rowSecurity.forTable(table).ownedRows(domainPredicate)` composes the request's row predicate into each direct
Drizzle select, update, or delete. `insertValues()` rejects caller-supplied scope fields and server-only references,
merges trusted `serverValues`, validates reference visibility, and stamps trusted scope before the insert;
`patchValues()` validates caller fields and references without rewriting scope. Both return prepared values for Drizzle
to persist. Raw Drizzle applies none of these rules on its own, so the route's ability check and guard calls are the
boundary—not a hidden field, URL parameter, or client-supplied workspace ID.

### Is Sapporta a library, framework, or hosted platform?

Sapporta is an open-source TypeScript framework made of installable libraries and project tooling. It initializes a
conventional pnpm workspace, then runs as part of the application you own.

It is not a hosted platform or external control plane. It is a framework just like Rails and Django, but built with
TypeScript assembling best in class libraries, and providing more specific conveniences for database applications and
agentic coding.
