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

Sapporta is a TypeScript + SQLite framework where the data layer is generated
from schema declarations, so agents spend their turns on your business logic
instead of plumbing.

- **One declaration, the full surface.** Declare a `sapportaTable` and its
  grid, forms, reports, and row-secured APIs exist. The next table you add
  gets all of it without an extra prompt.
- **Shared behavior written once.** Filtering, sorting, search, export, and
  foreign-key lookups are implemented in the framework and used by every
  screen — nothing to re-prompt, re-check, or re-fix table by table.
- **Security built in, not prompted in.** Every generated API enforces
  row-level security and the contracts are typed, so agent-written code is
  safe for public deployment.
- **A grid comfortable enough for a full day's work.** Arrow-key navigation,
  composed filters, export, and opening a related record from a cell all come
  with the declaration.
- **Reports with drill-down** into the underlying records.
- **A codebase you can read and own.** Plain Hono + React + SQLite, with
  skills and docs tuned so agents work directly with the running application.

### Why a framework instead of more prompting

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
differently, filtering exists only on the tables you happened to ask about,
and row checks exist only where someone remembered to prompt for them.

Sapporta is that shared layer, declared once and used by every table. Your
attention goes back to your own work — the workflows of your clinic CRM, your
inspection tracker, your vertical SaaS — instead of another round of
describing and fixing plumbing.
