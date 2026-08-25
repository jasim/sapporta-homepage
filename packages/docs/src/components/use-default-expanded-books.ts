import { useEffect } from "react";
import type { SchemaTableRowsByLevel, TGridSession } from "@sapporta/frontend";

// The demo opens with these books expanded so the first screen already shows
// that a book row carries quotes, and that the other rows do too.
const defaultExpandedBookTitles = ["The World as I See It", "From Mathematics to Generic Programming"];

// TGrid has no declarative initial expansion, so the demo expands its opening
// rows through the level runtime once the first page of books is displayed.
export function useDefaultExpandedBooks(session: TGridSession<SchemaTableRowsByLevel> | null): void {
  useEffect(() => {
    if (!session) return;

    const root = session.runtime.root;
    // Runs at most once per session: a reader who collapses one of these rows
    // keeps it collapsed through later sorts, searches, and page changes.
    const expandOpeningRows = () => {
      const rows = root.displayedRows().rows;
      if (rows.length === 0) return false;

      for (const row of rows) {
        if (row.kind !== "data") continue;
        if (!defaultExpandedBookTitles.includes(String(row.columns.title))) continue;
        if (!root.isExpanded(row.id)) root.expand(row.id);
      }

      return true;
    };

    if (expandOpeningRows()) return;

    const unsubscribe = root.subscribeDisplayedRowSequence(() => {
      if (expandOpeningRows()) unsubscribe();
    });
    // Cover the first page arriving between the check above and the
    // subscription. Unsubscribes are idempotent, so this cleanup is safe.
    if (expandOpeningRows()) unsubscribe();
    return unsubscribe;
  }, [session]);
}
