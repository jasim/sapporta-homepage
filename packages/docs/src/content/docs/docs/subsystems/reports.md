---
title: "Reports"
description:
  "Build route-based report screens with filters, summaries, nested rows,
  totals, and links to source records."
---

## Build a report

Reports are app-owned API routes with app-owned screens. Sapporta gives you the
typed route tools, a shared grid dataset shape, date range helpers, and a React
renderer; your application owns the input schema, permission check, query logic,
totals, navigation, and drill-down behavior.

Report grids use the same right-click copy menu as other grids, so users can
copy the active cell or range as CSV with or without headers.

A report usually has four parts:

1. A shared route contract in `packages/shared/src/contracts/`
2. A backend route under `packages/api/app/`
3. A pure mapper that turns application rows into a grid dataset
4. A React screen under `packages/frontend/src/`

Use `GET` query parameters for reports that fit in a URL, such as a date range,
account, customer, status, or location. Use `POST` only when the filter shape is
too large or nested for a query string.

```ts
// packages/shared/src/contracts/reports.ts
import { z } from "zod";
import { initContract } from "@sapporta/rest-core";
import { errorBodySchema } from "@sapporta/shared/contracts";
import { gridDatasetSchema } from "@sapporta/shared/grid-dataset";

const c = initContract();

export const reportsContract = c.router({
  accountLedger: c.query({
    method: "GET",
    path: "/reports/account-ledger",
    summary: "Account Ledger",
    metadata: { tags: ["reports"] },
    query: z.object({
      account_id: z.string().min(1),
      period_relative: z.string().optional(),
      period_from: z.string().optional(),
      period_to: z.string().optional(),
    }),
    responses: {
      200: gridDatasetSchema,
      400: errorBodySchema,
      403: errorBodySchema,
    },
  }),
});
```

Export the contract from `packages/shared/src/contracts/index.ts`, register it
with the app API, and add the typed frontend client the same way you would for
any custom endpoint.

The backend route should stay thin: resolve authorization and input at the route
edge, read scoped data, then call a pure mapper.

```ts
// packages/api/app/reports/account-ledger.ts
import { resolveDateRangeQueryBounds } from "@sapporta/shared";
import { TsRestApi, type SapportaEnv } from "@sapporta/server";
import { reportsContract } from "my-app-shared/contracts";
import { readAccountLedgerRows } from "./account-ledger-store";
import { toAccountLedgerDataset } from "./account-ledger-result";

const api = new TsRestApi<SapportaEnv>();

api.register(
  "accountLedger",
  reportsContract.accountLedger,
  async ({ c, request }) => {
    const auth = c.get("auth");
    auth.requireCan("read", "reports:account-ledger");

    const period = resolveDateRangeQueryBounds("period", request.query);
    const rows = await readAccountLedgerRows({
      db: c.get("db"),
      auth,
      accountId: request.query.account_id,
      fromDate: period.from,
      toDate: period.to,
    });

    return { status: 200, body: toAccountLedgerDataset(rows) };
  },
);

export default api;
```

Do not accept `workspace_id`, `workspaceId`, `scoped_to_user_id`, or
`scopedToUserId` from report filters. Use the route auth context and Sapporta's
row-security helpers when querying tables. If a report needs raw SQL, make the
visible base rows explicit first, then aggregate those rows.

## Scope report data

Reports are custom product routes. Resolve auth in the report route, pass
`{ db, auth }` to report data functions, and keep the mapper pure.

Use `scopedRows()` for ordinary report reads when the report is mostly a
filtered table view:

```ts
import { scopedRows } from "@sapporta/server";

const auth = projectAuth.requireAuthorizedWorkspaceData(c, {
  action: "read",
  subject: "customers",
});
const rows = scopedRows(c.get("db"), auth, customers);

const result = await rows.list({ limit: 100, sort: "name" });
```

For custom Drizzle report queries, compose the table guard into the query:

```ts
const accountGuard = auth.rowSecurity.forTable(accounts);

const rows = await db
  .select()
  .from(accountsTable)
  .where(accountGuard.ownedRows(eq(accountsTable.active, true)));
```

Use one guard for each scoped table that contributes rows to a join,
transaction, or aggregate. For rare raw SQL report code, build visible base
tables first, then aggregate those rows. Do not accept workspace or user scope
from report query parameters. For broader custom workflow patterns, see
[Build Product Workflows](/docs/building-your-own-feature/overview/); for SQL
fallback cautions, see
[Use APIs And Tools](/docs/tools-and-operations/choose-apis-and-tools/). For a
broader coding-agent review loop that includes scoped report data, contracts,
hidden IDs, and frontend links, see
[LLM-Assisted Engineering](/docs/tools-and-operations/llm-assisted-engineering/).

## Add report filters

Report filters should be shareable, reloadable, and easy to inspect from the
API. Keep the screen state in the URL, and send the same values to the typed
report client.

Sapporta date ranges use a flat URL shape:

- `period_relative=30d`
- `period_from=2026-01-01&period_to=2026-01-31`

On the server, call `resolveDateRangeQueryBounds("period", request.query)` once,
then pass `from` and `to` into your query function. A `null` bound means
unbounded.

