---
title: "Immutable tables and trusted raw access"
description:
  "Keep append-only policy distinct from abilities and contain Drizzle or SQL
  paths that bypass row and immutability helpers."
---

`immutable` blocks enforcing update and delete paths. It does not grant read or
create abilities, and it does not constrain trusted raw database access.

## Model append-only application history

For an event table, grant generated `read` and `export` when the product needs
them, but omit generated `create` when only a trusted workflow may append.
Ability policy is separate from immutability:

- the route ability decides whether the operation may run;
- row security decides which existing rows it may reach;
- `immutable` rejects helper-backed update and delete;
- the workflow decides which trusted values may be inserted.

Test generated event creation separately from immutable update/delete. Test an
immutable mutation both without its action ability and with the ability so
authorization rejection is not confused with immutable-policy rejection.

## Treat raw access as trusted authority

Raw Drizzle or SQL bypasses row policy and immutable helper checks unless code
explicitly composes the same predicates and write rules. Keep unavoidable raw
access in a narrow store module with a justification.

For reads, build guarded base relations before joining or aggregating. For
writes, state which helper invariant is being reproduced and prove managed
fields, reference visibility, immutability, and rollback directly. Raw SQL is
not an alternate generated CRUD command.

## Related documentation

- [Row-safe custom endpoints and reports](/docs/guides/security/row-safe-custom-endpoints-and-reports/)
- [Scoped table reads and writes](/docs/guides/security/scoped-table-reads-and-writes/)
- [Scoped report data](/docs/guides/reports/scoped-report-data/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
