---
title: "Technical overview"
description:
  "How a Sapporta application is assembled, from a table declaration to the
  APIs, screens, and guarantees that follow from it."
---

This document is a mental model, not a reference. It follows one table from
declaration to rendered screen, explaining what each layer does and where
control passes back to application code.

## It starts with a table

A Sapporta application is built by declaring tables. Almost everything else
follows from that.

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

### The generated API

Restart the server and the table has an HTTP API. There is no registration step:
routes resolve their table from the catalog when a request arrives, so a new
file in `packages/api/schema/` produces a new set of endpoints.

| Route | What it returns |
| --- | --- |
| `GET /api/tables/invoices` | a page of rows: `{ data, meta: { total, page, limit, pages } }`, filtered, searched, and sorted from the query string |
| `GET /api/tables/invoices/:id` | one row, as `{ data }` |
| `POST /api/tables/invoices` | `201` with the created row — or an array of rows, or a master row with its `$details` children |
| `PUT /api/tables/invoices/:id` | the updated row; the body is a partial, and omitted fields are left alone |
| `DELETE /api/tables/invoices/:id` | the row that was deleted |
| `GET /api/tables/invoices/_lookup` | `{ value, label }` pairs for foreign-key pickers, either by ids or by search term |
| `GET /api/tables/invoices/_count` | a total, or counts grouped by a column |
| `GET /api/tables/invoices/export.csv` | the same query, streamed as CSV |

That one declaration also drives the rest of the system:

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

The grid, the create form, the filter UI, and the `sapporta` CLI all read the
same declaration. None of them holds a second copy.

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

As a caller: a malformed query is a `400` before anything touches the database.
Anonymous is a legitimate auth state, not a failure. Permission checks whether
the caller may perform an action on the table — never about a specific row.
Which rows the caller can reach is decided one step later by the scope, the
same way for list, get, and delete. Writes pass a validation gate before
persisting. All responses, success or failure, use one format.

The rest of this document covers those steps in detail.

## One contract, both sides

A route's request and response shapes are written once, in `@sapporta/shared` —
a package with no server, database, or React, which both the API and the
frontend depend on. A route is a ts-rest contract with Zod schemas. The server
parses requests against it, the generated client takes its call signatures from
it, and the OpenAPI document is emitted from it. Adding a field is one edit, and
a server/client mismatch is a type error rather than a runtime surprise.

The generated client also validates response bodies at runtime, and that is
worth keeping on. TypeScript cannot detect a server returning something
different — the types are declared, not observed, so both sides keep compiling.
The runtime check catches the change at the call site rather than deeper in the
code where the value is finally read.

The same separation exists in the frontend. The grid engine underneath the
admin screens knows nothing about Sapporta — no tables, no row scope, no REST.
A binding layer compiles a table's schema into grid columns and endpoints. The
grid works without the framework, and the binding can be replaced without
touching the grid.

## The declaration in detail

### Column types

Sapporta provides column factories for common value types: `money()`,
`percentage()`, `number()`, `select()`, `bool()`, `date()`, `timestamp()`, and
`text()`. Each returns an ordinary Drizzle column builder — the table is still
a Drizzle table — and registers the column's value kind in the same call.

That registered kind drives every later layer. `money("total")` stores an
integer, renders right-aligned and currency-formatted in the grid, offers `gte`
and `lte` in the filter menu, and appears as a number in the OpenAPI schema.
`select("status", ["draft", "sent", "paid"])` stores text, becomes a dropdown in
the form, an enum in the contract, and an equality filter with three choices.
The kind is declared once and does not need revisiting per surface.

Plain Drizzle columns work too. Their kind is inferred from the SQL data type,
and a type with no mapping fails at boot rather than being guessed.

One authoring rule: finish a table before starting the next one. The factories
accumulate metadata for the next `sapportaTable()` call, so interleaving two
tables' column declarations is not supported.

A column with no explicit label gets one derived from its name — trailing `_id`
stripped, underscores replaced with spaces, sentence-cased — so `customer_id`
reads as "Customer" everywhere. Rename the column and the label follows.

### Numbers that add up

`SUM` over a column containing one NULL returns NULL. `AVG` skips NULLs and
reports the average of what remains. Neither produces a warning. The report
renders, the total looks plausible, and the number is wrong — usually found in
production by someone who trusted it.

Sapporta enforces a schema convention: **a numeric column must be `notNull()`.**
A nullable numeric column fails at boot, naming the column.

Not every number is a quantity, so there are exemptions. Keys are exempt
automatically — nobody sums a `customer_id`, and "no customer yet" is a real
state. For anything else, mark the column `additive: false`. *Additive* means
"this column gets summed or averaged"; marking a column non-additive says its
nullability is intentional and no aggregate should read it.

