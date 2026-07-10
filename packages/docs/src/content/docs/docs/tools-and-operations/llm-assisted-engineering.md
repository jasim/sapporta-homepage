---
title: "LLM-Assisted Engineering"
description:
  "Use Sapporta schema, contracts, OpenAPI, CLI checks, and validation loops
  with coding agents."
---

Sapporta is good terrain for LLM-assisted engineering because database-app
behavior is organized around a small set of typed, inspectable surfaces. An
agent can look at the existing files, make a narrow change, and run validation
against the same contracts, metadata, OpenAPI document, and table APIs the app
uses at runtime.

That does not mean a coding agent can safely invent product behavior. Business
rules, authorization policy, and data migrations still need a human reviewer.
Sapporta helps by making the artifacts concrete: schema files, generated SQL,
shared route contracts, server-side row-security code, report result shapes,
typed frontend clients, and live API discovery.

## Why Sapporta helps coding agents

Most product changes land in predictable places:

- `packages/api/schema/` for table definitions and schema metadata
- `packages/shared/src/contracts/` for shared API and report contracts
- `packages/api/app/` for backend route adapters
- `packages/api/modules/<domain>/` for larger workflow services and stores
- `packages/frontend/src/api.ts` for typed browser clients
- `packages/frontend/src/` for custom screens and report screens
- `/api/openapi.json` and `pnpm exec sapporta endpoints list` for live discovery

Those locations reduce ambiguity. An agent can inspect the relevant table,
contract, route, client, or screen before editing. Reviewers can then check the
same files plus generated SQL, OpenAPI output, row-scope helpers, and route
tests.

## The project shape agents should follow

```txt
schema -> migration -> generated table API -> grid/forms/CLI
shared contract -> API handler -> OpenAPI -> typed frontend client
report contract -> report route -> GridDataset -> report screen
auth context -> scopedRows()/rowSecurity -> row-safe data access
```

Each line has a deeper guide:

- [Model Your Data](/docs/subsystems/data-modeling/) for schema-as-code,
  semantic columns, relationships, and migrations.
- [Build Product Workflows](/docs/building-your-own-feature/overview/) for
  shared contracts and custom endpoints.
- [Control Access](/docs/subsystems/authorization/) for row scope,
  authorization, and server-side data boundaries.
- [Create Reports](/docs/subsystems/reports/) for route-based reports and
  grid-shaped results.
- [Build Screens](/docs/subsystems/frontend-screens/) and
  [Table-Aware Grids](/docs/subsystems/grid/) for custom frontend work.
- [Use APIs And Tools](/docs/tools-and-operations/choose-apis-and-tools/) for
  OpenAPI, CLI discovery, row commands, report calls, and SQL fallback guidance.

## Schema-as-code gives one source of truth

A Sapporta table is both a storage definition and product metadata. The raw
Drizzle table owns SQL columns, constraints, foreign keys, and inferred row
types. The Sapporta `table()` wrapper owns labels, row scope, search behavior,
relationship display, generated editing metadata, and lookup behavior.

```ts
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { table, bool, money, text, timestamp } from "@sapporta/server/table";
import { Temporal } from "@sapporta/shared/temporal";

export const invoicesTable = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace_id: text("workspace_id").notNull(),
  scoped_to_user_id: text("scoped_to_user_id").notNull(),
  invoice_number: text("invoice_number").notNull().unique(),
  status: text("status").notNull(),
  total: money("total").notNull().default(0),
  approved: bool("approved").notNull().default(false),
  created_at: timestamp("created_at")
    .$defaultFn(() => Temporal.Now.instant())
    .notNull(),
  updated_at: timestamp("updated_at")
    .$defaultFn(() => Temporal.Now.instant())
    .notNull(),
});

export const invoices = sapportaTable({
  drizzle: invoicesTable,
  meta: {
    label: "Invoices",
    rowScope: "workspaceUserScoped",
    rowLabelColumns: ["invoice_number"],
    search: { columns: ["invoice_number", "status"] },
    selects: [
      { type: "select", column: "status", options: ["draft", "approved"] },
    ],
    columns: {
      workspace_id: { visuallyHidden: true },
      scoped_to_user_id: { visuallyHidden: true },
    },
  },
});

type Invoice = typeof invoicesTable.$inferSelect;
type InvoiceInsert = typeof invoicesTable.$inferInsert;
```

Review schema changes as product changes, not just database changes:

- Migrations are generated with Drizzle Kit and reviewed before application.
- The server checks migration readiness at startup and does not auto-migrate.
- Semantic column factories such as `money`, `percentage`, `date`, `timestamp`,
  `bool`, `text`, and `number` keep parsing, filtering, and rendering
  consistent.
