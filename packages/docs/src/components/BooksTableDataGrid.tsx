import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, useNavigate, useSearchParams } from "react-router-dom";
import { makeRowId } from "@sapporta/grid";
import { controllerFor } from "@sapporta/grid/advanced";
import type { TableSchema } from "@sapporta/shared/contracts";
import {
  TableGridView,
  buildSchemaTGridConfig,
  defineTGrid,
  loadSchema,
  type SchemaTableRootRowsOptions,
  type SchemaTableRowsByLevel,
  type TGridCellActivationContext,
  type TGridSession,
  useSchemaStore,
} from "@sapporta/frontend";
import { toAppHref } from "../app-links";
import { quotesLevelName, type BooksGridServices } from "./books-grid-shared";
import { GridMessage } from "./grid-message";
import { QuoteDetailsCell } from "./quote-details-cell";
import { QuoteTextCell, quoteTextIsClipped } from "./quote-text-cell";
import { QuoteTextEditor } from "./quote-text-editor";
import { quoteAt, quoteDialogUrl, sameQuote } from "./quote-deep-link";
import { useQuoteDeepLink } from "./use-quote-deep-link";
import { useQuoteExpansion } from "./use-quote-expansion";

const booksTableName = "books";
const booksGridRootRows = {
  pageSize: 15,
} satisfies SchemaTableRootRowsOptions;

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
  const [session, setSession] = useState<TGridSession<SchemaTableRowsByLevel> | null>(null);
  const quoteExpansion = useQuoteExpansion();
  useQuoteDeepLink(session, searchParams);

  // Resolved live by the grid on every interaction; see BooksGridServices.
  const services: BooksGridServices = {
    quoteExpansion,
    openQuoteDialog: (quote) => navigate(quoteDialogUrl(searchParams, quote)),
  };

  const definition = useMemo(() => buildBooksDefinition(tables), [tables]);
  const route = useMemo(() => ({ path: "/", searchParams, navigate }), [navigate, searchParams]);

  return (
    <TableGridView
      definition={definition}
      table={tableSchema}
      route={route}
      services={services}
      registerAs={booksTableName}
      sessionRef={setSession}
      onNewRecord={() => {
        window.location.assign(toAppHref(`/tables/${booksTableName}/new`, appBaseUrl));
      }}
      viewRelatedRows
      className="homepage-grid min-h-0 overflow-hidden border border-sap-border"
      gridClassName="min-w-full"
    />
  );
}

// The grid definition: all books columns except `id`, plus the two custom
// quote columns that carry the demo's interactions.
function buildBooksDefinition(tables: readonly TableSchema[]) {
  const config = buildSchemaTGridConfig<BooksGridServices>({
    source: {
      rootTableName: booksTableName,
      tablesByName: Object.fromEntries(tables.map((table) => [table.name, table])),
    },
    rootRows: booksGridRootRows,
  });
  const booksLevel = config.levels[booksTableName];
  const quotesLevel = config.levels[quotesLevelName];

  if (booksLevel) {
    booksLevel.columns = (columns) => [columns.remainingTable({ exclude: ["id"] })];
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
          run: activateQuoteText,
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
          run: ({ level, row, appServices }) => {
            const quote = quoteAt(level.path, row.id);
            if (quote) appServices.openQuoteDialog(quote);
          },
        },
        renderCell: QuoteDetailsCell,
      }),
    ];
  }

  return defineTGrid<SchemaTableRowsByLevel, BooksGridServices>({
    ...config,
    phantomRows: {},
  });
}

// Enter on a clipped quote expands it inline. Enter on an expanded or
// unclipped quote edits the quote text instead.
function activateQuoteText({
  level,
  row,
  runtime,
  appServices,
}: TGridCellActivationContext<SchemaTableRowsByLevel, BooksGridServices, string>) {
  const quote = quoteAt(level.path, row.id);
  if (!quote) return;

  const { quoteExpansion } = appServices;
  const alreadyExpanded = sameQuote(quoteExpansion.get(), quote);

  if (alreadyExpanded || !quoteTextIsClipped(quote)) {
    // Editing another quote collapses whichever quote was expanded; editing
    // the expanded quote itself keeps it expanded.
    if (!alreadyExpanded) quoteExpansion.set(null);
    // Programmatic editing must use one of the column's allowed edit
    // triggers, so the second Enter opens the editor through the F2 path.
    controllerFor(runtime, level.path).startEdit(
      {
        rowId: makeRowId(level.path, quote.quoteRowKey),
        colId: "quote_text",
      },
      "f2",
    );
    return;
  }

  quoteExpansion.set(quote);
}
