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
