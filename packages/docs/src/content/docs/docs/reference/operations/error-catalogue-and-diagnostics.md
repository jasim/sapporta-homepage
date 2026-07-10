---
title: "Error catalogue and diagnostics"
description: "Look up stable error classes, HTTP categories, and narrow diagnostic commands."
---

## Identity

Server errors, shared error schemas, CLI mapping, migration readiness, and native-module diagnostics.

## Contract

- `QueryParseError` maps strict query failures to structured 400 responses.
- `ValidationError` and save-pipeline errors expose field or workflow validation without partial writes.
- `RowNotFoundError` hides the distinction between missing and invisible rows.
- `ImmutableTableOperationError` rejects update/delete for immutable tables.
- Migration readiness errors stop startup; native binding errors identify the failed addon load.
- Use endpoint/table discovery, `db:check`, CLI target flags, and health output before changing data or dependencies.


## Related documentation

- [Troubleshooting](/docs/guides/operations/troubleshooting/)
