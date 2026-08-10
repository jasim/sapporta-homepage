import { useEffect } from "react";
import { makeRowId } from "@sapporta/grid";
import { controllerFor } from "@sapporta/grid/advanced";
import type { SchemaTableRowsByLevel, TGridSession } from "@sapporta/frontend";
import { quoteDeepLinkFromUrl } from "./quote-deep-link";

// Visiting a quote deep link expands and reveals the linked book row. The
// row may not be displayed yet, so retry as the displayed sequence changes.
export function useQuoteDeepLink(
  session: TGridSession<SchemaTableRowsByLevel> | null,
  searchParams: URLSearchParams,
): void {
  const linkedBookRowKey = quoteDeepLinkFromUrl(searchParams)?.bookRowKey ?? null;

  useEffect(() => {
    if (!session || linkedBookRowKey === null) return;

    const { runtime } = session;
    const root = runtime.root;
    const rowId = makeRowId(root.path, linkedBookRowKey);
    const expandAndReveal = () => {
      if (root.displayedRow(rowId) === undefined) return false;
      if (!root.isExpanded(rowId)) root.expand(rowId);
      controllerFor(runtime, root.path).revealRow(rowId);
      return true;
    };

    if (expandAndReveal()) return;

    const unsubscribe = root.subscribeDisplayedRowSequence(() => {
      if (expandAndReveal()) unsubscribe();
    });
    // Cover the row arriving between the first check and the subscription.
    // Unsubscribes are idempotent, so the cleanup below is always safe.
    if (expandAndReveal()) unsubscribe();
    return unsubscribe;
  }, [session, linkedBookRowKey]);
}
