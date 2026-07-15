import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BrowserRouter, useNavigate, useSearchParams } from "react-router-dom";
import {
  childPath,
  makeRowId,
  rootPath,
  trailingEdge,
  type GridPath,
} from "@sapporta/grid";
import { controllerFor } from "@sapporta/grid/advanced";
import type { TableSchema } from "@sapporta/shared/contracts";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sapporta/ui";
import {
  TableGridView,
  buildSchemaTGridConfig,
  defineTGrid,
  loadSchema,
  type SchemaTableRootRowsOptions,
  type SchemaTableRowsByLevel,
  useTGridCell,
  useTGridCellEditor,
  useSchemaStore,
} from "@sapporta/frontend";
import { Check, Copy, Maximize2 } from "lucide-react";
import { toAppHref } from "../app-links";

const booksTableName = "books";
const quotesLevelName = "books.quotes";
const quoteBookParam = "quoteBook";
const quoteRowParam = "quoteRow";
const booksGridRootRows = {
  pageSize: 15,
} satisfies SchemaTableRootRowsOptions;
const quoteTextBaseClassName = "homepage-quote-cell homepage-quote-grid-text";

type QuoteDetailsOpenDetail = {
  path: string;
  rowKey: string;
};

type CopyStatus = "idle" | "copied" | "error";

type QuoteDeepLink = {
  bookRowKey: string;
  identity: QuoteDetailsOpenDetail;
};

type QuoteExpansionContextValue = {
  expandedQuote: QuoteDetailsOpenDetail | null;
  activeQuoteDialog: QuoteDetailsOpenDetail | null;
  linkedBookRowKey: string | null;
  reportQuoteClipping: (identity: QuoteDetailsOpenDetail, clipped: boolean) => void;
  openQuoteDialog: (identity: QuoteDetailsOpenDetail) => void;
  closeQuoteDialog: () => void;
};

const QuoteExpansionContext = createContext<QuoteExpansionContextValue | null>(null);
// Astro can render this component on the server; only use layout effects in
// the browser, where DOM measurements are available.
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function BooksTableDataGrid({ appBaseUrl = "" }: { appBaseUrl?: string }) {
  return (
    <BrowserRouter>
      <BooksTableDataGridContent appBaseUrl={appBaseUrl} />
    </BrowserRouter>
  );
}

function BooksTableDataGridContent({ appBaseUrl }: { appBaseUrl: string }) {
  const tables = useSchemaStore((state) => state.tables);
  const schemaLoaded = useSchemaStore((state) => state.loaded);
  const schemaError = useSchemaStore((state) => state.error);
  const tableSchema = tables.find((table) => table.name === booksTableName);

  useEffect(() => {
    if (!schemaLoaded && !schemaError) {
      void loadSchema();
    }
  }, [schemaError, schemaLoaded]);

  if (schemaError) {
    return (
      <GridMessage>
        Could not load the Books table metadata. Start the Sapporta app API or set the public app base URL for this docs
        page.
      </GridMessage>
    );
  }

  if (!schemaLoaded) {
    return <GridMessage>Loading the Books table...</GridMessage>;
  }

  if (!tableSchema) {
    return <GridMessage>The Books table is not available.</GridMessage>;
  }

  return <BooksGrid tableSchema={tableSchema} tables={tables} appBaseUrl={appBaseUrl} />;
}

