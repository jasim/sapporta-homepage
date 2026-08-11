/**
 * Demo-data reset endpoint.
 *
 * POST /api/demo-reset wipes the books and quotes tables and reloads them
 * wholesale from `original.db`, a pristine snapshot kept in the same folder as
 * the live database file. A scheduled job calls this every few minutes so the
 * public demo recovers from visitor edits without restarting the server.
 *
 * The copy runs over SQLite ATTACH inside one immediate transaction on the
 * server's own connection, so row IDs survive verbatim and readers only ever
 * see either the old or the fully restored data.
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  ActionError,
  forbidUnless,
  TsRestApi,
  type SapportaEnv,
} from "@sapporta/server";
import { demoResetContract } from "sapporta-homepage-app-shared";

const api = new TsRestApi<SapportaEnv>();

api.register("demoReset", demoResetContract.demoReset, ({ c }) => {
  const auth = c.get("auth");
  forbidUnless(c, auth.ability.can("run", "demo_reset"));

  const sqlite = c.get("sqlite");
  const originalPath = join(dirname(sqlite.name), "original.db");
  if (!existsSync(originalPath)) {
    throw new ActionError(
      `Demo snapshot not found at ${originalPath}`,
      "demo_snapshot_missing",
    );
  }

  sqlite.prepare("ATTACH DATABASE ? AS original").run(originalPath);
  try {
    const restore = sqlite.transaction(() => {
      // Children first so the wipe never trips the quotes -> books FK.
      sqlite.prepare("DELETE FROM main.quotes").run();
      sqlite.prepare("DELETE FROM main.books").run();

      sqlite
        .prepare(
          `INSERT INTO main.books (id, title, author, created_at, updated_at)
           SELECT id, title, author, created_at, updated_at
           FROM original.books`,
        )
        .run();
      sqlite
        .prepare(
          `INSERT INTO main.quotes (id, book_id, quote_text, created_at, updated_at)
           SELECT id, book_id, quote_text, created_at, updated_at
           FROM original.quotes`,
        )
        .run();

      // AUTOINCREMENT counters only ever grow, so graffiti inserts would leave
      // future IDs continuing from the vandalized high-water mark. Rebase the
      // counters onto the restored data instead.
      sqlite
        .prepare("DELETE FROM sqlite_sequence WHERE name IN ('books', 'quotes')")
        .run();
      sqlite
        .prepare(
          `INSERT INTO sqlite_sequence (name, seq)
           SELECT 'books', COALESCE(MAX(id), 0) FROM main.books
           UNION ALL
           SELECT 'quotes', COALESCE(MAX(id), 0) FROM main.quotes`,
        )
        .run();

      const count = (table: "books" | "quotes") =>
        (
          sqlite
            .prepare(`SELECT COUNT(*) AS n FROM main.${table}`)
            .get() as { n: number }
        ).n;
      return { books: count("books"), quotes: count("quotes") };
    });

    const body = restore.immediate();
    return { status: 200 as const, body };
  } finally {
    sqlite.exec("DETACH DATABASE original");
  }
});

export default api;
