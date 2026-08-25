---
title: "Row-safe custom endpoints and reports"
description:
  "Choose the row-safe data path for an application table operation, workflow,
  report, immutable table, or trusted raw query."
---

Generated table routes apply action checks and row visibility automatically.
Application code must choose those boundaries explicitly.

| Boundary | Question | Mechanism |
| --- | --- | --- |
| Credential | Who is calling, and in which workspace? | Session or agent token |
| Action ability | May this principal run the operation? | `forbidUnless(...)` or an authorized project helper |
| Data authority | Which workspace/user authority may the request exercise? | Request data-authority resolution and narrowing |
| Row enforcement | Which rows satisfy table and domain predicates? | `scopedRows(...)`, table guards, and `ownedRows(...)` |
| Write integrity | Which fields must trusted server code author? | Managed fields and `serverValues` |
| State transition | Which changes commit together? | A synchronous database transaction |

Passing one boundary does not imply another. A valid ID, hidden input, URL
filter, report link, or Grid state never grants authority.

## Choose the focused path

- [Scoped table reads and writes](/docs/guides/security/scoped-table-reads-and-writes/)
  covers `scopedRows()`, table guards, bounded reads, counts, and trusted insert
  preparation.
- [Domain workflows and transactions](/docs/guides/application-code/domain-workflows-and-transactions/)
  covers multi-table state transitions and rollback.
- [Scoped report data](/docs/guides/reports/scoped-report-data/) covers
  per-table report predicates, aggregation, and cross-workspace proof.
- [Immutable tables and trusted raw access](/docs/guides/security/immutable-tables-and-trusted-raw-access/)
  covers append-only policy and the review boundary for Drizzle or SQL that
  bypasses helpers.

Every route still checks its action before using a row helper. Each table in a
custom query or transaction needs its own guard.

## Related documentation

- [Authentication and abilities](/docs/guides/security/authentication-and-abilities/)
- [Workspaces, ownership, and row visibility](/docs/guides/security/workspaces-ownership-and-row-visibility/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
