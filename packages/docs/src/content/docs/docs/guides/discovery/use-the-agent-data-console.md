---
title: "Use the agent data console"
description:
  "Start here when the outcome is a live-record operation: inspect and choose
  the application operation, follow the agent-token setup, execute it, and
  confirm the result in the running app."
---

The agent data console is an operating discipline: discover live names, resolve
identity from visible rows, choose the owning operation, execute it, and read
the result back.

## Bound the request first

Give the agent an outcome, not broad database access. A bounded request names:

- the intended record or report outcome;
- the application and workspace boundary;
- operations that are allowed;
- destructive or administrative actions that are forbidden;
- the read-back evidence required; and
- conditions that require the agent to stop.

For example:

```text
In the selected application workspace, correct the author spelling on exactly
one visible book titled “Relativity.” Use the generated table operation, do not
use SQL or change ownership/scope fields, read the row back, and stop without
writing if the title is missing or ambiguous.
```

Repository changes belong in
[Develop with a coding agent](/docs/guides/discovery/develop-with-a-coding-agent/),
not in this operating session.

## Establish the caller boundary

Follow
[Agent access and scoped tokens](/docs/guides/security/agent-access-and-scoped-tokens/)
to create, store, rotate, or revoke the credential. That guide owns the token's
identity, workspace, ability, row-visibility, and lifecycle semantics.

Keep four questions separate for every write: who authenticated, whether that
caller has the action ability, which rows the resolved data authority exposes,
and which input values the server owns. Passing one boundary does not prove the
next.

```bash
export SAPPORTA_API_URL=http://localhost:3000
read -s SAPPORTA_API_TOKEN
export SAPPORTA_API_TOKEN

pnpm exec sapporta endpoints list
pnpm exec sapporta tables list
```

A rejected harmless read is a boundary result. For example, revocation is
identified by HTTP `401` and code `token_revoked`; branch on the status/code,
not its message. Stop on authentication or workspace errors and return to the
security owner rather than switching targets or widening access.

## Discover names and current state

The following example assumes the selected app exposes a `books` table. Discover
that name and locate the record through rows visible to the caller:

```bash
pnpm exec sapporta tables show books
pnpm exec sapporta --output json rows list books \
  --q "Relativity" \
  --limit 10
```

Do not guess an ID or foreign key. If the visible result contains zero or
multiple plausible rows, stop and ask for disambiguation. If it contains exactly
one intended row, retain that returned ID for the operation.

Inspect app-owned operations before using them:

```bash
pnpm exec sapporta endpoints list
pnpm exec sapporta endpoints show "GET /api/tables/books"
```

Endpoint detail exposes the HTTP contract, not the caller's ability or row
visibility. Choose the operation using the
[application-interface guide](/docs/guides/discovery/choose-an-application-interface/)
and the request's invariant.

## Execute the narrow operation

An author correction is ordinary single-table CRUD, so the generated row
operation owns it. Set `BOOK_ID` only from the single inspected result; the
shell guard prevents an empty value:

```bash
: "${BOOK_ID:?Set BOOK_ID from the single inspected row}"
pnpm exec sapporta rows update books "$BOOK_ID" \
  --values '{"author":"Albert Einstein"}'
pnpm exec sapporta --output json rows get books "$BOOK_ID"
```

The payload omits IDs, timestamps, workspace, ownership, role, audit, and
row-scope fields controlled by the server. When a transition spans records or
preserves a domain invariant, use its discovered app-owned endpoint instead of
reproducing it with several row commands.

For a read-only question, first use an existing scoped report when it defines
the business meaning. Otherwise use `rows count` for a filtered total or bounded
one-column group over one table:

```bash
pnpm exec sapporta --output json rows count tasks \
  --where '{"status":{"neq":"completed"}}'
```

State how terms such as “pending” map to stored values. Use `--group-by`,
`--order`, and `--limit` for grouped counts, and resolve foreign-key labels with
a separate target-table lookup. If the count surface cannot express the
question, use an app-owned report or read endpoint. Privileged `sql query` is an
explicitly authorized administrative fallback, not an escape from application
visibility.

## Confirm and report

A successful response is not the completed outcome. Read back the affected row,
event, report, or aggregate through the application. If a write loses its
response, read before retrying so an uncertain success does not become a
duplicate mutation.

Report:

- the selected app and workspace boundary;
- the table or mounted route used;
- the discovered record identity, filters, and row limit;
- the before/after fields or other confirmation;
- any skipped, ambiguous, partial, or failed work; and
- the stable error code when the operation did not complete.

## Stop safely

Stop without broadening access when:

- the record name, ID, relationship, or requested outcome is ambiguous;
- no discovered operation owns the requested invariant;
- the caller lacks authority or receives an authentication/workspace error;
- the request requires client-chosen workspace, owner, role, or scope fields;
- raw SQL, deletion, or another destructive action was not explicitly allowed;
- the inspected state changed before the write;
- a query is capped or partial and cannot support the claimed answer; or
- read-back does not prove the requested result.

Do not turn a not-found result into a workspace search. Invisible and missing
rows may intentionally share one response.

## Continue

- [Choose an application interface](/docs/guides/discovery/choose-an-application-interface/)
- [OpenAPI and endpoint discovery](/docs/guides/discovery/openapi-and-endpoint-discovery/)
- [Use the Sapporta CLI](/docs/guides/discovery/use-the-sapporta-cli/)
- [Agent access and scoped tokens](/docs/guides/security/agent-access-and-scoped-tokens/)
- [Table, row, and report commands](/docs/reference/cli/table-row-and-report-commands/)
- [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
- [API and SQL commands](/docs/reference/cli/api-and-sql-commands/)
