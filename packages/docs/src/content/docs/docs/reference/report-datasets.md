---
title: "Report Datasets"
description:
  "Lookup GridDataset, report node shapes, column shapes, footer rows, and
  report links."
---

## Report dataset reference

Reports are API routes in your app. Define a shared contract, register a backend
handler under `packages/api/app/`, and render the result in the frontend.

Simple reports usually use `GET` query parameters:

```ts
import { gridDatasetSchema } from "@sapporta/shared/grid-dataset";

export const trialBalanceRoute = c.query({
  method: "GET",
  path: "/reports/trial-balance",
  metadata: { tags: ["reports"] },
  query: z.object({ asOfDate: z.string() }),
  responses: {
    200: gridDatasetSchema,
    400: errorBodySchema,
    403: errorBodySchema,
  },
});
```

Date range filters use a flat URL shape:

```text
period_relative=30d
period_from=2026-01-01&period_to=2026-01-31
```

Resolve them at the route edge:

```ts
const period = resolveDateRangeQueryBounds("period", request.query);
```

`GridDataset` is the report wire type rendered by `ReportGridDataset`:

```ts
type GridDataset = {
  name: string;
  label: string;
  rootLevel: string;
  levels: Record<string, GridDatasetLevel>;
  nodes: GridDatasetNode[];
  footerRows?: GridDatasetFooterRow[];
  totalCount?: number;
  errors?: { path: string; message: string }[];
  stats?: GridDatasetStat[];
};
```

Key nested shapes:

```ts
type GridDatasetLevel = {
  label?: string;
  columns: GridDatasetColumn[];
  childLevels: string[];
  defaultCollapsed?: boolean;
};

type GridDatasetColumn = {
  id: string;
  label: string;
  kind?: "text" | "number" | "boolean" | "date" | "timestamp";
  displayFormat?: "currency" | "percentage";
  textDisplay?: "multiLine" | "markdown";
  visuallyHidden?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  colorRule?: "positive" | "negative" | "signed";
  zeroDisplay?: "blank" | "dot";
  strong?: boolean;
};

type GridDatasetNode = {
  rowKey: string;
  levelName: string;
  columns: Record<string, unknown>;
  rollup?: Record<string, unknown>;
  children?: Record<string, GridDatasetNode[]>;
  childFooterRows?: Record<string, GridDatasetFooterRow[]>;
  kind?: "opening" | "closing" | "subtotal";
};
```

`levels` declares the visible columns for each row level. Column identifiers use
`id`, not `name`. `nodes` contains source row data in `node.columns`, optional
computed values in `node.rollup`, and nested row groups in `node.children`.
Declare hidden IDs with `visuallyHidden: true` when frontend link resolvers need
them.

```ts
import type { GridDataset } from "@sapporta/shared/grid-dataset";

const dataset = {
  name: "trial-balance",
  label: "Trial Balance",
  rootLevel: "account",
  levels: {
    account: {
      columns: [
        {
          id: "account_id",
          label: "Account ID",
          kind: "text",
          visuallyHidden: true,
        },
        { id: "name", label: "Account", kind: "text" },
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
      rowKey: "account-1",
      levelName: "account",
      columns: { account_id: "account-1", name: "Cash", balance: 1250 },
    },
  ],
} satisfies GridDataset;
```

Links are frontend-owned. Pass `links` to `ReportGridDataset`; do not serialize
navigation metadata into the report result.

```tsx
<ReportGridDataset
  dataset={dataset}
  links={{
    account: {
      cell: {
        name: ({ node, column }) => [
          {
            label: "Open ledger",
            href: `/reports/account-ledger?account_id=${node.columns.account_id}&column=${column.id}`,
            kind: "route",
          },
        ],
      },
    },
  }}
/>
```

Validate report routes with:

```bash
pnpm exec sapporta endpoints show "GET /api/reports/trial-balance"
curl -fsS \
  -H "Authorization: Bearer ${SAPPORTA_API_TOKEN}" \
  "${SAPPORTA_API_URL:-http://localhost:3000}/api/reports/trial-balance?asOfDate=2026-06-12"
```
