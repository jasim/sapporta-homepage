## Frequently asked questions

### Is Sapporta only for internal tools?

No. Internal and operational tools are a natural fit because Sapporta gives every table an editable grid, forms, and
permission-aware APIs. But those are building blocks, not a boundary around the application. You can keep the generated
screens where they work and add customer-facing React routes and workflows where the product needs its own experience.

### Can I build customer-facing SaaS applications with it?

Yes, especially vertical SaaS products whose users work with structured, relational data. Sapporta includes
authentication, workspaces, roles, and row-scoped data access, so the same project can serve multiple tenants without
trusting the browser to choose its own workspace.

Sapporta is currently an early alpha and supports SQLite. That makes the deployment model a good fit for small
applications and focused SaaS products, but it is a constraint to evaluate against your expected workload.

### What kinds of products can I build?

Sapporta works well for products built around records and relationships: inventory and asset systems, CRMs, project and
case tracking, approval workflows, field-service software, personal databases, and vertical SaaS applications.

It is less opinionated about products whose main surface is not relational data, such as media editors or real-time
multiplayer experiences. You can still build those features in the same TypeScript application, but the generated grids
and table APIs will provide less leverage there.

### Why use Sapporta instead of asking an LLM to generate the whole application?

A coding agent can generate a form or endpoint quickly. The harder part is keeping authorization, validation,
pagination, filtering, migrations, API contracts, and browser state consistent as the application changes.

Sapporta makes those behaviors reusable runtime infrastructure. Your agent starts with working table APIs, grids, forms,
and row security, then spends its time on the domain-specific parts of the product. You still review ordinary TypeScript
code and tests rather than depending on a one-time pile of generated boilerplate.

### How does Sapporta work with Claude, Codex, and other coding agents?

Sapporta is not tied to one model or agent. Claude, Codex, and other agents that can work in a repository and follow an
Agent Skill can use the [Sapporta skill](https://github.com/jasim/sapporta-skills) to learn the framework's project
structure and workflow.

Inside a running application, the agent can discover the exact API surface at `/api/openapi.json` or through the
project-local Sapporta CLI. That gives it real contracts and table metadata instead of asking it to guess routes or JSON
shapes.

### How does an agent install and use the Sapporta skill?

Have the agent run:

```bash
npx skills add https://github.com/jasim/sapporta-skills --skill sapporta --global --yes
```

Then open the agent at the project root and ask it to load and follow the Sapporta skill before describing the
application or change you want. The skill guides project setup, data modelling, implementation, migrations, and
verification. For live data work, you can also give the agent a workspace-scoped access token from the application.

### Can I add custom business logic beyond generated CRUD?

Yes. Generated CRUD is the starting surface, not the application boundary. You can add typed contracts in the shared
package, Hono handlers and domain modules in the API, transactions around multi-table changes, and custom React routes
in the frontend.

Those custom features live beside Sapporta's generated routes in a regular TypeScript codebase. They can also use the
same authentication context, row-scoped data helpers, mailer, and typed client conventions.

### How are authentication, permissions, and tenant isolation handled?

Better Auth handles identities, sessions, and organizations. CASL abilities decide which actions a principal may
perform. Sapporta's row scopes separately decide which application-wide, workspace, or user-owned rows that action may
read or change.

Generated table endpoints apply both layers on the server and stamp trusted workspace and user values during writes.
Custom routes opt into the same model through row-scoped helpers; a hidden field, URL parameter, or client-supplied
workspace ID never grants authority by itself.

### Is Sapporta a library, framework, or hosted platform?

Sapporta is an open-source TypeScript framework made of installable libraries and project tooling. It initializes a
conventional pnpm workspace, then runs as part of the application you own.

It is not a hosted platform or external control plane. You keep the source, SQLite database, migrations, frontend, API,
and deployment configuration, and you choose where to run them.
