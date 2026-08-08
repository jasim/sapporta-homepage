## Sapporta projects are regular applications

When you create a new Sapporta project by running `sapporta init <project-name>`
you get a complete, pre-wired project out of the box — API server, React
frontend, auth, migrations, and a production Dockerfile, all set up and
connected.

Sapporta projects are regular TypeScript applications - you can add typed API
endpoints, React screens, and build everything you need without constraints.

**With a sprinkling of declarativeness.** The `sapportaTable` declaration is the only declarative configuration in a
Sapporta application.

See the table declaration code here:

```ts
// packages/api/schema/books.ts

// Regular table schema defined in Drizzle
export const booksTable = sqliteTable("books", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  author: text("author").notNull(),
});

// Declarative configuration for Sapporta
// auto-generated table APIs and data grids
export const books = sapportaTable({
  drizzle: booksTable,
  meta: {
    label: "Books",
    rowScope: "workspaceUserScoped",
    rowLabelColumns: ["title"],
    children: [
      {
        table: "quotes",
        foreignKey: "book_id",
        label: "Quotes",
        columns: ["quote_text"],
        defaultSort: "-created_at",
      },
    ],
    columns: {
      title: { width: 64 },
      author: { width: 36 },
    },
  },
});
```

<div class="pt-6"></div>

This single declaration gives every table two connected surfaces:

- **Table APIs.** Sapporta generates list, get, create, update, delete, lookup,
  count, and CSV export endpoints, then publishes them to `/api/openapi.json`
  for agentic use. Row-level security from `rowScope` and role-based permissions
  defined with CASL secure every call, so the APIs can be safely published on
  the internet.
- **Table Grid.** Sapporta publishes `/api/meta/tables`, which the React
  frontend uses to build editable grids, create forms, lookups, and nested
  child-table views. The grids include filtering, sorting, searching,
  exporting, nesting, and keyboard navigation. Because they use the table APIs,
  they inherit the same authorization and permissions.
