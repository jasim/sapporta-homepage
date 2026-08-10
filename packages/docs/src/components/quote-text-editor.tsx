import { useEffect, useRef, useState } from "react";
import { useTGridCellEditor, type SchemaTableRowsByLevel } from "@sapporta/frontend";
import { quotesLevelName, type BooksGridServices } from "./books-grid-shared";
import { quoteTextBaseClassName } from "./quote-text-cell";

export function QuoteTextEditor() {
  const { value, commit, cancel } = useTGridCellEditor<
    SchemaTableRowsByLevel,
    BooksGridServices,
    typeof quotesLevelName,
    "quote_text"
  >(quotesLevelName, "quote_text");
  const [draft, setDraft] = useState(() => String(value ?? ""));
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // Blur and key handling can both end the edit; settle only once.
  const settledRef = useRef(false);

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;

    node.focus();
    node.select();
  }, []);

  function settle(endEdit: () => void) {
    if (settledRef.current) return;
    settledRef.current = true;
    endEdit();
  }

  return (
    <textarea
      ref={textareaRef}
      aria-label="Quote"
      data-grid-part="editor-input"
      className={[quoteTextBaseClassName, "homepage-quote-editor"].join(" ")}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => settle(() => commit(draft))}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          settle(cancel);
          return;
        }

        if (event.key === "Tab") {
          event.preventDefault();
          settle(() => commit(draft, event.shiftKey ? "prev" : "next"));
          return;
        }

        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          settle(() => commit(draft));
        }
      }}
    />
  );
}