function BooksGrid({
  tableSchema,
  tables,
  appBaseUrl,
}: {
  tableSchema: TableSchema;
  tables: readonly TableSchema[];
  appBaseUrl: string;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const navigateRef = useRef(navigate);
  const searchParamsRef = useRef(searchParams);
  const [expandedQuote, setExpandedQuote] = useState<QuoteDetailsOpenDetail | null>(null);
  const deepLinkedQuote = useMemo(() => quoteDeepLinkFromSearchParams(searchParams), [searchParams]);
  // Activation callbacks live inside the stable TGrid definition, so they read
  // interaction state from refs instead of closing over render-time state.
  const expandedQuoteRef = useRef<QuoteDetailsOpenDetail | null>(null);
  const clippedQuotesRef = useRef(new Map<string, boolean>());
  const reportQuoteClipping = useCallback((identity: QuoteDetailsOpenDetail, clipped: boolean) => {
    clippedQuotesRef.current.set(quoteIdentityKey(identity), clipped);
  }, []);
  const expandInlineQuote = useCallback((identity: QuoteDetailsOpenDetail | null) => {
    expandedQuoteRef.current = identity;
    setExpandedQuote(identity);
  }, []);
  const openQuoteDialog = useCallback((identity: QuoteDetailsOpenDetail) => {
    const url = quoteDeepLinkUrl({
      routePath: "/",
      searchParams: searchParamsRef.current,
      identity,
    });
    if (url) {
      navigateRef.current(url);
    }
  }, []);
  const closeQuoteDialog = useCallback(() => {
    navigateRef.current(
      quoteBaseUrl({
        routePath: "/",
        searchParams: searchParamsRef.current,
      }),
      { replace: true },
    );
  }, []);
  const quoteExpansion = useMemo(
    () => ({
      expandedQuote,
      activeQuoteDialog: deepLinkedQuote?.identity ?? null,
      linkedBookRowKey: deepLinkedQuote?.bookRowKey ?? null,
      reportQuoteClipping,
      openQuoteDialog,
      closeQuoteDialog,
    }),
    [
      closeQuoteDialog,
      deepLinkedQuote?.bookRowKey,
      deepLinkedQuote?.identity,
      expandedQuote,
      openQuoteDialog,
      reportQuoteClipping,
    ],
  );
  const tablesByName = useMemo(() => {
    const byName: Record<string, TableSchema> = {};
    for (const table of tables) {
      byName[table.name] = table;
    }
    return byName;
  }, [tables]);
  const route = useMemo(
    () => ({
      path: "/",
      searchParams,
      navigate,
    }),
    [navigate, searchParams],
  );

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const definition = useMemo(() => {
    const config = buildSchemaTGridConfig({
      source: {
        rootTableName: booksTableName,
        tablesByName,
      },
      rootRows: booksGridRootRows,
    });
    const booksLevel = config.levels[booksTableName];
    const quotesLevel = config.levels[quotesLevelName];

    if (booksLevel) {
      booksLevel.columns = (columns) => [
        columns.remainingTable({ exclude: ["id"] }),
        columns.client("quote_deep_link", {
          label: "",
          width: 1,
          edit: "none",
          renderCell: QuoteDeepLinkBookCell,
        }),
      ];
    }

    if (quotesLevel) {
      quotesLevel.columns = (columns) => [
        columns.table("quote_text", {
          label: "Quote",
          minWidth: 32,
          maxWidth: 100,
          // TGrid forbids assigning the same gesture to edit and activation.
          // Enter owns the expand-or-edit activation. Custom TGrid editors do
          // not receive the typed seed, so quote editing starts through F2,
          // double-click, or the second-Enter activation path.
          edit: {
            editor: QuoteTextEditor,
            startsOn: ["f2", "doubleClick"],
          },
          activation: {
            startsOn: ["enter"],
            describe: "Expand quote or edit quote",
            run: ({ level, rowKey, runtime }) => {
              const path = level.path;
              const identity = quoteDetailsIdentity({ path, rowKey });
              const clipped = clippedQuotesRef.current.get(quoteIdentityKey(identity)) ?? true;

              if (quoteIdentityMatches(expandedQuoteRef.current, identity) || !clipped) {
                // Programmatic editing must use one of the column's allowed
                // edit triggers, so the second Enter opens the default editor
                // through the F2 path.
                if (!quoteIdentityMatches(expandedQuoteRef.current, identity)) {
                  expandInlineQuote(null);
                }
                controllerFor(runtime, path).startEdit(
                  {
                    rowId: makeRowId(path, rowKey),
                    colId: "quote_text",
                  },
                  "f2",
                );
                return;
              }
              expandInlineQuote(identity);
            },
          },
          renderCell: QuoteTextCell,
        }),
        columns.client("quote_details", {
          label: "",
          width: 48,
          edit: "none",
          activation: {
            startsOn: ["enter", "space", "click"],
            describe: "Expand quote details",
            run: ({ level, rowKey }) => {
              openQuoteDialog(
                quoteDetailsIdentity({ path: level.path, rowKey }),
              );
            },
          },
          renderCell: QuoteDetailsCell,
        }),
      ];
    }

    return defineTGrid<SchemaTableRowsByLevel>({
      ...config,
      phantomRows: {},
    });
  }, [expandInlineQuote, openQuoteDialog, tablesByName]);

  return (
    <QuoteExpansionContext.Provider value={quoteExpansion}>
      <TableGridView
        definition={definition}
        table={tableSchema}
        route={route}
        registerAs={booksTableName}
        onNewRecord={() => {
          window.location.assign(toAppHref(`/tables/${booksTableName}/new`, appBaseUrl));
        }}
        viewRelatedRows
        className="homepage-grid min-h-0 overflow-hidden border border-sap-border"
        gridClassName="min-w-full"
      />
    </QuoteExpansionContext.Provider>
  );
}

function QuoteDeepLinkBookCell() {
  const { level, rowKey, runtime } = useTGridCell<
    SchemaTableRowsByLevel,
    unknown,
    typeof booksTableName
  >(booksTableName);
  const path = level.path;
  const { linkedBookRowKey } = useQuoteExpansion();

  useEffect(() => {
    if (linkedBookRowKey !== String(rowKey)) return;

    const rowId = makeRowId(path, rowKey);
    if (!level.isExpanded(rowId)) level.expand(rowId);
    controllerFor(runtime, path).revealRow(rowId);
  }, [level, linkedBookRowKey, path, rowKey, runtime]);

  return null;
}

function QuoteTextCell() {
  const { level, rowKey, value } = useTGridCell<
    SchemaTableRowsByLevel,
    unknown,
    typeof quotesLevelName
  >(quotesLevelName);
  const path = level.path;
  const ref = useRef<HTMLDivElement | null>(null);
  const { expandedQuote, reportQuoteClipping } = useQuoteExpansion();
  const identity = useMemo(() => quoteDetailsIdentity({ path, rowKey }), [path, rowKey]);
  const expanded = quoteIdentityMatches(expandedQuote, identity);

  useBrowserLayoutEffect(() => {
    const node = ref.current;
    if (!node || expanded) return;

    // Overflow is a rendered-layout fact: column width, wrapping, zoom, and
    // fonts all affect it. Measure the collapsed element and keep a synchronous
    // answer for the TGrid activation callback.
    function measureQuoteClipping() {
      reportQuoteClipping(identity, node.scrollHeight > node.clientHeight);
    }

    measureQuoteClipping();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(measureQuoteClipping);
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [expanded, identity, reportQuoteClipping, value]);

  return (
    <div
      ref={ref}
      className={[
        quoteTextBaseClassName,
        expanded
          ? "max-h-none overflow-visible whitespace-pre-wrap"
          : "max-h-48 overflow-hidden",
      ].join(" ")}
    >
      {String(value ?? "")}
    </div>
  );
}

function QuoteTextEditor() {
  const { value, commit, cancel } = useTGridCellEditor<
    SchemaTableRowsByLevel,
    unknown,
    typeof quotesLevelName,
    "quote_text"
  >(quotesLevelName, "quote_text");
  const [draft, setDraft] = useState(() => String(value ?? ""));
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const draftRef = useRef(draft);
  const finishedRef = useRef(false);

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;

    node.focus();
    node.select();
  }, []);

  function commitDraft(target?: "next" | "prev") {
    if (finishedRef.current) return;
    finishedRef.current = true;
    commit(draftRef.current, target);
  }

  function cancelEdit() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    cancel();
  }

  return (
    <textarea
      ref={textareaRef}
      aria-label="Quote"
      data-grid-part="editor-input"
      className={[quoteTextBaseClassName, "homepage-quote-editor"].join(" ")}
      value={draft}
      onChange={(event) => {
        draftRef.current = event.target.value;
        setDraft(event.target.value);
      }}
      onBlur={() => commitDraft()}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          cancelEdit();
          return;
        }

        if (event.key === "Tab") {
          event.preventDefault();
          commitDraft(event.shiftKey ? "prev" : "next");
          return;
        }

        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          commitDraft();
        }
      }}
    />
  );
}

