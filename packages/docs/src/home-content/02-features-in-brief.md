Applications built with Sapporta offer full agentic access without insecure
exposure. `/api/openapi.json` exposes every registered endpoint and table
operation, giving agents complete, contract-accurate access to all APIs and
tables. Row-level security and CASL authorization enforce scope on every call.

The library, code generator, skills, and docs are tuned together for agentic
development, so you can prompt domain requirements and agents will build them
with a good user interface, secure data access, and well-factored modules.

Sapporta projects are regular TypeScript applications - you can add typed API
endpoints, React screens, and build everything you need without constraints.

## At a glance

When you create a new Sapporta project by running `sapporta init <project-name>`
you get a complete, pre-wired project out of the box — API server, React
frontend, auth, migrations, and a production Dockerfile, all set up and
connected.

Every table you define gets two things:

- **Table Grid.** An editable grid for your tables, with filtering, sorting,
  searching, exporting, nesting, and keyboard navigation. The grid uses the
  table APIs and therefore inherits their authorization and permissions.

- **Table APIs.** List, get, create, update, delete, lookup, count, and CSV
  export for every registered table. These APIs are secured with row-level
  security and role-based permissions defined with CASL. They are exposed
  thru <code>/api/openapi.json</code> for agentic operation.

Sapporta also provides a light-weight reporting system, and forms for editing
and creating rows.
