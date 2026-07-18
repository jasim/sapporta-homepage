---
title: "Choose a grid layer"
description: "Choose BaseGrid, ColumnPreset, or Sapporta's table-aware TGrid integration."
---

Standalone Grid exposes two layers. Sapporta applications add a third table-aware layer from a different package.

| Requirement | Layer | Import boundary |
| --- | --- | --- |
| Full control over schema, runtime, sources, and raw columns | BaseGrid | `@sapporta/grid/grid` |
| Standalone grid with typed column constructors and editors | BaseGrid + ColumnPreset | `@sapporta/grid` and `@sapporta/grid/column-preset` |
| Sapporta table metadata, generated queries, lookups, saves, and record routes | TGrid | `@sapporta/frontend` |

## Decision rules

- Start with ColumnPreset for normal standalone text, number, date, boolean, select, lookup, and selection columns.
- Use raw BaseGrid columns for a custom renderer or editor that ColumnPreset does not model.
- Use TGrid when a generated Sapporta table owns schema metadata, query state, row security, and record navigation.
- Do not import TGrid from `@sapporta/grid`; its public contract belongs to `@sapporta/frontend`.

For application record workflows, start with
[Grid-first record workflows](/docs/guides/generated-surfaces/grid-first-record-workflows/).
Then continue with [Columns and editors](/grid/guides/columns-and-editors/),
[BaseGrid Reference](/grid/reference/base-grid/), or the main
[TGrid guide](/docs/guides/generated-surfaces/table-aware-grids-and-customization/).
