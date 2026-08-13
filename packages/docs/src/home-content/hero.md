---
page:
  language: en
  title: Sapporta — TypeScript framework for database applications
  description:
    Sapporta is a TypeScript and SQLite framework for building small database
    applications with generated APIs, editable grids, forms, reports, and
    row-scoped authorization.
  skipLabel: Skip to content
brand:
  label: Sapporta
  href: /
navigation:
  label: Main navigation
  links:
    - label: Screenshots
      href: "#screenshots"
    - label: Documentation
      href: /docs/getting-started/introduction/
    - label: GitHub
      href: https://github.com/jasim/sapporta
---

## Make coding agents good at database applications

Sapporta provides an ERP-grade foundation for your software.

When you use AI to write code for database applications, you often get inconsistent implementations of common patterns across different parts of your app. Sapporta solves this by providing a framework where data-related functionality is generated consistently from schema declarations.

Coding agents often fail to establish consistent, reusable infrastructure across the codebase.

- Repetitive prompting for basic functionality
- Inconsistent implementations of similar features
- Security vulnerabilities in generated code
- Constant correction of plumbing rather than business logic

Sapporta solves this by providing a unified framework where:

- Tables declared once automatically get grids, forms, reports, and secure APIs
- Shared behaviors (filtering, sorting, exports) are implemented centrally
- Security is built into the foundation - both in the framework and agent skills
- The entire stack (Hono + React + SQLite) is transparent and maintainable

Sapporta provides a thoughtful integration between rapid development using AI and professional software development practices.


Agents produce screens quickly, but they do not build the shared layer
underneath: one grid that filters and sorts, APIs that secure their own rows,
forms that follow the schema.

Ask for a filter on a list of tickets and the agent writes conditions for the
fields you named — then it handles equals but not contains, and breaks when
two conditions meet. Fixing it takes turns of specifying, checking,
correcting, and waiting. Someone still has to build the UI that shows the
filter is active, and clears it.

Then you want the same on invoices, and the logic repeats. The agent will not
stop and say filtering is a general idea; that kind of generalization exists
only in systems designed around it. Prompting feature by feature never
arrives at a shared architecture — each generated screen filters a little
differently, and filtering exists only on the tables you happened to ask
about.

Sapporta is that shared layer, declared once and used by every table.

It gives you:

- **Every table fully equipped from one declaration.** Declare a
  `sapportaTable` and its grid, forms, reports, and row-secured APIs already
  exist, so the next table you add gets all of it without a single extra
  prompt.
- **Shared behavior written once.** Filtering, sorting, search, export, and
  foreign-key lookups are implemented once and shared by every screen, so you
  never re-prompt, re-check, and re-fix them table by table.
- **A grid comfortable enough for a full day's work.** Arrow-key navigation,
  composed filters, export, and opening a related record from a cell all come
  with the declaration; asking an agent to "build a table screen" does not
  produce this.
- **Reports with drill-down** into the underlying records.
- **Security built in, not prompted in.** Every generated API enforces
  row-level security and the contracts are typed, so agent-written code is
  safe for public deployment instead of being one more thing to remember.
- **Built for agentic development** — skills, docs, backend, and frontend are
  tuned together, so agents can work directly with the running application.
- **A codebase you can read and own** — plain Hono + React + SQLite.
- **Your attention back on your own work** — the workflows of your clinic CRM,
  your inspection tracker, or your vertical SaaS, rather than another round of
  describing and fixing plumbing.
