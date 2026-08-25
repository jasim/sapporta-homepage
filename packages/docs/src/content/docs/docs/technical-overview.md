---
title: "Technical overview"
description:
  "How a Sapporta application is layered: a table declaration produces the
  APIs, screens, and guarantees around it, and each boundary sits where it does
  for a stated reason."
---

A Sapporta application is built by declaring tables. Each declaration produces
an HTTP API, admin screens, a query grammar, and the rules for who may see which
row. This document describes those layers and why each boundary sits where it
does.

One goal recurs: a mistake fails at boot or returns a 4xx, instead of producing
a page that renders with a wrong number on it. Nullable numeric columns,
mistyped filter parameters, and foreign keys checked for existence rather than
visibility are each rejected for that reason.

## What a Sapporta application is made of

A table lives in `packages/api/schema/` and is declared twice in the same file:
a Drizzle table for the storage, and Sapporta metadata for how the application
should treat it.

```ts
// packages/api/schema/invoices.ts
export const invoicesTable = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace_id: text("workspace_id").notNull(),
  scoped_to_user_id: text("scoped_to_user_id").notNull(),
  customer_id: integer("customer_id").references(() => customersTable.id),
  number: text("number").notNull(),
  status: select("status", ["draft", "sent", "paid"]).notNull(),
  total: money("total").notNull(),
  issued_at: timestamp("issued_at").notNull(),
  paid_at: timestamp("paid_at"),
});

export const invoices = sapportaTable({
  drizzle: invoicesTable,
  meta: {
    label: "Invoices",
    rowScope: "workspaceUserScoped",
    rowLabelColumns: ["number"],
  },
});
```

The Drizzle half says `total` is an integer column. The Sapporta half says that
integer is money, that an invoice belongs to one user inside one workspace, and
that humans refer to an invoice by its number.

### One declaration, many surfaces

Restart the server and the table has an HTTP API — list, get, create, update,
delete, plus lookup, count, and CSV export. Routes resolve their table from the
catalog when a request arrives, so a new file in `packages/api/schema/` produces
a new set of endpoints with no registration step.

That same declaration drives the rest of the system:

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

The grid, the create form, the filter UI, and the `sapporta` CLI read that same
declaration, so one schema change reaches all of them and no surface holds a
second definition of what a `money` column is.

### How the code is layered

```
                       @sapporta/shared
      contracts · query grammar · value kinds · CSV · GridDataset
       imported by both sides — no server, database, or React code

        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
   packages/api                                  packages/frontend
     catalog                                       schema store
     generated routes                              binding layer
     guards · permission                           grid engine — no
     row security (scopedRows)                       Sapporta concepts
     Drizzle → SQLite                              screens: grid, forms,
        ▲                                            filters, reports
        │
        └── one HTTP surface: the browser, the `sapporta` CLI, your scripts
```

Two boundaries in that picture do most of the work. `@sapporta/shared` defines
every wire shape and both sides import it, so a server/client mismatch is a type
error rather than a runtime surprise. The grid engine under the admin screens is
written against columns and rows alone, and the binding layer compiles a table's
schema into grid columns and endpoints, so the grid runs without the framework
and the binding can be replaced without touching the grid.

### The path every request takes

Every call to a generated route runs the same sequence, in the same order.

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

As a caller: a malformed query is a `400` before the database is touched.
Anonymous is a legitimate auth state. Permission asks whether the caller may
perform an action on the table; the scope decides one step later which rows the
caller reaches, the same way for list, get, and delete. Writes pass a validation
gate before persisting. Every response, success or failure, uses one format.

