---
title: "Metadata and SQL endpoints"
description:
  "Look up framework metadata routes and privileged SQL HTTP surfaces."
---

## Identity

Framework routes registered under `/api/meta` and `/api/sql` when enabled.

## Contract

- Metadata routes expose project and registered table schema needed by generated
  clients.
- Every serialized table column has a semantic `kind`. Select options come from
  the column's Drizzle enum declaration, and `apiWritable` is included when the
  table definition declares an API write restriction.
- Browser table code parses the metadata response with the shared `TableSchema`
  Zod contract before using it for display, filter, form-draft, or grid-patch
  behavior.
- SQL query routes return rows; SQL execute routes perform privileged changes.
- SQL bypasses table helpers, trusted-value preparation, reference checks, and
  ordinary row visibility.
- Registration, authorization, limits, parameters, and dry-run behavior are
  visible in the running OpenAPI document.

## Related documentation

- [Choose an application interface](/docs/guides/discovery/choose-an-application-interface/)
