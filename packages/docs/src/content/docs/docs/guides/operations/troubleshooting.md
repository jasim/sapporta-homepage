---
title: "Troubleshoot startup, native modules, auth, and migrations"
description: "Diagnose common failures from their observable signal and apply a narrow correction."
---

Diagnose common failures from their observable signal and apply a narrow correction.

Startup, native SQLite, target selection, filters, auth, migrations, origins, and persistent storage each expose distinct diagnostics.

For the programmer, the operator confirms the failing boundary before changing dependencies, credentials, schema, or data.
For the application user, users regain the intended application without a destructive database reset or weakened filter/security behavior.

## System boundary

- For native binding errors, run the documented package-manager repair and rebuild the addon.
- For 400 filters, fix the strict query rather than dropping it.
- For auth errors, confirm target, token workspace, expiry, and revocation.
- For migration failures, compare committed artifacts and database readiness before starting the server.

## Task-app example

Use `endpoints show`, `tables show`, CLI target flags, migration checks, and health output to isolate the failing task-app boundary.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Error catalogue and diagnostics](/docs/reference/operations/error-catalogue-and-diagnostics/)
- [Migration and startup invariants](/docs/reference/operations/migration-and-startup-invariants/)
