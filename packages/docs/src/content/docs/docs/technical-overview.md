---
title: "Technical overview"
description:
  "A whirlwind tour of Sapporta"
---

Sapporta is a TypeScript toolkit for building database applications —
operational tools, internal business software, personal databases — anything
whose center is a relational model that people and programs need to read, edit,
and report on.

You declare tables. Sapporta derives the rest of the application from those
declarations while it runs: the HTTP API, the admin screens, the query grammar,
the OpenAPI document, and the view the CLI takes of your data. 

## Single process deployment

A Sapporta application is one Node process. It serves an HTTP API under `/api`,
serves the built React single-page app from that same process, and reads and
writes a SQLite file on local durable storage.

```
   browser (React SPA)      sapporta CLI · scripts · agents
            │                              │
            └──────────────┬───────────────┘
                           │  HTTP
                ┌──────────▼──────────┐
                │   one Node process  │
                │   Hono · /api       │
                │   + the built SPA   │
                └──────────┬──────────┘
                           │
                      SQLite file
```

The project is yours. `sapporta init` scaffolds a workspace you own outright:
the Hono API, the Drizzle schema, the React routes, the auth policy, the
deployment files. Sapporta stays an npm dependency inside that workspace rather
than a template you edit away from.

## Table declaration generates APIs, grids, and agentic operation

A table lives in `packages/api/schema/` and is declared using Drizzle. It is then
enriched with Sapporta metadata:

```ts
// packages/api/schema/invoices.ts
export const invoicesTable = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace_id: text("workspace_id").notNull(),
  scoped_to_user_id: text("scoped_to_user_id").notNull(),
  customer_id: integer("customer_id").references(() => customersTable.id),
  number: text("number").notNull(),
  // `select` and `money` are imported from Sapporta; they provide Drizzle spec
  // as well as semantic information for Sapporta grids, validations and APIs.  
  status: select("status", ["draft", "sent", "paid"]).notNull(),
  total: money("total").notNull(),
  issued_at: timestamp("issued_at").notNull(),
  paid_at: timestamp("paid_at"),
});

// The Sapporta metadata
export const invoices = sapportaTable({
  drizzle: invoicesTable,
  meta: {
    label: "Invoices",
    // Scope each invoice to a specific workspace and a specific user 
    rowScope: "workspaceUserScoped", 
    // Use the invoice number as a label for the entire row,
    // for example in foreign key comboboxes 
    rowLabelColumns: ["number"],
  },
});
```

### Value kinds

`money()`, `percentage()`, `select()`, `bool()`, `date()`, `timestamp()` and
their siblings each return an ordinary Drizzle column builder and register the
column's **value kind** in the same call. A kind is the column's semantic type,
which is richer than its SQL type: `money` and `percentage` are both stored
integers, and nothing downstream would be able to tell them apart otherwise.

Every later layer reads the registered kind. `money("total")` renders
right-aligned and currency-formatted in the grid, offers `gte` and `lte` in the
filter menu, and appears as a number in the OpenAPI schema.
`select("status", [...])` becomes a dropdown in the form, an enum in the
contract, and an equality filter with three choices. The kind is stated once and
needs no revisiting per surface.

Plain Drizzle columns work too; their kind is inferred from the SQL data type. A
column with no explicit label gets one derived from its name, with a trailing
`_id` stripped, so `customer_id` reads as "Customer" everywhere and follows the
column through a rename.

### Validation at boot

Sapporta validates the whole schema at startup rather than at first request, so
mistakes cause the app to crash on boot rather than continuing silently.