On the frontend, use the report primitives for normal report screens:

```tsx
// packages/frontend/src/reports/AccountLedgerReport.tsx
import { useCallback, useEffect, useState } from "react";
import { parseDateRange, serializeDateRange } from "@sapporta/shared";
import type { GridDataset } from "@sapporta/shared/grid-dataset";
import {
  DateRangeField,
  EntitySelectField,
  ReportError,
  ReportGridDataset,
  ReportRunButton,
  ReportScreenFrame,
  ReportSummaryStats,
  ReportToolbar,
  useUrlQueryState,
} from "@sapporta/frontend/report";
import { reportsApi } from "../api";

const defaultQuery = {
  account_id: "",
  period_relative: "30d",
  period_from: "",
  period_to: "",
};

export function AccountLedgerReport() {
  const [query, setQuery] = useUrlQueryState(defaultQuery);
  const [result, setResult] = useState<GridDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async () => {
    if (!query.account_id) return;
    setLoading(true);
    setError(null);

    try {
      const response = await reportsApi.accountLedger({ query });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not run report");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void run();
  }, [run]);

  const range = parseDateRange("period", query);

  return (
    <ReportScreenFrame title="Account Ledger">
      <ReportToolbar
        actions={
          <ReportRunButton
            loading={loading}
            disabled={!query.account_id}
            onClick={run}
          />
        }
      >
        <EntitySelectField
          tableName="accounts"
          label="account"
          value={query.account_id}
          onChange={(account_id) => setQuery({ account_id })}
        />
        <DateRangeField
          label="Period"
          value={range}
          onChange={(next) =>
            setQuery({
              period_relative: "",
              period_from: "",
              period_to: "",
              ...serializeDateRange(next, "period"),
            })
          }
        />
      </ReportToolbar>

      {error ? <ReportError error={error} /> : null}
      {result?.stats?.length ? (
        <ReportSummaryStats stats={result.stats} />
      ) : null}
      {result ? (
        <ReportGridDataset
          dataset={result}
          linkContext={{ input: query }}
          links={ledgerLinks}
        />
      ) : null}
    </ReportScreenFrame>
  );
}
```

Use `buildSearchParams` or `createSnapshotUrl` when you need to construct links
from the current filter state. For example, a row in a summary report can drill
into a ledger while preserving `period_from`, `period_to`, or `period_relative`.

Mount the screen with normal React Router routes and add it to your app
navigation. The report renderer only renders a dataset; it does not discover
routes, run queries, or decide which reports appear in the shell.

## Render summary and detail data

Return report results as `GridDataset` from `@sapporta/shared/grid-dataset`. The
dataset describes displayable rows; it does not describe how to query data,
authorize access, or place the report in navigation.

The important fields are:

| Field           | Purpose                                                              |
| --------------- | -------------------------------------------------------------------- |
| `name`, `label` | Stable dataset name and user-facing title                            |
| `rootLevel`     | The level rendered at the top of the grid                            |
| `levels`        | Columns, child level names, and collapse behavior for each row level |
| `nodes`         | The report rows                                                      |
| `footerRows`    | Top-level totals                                                     |
| `stats`         | Compact summary values above or near the grid                        |
| `errors`        | Non-fatal report-specific messages                                   |

Each level has columns. Use `visuallyHidden: true` for helper IDs the frontend
needs for links but users should not see as columns.

```ts
import type { GridDataset } from "@sapporta/shared/grid-dataset";

type LedgerInput = {
  accountId: string;
  accountName: string;
  openingBalance: number;
  lines: {
    journalEntryId: string;
    date: string;
    memo: string | null;
    debit: number;
    credit: number;
  }[];
};

export function toAccountLedgerDataset(input: LedgerInput): GridDataset {
  let balance = input.openingBalance;

  const lineNodes = input.lines.map((line) => {
    balance += line.debit - line.credit;
    return {
      rowKey: `line:${line.journalEntryId}`,
      levelName: "line",
      columns: { accountId: input.accountId, ...line, balance },
    };
  });

  return {
    name: "account-ledger",
    label: "Account Ledger",
    rootLevel: "account",
    levels: {
      account: {
        columns: [
          {
            id: "accountId",
            label: "Account ID",
            kind: "text",
            visuallyHidden: true,
          },
          { id: "accountName", label: "Account", kind: "text" },
          {
            id: "balance",
            label: "Closing Balance",
            kind: "number",
            displayFormat: "currency",
            strong: true,
          },
        ],
        childLevels: ["line"],
      },
      line: {
        columns: [
          {
            id: "accountId",
            label: "Account ID",
            kind: "text",
            visuallyHidden: true,
          },
          {
            id: "journalEntryId",
            label: "Journal Entry ID",
            kind: "text",
            visuallyHidden: true,
          },
          { id: "date", label: "Date", kind: "date" },
          { id: "memo", label: "Memo", kind: "text" },
          {
            id: "debit",
            label: "Debit",
            kind: "number",
            displayFormat: "currency",
            zeroDisplay: "blank",
          },
          {
            id: "credit",
            label: "Credit",
            kind: "number",
            displayFormat: "currency",
            zeroDisplay: "blank",
          },
          {
            id: "balance",
            label: "Balance",
            kind: "number",
            displayFormat: "currency",
          },
        ],
        childLevels: [],
      },
    },
    nodes: [
      {
        rowKey: `account:${input.accountId}`,
        levelName: "account",
        columns: {
          accountId: input.accountId,
          accountName: input.accountName,
        },
        rollup: { balance },
        children: {
          line: [
            {
              rowKey: "opening",
              levelName: "line",
              kind: "opening",
              columns: {
                memo: "Opening balance",
                balance: input.openingBalance,
              },
            },
            ...lineNodes,
          ],
        },
        childFooterRows: {
          line: [
            {
              rowKey: "line-total",
              columns: {
                memo: "Period total",
                debit: input.lines.reduce((sum, line) => sum + line.debit, 0),
                credit: input.lines.reduce((sum, line) => sum + line.credit, 0),
                balance,
              },
            },
          ],
        },
      },
    ],
    stats: [
      { label: "Opening balance", value: input.openingBalance.toFixed(2) },
      { label: "Closing balance", value: balance.toFixed(2), strong: true },
    ],
  };
}
```

