import { trailingEdge, type GridPath } from "@sapporta/grid";

const quoteBookParam = "quoteBook";
const quoteRowParam = "quoteRow";

// A quote is identified by its parent book row and its own row key. This is
// exactly what the deep-link URL carries, so the URL needs no translation.
export type QuoteRef = {
  bookRowKey: string;
  quoteRowKey: string;
};

// The quote behind a quotes-level row: the parent book row key comes from the
// grid path, the quote row key from the row itself.
export function quoteAt(path: GridPath, quoteRowKey: unknown): QuoteRef | null {
  const edge = trailingEdge(path);
  if (!edge) return null;
  return { bookRowKey: String(edge.parentRowKey), quoteRowKey: String(quoteRowKey) };
}

export function sameQuote(a: QuoteRef | null, b: QuoteRef | null) {
  return a !== null && b !== null && a.bookRowKey === b.bookRowKey && a.quoteRowKey === b.quoteRowKey;
}

export function quoteDeepLinkFromUrl(searchParams: URLSearchParams): QuoteRef | null {
  const bookRowKey = searchParams.get(quoteBookParam);
  const quoteRowKey = searchParams.get(quoteRowParam);
  return bookRowKey && quoteRowKey ? { bookRowKey, quoteRowKey } : null;
}

// The demo route URL with the quote deep link set (or cleared with `null`),
// preserving any other parameters such as grid query state.
export function quoteDialogUrl(searchParams: URLSearchParams, quote: QuoteRef | null): string {
  const params = new URLSearchParams(searchParams);
  if (quote) {
    params.set(quoteBookParam, quote.bookRowKey);
    params.set(quoteRowParam, quote.quoteRowKey);
  } else {
    params.delete(quoteBookParam);
    params.delete(quoteRowParam);
  }
  const queryString = params.toString();
  return `/${queryString ? `?${queryString}` : ""}`;
}
