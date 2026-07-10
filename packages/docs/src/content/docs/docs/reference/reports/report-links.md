---
title: "Report links"
description: "Look up report cell, row, footer, and cross-report link resolver contracts."
---

## Identity

Report link resolver types and renderer behavior from `@sapporta/frontend/report`.

## Contract

- Links are resolved in the frontend and are not serialized in `GridDataset`.
- Resolver context includes the current node, column/value, ancestors, and report input where applicable.
- Hidden IDs support generated-record and filtered-table destinations.
- Footer and synthetic rows may lack identifiers and must return no link when a target is unavailable.
- Every destination performs its own authorization.


## Related documentation

- [Drill-through and cross-report links](/docs/guides/reports/drill-through-and-cross-report-links/)