- Row types should be derived from Drizzle exports instead of hand-written in
  parallel.
- Nullable numeric fields need either non-null defaults for additive values or
  `additive: false` metadata when `null` has domain meaning.

See [Model Your Data](/docs/subsystems/data-modeling/) and
[Reference](/docs/reference/table-definitions/) for the full table metadata
model.

## Migrations make database changes reviewable

Table edits should produce inspectable SQL before the database changes:

```bash
pnpm --filter ./packages/api db:generate --name add_invoices
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
pnpm exec sapporta tables show invoices
```

This is useful in LLM-assisted work because the generated SQL and table metadata
become review artifacts. The agent should not silently change the database at
runtime. Reviewers should check the migration before applying it, then inspect
the table metadata exposed by the running app.

## Shared contracts prevent client/server drift

Custom app-owned features should start from a shared ts-rest contract:

1. Define the contract in `packages/shared/src/contracts/<feature>.ts`.
2. Re-export it from `packages/shared/src/contracts/index.ts`.
3. Register it with `TsRestApi` in `packages/api/app/<feature>.ts`.
4. Mount it from `packages/api/app.ts`.
5. Add a typed frontend client in `packages/frontend/src/api.ts`.
6. Confirm the live route with `pnpm exec sapporta endpoints show "METHOD /api/path"`.

```ts
// packages/shared/src/contracts/invoices.ts
import { z } from "zod";
import { initContract } from "@sapporta/rest-core";
import { errorBodySchema } from "@sapporta/shared/contracts";

const c = initContract();

export const invoicesContract = c.router({
  approveInvoice: c.mutation({
    method: "POST",
    path: "/invoices/:id/approve",
    summary: "Approve an invoice",
    pathParams: z.object({ id: z.coerce.number().int() }),
    body: z.object({}),
    responses: {
      200: z.object({
        data: z.object({
          id: z.number(),
          status: z.literal("approved"),
        }),
      }),
      404: errorBodySchema,
      409: errorBodySchema,
    },
  }),
});
```

The same declaration gives the backend parsed inputs, response typing, OpenAPI
output, `sapporta endpoints show` discovery, and typed frontend calls:

```ts
// packages/frontend/src/api.ts
import { getApiBase } from "@sapporta/frontend/platform";
import { createApiClient } from "@sapporta/shared/client";
import { invoicesContract } from "your-app-shared";

export const invoicesApi = createApiClient(invoicesContract, {
  baseUrl: getApiBase,
});
```

Keep `packages/shared` browser-safe. It can contain contracts, wire-format
types, Zod schemas, constants, parsers, and pure serializers. It must not
contain React components, Hono handlers, Drizzle queries, database access, file
I/O, or other server-only code.

For a full endpoint walkthrough, see
[Build Product Workflows](/docs/building-your-own-feature/overview/) and
[Custom API Endpoints](/docs/subsystems/custom-api-endpoints/).

## Row security gives non-negotiable boundaries

Row visibility is a server-side design decision, not a UI filter. A table's
`rowScope` tells Sapporta which trusted scope facts exist for the table.

| Row scope             | Required scope columns              |
| --------------------- | ----------------------------------- |
| `systemGlobal`        | none                                |
| `workspaceGlobal`     | `workspace_id`                      |
| `workspaceUserScoped` | `workspace_id`, `scoped_to_user_id` |

The rule for custom code is strict:

- Resolve auth at the route edge with the narrowest
  `projectAuth.requireAuthorized*Data()` helper.
- Use `scopedRows(db, auth, table)` for ordinary row operations.
- Use `auth.rowSecurity.forTable(table)` for joins, transactions, aggregates,
  reports, and multi-table workflows.
- Do not accept, submit, manually stamp, or manually filter `workspace_id`,
  `workspaceId`, `scoped_to_user_id`, or `scopedToUserId`.
- Do not mutate scoped rows by primary key alone.
- Do not fetch broadly and filter ownership in JavaScript.

```ts
import { RowNotFoundError, scopedRows } from "@sapporta/server";
import { projectAuth } from "../project-auth/index.js";
import { invoices } from "../schema/invoices.js";

api.register(
  "approveInvoice",
  invoicesContract.approveInvoice,
  async ({ c, request }) => {
    const auth = projectAuth.requireAuthorizedWorkspaceUserData(c, {
      action: "update",
      subject: "invoices",
    });
    const rows = scopedRows(c.get("db"), auth, invoices);

    try {
      const invoice = await rows.get(request.params.id);
      if (invoice["status"] !== "draft") {
        return { status: 409, body: { error: "invoice_not_draft" } };
      }

      const updated = await rows.update(request.params.id, {
        status: "approved",
      });

      return {
        status: 200,
        body: {
          data: { id: Number(updated["id"]), status: "approved" },
        },
      };
    } catch (err) {
      if (err instanceof RowNotFoundError) {
        return { status: 404, body: { error: "invoice_not_found" } };
      }
      throw err;
    }
  },
);
```