function QuoteDetailsCell() {
  const { level, row, rowKey, runtime, activation } = useTGridCell<
    SchemaTableRowsByLevel,
    unknown,
    typeof quotesLevelName
  >(quotesLevelName);
  const path = level.path;
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const { activeQuoteDialog, closeQuoteDialog } = useQuoteExpansion();
  const identity = useMemo(() => quoteDetailsIdentity({ path, rowKey }), [path, rowKey]);
  const open = quoteIdentityMatches(activeQuoteDialog, identity);
  const edge = trailingEdge(path);
  const parentRow = edge
    ? runtime
        .level(edge.parentPath)
        .displayedRow(makeRowId(edge.parentPath, edge.parentRowKey))
    : undefined;
  const book = textValue(parentRow?.columns.title, "Unknown book");
  const author = textValue(parentRow?.columns.author, "Unknown author");
  const quote = textValue(row.quote_text, "");
  const quoteCredit = `- ${book}, by ${author}`;
  const copyText = `${quote}\n\n${quoteCredit}`;

  useEffect(() => {
    if (!open) return;
    controllerFor(runtime, path).revealRow(makeRowId(path, rowKey));
  }, [open, path, rowKey, runtime]);

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

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && open) {
          closeQuoteDialog();
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
      <DialogContent className="max-h-[88vh] w-[min(94vw,64rem)] max-w-[94vw] overflow-y-auto p-0">
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
            <blockquote className="homepage-quote-cell whitespace-pre-wrap text-[1.25rem] leading-[1.52] text-sap-fg sm:text-[1.6rem]">
              {quote}
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

function quoteDeepLinkFromSearchParams(
  searchParams: URLSearchParams,
): QuoteDeepLink | null {
  const bookRowKey = searchParams.get(quoteBookParam);
  const quoteRowKey = searchParams.get(quoteRowParam);
  if (!bookRowKey || !quoteRowKey) return null;

  return {
    bookRowKey,
    identity: {
      path: String(
        childPath(rootPath(booksTableName), bookRowKey, quotesLevelName),
      ),
      rowKey: quoteRowKey,
    },
  };
}

function quoteDeepLinkUrl({
  routePath,
  searchParams,
  identity,
}: {
  routePath: string;
  searchParams: URLSearchParams;
  identity: QuoteDetailsOpenDetail;
}) {
  const edge = trailingEdge(identity.path as GridPath);
  if (!edge) return null;

  const params = new URLSearchParams(searchParams);
  params.set(quoteBookParam, String(edge.parentRowKey));
  params.set(quoteRowParam, identity.rowKey);
  const queryString = params.toString();
  return `${routePath}${queryString ? `?${queryString}` : ""}`;
}

function quoteBaseUrl({
  routePath,
  searchParams,
}: {
  routePath: string;
  searchParams: URLSearchParams;
}) {
  const params = new URLSearchParams(searchParams);
  params.delete(quoteBookParam);
  params.delete(quoteRowParam);
  const queryString = params.toString();
  return `${routePath}${queryString ? `?${queryString}` : ""}`;
}

function quoteDetailsIdentity({ path, rowKey }: { path: unknown; rowKey: unknown }): QuoteDetailsOpenDetail {
  return {
    path: String(path),
    rowKey: String(rowKey),
  };
}

function quoteIdentityMatches(current: QuoteDetailsOpenDetail | null, next: QuoteDetailsOpenDetail) {
  return current?.path === next.path && current.rowKey === next.rowKey;
}

function quoteIdentityKey(identity: QuoteDetailsOpenDetail) {
  return `${identity.path}\u0000${identity.rowKey}`;
}

function useQuoteExpansion() {
  const context = useContext(QuoteExpansionContext);
  if (!context) {
    throw new Error("useQuoteExpansion must be used inside QuoteExpansionContext.Provider");
  }
  return context;
}

function textValue(value: unknown, fallback: string) {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function GridMessage({ children }: { children: ReactNode }) {
  return (
    <div className="homepage-grid-message flex h-64 items-center justify-center gap-3 border border-sap-border bg-sap-surface p-4 text-[0.92rem] text-sap-soft max-[760px]:min-h-56 max-[760px]:flex-col max-[760px]:items-start">
      {children}
    </div>
  );
}
