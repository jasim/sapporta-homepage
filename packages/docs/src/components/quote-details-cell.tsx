import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { makeRowId, trailingEdge } from "@sapporta/grid";
import { controllerFor } from "@sapporta/grid/advanced";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sapporta/ui";
import { useTGridCell, type SchemaTableRowsByLevel } from "@sapporta/frontend";
import { Check, Copy, Maximize2 } from "lucide-react";
import { quotesLevelName, type BooksGridServices } from "./books-grid-shared";
import { quoteAt, quoteDeepLinkFromUrl, quoteDialogUrl, sameQuote } from "./quote-deep-link";

type CopyStatus = "idle" | "copied" | "error";

export function QuoteDetailsCell() {
  const { level, row, runtime, activation } = useTGridCell<
    SchemaTableRowsByLevel,
    BooksGridServices,
    typeof quotesLevelName
  >(quotesLevelName);
  const rowKey = String(row.id);
  const quote = quoteAt(level.path, row.id);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  // The URL is the source of truth for the open dialog, which is what makes
  // quote dialogs deep-linkable.
  const open = sameQuote(quoteDeepLinkFromUrl(searchParams), quote);

  const edge = trailingEdge(level.path);
  const parentRow = edge
    ? runtime.level(edge.parentPath).displayedRow(makeRowId(edge.parentPath, edge.parentRowKey))
    : undefined;
  const book = textValue(parentRow?.columns.title, "Unknown book");
  const author = textValue(parentRow?.columns.author, "Unknown author");
  const quoteText = textValue(row.quote_text, "");
  const quoteCredit = `- ${book}, by ${author}`;
  const copyText = `${quoteText}\n\n${quoteCredit}`;

  // A dialog opened through a deep link keeps its quote row on screen.
  useEffect(() => {
    if (!open) return;
    controllerFor(runtime, level.path).revealRow(makeRowId(level.path, rowKey));
  }, [open, level.path, rowKey, runtime]);

  useEffect(() => {
    if (copyStatus === "idle") return;
    const timeout = window.setTimeout(() => setCopyStatus("idle"), 1800);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  async function copyQuote() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  function closeDialog() {
    navigate(quoteDialogUrl(searchParams, null), { replace: true });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && open) {
          closeDialog();
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mx-auto h-8 w-8 text-sap-soft hover:text-sap-fg"
            aria-label={activation?.label ?? "Expand quote details"}
            title={activation?.label ?? "Expand quote details"}
            disabled={activation?.availability.kind === "disabled"}
            onClick={(event) => {
              event.stopPropagation();
              activation?.run();
            }}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          />
        }
      >
        <Maximize2 className="h-4 w-4" aria-hidden="true" />
      </DialogTrigger>
      <DialogContent className="homepage-quote-dialog max-h-[88vh] w-[min(94vw,64rem)] max-w-[94vw] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Quote details</DialogTitle>
          <DialogDescription>{quoteCredit}</DialogDescription>
        </DialogHeader>
        <div className="relative overflow-hidden bg-sap-surface px-7 py-8 sm:px-12 sm:py-11">
          <div
            className="pointer-events-none absolute right-8 top-3 select-none font-serif text-[8rem] leading-none text-sap-border-soft sm:right-12 sm:text-[12rem]"
            aria-hidden="true"
          >
            &rdquo;
          </div>
          <figure className="relative z-10">
            {/* The measure is capped so serif lines stay readable and clear of
                the quotation mark hanging in the top corner. */}
            <blockquote className="homepage-quote-cell max-w-[54ch] whitespace-pre-wrap text-pretty text-[1.25rem] leading-[1.52] text-sap-fg sm:text-[1.6rem]">
              {quoteText}
            </blockquote>
            <figcaption className="mt-5 border-t border-sap-border-soft pt-3 text-right text-[1.18rem] font-medium leading-snug sm:text-[1.28rem]">
              <span className="block text-[color:var(--ink)]">- {book}</span>
              <span className="mt-0.5 block text-[color:var(--link)]">by {author}</span>
            </figcaption>
          </figure>
          <div className="relative z-10 mt-7 flex items-center justify-end">
            <Button type="button" variant="outline" onClick={() => void copyQuote()}>
              {copyStatus === "copied" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copyStatus === "copied" ? "Copied" : copyStatus === "error" ? "Copy failed" : "Copy quote"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function textValue(value: unknown, fallback: string) {
  const text = String(value ?? "").trim();
  return text || fallback;
}
