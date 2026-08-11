import type { QuoteRef } from "./quote-deep-link";
import type { QuoteExpansionStore } from "./use-quote-expansion";

// Level id shared by the grid definition and the custom quote cells.
export const quotesLevelName = "books.quotes";

// The TGrid definition is built once (a new definition would restart the grid
// session), so its activation callbacks cannot close over render-time state.
// Instead the grid resolves `appServices` live on every interaction, which is
// where the definition and the custom cells find everything that changes.
export type BooksGridServices = {
  quoteExpansion: QuoteExpansionStore;
  openQuoteDialog: (quote: QuoteRef) => void;
};
