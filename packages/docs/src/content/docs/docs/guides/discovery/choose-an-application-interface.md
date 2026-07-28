---
title: "Choose an application interface"
description:
  "Start here before choosing a caller: select the application operation, then
  continue to OpenAPI and the CLI when the task is to inspect and call a mounted
  route."
---

Choose the application operation before choosing its caller. A generated table
route, domain endpoint, report, and SQL query preserve different rules. A
browser, typed client, CLI command, or agent is only a caller of one of those
operations.

## Decide what owns the work

Start with the invariant that must survive the call. That choice determines
where authorization, validation, and confirmation belong.

| Outcome                                       | Owning operation                        | Suitable callers                                               | Confirmation                                                         |
| --------------------------------------------- | --------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| Inspect or edit an ordinary registered record | Generated record screen or table API    | Browser, `rows` CLI command, or data-console agent             | Read the affected row through the same visible table surface         |
| Answer an ad hoc total or one-column group    | Generated table count                   | `rows count`, direct HTTP, or app-owned server code            | State the filter meaning, row boundary, grouping, and result bound   |
| Apply a named business transition             | App-owned endpoint                      | Typed browser client, `api` CLI command, or data-console agent | Read the declared domain result and the affected state               |
| Reuse an aggregate or read model              | Protected report route and screen       | Browser, `api` CLI command, or data-console agent              | Check the returned dataset or aggregate against its scoped base rows |
| Change repository behavior                    | Source code and tests                   | Coding agent with the Sapporta skill                           | Review the diff and focused verification                             |
| Perform exceptional administration            | Ability-gated unrestricted SQL endpoint | Explicitly authorized operator using `sql`                     | Bound the query or mutation and inspect the resulting state          |

A custom screen does not automatically require a custom data operation. It can
call the generated table API when one registered table still owns the record.
Conversely, putting a multi-table transition behind a custom button does not
make a sequence of table updates atomic; that rule belongs in one app-owned
endpoint.

The generated count operation is narrower than a report. It counts visible rows
from one table, optionally grouped by one column. Use a report when the
application already owns the meaning, when the question combines tables, or when
the result needs reusable measures and labels.

## Keep authority with the operation

Authentication establishes the caller. Abilities decide whether that caller may
perform the action. Row visibility limits which records the permitted action may
reach. These checks remain server-side regardless of whether the caller is a
generated screen, the CLI, or an agent.

A missing row and a row hidden from the caller may intentionally produce the
same not-found result. Do not respond by changing workspace parameters, adding
owner fields, or falling back to SQL. Client payloads also omit server-managed
workspace, ownership, role, audit, and row-scope fields unless the owning
contract explicitly accepts them.

The shared authentication boundary can reject a request before a generated or
app-owned operation runs. Endpoint discovery shows the operation's HTTP
contract; it does not prove the caller's ability or row visibility.

## Discover, call, and confirm

Once the owner is clear:

1. Inspect the live table metadata or mounted endpoint.
2. Resolve names and record IDs from rows visible to the caller.
3. Execute the narrowest operation that preserves the rule.
4. Read back the intended consequence through an application surface.

An HTTP success proves transport and the declared response, not every intended
side effect. Confirm the affected record, event, report, or other observable
invariant. If the write result is uncertain after a transport failure, read
before retrying.

## Keep SQL last

`sql query` and `sql execute` call ability-gated unrestricted metadata
endpoints. They bypass generated row helpers and the application operations
above, so they are administrative fallbacks rather than alternate CRUD commands.
Prefer a generated route, named domain endpoint, or scoped report whenever one
owns the task.

## Continue with the caller

- [OpenAPI and endpoint discovery](/docs/guides/discovery/openapi-and-endpoint-discovery/)
  identifies mounted methods, paths, inputs, and declared responses.
- [Use the Sapporta CLI](/docs/guides/discovery/use-the-sapporta-cli/) calls
  those operations from the project-local command line.
- [Use the agent data console](/docs/guides/discovery/use-the-agent-data-console/)
  adds bounded authority, read-back, and safe stopping for live-record work.
- [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
  covers scalar and grouped counts through the CLI, HTTP, and server helpers.
- [Develop with a coding agent](/docs/guides/discovery/develop-with-a-coding-agent/)
  is the separate path for repository changes.
- [Security guides](/docs/guides/security/authentication-and-abilities/) own
  authentication, abilities, workspaces, and row visibility.
