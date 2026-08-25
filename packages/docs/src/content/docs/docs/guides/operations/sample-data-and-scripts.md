---
title: "Sample data and command-line scripts"
description:
  "Fill a development database with `pnpm seed`, and open the application from
  any script through the app's own save path."
---

A generated project ships `pnpm seed` and the runtime behind it. A script opens
the database on the same machine, signs in as an account, and writes through the
application's own save path — the same validation, column defaults, and
ownership stamping a request from the browser gets. Seeded rows are rows the
application could have produced.

Apply migrations first, so the tables being seeded exist.

## Fill the development database

`packages/api/seed.ts` is where a developer writes rows. It is workspace-owned:
the scaffold creates it once and the project owns it from then on.

```ts
import { openSeedRuntime } from "./seed-runtime.js";
import { books, reviews } from "./schema/books.js";

const SAMPLE_DATA_ACCOUNT = {
  name: "Demo User",
  email: "demo@example.com",
  password: "demo-password",
};

const demo = await openSeedRuntime(SAMPLE_DATA_ACCOUNT);

if ((await demo.rows(books).count()) === 0) {
  const dune = await demo.rows(books).create({
    title: "Dune",
    author: "Frank Herbert",
    published_on: "1965-08-01",
  });

  await demo.rows(reviews).create({ book_id: dune.id, rating: 5 });
}

demo.close();
```

Import a table from `packages/api/schema/` and call
`demo.rows(table).create({ ... })`. `create()` returns the stored row, so create
parent rows first and take foreign keys from what comes back. Omit `id`,
`created_at`, `updated_at`, `workspace_id`, and `scoped_to_user_id`: those are
generated, or stamped from the account the run signed in as.

`openSeedRuntime()` returns the workspace the rows land in, `rows()`, and
`close()`.

Guard writes with a count so a repeat run does not add the same rows twice. The
account is created on the first run and signed in to on every run after.

Run it from the repository root:

```bash
pnpm seed
```

The run needs no server and no access token. Sign in as the sample-data account
named at the top of `seed.ts` to see the rows.

A script writes into the first workspace its account belongs to. A browser
prefers whichever workspace the session is already in and falls back to that
same one. The two agree for an account with a single workspace and for a session
that has not chosen, which covers a freshly seeded project. They part company
for a person who belongs to several workspaces and has switched.

## Permit sample-data seeding

The sample-data account's password is written in `seed.ts`, and creating it
skips what the sign-up route does to protect a real address: the rate limit, the
trusted-origin check, and the verification email.
`packages/api/project-auth/sample-data.ts` holds both the permission check and
the one write that marks the address verified, so a caller that reaches past
`openSeedRuntime()` for `createSampleDataAccount()` is refused for the same
reason the seed script is.

Seeding runs where `.env.development` sets:

```text
SAPPORTA_ALLOW_SAMPLE_DATA_SEEDING=true
```

and `NODE_ENV` is not `production`. The permission is granted rather than merely
not withheld: an environment that never heard of the setting is refused. A
staging box, a systemd unit, or CI running against a restored snapshot otherwise
looks exactly like a developer's machine.

Never carry that setting into a deployment. The password is in the source, so
the account it creates is a live credential for any database that has it.

## Open the application from any other script

A script that is not sample data — a nightly job, a one-off import, a
maintenance task — uses `openScriptRuntime()` from
`packages/api/script-runtime.ts`:

```ts
import { openScriptRuntime } from "./script-runtime.js";
import { invoices } from "./schema/invoices.js";

const script = await openScriptRuntime({ email, password });

await script.rows(invoices).create({ customer_id, amount_cents: 4500 });

script.close();
```

It opens the application with no server around it, signs in as whichever account
that address and password belong to, and returns `rows(table)` with exactly the
row access that person holds. It creates nothing and needs no permission
setting. The database, table definitions, and auth come up exactly as they do
for the server, so a script sees the schema checks the server would have refused
to start without.

A script works on the whole workspace it signed in to. That authority set is
fixed rather than chosen at the call site: `authz/resolveRequestDataAuthority()`
remains the only place a served request's row access is decided.

**The account is proved, not named.** Signing in there means holding the
password, which is what a browser holds, so a caller gains nothing it did not
already have. A primitive that named an account outright — act as anyone, no
credential — is one that becomes privilege escalation the moment it is copied
into a route.

Do not call `openScriptRuntime()` from a route, from middleware, or from
anything they reach. A served request already carries the row access it earned,
at `c.get("auth")`. `verifyEmailPasswordWithoutRateLimit()` states the reason in
its name: the throttle in front of the sign-in route counts HTTP requests, and
does not apply to a call made in process.

## The runtime both paths share

`openProjectRuntime()` in `packages/api/runtime.ts` opens the database, loads
the table schema, and configures auth and mail. `boot.ts` mounts Hono on top of
it, and the script runtime opens it directly. Both call the `close()` it
returns, so the HTTP server and `pnpm seed` cannot drift apart.

It defaults mail to off for a script, because the addresses in a database belong
to people who did not ask a script to write to them. It takes the
anonymous-route list as an option from `boot.ts`, so opening the application
does not pull in every route module.

## Two ways not to seed

- **An HTTP sign-in with a hand-written cookie jar.** Signing up over HTTP
  against the running server means keeping `Set-Cookie` across calls, sending an
  origin CORS will accept, and reading the API port out of `.env.development` —
  plumbing that exists because the script is treated as a browser. A script runs
  on the same machine as the database. Agent access tokens do not close the gap
  either: only a signed-in person can create one, and a freshly scaffolded app
  has no account yet, which is precisely when sample data is wanted.
- **Raw SQL `INSERT`.** It writes rows the application itself could never have
  produced: no validation, no column defaults, and ownership columns filled in
  by hand or left empty.

## Related documentation

- [Create a Sapporta project](/docs/getting-started/create-a-project/)
- [Generated project layout](/docs/reference/project/generated-project-layout/)
- [Environment variables](/docs/reference/project/environment-variables/)
- [Scoped table reads and writes](/docs/guides/security/scoped-table-reads-and-writes/)
- [Scoped CRUD and bounded reads](/docs/reference/server/row-scoped-data/scoped-crud-and-bounded-reads/)
- [Agent access and scoped tokens](/docs/guides/security/agent-access-and-scoped-tokens/)
