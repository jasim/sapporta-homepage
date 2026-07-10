---
title: "Custom API Endpoints"
description:
  "Add app-owned endpoints with shared contracts, typed handlers, auth, files,
  errors, and frontend clients."
---

Create a custom endpoint when the action is a app-owned feature rather than
ordinary row CRUD: voiding an invoice, importing a bank statement, approving an
expense, posting a journal, calling an external service, returning a custom
shape, or coordinating a transaction.

Keep using table APIs for list, get, create, update, delete, lookup, count, and
export behavior. Use report routes for summaries, ledgers, statements, and
rollups.

## Contract file

Put request and response contracts in `packages/shared/src/contracts/`. Keep
this file browser-safe: Zod schemas, constants, serializers, and types only. Do
not import React components, route handlers, database queries, database handles,
or file I/O.

```ts
// packages/shared/src/contracts/invoices.ts
import { z } from "zod";
import { initContract } from "@sapporta/rest-core";
import { errorBodySchema } from "@sapporta/shared/contracts";

const c = initContract();

export const invoicesContract = c.router({
  voidInvoice: c.mutation({
    method: "POST",
    path: "/invoices/:id/void",
    summary: "Void an invoice",
    metadata: { tags: ["invoices"] },
    pathParams: z.object({ id: z.coerce.number().int() }),
    body: z.object({
      reason: z.string().min(1),
    }),
    responses: {
      200: z.object({
        data: z.object({
          id: z.number(),
          status: z.literal("void"),
        }),
      }),
      404: errorBodySchema,
      409: errorBodySchema,
      422: errorBodySchema,
    },
  }),
});
```

Use `c.query(...)` for `GET`. Use `c.mutation(...)` for `POST`, `PUT`, `PATCH`,
and `DELETE`. Declare `path`, `pathParams`, `query`, `body`, `responses`,
`summary`, `metadata.tags`, and `contentType` as needed.

Re-export the contract:

```ts
// packages/shared/src/contracts/index.ts
export { invoicesContract } from "./invoices.js";
```

## Route handler

Put a small workflow handler in `packages/api/app/<feature>.ts`. For a larger
domain, keep that file focused on HTTP input/output and call services under
`packages/api/modules/<domain>/`.

```ts
// packages/api/app/invoices.ts
import {
  RowNotFoundError,
  scopedRows,
  TsRestApi,
  type SapportaEnv,
} from "@sapporta/server";
import { invoicesContract } from "your-app-shared";
import { projectAuth } from "../project-auth/index.js";
import { invoices } from "../schema/invoices.js";

const api = new TsRestApi<SapportaEnv>();

api.register(
  "voidInvoice",
  invoicesContract.voidInvoice,
  async ({ c, request }) => {
    const auth = projectAuth.requireAuthorizedWorkspaceUserData(c, {
      action: "update",
      subject: "invoices",
    });
    const rows = scopedRows(c.get("db"), auth, invoices);

    try {
      const invoice = await rows.get(request.params.id);
      if (invoice["status"] === "paid") {
        return {
          status: 409,
          body: { error: "paid_invoice_cannot_be_voided" },
        };
      }

      const updated = await rows.update(request.params.id, {
        status: "void",
        void_reason: request.body.reason,
      });

      return {
        status: 200,
        body: { data: { id: Number(updated["id"]), status: "void" } },
      };
    } catch (err) {
      if (err instanceof RowNotFoundError) {
        return { status: 404, body: { error: "invoice_not_found" } };
      }
      throw err;
    }
  },
);

export default api;
```

`api.register("routeId", contract.route, handler)` connects the contract to the
handler and validates path params, query, headers, and body before your workflow
runs. Zod request failures return `400`; handlers do not need manual JSON
parsing. Handler inputs are typed, so `request.params.id` is a number when the
contract uses `z.coerce.number()`.

Return `{ status, body }` and declare every returned status in the contract.
Return the shape declared in `responses`; endpoint discovery and typed clients
rely on that contract.

## Make the route reachable

Import and connect the route from `packages/api/app.ts`:

```ts
// packages/api/app.ts
import invoicesApi from "./app/invoices.js";

export function loadApp(app: TsRestApi<SapportaEnv>, _options: LoadAppOptions) {
  app.route("/", invoicesApi);
}
```

Write contract paths without `/api`. A contract path `/invoices/:id/void` is
served at `/api/invoices/:id/void`.

Creating `packages/api/app/invoices.ts` is not enough by itself. If a route does
not appear in `pnpm exec sapporta endpoints list`, confirm it is connected from
`loadApp()`.

Only add entries to `publicApiRoutes` when anonymous visitors should be able to
call the endpoint. Public routes must still check the requested action and apply
row security before reading or writing data.

## Auth and data access

