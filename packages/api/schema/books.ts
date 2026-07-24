import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { sapportaTable, text, timestamp } from "@sapporta/server/table";
import { Temporal } from "@sapporta/shared/temporal";

export const booksTable = sqliteTable("books", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  author: text("author").notNull(),
  created_at: timestamp("created_at")
    .$defaultFn(() => Temporal.Now.instant())
    .notNull(),
  updated_at: timestamp("updated_at")
    .$defaultFn(() => Temporal.Now.instant())
    .notNull(),
});

export const books = sapportaTable({
  drizzle: booksTable,
  meta: {
    label: "Books",
    rowScope: "systemGlobal",
    rowLabelColumns: ["title"],
    search: { self: "allColumns", children: { quotes: "allColumns" } },
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

export default books;
