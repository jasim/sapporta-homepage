---
title: "Table-Aware Grids"
description:
  "Use generated grids and TGrid for Sapporta schema tables, generated table
  APIs, row visibility, lookup labels, and framework-owned record workflows."
---

## Show editable table data

Use a table-aware grid when your custom screen is still working with Sapporta
records. You get editable cells, keyboard navigation, filters, sort,
pagination, lookup labels, CSV export, and relationship expansion without
rewriting the generated table API plumbing.

Start with the standard schema grid for a custom route that should look and
behave like Sapporta's built-in table screens:

```tsx
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  SchemaTableGridView,
  type SchemaTableGridViewSource,
} from "@sapporta/frontend";
import { useSchemaStore } from "@sapporta/frontend/schema";

export function InvoiceListRoute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tables = useSchemaStore((state) => state.tables);
  const table = tables.find((candidate) => candidate.name === "invoices");

  const source = useMemo<SchemaTableGridViewSource | null>(() => {
    if (!table) return null;
    return {
      table,
      tablesByName: Object.fromEntries(
        tables.map((schema) => [schema.name, schema]),
      ),
    };
  }, [table, tables]);

  if (!source) return null;

  return (
    <SchemaTableGridView
      source={source}
      route={{ path: "/invoices", searchParams, navigate }}
      registerAs="invoices"
      onNewRecord={() => navigate("/invoices/new")}
    />
  );
}
```

`SchemaTableGridView` is the right default for application builders. It reads
the table schema, uses the built-in table row APIs, keeps query state in the
URL, resolves foreign-key labels, renders expandable child tables declared in
metadata, and wires CSV export to the same filtered result set the user sees.

Move to a custom TGrid definition when the screen needs product-specific
columns, custom editing, selection, nested levels, or workflow actions around
the grid. TGrid still uses Sapporta table APIs by default, so row visibility,
validation, lookup loading, and ordinary create/update/delete behavior stay in
one place.

## Customize schema table columns

Use `buildSchemaTGridConfig` when the schema table is still the source of truth
but the route needs a different column layout.

```tsx
import { useMemo } from "react";
import {
  TableGridView,
  buildSchemaTGridConfig,
  defineTGrid,
  useTGridCell,
  type SchemaTableRowsByLevel,
} from "@sapporta/frontend";
import { eqCondition } from "@sapporta/shared/filter";

function StatusCell() {
  const cell = useTGridCell<SchemaTableRowsByLevel, unknown, "invoices">(
    "invoices",
  );
  const status = String(cell.row.status);

  return <span data-status={status}>{status}</span>;
}

export function DraftInvoicesGrid({ table, tablesByName, route }) {
  const definition = useMemo(() => {
    const config = buildSchemaTGridConfig({
      source: { rootTableName: "invoices", tablesByName },
      rootRows: {
        fixedFilters: [eqCondition("status", "draft")],
        initialSort: [{ colId: "invoice_date", direction: "desc" }],
      },
      relatedRows: { pageSize: 25 },
    });

    config.levels.invoices.columns = (columns) => [
      columns.table("customer_id", { label: "Customer" }),
      columns.table("invoice_date", { label: "Date", edit: "none" }),
      columns.table("status", {
        label: "Status",
        renderCell: StatusCell,
      }),
      columns.remainingTable({
        exclude: ["id", "customer_id", "invoice_date", "status"],
      }),
    ];

    return defineTGrid<SchemaTableRowsByLevel>(config);
  }, [tablesByName]);

  return (
    <TableGridView
      definition={definition}
      table={table}
      route={route}
      registerAs="invoices"
    />
  );
}
```

Use the table column builder for persisted fields:

| Builder                    | Use it for                                                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `columns.table("name")`    | A real table column with schema-backed display, editing, parsing, sorting, and lookup behavior.                 |
| `columns.client("key")`    | A computed display column, action column, timer, badge, or other value that is not saved directly to the table. |
| `columns.remainingTable()` | All visible schema columns not already placed by the custom layout.                                             |

## Customize table query and save behavior

Grid behavior belongs in the definition when it changes how Sapporta rows,
schema columns, or workflow actions around the table behave. Keep local React
state for page chrome, panels, and workflow actions around the grid.

Use query settings to control what the table can show:

- `fixedFilters` constrain the route and are not editable in the toolbar.
- `initialFilters`, `initialSort`, `initialSearch`, and `initialPage` are user
  editable defaults.
- `pageSize` sets the default page size for a level.
- `query.owner: "host"` means visible controls own query state.
- `query.owner: "source"` is the usual choice for expansion-loaded child rows.

Do not use `fixedFilters` or hidden columns as authorization. In auth-enabled
apps, built-in table APIs apply row visibility on the server. Custom row clients
and custom save services must call backend endpoints that apply the same
server-side scope.

Use `saveCellValue` when a cell edit needs domain logic before the row is
patched. The handler can return a single value, a multi-field patch, a full row,
or a reload instruction.