[The life of a request](#the-life-of-a-request) walks that sequence stage by
stage.

**Detail:** [Generated table APIs](/docs/guides/generated-surfaces/generated-table-apis/)
· [Table endpoints](/docs/reference/http/table-endpoints/)
· [Project file map](/docs/reference/project/project-files/)
· [Tour the generated project](/docs/getting-started/tour-the-generated-project/)

## Declaring a table

### A column's kind is declared once and drives every surface

Sapporta provides column factories for common value types — `money()`,
`percentage()`, `number()`, `select()`, `bool()`, `date()`, `timestamp()`,
`text()`. Each returns an ordinary Drizzle column builder and registers the
column's value kind in the same call, so the table is still a Drizzle table.

Every later layer reads that registered kind. `money("total")` stores an
integer, renders right-aligned and currency-formatted in the grid, offers `gte`
and `lte` in the filter menu, and appears as a number in the OpenAPI schema.
`select("status", ["draft", "sent", "paid"])` stores text, becomes a dropdown in
the form, an enum in the contract, and an equality filter with three choices.
The kind is stated once and needs no revisiting per surface.

Plain Drizzle columns work too; their kind is inferred from the SQL data type. A
column with no explicit label gets one derived from its name, with a trailing
`_id` stripped and underscores replaced by spaces, so `customer_id` reads as
"Customer" everywhere and follows the column through a rename.

Finish a table before starting the next one. The factories accumulate metadata
for the next `sapportaTable()` call, so two tables' column declarations cannot be
interleaved.

### What fails at boot

Sapporta validates the whole catalog at startup rather than at first request, so
a schema mistake is a failed boot naming the column. Three checks carry design
decisions.

**A numeric column must be `notNull()`.** `SUM` over a column containing one
NULL returns NULL, and `AVG` skips NULLs and reports the average of what
remains. Neither warns, so the report renders and the total is wrong. Keys are
exempt, because nobody sums a `customer_id` and "no customer yet" is a real
state, and any other column can be marked non-additive. *Additive* means the
column gets summed or averaged; declaring a column non-additive says its
nullability is intentional and no aggregate should read it.

**Timestamps must be in string mode.** The `timestamp()` helper stores a fixed
shape so that string order is time order; Drizzle's Date-object mode is
rejected. [Time and time zones](#time-and-time-zones) explains the ordering.

**Names and keys are checked.** SQLite keywords, the `_sapporta_` prefix, names
that would collide with a route segment such as `_lookup` or `_count`, and the
three columns Sapporta manages — `id`, `created_at`, `updated_at` — are rejected
at declaration. A table with no primary key is an error rather than a table with
an invented `id`. An SQL type with no kind mapping fails here rather than being
guessed.

Search configuration and report link bindings compile and validate at boot for
the same reason; both have their own sections below.

The resulting `TableDef` is readable at runtime, and the CLI and the OpenAPI
emitter read it. Treat it as read-only: every layer below assumes it still
describes the table.

### Declaring who a row belongs to

A generated route returns the rows of a table that this request may see. The
request supplies that answer; the URL and the body never do. Each table selects
the rule with `rowScope`:

| `rowScope` | A request reaches a row when |
| --- | --- |
| `workspaceUserScoped` *(default)* | the row's workspace **and** user both match the request |
| `workspaceGlobal` | the row's workspace matches the request |
| `systemGlobal` | always — the table is not partitioned at all |

A table that declares nothing gets the narrowest of the three, and widening is
explicit. The server stamps the scope columns on insert and hides them from
every generated screen; a request body cannot set them, and unlike other
auto-managed columns they cannot be brought back by re-declaring them.
[Row security](#row-security) covers the mechanism behind this table.

**Detail:** [Tables, columns, and schema metadata](/docs/guides/model-data/tables-columns-and-schema-metadata/)
· [Table definitions](/docs/reference/schema/table-definitions/)
· [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
· [Table validation](/docs/reference/schema/table-validation/)
· [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)

## The life of a request

### Parse — one contract, three consumers

A route's request and response shapes are written once, in `@sapporta/shared`,
as a ts-rest contract with Zod schemas. The server parses requests against it,
the generated client takes its call signatures from it, and the OpenAPI document
is emitted from it. Adding a field is one edit.

The generated client also validates response bodies at runtime, which is worth
keeping on. TypeScript types are declared rather than observed, so a server that
starts returning a different shape keeps compiling on both sides; the runtime
check reports the mismatch at the call site rather than deeper in the code where
the value is finally read.

### Authenticate — token, cookie, or anonymous

Auth resolution tries a bearer token, then a session cookie, then resolves
anonymous. Anonymous is a resolved state that public routes use, and no
placeholder user is created for it. [Identity and
sessions](#identity-and-sessions) covers what the scaffolded implementation does
here.

### Authorize — a boolean about the table

`ability.can(action, table)` returns a boolean: may this caller create invoices
at all. It is never compiled into SQL and never consulted per row; the scoped
operation that runs afterward handles rows.

The ability is computed before the check, so a failure while computing it — a
membership lookup that fails, a database briefly unavailable — propagates as a
500. A callback that threw during the check would answer 403, which tells the
caller they are not allowed when the truth is that nobody knows.

### Scope — every query wrapped

`scopedRows` enforces ownership. Every generated handler goes through it, and
custom code can call it directly — it is the supported way to query a table from
a custom endpoint. Every operation, including get, update, and delete by primary
key, wraps its predicate in the scope predicate, so a primary-key hit counts
only if the row was visible to this request and a guessed or copied id is a 404.

### Validate — one write gate

Every write goes through one gate — generated route, direct data-access call, or
master-detail save — and the gate rejects rather than repairs.

String fields refuse control characters other than tab, newline, and carriage
return. Generated text carrying a vertical tab or a null byte stores cleanly,
renders as ordinary text, breaks a CSV export weeks later, and cannot be found
by searching for what it looks like.

A strict per-column parse runs next, so a misspelled column name fails the write
instead of being dropped, and the parsed value is what gets written; the raw
input is never substituted back.

> **`PUT` here is patch-shaped.** The generated update route uses `PUT` and
> accepts a partial body: it carries only the fields being changed, and the rest
> are left as they were.

A `POST` carrying `$details` writes a master row and its children in one SQLite
transaction and requires a create grant on both tables. The server stamps the
master's new primary key into each child rather than taking it from the request
body, so the children omit that foreign key entirely.

### Respond — one error envelope

Failures have one shape, with a code that can be branched on.

```jsonc
// 422
{
  "error": "Validation failed",
  "code": "VALIDATION_FAILED",
  "details": [{ "field": "total", "message": "Expected number" }]
}
```

Three decisions hold this together. The `ErrorCode` set is **closed** and each
code maps to exactly one status, so a caller branches on the code rather than
pattern-matching a message. SQLite constraint failures are **classified**:
unique and primary-key violations become `409`, other constraint failures `422`.
A database error classified as a 500 has its message **replaced** with a generic
one, while 4xx responses keep their specific message, so the caller learns what
they did wrong and not what the database looks like inside.

Calls through the generated client either unwrap a 2xx body or throw
`ApiError(status, body)`, so callers branch on the envelope rather than parse it
themselves.

The OpenAPI document has its own `public` / `authenticated` / `disabled` policy,
independent of the authorization on the routes it describes: reading the
catalogue and calling what is in it are separate grants.

**Detail:** [Shared contracts and request validation](/docs/guides/application-code/shared-contracts-and-request-validation/)
· [Typed API clients](/docs/guides/application-code/typed-api-clients/)
· [Expected errors and HTTP mapping](/docs/guides/application-code/expected-errors-and-http-mapping/)
· [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
· [Error catalogue and diagnostics](/docs/reference/operations/error-catalogue-and-diagnostics/)
· [Parent-detail transactions](/docs/guides/application-code/parent-detail-transactions/)
· [OpenAPI](/docs/reference/http/openapi/)

## Row security

Row visibility is derived in one place. A request resolves to one context, that
context produces SQL predicates, and the same derivation drives reads, writes,
ownership stamping, and reference checks. Handlers never write
`where workspace_id = ?` directly.

### Four fields describe a request

The context holds `principal` (who is asking), `dataAuthority` (which trusted
ownership facts this request may use), `ability` (which named actions are
allowed), and `rowSecurity` (the per-table helpers that turn authority into
SQL). They stay separate so that granting an action never widens a row
predicate, and so an anonymous public route can use row security without a
signed-in user.

### The principal is anonymous or a user

The principal is a union of `anonymous` and `user`. Public traffic creates no
users, sessions, memberships, or workspace ids. Roles sit on the workspace
membership rather than on the user, so one person holds different roles in
different workspaces.

### Permission is swappable; authority is fixed

Permissions reach the framework through one method — `can(action, subject)`
returning a boolean — and that method is the entire interface. The scaffold
builds abilities with CASL; the framework imports no CASL and reads no CASL
condition, so a role table, an attribute check, or a call to a policy service
satisfies the interface just as well.

Authority produces SQL, so it is fixed. A request carries up to three additive
slots — `systemGlobalOnly`, `workspaceGlobalOnly`, `workspaceUserScoped` — each
holding the trusted ownership facts this request may use for predicates, insert
stamping, and reference checks. At least one slot is required at the type level,
and a runtime guard rejects conflicting workspace ids across the two workspace
slots.

### A missing authority is a 403

| Declared `rowScope` | SQL predicate | Authority slot required |
| --- | --- | --- |
| `systemGlobal` | `TRUE` | `systemGlobalOnly` |
| `workspaceGlobal` | `workspace_id = ?` | `workspaceGlobalOnly` |
| `workspaceUserScoped` | `workspace_id = ? AND scoped_to_user_id = ?` | `workspaceUserScoped` |

When the slot a table needs is absent, the call throws a 403 rather than falling
back to something broader. Querying a workspace-global table with user-scoped
authority is a forbidden request, not a broken schema. The column names come
from shared constants, so the server and the client spell them identically.

### A foreign key is checked for visibility

The reference check is built from the same predicate the read path uses,
AND-composed with equality on the submitted value, so a row this request could
not read is an invalid reference and the check can never be more permissive than
a read of the target table. An existence check —
`SELECT 1 FROM customers WHERE id = ?` — answers yes for another workspace's
customer: a user in workspace A can attach their invoice to a customer in
workspace B by supplying the id, and every later read of that invoice resolves a
label out of another tenant's data.

### The server decides who owns a new row

The insert path runs in a fixed order: prohibited API fields are rejected,
trusted server values are merged, references are validated against the merged
row, and the authority-derived ownership values are spread last, so nothing in
the input can overwrite them. A body containing `workspace_id` does not fail;
that field is simply not the one that decides. Updates never stamp ownership, so
no `PUT` can re-home a row into another workspace.

Server code that needs to set a reference a client may not set — a parent id on
detail rows, for example — goes through a trusted-values channel that is
separate from the API payload by construction.

### What the API refuses is declared in metadata

Generated primary keys, columns marked non-writable, the scope fields, and
references marked non-settable are rejected before validation and before the
write, and the same flags are omitted from the generated client types and the
OpenAPI schema. What a form allows editing is a rendering of this server-owned
rule rather than a second copy of it.

**Detail:** [Workspaces, ownership, and row visibility](/docs/guides/security/workspaces-ownership-and-row-visibility/)
· [Scoped table reads and writes](/docs/guides/security/scoped-table-reads-and-writes/)
· [Row-safe custom endpoints and reports](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
· [Auth and row security](/docs/reference/server/auth-and-row-security/)
· [Table row-security guards](/docs/reference/server/row-scoped-data/table-row-security-guards/)
· [Scoped CRUD and bounded reads](/docs/reference/server/row-scoped-data/scoped-crud-and-bounded-reads/)

## Identity and sessions

`sapporta init` writes one implementation of that model into the project: Better
Auth with a multi-tenant organization model in which an organization is the
workspace. The application owns and edits this code directly. One resolver
handles every request, public or private, and a public-route pattern lets
anonymous traffic reach the handler and does nothing else.

### Bearer tokens resolve before session cookies

A token names the workspace for its request explicitly, while a browser session
takes its workspace from the session's active organization, so a script writes
where its token was scoped whatever the browser last selected. A workspace
belongs to a person rather than to a session: if the active one no longer has a
membership, the resolver falls back to the user's oldest membership, or
provisions a workspace and owner membership in a single transaction.

### Each guard narrows the context it hands on

Access levels compose, from "any resolved context" through "a verified user" to
"a workspace owner". Each of the three data-authority guards verifies the
authority slot and the permission, then returns a context whose `dataAuthority`
and `rowSecurity` are narrowed to that one slot, so a handler cannot reach a
broader authority than the one it declared.

Owner is a workflow permission: an owner may invite users and change settings
while the row boundary on user-scoped tables stays where it is. Permission and
authority are separate fields on the context for this reason.

### Tokens are hashed, shown once, and compared in constant time

Storage keeps a hash of the token. Lookup parses the id, compares hashes with a
timing-safe comparison, then checks in a fixed order: revoked, expired, user
exists, membership in the token's workspace. Token management is
interactive-only, so a bearer-token caller cannot mint or revoke tokens and a
stolen token cannot be used to manufacture more.

Auth failures arrive as a small closed set of codes, each with one status
mapping and a default message, specific enough for a script to act on: token
expired means rotate, workspace required means the token no longer maps to a
valid membership. Humans read the message; automation branches on the code.

### In the browser, the session is a closed union of states

The client session is one of seven named states, including `unknown`, `loading`,
and `workspaceRequired`. A screen therefore says what it renders while the
answer is still unknown, instead of showing the signed-out view for a moment and
then flipping. Switching workspace and logging out both reset the schema store,
so no screen renders another workspace's metadata, and post-login redirect
targets are filtered to same-origin paths.

### The runtime and the sign-in screens are separate imports

The auth surface is published as four entry points: the route gates and session
store with no page components, the sign-in and password-reset pages, the account
and token screens, and everything together. An application with its own branded
sign-in takes the runtime and writes the screens, keeping the gate logic and
shipping none of the pages it replaced.

**Detail:** [Authentication and abilities](/docs/guides/security/authentication-and-abilities/)
· [Agent access and scoped tokens](/docs/guides/security/agent-access-and-scoped-tokens/)
· [Authentication and token endpoints](/docs/reference/http/authentication-and-token-endpoints/)
· [App shell, routes, and navigation](/docs/reference/frontend/app-shell-routes-and-navigation/)

## Querying

Filtering, sorting, searching, paginating, counting, and exporting all use one
grammar. The grammar lives in the shared package, the server resolves it to SQL,
and the filter UI authors it.

Conditions travel in the URL:

```
GET /api/tables/invoices
      ?filter[status][eq]=sent
      &filter[total][gte]=1000
      &filter[customer_id][in]=4,9,17
      &filter[paid_at][is]=null
      &sort=-issued_at&page=2&limit=50&q=acme
```

### An unknown filter column is a 400

`filter[naration][eq]=X`, a typo for `narration`, is a 400 naming the unknown
column. A parser that iterates the parameters it recognises and ignores the rest
returns *every row* instead: the page renders, the total looks plausible, and
nothing on screen says the number is wrong. Silent-ignore is rejected as a class.

Decoding validates the grammar, and server resolution validates the column and
whether that operator applies to that kind of value; each failure is a 400
carrying a specific code. Query keys outside the whitelist are rejected too, and
LIKE operands are escaped.

### Which operators apply to which kind of value is one table

It lives in the shared package, and both sides read it — the server when it
resolves a query, the filter UI when it decides what to offer. The operators
available on a money column are the same operators the server will accept, and
they do not depend on the entry point: column header menu, filter pill, or
add-filter button.

### Every read surface resolves the same filter state through the same code

One resolver per surface sits over the grammar — page, export, count, and lookup
each with their own shape, the count resolver taking grouping but no search, the
lookup resolver a strict ids-or-search union. The list view and the CSV export
run one filter state down one path, which is what makes an exported file match
the screen it was exported from.

### Search omits the branches a requester cannot read

Search configuration is normalised when the catalog is built: cycles rejected,
unknown columns and mis-targeted foreign keys failing at boot rather than at
request time. At request time the predicate omits the branches this requester
cannot read, and when nothing readable is left it becomes a deliberately false
predicate returning zero rows. Child and referenced-label branches run as
`EXISTS` subqueries wrapped in the target table's own ownership predicate, so
search cannot become a side channel around row security. Searching a table that
declares no search config is a 400.

### Every read is ordered by the primary key last

Requested sort, table default sort, or no sort at all — the primary key is
appended ascending in every case, so pagination and scans stay stable under
ties. Grouped counts are capped and ordered deterministically, with group values
re-parsed through the column's own schema before they are returned.

> **`page()` runs two statements.** The count and the row select are separate
> queries with no wrapping transaction, so a concurrent write between them can
> make the reported total disagree with the rows returned. Both use the same
> scoped `WHERE` clause, so they cannot disagree systematically — but under
> concurrent writes they can disagree by a row, transiently.

### Export streams one statement, one row at a time

Quote escaping to RFC 4180, null and boolean and date coercion, and row assembly
are defined once in the shared package and used by both the server's export and
the grid's clipboard copy, so a grid's clipboard copy matches its downloaded
export. The export streams rather than paginating: SQLite advances one prepared
statement, the active statement owns the read snapshot, and the iterator closes
on early cancellation. There is no batch-size input, because re-running paged
queries would be slower and less consistent.

**Detail:** [Filtering, sorting, search, and pagination](/docs/guides/generated-surfaces/filtering-sorting-search-and-pagination/)
· [Query syntax](/docs/reference/http/query-syntax/)
· [Configure table search](/docs/guides/model-data/configure-table-search/)
· [Relational search semantics and security](/docs/guides/model-data/relational-search-semantics-and-security/)
· [Generated lookups and CSV export](/docs/guides/generated-surfaces/generated-lookups-and-csv-export/)
· [Generated query resolvers](/docs/reference/server/row-scoped-data/generated-query-resolvers/)

## Time and time zones

Time cuts across storage, query, grid, forms, and export, so it is stated once
here rather than repeated at each surface.

### One stored shape, chosen so that string order is time order

The canonical instant is `YYYY-MM-DDTHH:mm:ssZ`: UTC, fixed width, fractional
seconds truncated. The formatter re-checks its own output against that pattern
and fails rather than storing a value that would break the ordering.

Fixed width matters because SQLite TEXT storage sorts by raw string comparison.
Compare `2026-08-24T10:00:00Z` with `2026-08-24T10:00:00.5Z` as strings: `.`
sorts before `Z`, so the later instant sorts first, and anything relying on
string order is then wrong for exactly the rows that happen to carry a fraction.
Drizzle's Date-object timestamp mode is rejected at boot for this reason.

Time zones are passed as arguments throughout rather than read ambiently.

### A day is resolved in the workspace's time zone

The workspace row carries an IANA time zone, and every day-shaped decision
resolves against it: the bounds of a day-ranged filter, the buckets of a grouped
report, the wall clock a timestamp cell is printed on. "Revenue for August 24"
therefore names one set of rows for everyone looking at one dashboard, rather
than a different set per viewer's laptop.

Grouping by local day in SQLite goes through a `to_tz_date(col, zone)` function
that the driver registers on every project connection. SQLite ships no time zone
database, and `date(col, 'localtime')` resolves against whichever process opened
the file.

### A date range travels as a state

`DateRangeState` is a union of all-time, relative (a duration such as the last 30
days), and custom absolute bounds. Two things follow. The application cannot
reach a hybrid partial-custom-while-relative state, because the union has no such
arm. And a user's "Last 30 days" stays semantically that through every layer,
instead of being flattened at the first opportunity into two dates that then
silently age.

Flattening happens where the query is built, from a zone and a moment the caller
supplies, and it produces both shapes a column can be compared against at once:
inclusive calendar days for a `date` column, and a half-open window of UTC
instants for a `timestamp` column. Half-open, because an inclusive upper bound
compared against a timestamp drops its own last day, and a bound built from a
local `23:59:59` loses an hour on the day a zone leaves daylight saving.
Freezing is available for copy-a-snapshot-link workflows.

### Where this surfaces elsewhere

Three consequences appear on other surfaces and are easier to read here than in
place. A CSV export annotates timestamp columns as UTC in the header, because a
reader whose screen shows local time and whose export shows UTC otherwise has
two different-looking answers and nothing to reconcile them with. Date and
timestamp columns are edited through forms with grid inline editing disabled,
because `<input type="date">` has nowhere to put a time component and would drop
it on commit. And a date filter control on a *timestamp* column names a calendar
day in the workspace's zone, with the operator deciding which edge of that day
the bound sits on — which is also why `on` and `not on` are absent for such a
column: a day is a range of instants, and one condition expresses one comparison.

**Detail:** [Days and time zones](/docs/reference/server/days-and-time-zones/)
· [Group and filter by day](/docs/guides/reports/group-and-filter-by-day/)

## The admin frontend

The admin frontend centers on an editable grid, with forms, filters, links, and
reports around it. Two layers matter for the mental model.

A **generic grid engine** contains no Sapporta concepts: no tables, no row
scope, no REST. A **binding layer** compiles a table's schema into grid columns
and REST endpoints. The grid therefore runs without the framework, the binding
can be replaced without touching the grid, and a generated screen and a
hand-written one share one engine. An application that outgrows the generated
grid moves down a layer rather than out of the system.

The grid is a product in its own right, with its own documentation. What follows
is the behaviour a Sapporta application inherits from it, and why it is shaped
that way.

### Interaction state lives in the DOM

Editing a cell re-renders that cell. Moving the cursor changes a CSS class.
Neither does work proportional to the number of visible cells.

Interaction state is read from the DOM rather than mirrored into React: every
grid root, row, and cell carries its identity as data attributes, and the
keyboard and editor-positioning code queries those attributes instead of
maintaining a parallel map. Two consequences follow. The CSS and the interaction
code cannot disagree about which cell is which, because they key off the same
attributes. And an end-to-end test addresses a row by its row id rather than by
its position on screen.

Keyboard behaviour is a fixed grammar built on the same reading: arrows walk live
display state rather than a cached list, Enter resolves in a stated order from
most specific to least, nested grids leave each other's keys alone, and the
cursor and the selection are separate command families — so ticking a row's
checkbox changes what an operation acts on and leaves the cursor where it is.

### An edit renders before the server confirms it

The value is written into the snapshot immediately and sent, and the response
produces exactly one reconcile event, of three distinct kinds. `agreed`. Or
`diverged`, where the authoritative value is written first and then reported, so
a server-side adjustment is visible *as an adjustment* rather than as one value
silently replacing another. Or `rejected`, carrying the backend's reason
alongside both the optimistic and the prior value.

> **A rejected cell write keeps the typed value on screen.** The rejection is
> handed to the host with the prior value attached, and the host decides whether
> to revert, retry, or leave the entry visible with the error. A cell that
> reverts itself while the user is looking elsewhere is a lost edit with no
> explanation — which does mean an application that wants auto-revert has to ask
> for it.

A batch has the opposite contract: it is atomic from the grid's point of view and
reverts every change on any rejection, so a half-applied batch is never
displayed. Bulk row deletion is not atomic, and reports partial failure as
data — which rows succeeded, which failed, and which were never attempted.

### Rows and references resolve without flicker or staleness

Deleting a row and filtering it away land the cursor in the same place, because
both run one planner over a snapshot taken before the rows are removed — and
removing the focused row is distinguished from removing one of its ancestors,
since "focus the next row" lands somewhere unrelated when a parent and all its
detail rows vanish together. Unsaved draft rows live on a separate channel that
the display pipeline reads directly, so a data source holds only persisted data.
Foreign-key labels are fetched in one batched lookup per screen, where an
unresolved key reads as `undefined` — a different state from a value that was
never set — and a late response is discarded when a newer request for the same
scope has already been issued.

Links are declared on the schema and resolved against row values, with binding
errors caught at schema extraction. At render time a null result therefore means
this row lacks the value, and the link is hidden rather than rendered with a raw
id in it.

### Forms and URL state render server-owned rules

A form offers exactly the fields the API will accept. Editability is computed
from the flags the server enforces, so a column the server would reject gets no
control at all, and marking a column read-only later stops it being offered
without anyone touching the form.

A form draft holds raw input text until it is committed — intermediate states
such as a bare `-` included — and decodes at commit. An invalid draft is sent as
typed, so the authoritative error comes from the server and renders inline on the
field that caused it. Empty means different things on create and update,
deliberately.

Query state round-trips the URL exactly: encode and decode are inverses, and the
*presence* of a raw key rather than its value decides whether a field
participates. Sort is also persisted to localStorage, where the URL wins and the
stored value is sanitised against the current columns — localStorage outlives
schema changes, so a persisted sort is best-effort UI state rather than trusted
query input. The filter UI reads its operator sets from the same shared table the
server resolves against.

### Reports are the same grid, readonly

Grouping, expansion, footers, conditional colouring, and keyboard navigation are
the engine's existing behaviour rather than report-specific code. Drill-down is a
host callback; omit it and the report has none.

A report result is data with a declared shape. `GridDataset` — columns, grouping
levels, tree nodes, footer rows, colour rules, links — is a Zod schema in the
shared package, parsed at the boundary rather than asserted in TypeScript. The
server can produce a report with whatever query it likes, including raw SQL
beneath every layer in this document, and the frontend renders it with no
report-specific code. Link consistency is checked against the dataset's own
columns, so a report cannot ship a link bound to a column it does not return.

**Detail:** [Grid interaction and selection](/docs/guides/generated-surfaces/grid-interaction-and-selection/)
· [Generated record screens and forms](/docs/guides/generated-surfaces/record-screens-and-forms/)
· [Table-aware grids and customization](/docs/guides/generated-surfaces/table-aware-grids-and-customization/)
· [Report datasets and formatting](/docs/guides/reports/report-datasets-and-formatting/)
· [GridDataset](/docs/reference/reports/grid-dataset/)
· [Report links](/docs/reference/reports/report-links/)
· [TGrid](/docs/reference/frontend/tgrid/)
· [Grid core model](/grid/guides/core-model/)
· [Grid DOM state contract](/grid/reference/dom-and-styling-contract/)
· [Data-source writes and reconciliation](/grid/reference/data-sources/writes-and-reconciliation/)

## The CLI

The `sapporta` CLI is a client of the application's HTTP API. Its commands
authenticate with a bearer token and go through the same authorization and row
scoping as any other caller, so what the CLI can read is exactly what that token
could read through the browser — the property that makes it safe to hand to an
agent.

```bash
sapporta tables show invoices
sapporta rows list invoices --where 'filter[status][eq]=sent' --limit 20
sapporta sql "select status, count(*) from invoices group by status"
```

Output is a rendered table when stdout is a TTY and JSON otherwise, with an
explicit `--output` beating both, so piped, scripted, and agent invocations get
machine-readable output without having to ask for it.

**Ad-hoc SQL is read-only by default.** The runner prepares the statement and
lets the driver report whether it returns rows, rather than requiring the verb to
be specified in advance, and reads run inside a query-only pragma that is
restored afterward. Writes need an explicit opt-in through a separate `sql
execute` command, so read and write SQL are separate entry points. A dry-run mode
returns the query plan instead of executing, and `DROP TABLE` and `ALTER TABLE`
are blocked even under the opt-in.

**Detail:** [Use the Sapporta CLI](/docs/guides/discovery/use-the-sapporta-cli/)
· [CLI overview and global options](/docs/reference/cli/overview-and-global-options/)
· [API and SQL commands](/docs/reference/cli/api-and-sql-commands/)
· [Use the agent data console](/docs/guides/discovery/use-the-agent-data-console/)

## Running a project

### `sapporta init` writes into the target directory only once everything works

The project is rendered into a hidden staging directory and renamed into place
only after install, the SQLite smoke test, the first migration, and an initial
git commit have all passed; any earlier failure removes the staging directory and
leaves the target untouched, so a failed scaffold can be run again directly.
Preflights check npm reachability, pnpm presence and major version, and, after
install, that the native SQLite binding actually loads.

> **pnpm 10 and earlier fail silently here.** They read workspace settings from
> the `pnpm` field in `package.json`, which pnpm 11 removed in favour of
> `pnpm-workspace.yaml`. An older pnpm installs a differently resolved tree and
> reports nothing — which is why the version is a preflight rather than a line
> in the README.

### Every generated file has an owner, and a refresh honours it

A manifest tags each file `framework`, `example`, or `workspace`. A refresh
overwrites the first two, skips workspace files, and merges workspace
`package.json` files, with a dry-run plan available before anything is written.

File ownership is what makes a scaffold an upgradable dependency. Framework code
copied into a project would otherwise stay frozen at the version it was copied
from, and every later improvement would need a manual diff against a template the
project no longer has.

### Migration state is three problems, reported together

The boot-time guard joins the migration files on disk against the applied ledger
and reports pending (not yet applied), missing (applied, file gone), and changed
(hash mismatch) as separate categories in one combined error, each with the
command that fixes it. The fix differs per category, which is why they are not
collapsed into "your migrations are out of date".

### The database connection is opened the same way every time

The PRAGMA order is fixed, starting with `journal_mode = WAL` because it changes
the file format and affects how the later PRAGMAs interact, and covering busy
timeout, synchronous mode, foreign keys, and cache size. Test databases apply
only the two semantically significant settings and skip the performance tunings,
which do not matter for a single-process in-memory database.

> **`foreign_keys` is per connection and is not stored in the file.** SQLite
> defaults it off, so a connection that does not set it does not enforce foreign
> keys, and nothing reports that. Hence on every open, not once at creation.

### Logging carries request fields down without threading them

One logger is configured from the environment, so the format is a deployment
decision rather than a per-module one. A module or a request takes a child logger
carrying its own fields, and those fields appear on everything logged beneath it
without being passed through the calls in between. The HTTP middleware records
method, path, status, and duration, and leaves the request body unread:
consuming it there would take it away from the handler that has to parse it.

Development ports are slots rather than numbers. A project draws a random slot
from 0–255 and takes `3000+slot` and `5173+slot` together, so two projects
collide only on the same slot rather than on either port independently.

**Detail:** [Create a Sapporta project](/docs/getting-started/create-a-project/)
· [Schema changes and migrations](/docs/guides/model-data/schema-changes-and-migrations/)
· [Migration and startup invariants](/docs/reference/operations/migration-and-startup-invariants/)
· [Runtime and deployment contract](/docs/reference/operations/runtime-and-deployment-contract/)
· [Application configuration](/docs/guides/operations/application-configuration/)
· [Troubleshooting](/docs/guides/operations/troubleshooting/)
· [Environment variables](/docs/reference/project/environment-variables/)

## Where the layers open

Every layer described above has a documented exit, and each one names what it
trades away. These are the supported seams.

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
| Scaffolded code | Edit workspace-owned files freely | `sapporta refresh` will not update them |

The cost of leaving a layer is paid at the call site that leaves it, and it is
paid in guarantees rather than in compatibility. Code above and below an escape
hatch keeps working.

**Detail:** [Custom API endpoints](/docs/guides/application-code/custom-api-endpoints/)
· [Domain workflows and transactions](/docs/guides/application-code/domain-workflows-and-transactions/)
· [Non-JSON and raw responses](/docs/guides/application-code/non-json-and-raw-responses/)
· [Immutable tables and trusted raw access](/docs/guides/security/immutable-tables-and-trusted-raw-access/)
· [Scoped report data](/docs/guides/reports/scoped-report-data/)
· [Bounded GridCore projections](/docs/guides/application-code/bounded-gridcore-projections/)
· [Choose a grid layer](/grid/start/choose-a-grid-layer/)