<TK: show the `additive: false` declaration in code — need the exact call site
from the codebase (factory argument vs. table meta).>

The same boot check rejects Drizzle timestamps in Date-object mode, pointing
to the string-mode `timestamp()` helper instead. The reason is in
[Asking questions of the data](#asking-questions-of-the-data): stored
timestamps have a fixed shape so that string order is time order.

### Names Sapporta refuses

Some column names are rejected at declaration: SQLite keywords, anything
prefixed `_sapporta_`, names that would collide with a route segment such as
`_lookup` or `_count`, and the three columns Sapporta manages — `id`,
`created_at`, and `updated_at`. A table with no primary key is an error rather
than a table with an invented `id`.

The resulting `TableDef` is readable at runtime, and the CLI and OpenAPI emitter
read it. Do not write to one: every layer below assumes it still describes the
table.

### Who a row belongs to

Every generated route answers "what is in this table that *this request* may
see", not "what is in this table". The answer comes from the request, never from
the URL or body. Each table selects the rule with `rowScope`:

| `rowScope` | A request reaches a row when |
| --- | --- |
| `workspaceUserScoped` *(default)* | the row's workspace **and** user both match the request |
| `workspaceGlobal` | the row's workspace matches the request |
| `systemGlobal` | always — the table is not partitioned at all |

A table that declares nothing gets the narrowest of the three. Widening must be
explicit. The scope columns are stamped by the server on insert, are never read
from a request body, and are hidden from every generated screen — unlike other
auto-managed columns, they cannot be brought back by re-declaring them.
[Who can see which rows](#who-can-see-which-rows) covers the full mechanism.

## What happens to a request

The permission step and the row-scope step do different jobs.
`ability.can(action, table)` returns a boolean: may this caller create invoices
at all. It is never compiled into SQL and never checked per row. Rows are
handled entirely by the scoped operation that runs afterward.

The check is a boolean rather than a callback that throws. A permission check
that *throws* — a membership lookup that fails, a database briefly unavailable —
must not become a 403, because 403 tells the caller they are not allowed when
the truth is that nobody knows. A pre-computed boolean lets the exception
propagate as a 500, which is the correct answer.

**`scopedRows` is where ownership is enforced.** Every generated handler goes
through it, and custom code can call it directly — the supported way to query a
table from a custom endpoint. There is no way around the ownership
columns. Every operation, including get, update, and delete by primary key,
wraps its predicate in the scope predicate. A primary-key hit only counts if the
row was visible to this request, so a guessed or copied id is a 404, not a
leak.

> **`page()` runs two statements.** The count and the row select are separate
> queries with no wrapping transaction, so a concurrent write between them can
> make the reported total disagree with the rows returned. Both use the same
> scoped `WHERE` clause, so they cannot disagree systematically — but under
> concurrent writes they can disagree by a row, transiently.

### What a write has to get past

Every write goes through one gate — generated route, direct data-access call, or
master-detail save — and the gate rejects rather than repairs.

Control characters other than tab, newline, and carriage return are refused in
every string field. The motivating case: generated text carrying an invisible
vertical tab or null byte. It stores cleanly, renders as ordinary text, breaks a
CSV export weeks later, and cannot be found by searching for what it looks like.

Then a strict per-column parse runs, so a misspelled column name fails the write
instead of being silently dropped, and the parsed value is what gets written —
the raw input is never substituted back.

> **`PUT` here is patch-shaped.** The generated update route uses `PUT`, but the
> body it accepts is a partial: it carries only the fields being changed, and
> the rest are left as they were.

### One error envelope

Failures have one shape, with a code that can be branched on.

```jsonc
// 422
{
  "error": "Validation failed",
  "code": "VALIDATION_FAILED",
  "details": [{ "field": "total", "message": "Expected number" }]
}
```

The `ErrorCode` set is closed and each code maps to one status. SQLite
constraint failures are classified: unique and primary-key violations become
`409`, other constraint failures `422`. A database error classified as a 500
has its message replaced with a generic one, while 4xx responses keep their
specific message and code — the caller sees what went wrong, but not what the
database looks like inside. Query-parse failures have their own lowercase set —
`unknown_column`, `op_not_applicable`, `no_search_config` — and always map to
`400`.

Calls through the generated client either unwrap a 2xx body or throw
`ApiError(status, body)`, so callers branch on the envelope rather than parse it
themselves.

### Creating a master and its details

A `POST` carrying `$details` writes the master row and its children in one
SQLite transaction, and requires a create grant on both tables. The master's new
primary key is stamped into each child by the server rather than taken from the
request body — the children omit that foreign key entirely.

### The way out

The OpenAPI document has its own `public` / `authenticated` / `disabled` policy,
independent of the authorization on the routes it describes: being allowed to
read the catalogue is not the same as being allowed to call what is in it.

Below the generated routes, the layers stay open. Custom ts-rest contracts
register on the same API object. Returning a raw `Response` bypasses the
envelope. The handler factory accepts a custom guard in place of its default.
Beneath `scopedRows` sit raw Drizzle and raw SQL — with the guarantees of this
section traded away at exactly that one call.

## Who can see which rows

Row visibility is the part of a database application that goes wrong quietly, so
it gets its own section. A request resolves to one context; that context
produces SQL predicates; the same derivation is applied to reads, writes,
ownership stamping, and reference checks. Handlers never write
`where workspace_id = ?` directly.

**Four fields describe a request.** The context holds `principal` (who is
asking), `dataAuthority` (which trusted ownership facts this request may use),
`ability` (which named actions are allowed), and `rowSecurity` (the per-table
helpers that turn authority into SQL). They are separate because collapsing
them is how a permission silently becomes visibility. Granting an action does
not widen any row predicate. An anonymous public route can still use row
security without inventing a fake signed-in user.

**Anonymous is a real state, not a placeholder user.** The principal is a union
of `anonymous` and `user`. No fake users, sessions, memberships, or workspace
ids are created for public traffic. Roles sit on the workspace membership rather
than on the user, so one person holds different roles in different workspaces.

**Permission is swappable; authority is not.** Permissions reach the framework
through exactly one method — `can(action, subject)` returning a boolean — and
that method is the entire interface. The scaffold builds abilities with CASL,
but nothing in the framework imports CASL or reads a CASL condition, so a role
table, an attribute check, or a call to a policy service satisfies the
interface just as well.

Authority produces SQL. A request carries up to three additive slots —
`systemGlobalOnly`, `workspaceGlobalOnly`, `workspaceUserScoped` — each holding
the trusted ownership facts (a workspace id and a user id) that this request
may use for predicates, insert stamping, and reference checks. At least one
slot is required at the type level, and a runtime guard rejects conflicting
workspace ids across the two workspace slots.

**A table's scope selects its predicate, and a missing authority is a 403
rather than a wider query.**

| Declared `rowScope` | SQL predicate | Authority slot required |
| --- | --- | --- |
| `systemGlobal` | `TRUE` | `systemGlobalOnly` |
| `workspaceGlobal` | `workspace_id = ?` | `workspaceGlobalOnly` |
| `workspaceUserScoped` | `workspace_id = ? AND scoped_to_user_id = ?` | `workspaceUserScoped` |

When the slot a table needs is absent, the call throws — a 403 with code
`row_scope_forbidden` — rather than falling back to something broader. Querying
a workspace-global table with user-scoped authority is a forbidden request, not
a broken schema, and the only safe way to fail is closed. The column names come
from shared constants, so the server and client spell them identically.

**A foreign key is checked for visibility, not existence.** The naive approach —
`SELECT 1 FROM customers WHERE id = ?` — answers yes for another workspace's
customer. A user in workspace A can attach their invoice to a customer in
workspace B by supplying the id, and every later read of that invoice resolves a
label out of another tenant's data.

Sapporta builds the check from the same predicate the read path uses,
AND-composed with equality on the submitted value. A row that could not have
been read is an invalid reference. The check cannot be more permissive than a
read of the target table — which is the property an existence check cannot
guarantee.

**A create cannot choose who owns the row it creates.** The insert path runs in
a fixed order: prohibited API fields are rejected, trusted server values are
merged, references are validated against the merged row, and the
authority-derived ownership values are spread last, so nothing in the input can
overwrite them. A body containing `workspace_id` does not fail — that field is
not the one that decides. Updates never stamp ownership at all, so no
`PUT` can quietly re-home a row into another workspace.

When server code needs to set a reference a client may not set — a parent id on
detail rows, for example — it goes through `serverValues`, a channel for trusted
writes that is separate from the API payload by construction.

**Which fields the API refuses is declared in metadata, not repeated in
handlers.** Generated primary keys, columns marked `apiWritable: false`, the
scope fields, and references marked `apiSettable: false` are rejected before
validation and before the write, and the same flags are omitted from the
generated client types and the OpenAPI schema. What a form allows editing is a
rendering of this server-owned rule, never a second copy.

### The auth system that is scaffolded

Everything above is the framework's model. What `sapporta init` writes into a
project is one implementation of it, on Better Auth, with a multi-tenant
organization model in which an organization is the workspace — template code
the application owns and edits directly. One resolver handles every request,
public or private, and a
public-route pattern lets anonymous traffic reach the handler and does nothing
else.

**Bearer tokens resolve before session cookies.** A token names the workspace
for its request explicitly, while a browser session takes its workspace from the
session's active organization. So a script writes where its token was scoped,
whatever the browser last selected. A workspace belongs to a person rather than
to a session: if the active one no longer has a membership, the resolver falls
back to the user's oldest membership, or provisions a workspace and owner
membership in a single transaction.

**Each authority guard narrows the context it hands on.** Access levels compose:
`requireAuthContext`, `requirePrincipalUser`, `requireVerifiedUser`,
`requireWorkspaceRowsAllowed`, `requireWorkspaceOwner`, and
`rejectAnonymousByDefault` with a configurable public-routes list. The three
`requireAuthorized*Data` guards do more than check — each verifies the authority
slot and the permission, then returns a context whose `dataAuthority` and
`rowSecurity` have been narrowed to that one slot. A handler cannot reach for a
broader authority than the one it declared. Owner is a workflow permission, not
a data widening: an owner may invite users and change settings without the row
boundary on user-scoped tables moving at all.

**Tokens are hashed, shown once, and compared in constant time.** A token reads
`spat_<id>_<secret>` with a 32-byte secret, and storage keeps only
`sha256(id + secret)`. Lookup parses the id, compares hashes with
`timingSafeEqual`, then checks in a fixed order: revoked, expired, user exists,
membership in the token's workspace. The failure codes are specific enough for a
script to act on — `token_expired` means rotate, `workspace_required` means the
token no longer maps to a valid membership. Token management is
interactive-only, so a bearer-token caller cannot mint or revoke tokens.

Auth failures arrive as one of eight codes — `unauthenticated`, `token_expired`,
`token_revoked`, `email_not_verified`, `workspace_required`, `forbidden`,
`not_found`, `validation_failed` — each with one status mapping and a default
message. Humans read the message; automation branches on the code.

**The session store and the sign-in screens are separate imports.** The auth
surface is published as four entry points: `auth/runtime` is the route gates and
the session store with no page components, `auth/pages` is sign-in, sign-up,
and password reset, `auth/profile` is the account and token screens, and `auth`
is all of it. An application that wants its own branded sign-in takes the
runtime and writes the screens, without reimplementing the gate logic or
shipping the pages it replaced.

In the browser the session is a closed union of seven states — `unknown`,
`loading`, `guest`, `authenticated`, `unverified`, `workspaceRequired`,
`failed` — rather than a truthy user object, so a screen has to say what it
does while the answer is still unknown. Switching workspace and logging out
both reset the schema store, so no screen renders another workspace's metadata.
The route gate renders a loading state instead of protected content for the
unresolved states, and the redirect URL is carried in router state and filtered
through a check that requires a leading `/` and rejects protocol-relative `//`
values. Whether an unverified email blocks access is the server's call; the
store treats a successful response as a usable session even while `emailVerified`
is false.

Past all of this, `withDataAuthority()` re-narrows the engine for a specialised
workflow, and direct Drizzle queries bypass the layer entirely — at the cost of
every guarantee in this section.

## Asking questions of the data

Filtering, sorting, searching, paginating, counting, and exporting all use one
grammar and one time convention. The grammar lives in the shared package, the
server resolves it to SQL, and the filter UI authors it.

**A filter typo is a 400, not a wider result set.** Conditions travel in the
URL as `filter[column][op]=value`:

```
GET /api/tables/invoices
      ?filter[status][eq]=sent
      &filter[total][gte]=1000
      &filter[customer_id][in]=4,9,17
      &filter[paid_at][is]=null
      &sort=-issued_at&page=2&limit=50&q=acme
```

A condition has three forms: scalar operators carry a `value`, list operators
(`in`, `nin`) carry `values`, and the null check carries a polarity. Decoding
validates the grammar — `unknown_filter_shape`, `unknown_op`, `bad_value` — and
server resolution validates the column and whether that operator applies to that
kind of value — `unknown_column`, `op_not_applicable`. Each failure is a 400
carrying its code. Query keys outside the whitelist and outside the `filter[`
prefix are rejected too, and LIKE operands are escaped for `%`, `_`, and `\`.

This is the opposite of the usual behaviour, so it is worth stating plainly.
Given `filter[naration][eq]=X`, a typo for `narration`, a parser that iterates
the parameters it recognises and ignores the rest returns *every row*: the page
renders, the total looks plausible, and nothing on screen suggests the number
is wrong. Silent-ignore is rejected as a class, so that request is a 400 naming
the unknown column.

**Which operators apply to which kind of value is one table.** It lives in the
shared package, and both sides read it — the server when it resolves a query,
the filter UI when it decides what to offer. The operators available on a money
column are the same operators the server will accept, and they do not depend on
the entry point — column header menu, filter pill, or add-filter button.

**Every read surface resolves the same filter state through the same code.** One
resolver per surface sits over the grammar: `resolvePageQuery` and
`resolveExportQuery` take filters, search, and sort; `resolveCountQuery` takes
`group_by` with ordering and a limit but no search; `resolveLookupQuery` is a
strict ids-XOR-search union. The list view and the CSV export run one filter
state down one path — which is what makes an exported file match the screen it
was exported from.

**Search is compiled at boot, and returns nothing rather than reporting rows
the requester cannot see.** Configuration is normalised when the catalog is
built: cycles rejected, empty column lists rejected, unknown columns and
undeclared children and mis-targeted foreign keys failing there rather than at
request time, and an unindexed searchable foreign key logged as a warning. At
request time the predicate omits the branches this requester cannot read, and
when nothing readable is left it becomes a deliberately false predicate — zero
rows. Child and referenced-label branches run as `EXISTS` subqueries wrapped in
the target table's own ownership predicate. Searching a table declared
`search: false` is a 400 with `no_search_config`, not an empty result.

**Every read is ordered by the primary key last.** Requested sort, table
default sort, or no sort at all — the primary key is appended ascending in
every case, so pagination and scans stay stable under ties. Grouped counts
default to 50 groups and cap at 1000, ordered by count then value, with group
values re-parsed through the column's own schema before they are returned.

**Timestamps have one shape, chosen so that string order is time order.** The
canonical instant is `YYYY-MM-DDTHH:mm:ssZ`: UTC, fixed width, fractional
seconds truncated. The formatter re-checks its own output against that pattern
and fails rather than storing a value that would break the ordering. Fixed
width is the whole point, because SQLite TEXT storage sorts by raw string
comparison. Compare `2026-08-24T10:00:00Z` with `2026-08-24T10:00:00.5Z` as
strings: `.` sorts before `Z`, so the later instant sorts first, and anything
relying on string order is then wrong for exactly the rows that happen to carry
a fraction. Time zones are passed as arguments throughout rather than read
ambiently; the one documented ambient reader is `deviceTimeZone()`, called by
the sign-up request.

**A day belongs to the workspace, not to the reader.** The workspace row carries
an IANA time zone, and every day-shaped decision resolves against it: the bounds
of a day-ranged filter, the buckets of a grouped report, the wall clock a
timestamp cell is printed on. A handler reads it with
`workspaceTimeZone(c.get("auth"))` and a screen with `appTimeZone()`. "Revenue
for August 24" therefore names one set of rows for everyone looking at one
dashboard. Grouping by local day in SQLite goes through `to_tz_date(col, zone)`,
a function the driver registers on every project connection, because SQLite
ships no time zone database and `date(col, 'localtime')` would resolve against
whichever process opened the file.

**A date range travels as a state, not as a pair of dates.** `DateRangeState`
is a union of all-time, relative (a duration such as the last 30 days), and
custom absolute bounds. Two things follow. The application cannot reach a hybrid
partial-custom-while-relative state, because the union has no such arm. And a
user's "Last 30 days" stays semantically that through every layer, instead of
being flattened at the first opportunity into two dates that then silently age.
Flattening happens where the query is built, from a zone and a moment the caller
supplies, and it produces both shapes a column can be compared against at once:
inclusive calendar days for a `date` column, and a half-open window of UTC
instants for a `timestamp` column. Half-open, because an inclusive upper bound
compared against a timestamp drops its own last day, and a bound built from a
local `23:59:59` loses an hour on the day a zone leaves daylight saving.
Freezing is available on purpose: `snapshotDateRange` converts a relative range
to absolute bounds, for copy-a-snapshot-link workflows.

**CSV export reads one statement, one row at a time.** Quote escaping to RFC
4180, null and boolean and date coercion, and row assembly are defined once in
the shared package and used by both the server's export and the grid's clipboard
copy, so a grid's clipboard copy matches its downloaded export. The export
streams: Drizzle compiles the SQL, better-sqlite3's `iterate()` yields rows one
at a time, the active statement owns the read snapshot, and the iterator is
closed in `finally` on early cancellation. There is deliberately no batch-size
input, because SQLite advances one prepared statement rather than rerunning
paged queries. Timestamp columns annotate their CSV header as UTC — a reader
whose screen shows local time and whose export shows UTC otherwise has two
different-looking answers and nothing to reconcile them with.

The wire grammar is fixed, but the server is not confined to it: hand-written
`WHERE` clauses go beyond what a filter condition can express, and `findMany()`
and `page()` replace the streaming scan for small result sets.

## The screen

The admin frontend centers on an editable grid, with forms, filters, and links
around it. Underneath is a generic grid engine that contains no Sapporta
concepts, and a binding layer that compiles a table's schema into grid columns
and REST endpoints. What follows is what that produces, from the outside.

**Editing a cell re-renders that cell, not the grid.** Moving the cursor
changes a CSS class. Neither does work proportional to the number of visible
cells.

This works because interaction state is read from the DOM rather than mirrored
into React. Every grid root, row, and cell carries its identity as data
attributes — `data-grid-path`, `data-grid-part`, `data-row-id`, `data-col-id` —
and the keyboard and editor-positioning code queries those instead of keeping a
parallel map of where things are. Two consequences: the CSS and the interaction
code cannot disagree about which cell is which, because they key off the same
attributes; and an end-to-end test addresses a row by its row id rather than by
its position on screen.

**Keyboard behaviour is a fixed grammar.** Arrow keys move through the rows
actually on screen, child rows of an expanded parent included, walking live
display state rather than a cached list. Enter resolves in a stated order: a
writable data cell opens its editor; the same column on a readonly source or a
structural row runs its cell activation; row activation is the last fallback.
Space resolves before printable-key editing, because the browser reports it as a
one-character key, and Shift+Space is taken by row selection first. Any other
printable key on a type-editable cell opens the editor seeded with that
character. Nested grids do not steal each other's keys — each checks that the
event target's closest grid container is its own root. The cursor and the
selection are separate command families, so ticking a row's checkbox changes
what an operation acts on without moving the cursor or scrolling.

How an edit begins decides where the caret lands. Typing `4` on a number cell
opens the editor holding `4` with the caret after it; double-clicking selects
the whole value, so the next keystroke replaces it. Date and timestamp columns
have inline editing disabled and are edited through forms, because
`<input type="date">` has nowhere to put a time component and would drop it on
commit.

**An edit appears before the server has agreed to it, and the three possible
answers are distinct.** The value is written into the snapshot immediately and
sent, and the response produces exactly one reconcile event. `agreed`. Or
`diverged`, where the authoritative value is written first and then reported,
so a server-side adjustment is visible *as an adjustment* rather than as one
value silently replacing another. Or `rejected`, carrying the backend's reason,
the optimistic value, and the prior value. Repeated edits to one cell are
last-write-wins by token, and superseded page loads are discarded the same way.

> **A failed cell write does not put the old value back.** The rejection is
> handed to the host with the prior value attached, and the host decides whether
> to revert, retry, or leave the entry on screen with the error. A cell that
> reverts itself while the user is looking elsewhere is a lost edit with no
> explanation — which does mean an application that wants auto-revert has to ask
> for it.

**A batch has the opposite contract.** `applyChanges` is atomic from the grid's
point of view: without a batch endpoint it fans out per-cell writes, and on any
rejection reverts every change to its prior value, so a half-applied batch is
never displayed. Bulk row deletion is not atomic, and reports partial failure as
data: which rows succeeded, which failed, and which were never attempted.

**Deleting a row and filtering it away land the cursor in the same place.**
Where the cursor goes is planned from a snapshot of the visible rows taken
before they are removed: the next focusable row, else the previous one, else
the grid itself, else nothing. Removing the focused row is distinguished from
removing one of its ancestors, because "focus the next row" lands somewhere
unrelated when a parent and all its detail rows vanish together. Both mutations
run that one planner, so the cursor does not behave differently depending on
which of them took the rows away.

**A draft row never enters the data source.** Unsaved rows live on a separate
per-path channel that the display pipeline reads directly, so a data source only
ever holds persisted data. A blank add-row appears where the source allows
appending; when that eligibility is lost, blank drafts are removed and filled
ones kept, because a filled row is user input and belongs in the normal
leave-and-commit path. Moving the cursor off a filled draft commits it.

**Foreign-key labels are batched, and a late response cannot overwrite a newer
one.** Fifty invoices with a customer column need fifty customer names: missing
keys are collected, any already in flight awaited, and one lookup call issued
for the rest. A key that has not resolved yet reads as `undefined` — a different
state from a value that was never set, and the two render differently.
Search-as-you-type compares each response against the latest request for its
scope, so the answer to `sm` arriving after the answer to `smith` is discarded.

**Links are declared on the schema and resolved against row values** — a table
drill-through, a report with query parameters, or an external URL, with row
columns bound into the href. Binding a column that does not exist fails at
schema extraction, so at render time a null result can only mean this row lacks
the value, and the link is hidden rather than rendered with a raw id in it.

**A form offers exactly the fields the API will accept.** Editability is
computed from the flags the server enforces — `visuallyHidden`, auto-increment
primary keys, `apiWritable: false`, the scope fields — so a column the server
would reject gets no control at all, and marking a column read-only later stops
it being offered without anyone touching the form.

**A form draft holds raw input text until it is committed.** Numeric, date, and
timestamp controls keep exactly what was typed, intermediate states such as a
bare `-` included, and decode at commit to a typed value, empty, or invalid.
Nothing is coerced automatically: an invalid draft is sent as typed, so the
authoritative error comes from the server and renders inline on the field that
caused it. Empty means different things on the two write paths, deliberately.
On create, an empty non-text control is omitted so the backend applies its
insert and default rules, while an empty optional text control stays `""`. On
update, empty decodes to an explicit null and clears the field.

**Query state round-trips the URL exactly; saved sort is best-effort.** Encode
and decode are exact inverses for page, sort, filters, and search, and the
*presence* of a raw query key — not its value — decides whether a field
participates, so an absent key leaves the level's default in place. Sort is
also persisted to localStorage, where the URL wins and the stored value is
sanitised against the current columns: localStorage outlives schema changes, so
a persisted sort is best-effort UI state rather than query input to be trusted.

Filter authoring reads the operator table from the shared package. Every column
is coarsened into one of six filter types — text, number, date, boolean, enum,
foreign key — and the catalog maps each to its operator set, default operator,
value shape, and input component. A date control on a timestamp column names a
calendar day in the workspace's zone, and the operator picks which edge of that
day the bound sits on: `on or after` and `before` read its first instant, `after`
and `on or before` its last. `on` and `not on` are not offered for such a
column, because a day is a range of instants and one condition expresses one
comparison.

**Reports render through the same grid, readonly**, so grouping, expansion,
footers, conditional colouring, and keyboard navigation are the engine's
existing behaviour rather than report-specific code. Drill-down is a host
callback; omit it and the report has none.

**A report result is data with a declared shape.** `GridDataset` — columns,
grouping levels, tree nodes, footer rows, conditional colour rules, links — is
a Zod schema in the shared package, parsed at the boundary rather than asserted
in TypeScript. The server can produce a report with whatever query it likes,
including raw SQL beneath every layer described here, and the frontend renders
it with no report-specific code: column kinds select their presets, grouping
levels become grid levels, footers land at the end. Link consistency is checked
against the dataset's own columns, so a report cannot ship a link bound to a
column it does not return.

<TK: a short `GridDataset` example — the smallest report payload that renders,
with one grouping level and a footer. Needs the exact field names from the
shared schema.>

Any object satisfying the data-source protocol replaces the shipped sources, a
level accepts fully custom column specs, and the surrounding chrome is render
callbacks.

## Running it

The `sapporta` CLI is a client of the application's HTTP API, not a second
path into the database. Its commands authenticate with a bearer token and go
through the same authorization and row scoping as any other caller, so what the
CLI can read is exactly what that token could read through the browser.

```bash
sapporta tables show invoices
sapporta rows list invoices --where 'filter[status][eq]=sent' --limit 20
sapporta sql "select status, count(*) from invoices group by status"
```

Output is a rendered table when stdout is a TTY and JSON otherwise, with an
explicit `--output` beating both — so piped, scripted, and agent invocations get
machine-readable output without having to ask for it.

**Ad-hoc SQL is read-only by default.** The runner prepares the statement
and lets better-sqlite3 report whether it returns rows, rather than requiring
the verb to be specified in advance, and reads run inside
`PRAGMA query_only = ON`, restored in `finally`.
Writes need an explicit opt-in through a separate `sql execute` command, which
makes read and write SQL syntactically distinct entry points. `--dry-run` runs
`EXPLAIN QUERY PLAN` instead of executing. `DROP TABLE` and `ALTER TABLE` are
blocked even under the opt-in.

**`sapporta init` writes into the target directory only once everything has
succeeded.** The project is rendered into a hidden staging directory and renamed
into place only after install, the SQLite smoke test, the first migration, and
an initial git commit have all passed; any earlier failure removes the staging
directory and leaves the target untouched. A failed scaffold leaves nothing to
clean up — it can be run again directly. Three preflights run before that: npm
registry reachability, pnpm presence and major version, and — after install —
an in-process `select 1` against better-sqlite3 that tells a missing native
binding apart from other failures and walks a rebuild chain before giving up.

> **pnpm 10 and earlier fail silently here.** They read workspace settings from
> the `pnpm` field in `package.json`, which pnpm 11 removed in favour of
> `pnpm-workspace.yaml`. An older pnpm installs a differently resolved tree and
> reports nothing — which is why the version is a preflight rather than a line
> in the README.

Development ports are slots rather than numbers. A project draws a random slot
from 0–255 and takes `3000+slot` and `5173+slot` together, so two projects
collide only on the same slot rather than on either port independently.

**Every generated file has an owner, and a refresh honours it.** A manifest
tags each file `framework`, `example`, or `workspace`. A refresh overwrites the
first two, skips workspace files, and merges workspace `package.json` files —
the workspace's `name` and `scripts` fields kept verbatim, the three dependency
maps unioned with the scaffold's entries winning on key collisions — with a
dry-run plan available before anything is written. Without this, framework code
copied into a project would be frozen at the version it was copied from, and
every later improvement would require a manual diff against a template the
project no longer has.

**Migration state is three problems, reported together.** The boot-time guard
joins the migration files on disk against the applied ledger and reports pending
(not yet applied), missing (applied, file gone), and changed (hash mismatch) as
separate categories in one combined error, each with the command that fixes it.
The fix differs per category, which is why they are not collapsed into "your
migrations are out of date".

**The database connection is opened the same way every time.** The PRAGMA order
is fixed: `journal_mode = WAL` first, because it changes the file format and
affects how the later PRAGMAs interact; then `busy_timeout = 5000` against
transient `SQLITE_BUSY` under load; `synchronous = NORMAL`, trading a small
risk of losing the last transaction on an OS crash for roughly double the write
throughput; `foreign_keys = ON`; and an 8MB cache. Test databases apply the two
semantically significant settings — WAL and foreign keys — and skip the three
performance tunings, which do not matter for a single-process in-memory
database.

> **`foreign_keys` is per connection and is not stored in the file.** SQLite
> defaults it off, so a connection that does not set it does not enforce foreign
> keys, and nothing reports that. Hence on every open, not once at creation.

**Every request is logged, and the fields a request carries follow it down.**
One logger is configured from the environment — `LOG_FORMAT=json` for
structured output and anything else for a human-readable line, `LOG_LEVEL` for
the threshold — so the format is a deployment decision rather than a per-module
one. A module or a request takes a child logger carrying its own fields, and
those fields appear on everything logged beneath it without being threaded
through the calls in between. The HTTP middleware records method, path, status,
and duration, and deliberately does not read the request body: consuming it
there would take it away from the handler that has to parse it.

`sapporta api` and `sql execute` are the sanctioned paths past the typed
commands, and direct better-sqlite3 access sits beneath the SQL runner, without
its read-only enforcement, result envelope, or error classification.

## Where it ends

The boundary is part of the design. What follows is not provided; an
application that needs it builds it or integrates something else.

**SQLite only, by design.** There is no Postgres, no MySQL, and no
multi-database abstraction. The framework is scoped to personal database
systems, multi-tenant SaaS on a single SQLite instance, and report-heavy
operational software — cases where concurrency is per-tenant rather than
global. It is a poor fit for static sites, content-first sites, and
applications whose difficulty is mostly outside the database. Several decisions
above depend on this choice: the PRAGMA sequence, the streaming scan over a
single statement handle, and the introspection layer's normalisation of PRAGMA
output.

**Not provided.** Background jobs and scheduled tasks. Audit logging and record
history. Real-time updates over WebSocket or server-sent events. Soft delete
and archival. Internationalisation — locale-aware number and date formatting
exists, message translation does not. General-purpose rate limiting for
application routes; the generated auth routes are rate-limited through Better
Auth. Bulk CSV import; export is provided. Feature flags. Transactional email
beyond the auth flows — the mail transport abstraction exists, templates and
sending policy for application email do not. File and blob storage; multipart
parsing is provided, persistence is not. Scheduled or PDF reports. Paste into
the grid; copy out is provided.

**A script opens the application without HTTP.** `openScriptRuntime()` in the
generated project opens the database, signs in with an address and password, and
returns `rows(table)` carrying that person's row access — the same validation,
column defaults, and ownership stamping a browser request gets. `pnpm seed` is
that call with the sample-data account wired in, and `packages/api/seed.ts` is
where a developer writes rows. The account is proved rather than named: signing
in there means holding the password, so a script holds nothing a browser does
not, and there is no act-as-anyone primitive sitting in the project for a route
to borrow. Creating the sample-data account is the one capability that needs a
permission, because its password is in the source, and it checks that permission
itself.

**Optimistic UI is not concurrency control.** The grid's optimistic mutations
reconcile one client's edits against server responses. There is no
database-level conflict detection: no version column, no compare-and-set on
update. Two clients editing the same row concurrently will overwrite each other
without notice. An application that needs detection adds a version or timestamp
column and enforces it in its own handlers.

**Every layer has a documented way out.** Raw Drizzle queries run beneath the
row-security layer. Custom ts-rest routes mount beside the generated ones. A
preset kind outside the built-in set opts a column out of the preset system,
because the kind is an open string rather than a closed list. A hand-written
data source replaces the REST binding beneath the grid. `sapporta sql` and
direct better-sqlite3 access sit beneath everything. Each generic layer is an
offer, and taking a bypass trades that layer's guarantees for control at that
one point — without leaving the framework everywhere else.
