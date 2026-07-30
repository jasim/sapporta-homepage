## Sapporta projects are regular applications

Sapporta projects are regular codebases that you fully own. Sapporta tries to be
a small toolkit with many composable helpers that plugs into an otherwise
conventional web application.

### With a sprinkling of declarativeness

The `sapportaTable` declaration is the only declarative configuration in a
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

This declaration is used by Sapporta to:

- Generate the list, get, create, update, delete, lookup, count, and CSV export
  endpoints for each table.
- Derive the Zod request and response schemas for those endpoints and publish
  their table-specific contracts at `/api/openapi.json`.
- Apply write rules and the declared `rowScope` on the server, including
  supplying trusted workspace and user scope values.
- Publish a browser-safe table model at `/api/meta/tables`, which the React
  frontend uses to build editable grids, create forms, lookups, and nested
  child-table views.

As you can see, this declarative configuration is what makes Sapporta truly
useful for rapidly building database applications.

I've found that coding agents routinely read the Sapporta library code, and
understands the configuration and its runtime implications quite well. Unlike
more complex multi-knob declarative systems (like say Kubernetes), the
configuration here maps in a straightforward manner to their runtime, and is
thus amenable to better understanding and control.
