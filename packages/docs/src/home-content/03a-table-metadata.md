## A little metadata at the integration point

However, I couldn't fully be rid of declarativeness. If you have ideas on how we can decompose this further, kindly pen an email to me post-haste.

In Sapporta we add a bit of declarative table metadata, that informs how the Table APIs and data grids work. It is attached to the Drizzle table definition:

```ts
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
    rowScope: "systemGlobal",
    rowLabelColumns: ["title"],
    search: { columns: ["author", "title"] },
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

The example schema defines a `books` SQLite table. It has an automatically
incremented integer primary key named `id`, a required text field named `title`,
and a required text field named `author`. The Sapporta metadata labels the table
“Books,” assigns system-wide row scope, uses `title` as the row label, and
enables search over `author` and `title`. It defines `quotes` as a child table
through `book_id`, displays `quote_text`, and sorts quotes by descending
`created_at`. The title column has a width of 64 and the author column has a
width of 36.

This metadata produces the books grid, forms, REST routes, search behavior,
column widths, row labels, child records, and OpenAPI information. The schema
lives at `packages/api/schema/books.ts`. Application-specific contracts,
handlers, services, and screens remain TypeScript files in a Hono API and React
application.
