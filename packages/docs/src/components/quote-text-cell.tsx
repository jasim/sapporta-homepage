import { useCallback, useLayoutEffect, useState, useSyncExternalStore } from "react";
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
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const clipped = useIsClipped(node, `${expanded}:${String(value ?? "")}`);

  return (
    <div
      ref={setNode}
      data-quote-book={quote?.bookRowKey}
      data-quote-row={quote?.quoteRowKey}
      // The fade that marks an unread tail is painted from this flag rather
      // than from the clamp alone: a quote that already fits must not advertise
      // text it does not have.
      data-quote-clipped={!expanded && clipped ? "true" : undefined}
      className={[
        quoteTextBaseClassName,
        // The collapsed height is a whole number of quote lines, so it is
        // measured from the type in the stylesheet rather than set here.
        expanded ? "max-h-none overflow-visible whitespace-pre-wrap" : "homepage-quote-grid-text--clamped",
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
  return node ? nodeIsClipped(node) : true;
}

function nodeIsClipped(node: HTMLElement): boolean {
  return node.scrollHeight > node.clientHeight;
}

// The same measurement, kept live for the cell that owns the node. A clipped
// cell is pinned at its max height, so its own box stops reporting content
// changes; the observer still fires on the column resizes and font swaps that
// decide where the text wraps, which is what changes the answer in practice.
function useIsClipped(node: HTMLElement | null, revision: string): boolean {
  const [clipped, setClipped] = useState(false);
  const measure = useCallback(() => {
    if (node) setClipped(nodeIsClipped(node));
  }, [node]);

  useLayoutEffect(() => {
    measure();
  }, [measure, revision]);

  useLayoutEffect(() => {
    if (!node) return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [measure, node]);

  return clipped;
}
