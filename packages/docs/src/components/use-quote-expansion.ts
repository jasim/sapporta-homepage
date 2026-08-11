import { useMemo } from "react";
import { sameQuote, type QuoteRef } from "./quote-deep-link";

// Which quote is currently expanded inline. This is a tiny external store
// rather than React state because the stable activation callback must read it
// synchronously, while quote cells subscribe to it to re-render.
export type QuoteExpansionStore = {
  get(): QuoteRef | null;
  set(quote: QuoteRef | null): void;
  subscribe(listener: () => void): () => void;
};

export function useQuoteExpansion(): QuoteExpansionStore {
  return useMemo(createQuoteExpansion, []);
}

function createQuoteExpansion(): QuoteExpansionStore {
  let expanded: QuoteRef | null = null;
  const listeners = new Set<() => void>();
  return {
    get: () => expanded,
    set(quote) {
      if (sameQuote(expanded, quote)) return;
      expanded = quote;
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
