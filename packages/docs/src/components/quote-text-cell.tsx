import { useSyncExternalStore } from "react";
import { useTGridCell, type SchemaTableRowsByLevel } from "@sapporta/frontend";
import { quotesLevelName, type BooksGridServices } from "./books-grid-shared";
import { quoteAt, sameQuote, type QuoteRef } from "./quote-deep-link";

export const quoteTextBaseClassName = "homepage-quote-cell homepage-quote-grid-text";

export function QuoteTextCell() {
  const { level, row, value, appServices } = useTGridCell<
    SchemaTableRowsByLevel,
    BooksGridServices,
    typeof quotesLevelName
  >(quotesLevelName);
  const quote = quoteAt(level.path, row.id);
  const { quoteExpansion } = appServices;
  const expanded = useSyncExternalStore(
    quoteExpansion.subscribe,
    () => quote !== null && sameQuote(quoteExpansion.get(), quote),
    () => false,
  );

  return (
    <div
      data-quote-book={quote?.bookRowKey}
      data-quote-row={quote?.quoteRowKey}
      className={[
        quoteTextBaseClassName,
        expanded ? "max-h-none overflow-visible whitespace-pre-wrap" : "max-h-48 overflow-hidden",
      ].join(" ")}
    >
      {String(value ?? "")}
    </div>
  );
}

// Overflow is a rendered-layout fact (column width, wrapping, zoom, and fonts
// all affect it), so measure the rendered cell at the moment Enter is pressed.
// A cell that cannot be found is treated as clipped, so Enter expands rather
// than edits.
export function quoteTextIsClipped(quote: QuoteRef): boolean {
  const node = document.querySelector<HTMLElement>(
    `[data-quote-book="${CSS.escape(quote.bookRowKey)}"][data-quote-row="${CSS.escape(quote.quoteRowKey)}"]`,
  );
  return node ? node.scrollHeight > node.clientHeight : true;
}