A few other checks are involved in sapporta definitions: Names that
would collide with a route segment or with the columns Sapporta manages are
rejected. A table with no primary key is an error rather than a table with an
invented `id`. Timestamps must be in string mode, for reasons
[time and time zones](#time-and-time-zones) explains. And a numeric column must
be `notNull()`:

> `SUM` over a column containing one NULL returns NULL, and `AVG` skips NULLs
> and reports the average of what remains. Neither warns, so the report renders
> and the total is wrong. Keys are exempt — nobody sums a `customer_id`, and "no
> customer yet" is a real state — and any other column can be marked
> non-additive to say its nullability is intentional.

**Continue with:** [Tables, columns, and schema metadata](/docs/guides/model-data/tables-columns-and-schema-metadata/)
· [Table validation](/docs/reference/schema/table-validation/)

## The catalog

Validation produces the **catalog**: one `TableDef` per table, holding the
columns, their kinds, the labels, the row scope, and the search configuration.
The catalog is an ordinary runtime object, readable by any code that wants it.

Everything else in the application is computed from it.

```
                 ┌── REST routes: list, get, create, update, delete,
                 │                lookup, count, export.csv
                 ├── the OpenAPI document, and the typed client generated from it
one              ├── row-scope predicates, reference checks, ownership stamping
declaration ─────┼── grid columns: renderer, editor, alignment, width
                 ├── form fields, and their edit permissions
                 ├── filter operators and their input controls
                 └── CSV columns, for the export and for clipboard copy
```

**None of that is code generation.** No files are written - all of this is 
computed from the catalog — some  at boot, some when a request arrives — 
so adding a file to `packages/api/schema/` produces a new set of endpoints and a new admin screen
with no other step.

The code that reads the catalog is split across three packages.

```
                        @sapporta/shared
      contracts · query grammar · value kinds · CSV · GridDataset
           imported by both sides — no server, no React

              ┌──────────────┴──────────────┐
              ▼                             ▼
       packages/api                  packages/frontend
       the catalog                   schema store
       generated routes              binding layer
       guards · permission           grid engine
       row security                  screens: grid, forms,
       Drizzle → SQLite                filters, reports
              │                             │
              └──────────  HTTP  ───────────┘
                  the browser, the `sapporta` CLI, your scripts
```

`@sapporta/shared` defines
every wire shape and both sides import it, so a server/client mismatch is a type
error rather. 

And the grid engine under the admin
screens is written against columns and rows alone, with the binding layer
compiling a table's schema into grid columns and endpoints — so the grid runs
without the framework, and the binding can be replaced without touching the
grid.

## The life of a request

Every call to a generated route runs in this order:

```
  HTTP request
      │
      ▼
  contract parse ─── body and query, against the route's Zod schema
      │
      ▼
  auth resolve ───── bearer token, else session cookie, else anonymous
      │
      ▼
  permission ─────── can(action, table) → a boolean; false is 403
      │
      ▼
  row scope ──────── the table's declared scope, bound to this request's authority
      │
      ▼
  write gate ─────── writes only: control-character reject, strict per-column parse
      │
      ▼
  operation ──────── every query wrapped in the ownership predicate
      │
      ▼
  response ───────── a 2xx body, or { error, code, details }
```

**Parse.** A route's request and response shapes are written once, in
`@sapporta/shared`, as a ts-rest contract with Zod schemas. The server parses
requests against it, the generated client takes its call signatures from it, and
the OpenAPI document is emitted from it — one contract, three consumers, and
adding a field is one edit. A malformed query is a `400` before the database is
touched.

**Authenticate.** Resolution tries a bearer token, then a session cookie, then
resolves anonymous. Anonymous is a legitimate resolved state that public routes
use, not a failure; no placeholder user is created for it.

**Authorize.** `ability.can(action, table)` returns a boolean — may this caller
create invoices at all. It is never compiled into SQL and never consulted per
row.

**Scope.** The rows come next, and separately. The table's declared scope is
bound to the authority this request carries, and the resulting predicate wraps
every query the operation runs.

**Validate.** Writes pass one gate, which rejects rather than repairs. String
fields refuse control characters other than tab, newline, and carriage return —
text carrying a vertical tab stores cleanly, renders as ordinary text, breaks a
CSV export weeks later, and cannot be found by searching for what it looks like.
A strict per-column parse runs next, so a misspelled column name fails the write
instead of being dropped, and the parsed value is what gets written.

**Respond.** Failures have one shape, with a code that can be branched on.

```jsonc
// 422
{
  "error": "Validation failed",
  "code": "VALIDATION_FAILED",
  "details": [{ "field": "total", "message": "Expected number" }]
}
```

The `ErrorCode` set is closed and each code maps to exactly one status, so a
caller branches on the code rather than pattern-matching a message. SQLite
constraint failures are classified: unique and primary-key violations become
`409`, other constraint failures `422`. A database error classified as a 500 has
its message replaced with a generic one, while 4xx responses keep their specific
message — the caller learns what they did wrong, and not what the database looks
like inside.

**Continue with:** [Generated table APIs](/docs/guides/generated-surfaces/generated-table-apis/)
· [Table endpoints](/docs/reference/http/table-endpoints/)
· [Expected errors and HTTP mapping](/docs/guides/application-code/expected-errors-and-http-mapping/)

## Row security

Two of those stages decide what a caller reaches, and they are deliberately
different things. Permission is a boolean about a table. Row visibility is a
predicate about rows — and it is a property of the table declaration, not of
each handler. Handlers never write `where workspace_id = ?` themselves.

A request resolves to one context, that context produces SQL predicates, and the
same derivation drives reads, writes, ownership stamping, and reference checks.
The context keeps four things separate: `principal` (who is asking),
`dataAuthority` (which trusted ownership facts this request may use), `ability`
(which named actions are allowed), and `rowSecurity` (the per-table helpers that
turn authority into SQL). They stay separate so that granting an action never
widens a row predicate.

### Declared scopes

Each table selects one of three rules with `rowScope`, and the rule fixes both
the SQL predicate and the authority a request must carry to use it.

| `rowScope` | A request reaches a row when | SQL predicate | Authority slot |
| --- | --- | --- | --- |
| `workspaceUserScoped` *(default)* | the row's workspace **and** user both match | `workspace_id = ? AND scoped_to_user_id = ?` | `workspaceUserScoped` |
| `workspaceGlobal` | the row's workspace matches | `workspace_id = ?` | `workspaceGlobalOnly` |
| `systemGlobal` | always — the table is not partitioned | `TRUE` | `systemGlobalOnly` |

A table that declares nothing gets the narrowest of the three; widening is
explicit. When the authority slot a table needs is absent, the call throws a 403
rather than falling back to something broader: querying a workspace-global table
with user-scoped authority is a forbidden request, not a broken schema.

`scopedRows` is where this is enforced. Every generated handler goes through it,
and custom code can call it directly — it is the supported way to query a table
from a custom endpoint. Every operation, including get, update, and delete by
primary key, wraps its predicate in the scope predicate, so a primary-key hit
counts only if the row was visible to this request, and a guessed or copied id
is a 404.

### Permission and authority

Permission is swappable; authority is fixed. Permissions reach the framework through one method — `can(action, subject)`
returning a boolean — and that method is the entire interface. The scaffold
builds abilities with CASL; the framework imports no CASL and reads no CASL
condition, so a role table, an attribute check, or a call to a policy service
satisfies the interface just as well.

Authority produces SQL, so it is fixed. A request carries up to three additive
slots, each holding the trusted ownership facts it may use for predicates,
insert stamping, and reference checks. At least one is required at the type
level, and a runtime guard rejects conflicting workspace ids across the two
workspace slots.

### Reference checks

The reference check is built from the same predicate the read path uses,
AND-composed with equality on the submitted value, so a row this request could
not read is an invalid reference and the check can never be more permissive than
a read of the target table.

> An existence check — `SELECT 1 FROM customers WHERE id = ?` — answers yes for
> another workspace's customer. A user in workspace A could attach their invoice
> to a customer in workspace B by supplying the id, and every later read of that
> invoice would resolve a label out of another tenant's data.

### Ownership on insert

The insert path runs in a fixed order: prohibited API fields are rejected,
trusted server values are merged, references are validated against the merged
row, and the authority-derived ownership values are spread last, so nothing in
the input can overwrite them. A body containing `workspace_id` does not fail;
that field is simply not the one that decides. Updates never stamp ownership, so
no `PUT` can re-home a row into another workspace.

The scope columns, generated primary keys, and columns marked non-writable are
rejected before validation, and the same flags are omitted from the generated
client types and the OpenAPI schema. What a form allows editing is a rendering
of this server-owned rule rather than a second copy of it.

### Identity and workspaces

`sapporta init` writes one implementation of this model into the project: Better
Auth with a multi-tenant organization model in which an organization is the
workspace. The application owns and edits that code directly.

The principal is a union of `anonymous` and `user` — public traffic creates no
users, sessions, memberships, or workspace ids. Roles sit on the workspace
membership rather than on the user, so one person holds different roles in
different workspaces, and owner is a workflow permission: an owner may invite
users and change settings while the row boundary on user-scoped tables stays
where it is.

Bearer tokens resolve before session cookies, and a token names the workspace
for its request explicitly while a browser session takes its workspace from the
session's active organization — so a script writes where its token was scoped
whatever the browser last selected. Tokens are stored as hashes and shown once,
and token management is interactive-only, so a stolen token cannot be used to
manufacture more.

**Continue with:** [Workspaces, ownership, and row visibility](/docs/guides/security/workspaces-ownership-and-row-visibility/)
· [Scoped table reads and writes](/docs/guides/security/scoped-table-reads-and-writes/)
· [Authentication and abilities](/docs/guides/security/authentication-and-abilities/)

## Querying

Row security decides which rows exist for a request. The query grammar decides
which of those the caller asked for. Filtering, sorting, searching, paginating,
counting, and exporting all use one grammar: it lives in the shared package, the
server resolves it to SQL, and the filter UI authors it.

Conditions travel in the URL.

```
GET /api/tables/invoices
      ?filter[status][eq]=sent
      &filter[total][gte]=1000
      &filter[customer_id][in]=4,9,17
      &filter[paid_at][is]=null
      &sort=-issued_at&page=2&limit=50&q=acme
```

**An unknown filter column is a 400.** `filter[naration][eq]=X`, a typo for
`narration`, is rejected by name. A parser that iterates the parameters it
recognises and ignores the rest would return *every row* instead: the page
renders, the total looks plausible, and nothing on screen says the number is
wrong. Silent-ignore is rejected as a class — decoding validates the grammar,
resolution validates the column and whether that operator applies to that kind
of value, and each failure is a 400 carrying a specific code.

Which operators apply to which value kind is one table in the shared package,
and both sides read it. The operators offered on a money column are the
operators the server will accept, whatever the entry point.

Two properties fall out of running every read surface through the same
resolution. The list view and the CSV export run one filter state down one path,
which is what makes an exported file match the screen it was exported from. And
every read is ordered by the primary key last — requested sort, table default,
or no sort at all — so pagination stays stable under ties.

Search is configured per table and normalised when the catalog is built, with
cycles and unknown columns failing at boot. At request time the predicate omits
the branches this requester cannot read, and when nothing readable is left it
becomes a deliberately false predicate returning zero rows. Child and
referenced-label branches run as `EXISTS` subqueries wrapped in the target
table's own ownership predicate, so search cannot become a side channel around
row security.

**Continue with:** [Filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)
· [Query syntax](/docs/reference/http/query-syntax/)
· [Relational search semantics and security](/docs/guides/model-data/relational-search-semantics-and-security/)

## Time and time zones

One kind of value resists all of the above, because it means different things in
different places. Time cuts across storage, query, grid, forms, and export, so
it is stated once here rather than repeated at each surface.

The canonical instant is `YYYY-MM-DDTHH:mm:ssZ`: UTC, fixed width, fractional
seconds truncated. The formatter re-checks its own output against that pattern
and fails rather than storing a value that would break the ordering.

Fixed width matters because SQLite TEXT storage sorts by raw string comparison.
Compare `2026-08-24T10:00:00Z` with `2026-08-24T10:00:00.5Z` as strings: `.`
sorts before `Z`, so the later instant sorts first, and anything relying on
string order is then wrong for exactly the rows that happen to carry a fraction.
Drizzle's Date-object timestamp mode is rejected at boot for this reason.

A day, meanwhile, is resolved in the workspace's time zone. The workspace row
carries an IANA zone, and every day-shaped decision resolves against it: the
bounds of a day-ranged filter, the buckets of a grouped report, the wall clock a
timestamp cell is printed on. "Revenue for August 24" therefore names one set of
rows for everyone looking at one dashboard, rather than a different set per
viewer's laptop. Grouping by local day goes through a `to_tz_date(col, zone)`
function the driver registers on every connection, because SQLite ships no time
zone database and `date(col, 'localtime')` would resolve against whichever
process opened the file.

Date ranges travel as a state rather than as two dates. `DateRangeState` is a
union of all-time, relative, and custom absolute bounds, and flattening happens
where the query is built, from a zone and a moment the caller supplies. A user's
"Last 30 days" therefore stays semantically that through every layer, instead of
being turned at the first opportunity into two dates that then silently age.

**Continue with:** [Days and time zones](/docs/reference/server/days-and-time-zones/)
· [Group and filter by day](/docs/guides/reports/group-and-filter-by-day/)

## The admin frontend

All of that is invisible until someone looks at a screen. The admin frontend
centers on an editable grid, with forms, filters, links, and reports around it,
and two layers matter for the mental model.

A **generic grid engine** contains no Sapporta concepts: no tables, no row
scope, no REST. A **binding layer** compiles a table's schema into grid columns
and REST endpoints. The grid therefore runs without the framework, the binding
can be replaced without touching the grid, and a generated screen and a
hand-written one share one engine. An application that outgrows the generated
grid moves down a layer rather than out of the system.

The grid is a product in its own right, with [its own documentation](/grid/).
Three behaviours are worth knowing at this level.

**An edit renders before the server confirms it.** The value is written into the
snapshot immediately and sent, and the response produces exactly one reconcile
event of three kinds: `agreed`; `diverged`, where the authoritative value is
written first and then reported, so a server-side adjustment is visible *as an
adjustment* rather than as one value silently replacing another; or `rejected`,
carrying the backend's reason alongside both the optimistic and the prior value.
A batch has the opposite contract — atomic from the grid's point of view,
reverting every change on any rejection, so a half-applied batch is never
displayed.

**Forms render server-owned rules.** A form offers exactly the fields the API
will accept, with editability computed from the flags the server enforces. A
column the server would reject gets no control at all, and marking a column
read-only later stops it being offered without anyone touching the form. Query
state round-trips the URL exactly: encode and decode are inverses, and the
filter UI reads its operator sets from the same shared table the server resolves
against.

**Reports are the same grid, readonly.** Grouping, expansion, footers,
conditional colouring, and keyboard navigation are the engine's existing
behaviour rather than report-specific code. A report result is data with a
declared shape — `GridDataset` is a Zod schema in the shared package, parsed at
the boundary rather than asserted in TypeScript — so the server can produce a
report with whatever query it likes, including raw SQL beneath every layer in
this document, and the frontend renders it with no report-specific code.

**Continue with:** [Grid interaction and selection](/docs/guides/generated-surfaces/grid-interaction-and-selection/)
· [Report datasets and formatting](/docs/guides/reports/report-datasets-and-formatting/)
· [Choose a grid layer](/grid/start/choose-a-grid-layer/)

## Machine interfaces

A person is one kind of caller. The same surfaces were built for the other kind.

The OpenAPI document is emitted from the same contracts the server parses
against, and the typed client is generated from it, so a call from application
code has the route's request and response types without a second declaration.
The document has its own `public` / `authenticated` / `disabled` policy,
independent of the authorization on the routes it describes: reading the
catalogue and calling what is in it are separate grants.

The `sapporta` CLI is a client of that same HTTP API. Its commands authenticate
with a bearer token and go through the same authorization and row scoping as any
other caller, so what the CLI can read is exactly what that token could read
through the browser. That property — not a special mode, just the absence of
one — is what makes it safe to hand to an agent.

```bash
sapporta tables show invoices
sapporta rows list invoices --where 'filter[status][eq]=sent' --limit 20
sapporta sql "select status, count(*) from invoices group by status"
```

Output is a rendered table when stdout is a TTY and JSON otherwise, with an
explicit `--output` beating both, so piped, scripted, and agent invocations get
machine-readable output without having to ask for it. Ad-hoc SQL is read-only by
default: reads run inside a query-only pragma that is restored afterward, writes
need an explicit opt-in through a separate `sql execute` command, and
`DROP TABLE` and `ALTER TABLE` are blocked even under the opt-in.

**Continue with:** [Use the Sapporta CLI](/docs/guides/discovery/use-the-sapporta-cli/)
· [OpenAPI and endpoint discovery](/docs/guides/discovery/openapi-and-endpoint-discovery/)
· [Agent access and scoped tokens](/docs/guides/security/agent-access-and-scoped-tokens/)

## The project

Those are the surfaces. What follows is the project that hosts them.

`sapporta init` renders into a hidden staging directory and renames into place
only after install, the SQLite smoke test, the first migration, and an initial
git commit have all passed. Any earlier failure removes the staging directory
and leaves the target untouched, so a failed scaffold can be run again directly.

Code reaches the resulting project in one of two ways. Most of it is
**imported**: the `@sapporta/*` packages the project depends on, where all real
behaviour lives. The rest is **copied** — the files `sapporta init` writes into
the project, which is boot wiring such as `boot.ts` and `main.tsx`, starter
examples such as `app.ts` and `authz/`, and workspace files such as
`package.json` and the env files.

**The project owns every copied file and may edit any of them.** Sapporta writes
them once and never rewrites them; there is no file the scaffold reserves for
itself and no category you are expected to leave alone. That works because the
copied files are wiring rather than behaviour — upgrading Sapporta is a package
version bump, and the improvements arrive through the imports rather than
through a template the project would have to re-sync with.

Migration state is three problems, and the boot-time guard reports them
together: pending (not yet applied), missing (applied, file gone), and changed
(hash mismatch), each with the command that fixes it. The fix differs per
category, which is why they are not collapsed into "your migrations are out of
date".

**Continue with:** [Create a Sapporta project](/docs/getting-started/create-a-project/)
· [Schema changes and migrations](/docs/guides/model-data/schema-changes-and-migrations/)
· [Runtime and deployment contract](/docs/reference/operations/runtime-and-deployment-contract/)

## Where the layers open

One property runs through all of it: no layer is a dead end. Every layer
described above has a documented exit, and each one names what it trades away.

| Layer | The way out | What you give up |
| --- | --- | --- |
| Routing | Custom ts-rest contracts register on the same API object | Nothing — the contract is still parsed and typed |
| Response shape | Return a raw `Response` | The error envelope and the generated client's typing |
| Route guard | Pass a custom guard to the handler factory | The default auth resolution |
| Row security | Call `scopedRows` directly from a custom endpoint | Nothing — this is the supported way to query a table |
| Row security | `withDataAuthority()` re-narrows the engine | Nothing — a deliberate narrowing for one workflow |
| Row security | Raw Drizzle or raw SQL | Every guarantee in [Row security](#row-security), at exactly that call |
| Query grammar | Hand-written `WHERE` clauses; bounded reads for small sets | The shared grammar, and the filter UI's ability to author it |
| Reports | Any query, including raw SQL, returned as a `GridDataset` | Row security, unless you use the scoped report helpers |
| Grid data | Any object satisfying the data-source protocol | The REST binding and its schema-derived columns |
| Grid columns | Fully custom column specs on a level | The kind-derived renderers, editors, and filters |
| Auth screens | Take the auth runtime without the pages | The shipped sign-in, sign-up, and reset screens |

The cost of leaving a layer is paid at the call site that leaves it, and it is
paid in guarantees rather than in compatibility. Code above and below an escape
hatch keeps working.

**Continue with:** [Custom API endpoints](/docs/guides/application-code/custom-api-endpoints/)
· [Row-safe custom endpoints and reports](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
· [Scoped report data](/docs/guides/reports/scoped-report-data/)

## A note on failure

One goal recurs through every decision above: a mistake should fail at boot or
return a 4xx, instead of producing a page that renders with a wrong number on
it.

Nullable numeric columns, mistyped filter parameters, timestamps that sort out
of order, and foreign keys checked for existence rather than visibility are each
rejected for that reason. They share a shape — each one produces output that
looks right, on a screen with nothing on it to say otherwise. A system that
returns an error is inconvenient once. A system that returns a plausible wrong
answer is trusted until someone happens to check.
