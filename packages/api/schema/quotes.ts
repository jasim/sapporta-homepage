import { index, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { sapportaTable, text, timestamp } from "@sapporta/server/table";
import { Temporal } from "@sapporta/shared/temporal";
import { booksTable } from "./books.js";

export const quotesTable = sqliteTable(
  "quotes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    book_id: integer("book_id")
      .notNull()
      .references(() => booksTable.id, { onDelete: "cascade" }),
    quote_text: text("quote_text").notNull(),
    created_at: timestamp("created_at")
      .$defaultFn(() => Temporal.Now.instant())
      .notNull(),
    updated_at: timestamp("updated_at")
      .$defaultFn(() => Temporal.Now.instant())
      .notNull(),
  },
  (t) => [index("quotes_book_id_idx").on(t.book_id)],
);

export const quotes = sapportaTable({
  drizzle: quotesTable,
  meta: {
    label: "Quotes",
    rowScope: "systemGlobal",
    rowLabelColumns: ["quote_text"],
    columns: {
      book_id: { label: "Book", width: 18 },
      quote_text: {
        label: "Quote",
        minWidth: 32,
        maxWidth: 100,
        textDisplay: "multiLine",
      },
    },
  },
});

export default quotes;