This is the strongest reason Sapporta works well with coding agents: the
framework gives agents explicit boundaries they must not improvise around. See
[Control Access](/docs/subsystems/authorization/) for the full model.

## Reports are typed product routes

Reports use the same agent-friendly shape as product endpoints:

- shared report contract in `packages/shared/src/contracts/`
- backend handler under `packages/api/app/`
- scoped query or store logic
- pure mapper returning `GridDataset`
- React screen rendering the report result
- frontend-owned link resolvers for drill-down navigation

Review report changes for both result shape and row boundaries:

- Report filters should not include workspace or user scope fields.
- Date ranges should use the shared flat query shape and Temporal-aware helpers.
- Hidden IDs belong in report columns when the frontend needs drill-down links.
- Links are resolved by the frontend because route state and navigation policy
  live there.
- Raw SQL in reports needs explicit visible base rows or row-security guards
  before aggregation.

Reports should explain numbers. When a row represents a total, balance, or
summary, link it back to the source record, ledger, or detail report where that
helps the reviewer or user inspect the result. See
[Create Reports](/docs/subsystems/reports/) for route-based reports, scoped
report data, `GridDataset`, and drill-down links.

## Frontend work stays typed and scoped

Choose the narrowest frontend surface that matches the workflow:

- Use generated table screens for ordinary record browsing and editing.
- Use `SchemaTableGridView` when a custom route still works with Sapporta table
  records.
- Use TGrid when the route needs custom columns, toolbar actions, selection, or
  nested layouts while still relying on table APIs.
- Use report components for route-based reports.
- Use typed app API clients for app-owned features that require custom backend
  behavior.

The main frontend touchpoints are `packages/frontend/src/App.tsx` for
`appNavigation`, `appHomeRoute`, `appPublicRoutes`, and `appProtectedRoutes`,
and `packages/frontend/src/api.ts` for typed clients.

Hidden form inputs and frontend filters are not authorization. Generated table
APIs and custom backend routes must enforce scope server-side. See
[Build Screens](/docs/subsystems/frontend-screens/) and
[Table-Aware Grids](/docs/subsystems/grid/) for the frontend route, form, grid,
and report-screen patterns.

## The agent validation loop

Use this checklist when reviewing an LLM-assisted change:

```txt
[ ] table definitions use explicit rowScope and required scope columns
[ ] generated SQL migration was reviewed before db:migrate
[ ] shared contract declares every request and response status shape
[ ] custom route is mounted and appears in sapporta endpoints list
[ ] route resolves auth at the edge with the narrowest data authority
[ ] ordinary row work uses scopedRows()
[ ] custom joins/transactions/aggregates use rowSecurity.forTable()
[ ] frontend imports a typed client instead of hand-writing fetch shapes
[ ] reports return the shared report/grid result shape and include needed hidden IDs
[ ] tests or CLI/API checks cover the changed route, report, or table behavior
```

The goal is not to trust the agent. The goal is to make the change small enough
and the outputs explicit enough that a reviewer can inspect them.

## Example: one feature request, many guardrails

Feature request: "Add an approval action for draft invoices."

```txt
packages/shared/src/contracts/invoices.ts
  Defines POST /invoices/:id/approve request and response schemas.

packages/api/app/invoices.ts
  Registers the route, resolves auth, loads the row through scopedRows(), and
  returns explicit 404/409 errors for missing rows or invalid status.

packages/api/modules/invoices/services/approve-invoice.ts
  Holds the domain invariant: only draft invoices can be approved.

packages/frontend/src/api.ts
  Exposes invoicesApi.approveInvoice from the shared contract.

packages/frontend/src/screens/Invoices.tsx
  Calls the typed client and refreshes the current row or grid state.
```

The guardrails are visible in code:

- The browser never sends `workspace_id`.
- The route does not update by primary key alone.
- The status invariant is tested outside React.
- The contract makes client/server drift visible at build time.
- `sapporta endpoints show` proves the route is mounted.

That example still needs product judgment. A human should decide what "approval"
means, which roles can run it, which statuses are allowed, whether approval is
reversible, what should be audited, and how the UI should present the resulting
state.