```tsx
import type { TGridCellWriteContext } from "@sapporta/frontend";

type InvoiceItemRow = {
  id: string;
  item_id: string | null;
  quantity: number;
  balance_stock: number | null;
};

type RowsByLevel = {
  "invoices.items": InvoiceItemRow;
};

type AppServices = {
  stockAvailable(input: {
    lineId: string;
    itemId: string | null;
    quantity: number;
  }): Promise<{ available: boolean; balanceStock: number }>;
};

async function saveQuantity(
  ctx: TGridCellWriteContext<
    RowsByLevel,
    AppServices,
    "invoices.items",
    "quantity"
  >,
) {
  const stock = await ctx.appServices.stockAvailable({
    lineId: ctx.row.id,
    itemId: ctx.row.item_id,
    quantity: ctx.value,
  });

  return {
    kind: "patch" as const,
    patch: {
      quantity: stock.available ? ctx.value : ctx.row.quantity,
      balance_stock: stock.balanceStock,
    },
  };
}
```

Pass the concrete services when rendering the grid:

```tsx
<TableGridView
  definition={definition}
  table={invoicesTable}
  route={route}
  services={{ stockAvailable }}
/>
```

Override `rowsClient` only when a level must fetch or save through another
transport while keeping the Sapporta grid workflow:

```ts
import type { TableRowsClient } from "@sapporta/frontend";

const rowsClient = {
  fetch: (params) => invoiceWorkflowApi.listRows(params),
  create: (tableName, row) => invoiceWorkflowApi.createRow(tableName, row),
  update: (tableName, id, patch) =>
    invoiceWorkflowApi.updateRow(tableName, id, patch),
  remove: (tableName, id) => invoiceWorkflowApi.deleteRow(tableName, id),
} satisfies TableRowsClient;
```

For child inserts, TGrid fills the parent foreign-key before it calls
`rowsClient.create`. Your backend should still validate that the parent and
child are allowed for the current user.

## Render a custom TGrid surface

When you build the visible surface yourself, keep the session lifecycle stable.
`useTGridSession` returns `null` until the live session exists and disposes it
when the definition changes or the component unmounts. Start lookup loading for
foreign-key labels after the session exists:

```tsx
import { useEffect } from "react";
import {
  TGrid,
  startTGridLookupLoading,
  useTGridSession,
} from "@sapporta/frontend";

function InvoiceGridView({ definition, services }) {
  const session = useTGridSession(definition, { services });

  useEffect(() => {
    if (!session) return;
    return startTGridLookupLoading(session);
  }, [session]);

  if (!session) return null;

  return <TGrid session={session} className="invoiceGrid" />;
}
```

## Use hierarchical table grids

Use schema relationships when the nested rows are real child tables. A table's
relationship metadata gives `SchemaTableGridView` enough information to render
expandable children with the right foreign key and default sort.

For custom nested table screens, declare the level graph explicitly:

```tsx
type InvoiceRow = {
  id: string;
  customer_id: string;
  invoice_date: string;
  status: "draft" | "sent" | "paid";
};

type InvoiceItemRow = {
  id: string;
  invoice_id: string;
  item_id: string | null;
  quantity: number;
  unit_price: number;
};

type RowsByLevel = {
  invoices: InvoiceRow;
  "invoices.items": InvoiceItemRow;
};

const definition = defineTGrid<RowsByLevel>({
  rootLevel: "invoices",
  levels: {
    invoices: {
      table: invoicesTable,
      childLevels: ["invoices.items"],
      query: { owner: "host", pageSize: 50, urlSync: true },
      columns: (columns) => [
        columns.table("customer_id", { label: "Customer" }),
        columns.table("invoice_date", { label: "Date" }),
        columns.table("status", { label: "Status" }),
      ],
    },
    "invoices.items": {
      table: invoiceItemsTable,
      parent: {
        level: "invoices",
        foreignKey: "invoice_id",
        defaultSort: "item_id",
      },
      childLevels: [],
      query: { owner: "source", pageSize: 25 },
      columns: (columns) => [
        columns.table("item_id", { label: "Item" }),
        columns.table("quantity", { label: "Qty", edit: "default" }),
        columns.table("unit_price", { label: "Unit price" }),
      ],
    },
  },
});
```

The root level is usually host-owned so the table page and URL can control
search, filters, sort, and pagination. Child levels are usually source-owned
because they are loaded from the parent row's expansion path. When a user
expands a row, the runtime resolves the child source, loads the child rows, and
caches the materialized child path.

Use path-like level ids such as `invoices.items` for readability. They are grid
level ids, not route paths, and they do not have to match table names.

## When to leave framework grids

Use standalone Sapporta Grid when the surface is not backed by Sapporta table
APIs. The standalone package is for screens that own their row model, data
source, save path, filters, pagination, export, and backend transport.

Start with [Sapporta Grid Docs](/grid/docs/), especially
[Getting Started](/grid/docs/getting-started/),
[Data Sources](/grid/docs/data-sources/), and
[Hierarchical Grids](/grid/docs/hierarchical-grids/).
