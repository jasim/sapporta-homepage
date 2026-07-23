## A regular application you own

I wanted to avoid declarative configurations as much as possible.
[Descriptive declarativeness is magic](https://medium.com/@jasim_ab/declarative-programming-and-magic-part-i-885d21deaa79);
it creates a conceptual gap between the static program and dynamic process,
and constrains what we can do, because we're no longer writing direct code.

So Sapporta is not an opaque, fully declarative framework. There is no
inversion of control. Sapporta projects are regular codebases that you fully
own. Sapporta provides a small toolkit with many composable helpers that
plugs into a conventional web application. On the front-end it uses
shadcn+BaseUI, TanStack Form, and TanStack Query. It uses Hono on the
back-end, ts-rest, and Drizzle with SQLite.

![A project detail page with status metrics and its related tasks grid](/assets/home/exercise-workflow/project-detail.png "Related records stay in context on project detail pages.")

However, I couldn't fully be rid of declarativeness. If you have ideas on how we can decompose this further, please write to me immediately. 

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

Tables use Drizzle. Migrations are generated as SQL. The project expects the SQL
to be reviewed, committed, and applied explicitly. The SQLite database is stored
in one file that can be backed up, moved, and inspected. The application runs as
a regular Node.js process.

Table metadata controls grids, forms, REST routes, and OpenAPI output. Generated
routes enforce row visibility and abilities. Custom routes select access rules
at the API boundary. Browser filters and hidden columns do not provide server
authorization. Shared ts-rest contracts validate requests, type handlers,
generate OpenAPI, and create browser clients. The project separates shared
contracts, route adapters, domain services, database stores, and React views.

APIs don't require manual JSON wiring for request and response parsing. Both the
auto-generated APIs and any domain APIs you write are defined using ts-rest. The
definitions go into `packages/shared` and are immediately available in the front
end as typed functions.
