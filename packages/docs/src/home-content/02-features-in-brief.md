## In brief

Sapporta is similar to Rails and Django in that when you write
`sapporta init <project-name>`, the created project comes with everything needed
for a web application, set up and wired together.

To make applications that manage relational data full-featured out of the box,
every table you define in a Sapporta project immediately gets two things:

- **Table Grid.** An editable grid for your tables, with filtering, sorting,
  searching, exporting, nesting, and keyboard navigation. The grid uses the
  table APIs and therefore inherits their authorization and permissions.

- **Table APIs.** List, get, create, update, delete, lookup, count, and CSV
  export for every registered table. These APIs are secured with row-level
  security and role-based permissions defined with CASL. They are exposed thru <code>/api/openapi.json</code> for agentic operation.

Sapporta also provides a Reporting framework, and auto-generated edit and create forms for every row. It  also comes with a `Dockerfile` for easy production deployment.

### Table Metadata

All the above features are produced from the Drizzle schema along with some Sapporta-specific metadata:

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
    rowScope: "systemGlobal",
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
