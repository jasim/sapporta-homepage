## Features in brief

Sapporta is similar to Rails and Django in that when you write
`sapporta init <project-name>`, the created project comes with everything needed
for a web application, set up and wired together. Since this is Node.js, we use
Hono for the web server and Drizzle for the ORM. The only database currently
supported is SQLite.

![A work dashboard with project health summaries and an urgent tasks grid](/assets/home/exercise-workflow/dashboard.png "A dashboard combines summaries, reports, and live application data.")

![A form for creating a task with project, priority, and due date fields](/assets/home/exercise-workflow/new-task-form.png "Schema metadata supplies typed create and edit forms.")

To make applications that manage relational data full-featured out of the box,
every table you define in a Sapporta project immediately gets two things:

- **Table APIs.** List, get, create, update, delete, lookup, count, and CSV
  export for every registered table. These APIs are secured with row-level
  security and role-based permissions.
- **A table grid.** An editable grid for your tables, with filtering, sorting,
  searching, exporting, nesting, and keyboard navigation. The grid uses the
  table APIs and therefore inherits their authorization and permissions.

Reports, forms, typed custom endpoints are part of the same integrated stack. It
also comes with a `Dockerfile` for easy production deployment.
