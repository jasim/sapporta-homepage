## Sapporta projects are regular applications

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

This declaration is used by Sapporta to:

- Generate the list, get, create, update, delete, lookup, count, and CSV export
  endpoints for each table.
- Publish them to `/api/openapi.json` for agentic use
- Secure them with based on `rowScope`, so that the API can be safely published on the internet
- Publish `/api/meta/tables`, which the React
  frontend uses to build editable grids, create forms, lookups, and nested
  child-table views.