Resolve auth at the route edge with the narrowest helper that fits the workflow:

```ts
const auth = projectAuth.requireAuthorizedWorkspaceData(c, {
  action: "create",
  subject: "customers",
});
```

Use `scopedRows(db, auth, table)` for ordinary table work:

```ts
const rows = scopedRows(c.get("db"), auth, customers);
const created = await rows.create(request.body);
```

Use `auth.rowSecurity.forTable(table)` when the workflow needs custom Drizzle
joins, transactions, aggregates, or multi-table state transitions:

```ts
const invoiceGuard = auth.rowSecurity.forTable(invoices);
const lineGuard = auth.rowSecurity.forTable(invoiceLines);

const created = await c.get("db").transaction(async (tx) => {
  const invoice = await tx
    .insert(invoicesTable)
    .values(await invoiceGuard.insertValues(tx, request.body.invoice))
    .returning()
    .get();

  const lines = await lineGuard.insertManyValues(tx, request.body.lines, {
    serverValues: () => ({ invoice_id: invoice.id }),
  });

  await tx.insert(invoiceLinesTable).values(lines);
  return { invoice, lines };
});
```

Use raw SQL only when scoped row helpers and row-security guards do not fit the
workflow. Keep that SQL close to the domain code and note why the higher-level
helpers do not fit.

Never hand-stamp or trust client-provided `workspace_id`, `workspaceId`,
`scoped_to_user_id`, or `scopedToUserId`. Never update or delete scoped tables
by primary key alone; compose row ownership into the SQL predicate.

## Multipart and non-JSON responses

For uploads, set `contentType: "multipart/form-data"` and declare file fields
with `z.instanceof(File)`:

```ts
// packages/shared/src/contracts/imports.ts
import { z } from "zod";
import { initContract } from "@sapporta/rest-core";
import { errorBodySchema } from "@sapporta/shared/contracts";

const c = initContract();

export const importsContract = c.router({
  uploadStatement: c.mutation({
    method: "POST",
    path: "/imports/statements",
    summary: "Upload a bank statement",
    contentType: "multipart/form-data",
    body: z.object({
      statement: z.instanceof(File),
      source: z.string().min(1),
    }),
    responses: {
      200: z.object({ rows_imported: z.number() }),
      422: errorBodySchema,
    },
  }),
});
```

On the server, read file fields from the `files` handler argument and non-file
fields from `request.body`:

```ts
api.register(
  "uploadStatement",
  importsContract.uploadStatement,
  async ({ request, files }) => {
    const statement = files.statement as File;
    const bytes = Buffer.from(await statement.arrayBuffer());

    const rowsImported = await importStatement({
      source: request.body.source,
      bytes,
    });

    return { status: 200, body: { rows_imported: rowsImported } };
  },
);
```

For multiple files, declare `z.array(z.instanceof(File))` and read
`files.fieldName` as `File[]`.

For CSV or another response content type, declare an alternate response:

```ts
responses: {
  200: c.otherResponse({ contentType: "text/csv", body: z.string() }),
}
```

For streaming, custom headers, or a response that does not fit the normal
`{ status, body }` shape, return a raw `Response` from the handler.

## Errors

Use declared non-2xx responses for expected domain failures:

| Status | Use it for                                                  |
| ------ | ----------------------------------------------------------- |
| `404`  | A row is missing or invisible in the active auth boundary.  |
| `409`  | The resource state conflicts with the requested transition. |
| `422`  | The request parsed, but the workflow cannot accept it.      |
| `502`  | An upstream service failed.                                 |

Simple route checks can return a declared error directly:

```ts
if (invoice["status"] === "paid") {
  return {
    status: 409,
    body: {
      error: "paid_invoice_cannot_be_voided",
      code: "invoice_state_conflict",
    },
  };
}
```

For errors raised deep in service code, define typed domain errors near the
workflow and translate them once at the route edge:

```ts
try {
  const result = await postJournalEntry({
    db: c.get("db"),
    input: request.body,
  });
  return { status: 201, body: { data: result } };
} catch (err) {
  if (err instanceof ClosedPeriodError) {
    return { status: 422, body: err.toPayload() };
  }
  throw err;
}
```

Unexpected errors should still bubble to Sapporta's default error handler.

## Verification

After adding the contract, handler, and `loadApp()` entry, inspect the live
route:

```bash
pnpm exec sapporta endpoints list
pnpm exec sapporta endpoints show "POST /api/invoices/{id}/void"
```

Then call the route directly:

```bash
pnpm exec sapporta api post /api/invoices/123/void \
  --body '{"reason":"duplicate"}'
```

If the frontend import does not type-check, confirm the contract is re-exported
from `packages/shared/src/contracts/index.ts` and from the shared package barrel
used by the app.