Use `rollup` for values computed from a node's children, `footerRows` for
top-level totals, and `childFooterRows` for totals inside a child group. Use
`kind: "opening"`, `"closing"`, or `"subtotal"` for synthetic rows that should
be recognizable to tests and link resolvers.

For summary reports, each top-level node might be a customer, category,
warehouse, project, account, or period. For detail reports, a top-level node can
hold a single master record with child rows for the events, line items, or
transactions that explain the total.

## Link from reports to records

Links are frontend behavior. Do not serialize links in the report result.
Instead, include hidden identifiers in `node.columns`, then pass link resolvers
to `ReportGridDataset`.

```tsx
import type { ReportCellLinkResolvers } from "@sapporta/frontend/report";
import { createSnapshotUrl } from "@sapporta/frontend/report";

type LedgerQuery = typeof defaultQuery;

const ledgerLinks: ReportCellLinkResolvers<LedgerQuery> = {
  account: {
    row: ({ node }) => [
      {
        label: "Open account",
        href: `/tables/accounts/${node.columns.accountId}`,
        kind: "record",
        icon: "drill-up",
      },
    ],
  },
  line: {
    row: ({ node }) =>
      node.kind === "opening"
        ? []
        : [
            {
              label: "Open journal entry",
              href: `/tables/journal_entries/${node.columns.journalEntryId}`,
              kind: "record",
              icon: "drill-up",
            },
          ],
    cell: {
      balance: ({ node, input }) =>
        node.kind === "opening"
          ? []
          : [
              {
                label: "Open balance detail",
                href: createSnapshotUrl("/reports/account-ledger", {
                  account_id: node.columns.accountId,
                  period_relative: input?.period_relative,
                  period_from: input?.period_from,
                  period_to: input?.period_to,
                }),
                kind: "route",
                icon: "drill-into",
              },
            ],
    },
  },
};
```

Use the link type that matches the destination:

- `record` for `/tables/<table>/<id>`
- `route` for another report, workflow, or app screen
- `drill-down` when a summary opens a narrower report
- `external` with `target: "_blank"` only for intentionally external URLs

Resolvers receive the current node, level name, ancestors, column/value for cell
links, and optional `linkContext` input. Check optional identifiers before
returning a link; opening rows, subtotal rows, and footer rows often do not have
source record IDs. Link targets must still enforce their own authorization.

## Report patterns

Most reports are variations on a few shapes:

| Pattern           | Shape                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| Ledger            | One master row with opening, detail lines, running balance, and child footer totals                      |
| Summary           | One flat row per entity or period, with top-level `footerRows` for grand totals                          |
| Statement         | Section rows such as assets, liabilities, revenue, or expense, with account children and section rollups |
| Operational list  | A filtered readonly grid of work items, often with hidden IDs and row links to source records            |
| Drill-down report | A summary row links to another report with the current filters plus a narrower entity filter             |

Use one backend module per report unless the query logic is large enough to move
into a shared store or service. A good module boundary is:

- the route registration
- report-specific row types
- the read/query orchestration
- the pure row-to-dataset mapper

Validate the route and mapper separately:

```ts
import { gridDatasetSchema } from "@sapporta/shared/grid-dataset";

it("returns a grid dataset", async () => {
  const response = await app.request(
    "/api/reports/account-ledger?account_id=acct_1&period_relative=30d",
  );

  expect(response.status).toBe(200);
  const body = gridDatasetSchema.parse(await response.json());
  expect(body.name).toBe("account-ledger");
});
```

Then inspect the mounted route from a running app:

```bash
pnpm exec sapporta endpoints show "GET /api/reports/account-ledger"
curl -fsS \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/reports/account-ledger?account_id=acct_1&period_relative=30d"
```

For protected apps, include `SAPPORTA_API_TOKEN` or the same authorization
header your app uses. The report route should be discoverable through OpenAPI,
parse successfully as `gridDatasetSchema`, and render through
`ReportGridDataset` without custom grid code.
