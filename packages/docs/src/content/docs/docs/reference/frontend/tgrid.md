---
title: "TGrid"
description: "Look up Sapporta table-aware grid definitions, sessions, routes, hooks, and services."
---

## Identity

`TGrid` and table-grid exports from `@sapporta/frontend`; standalone runtime primitives come from `@sapporta/grid`.

## Contract

- `defineTGrid()` declares schema-table levels and column builders.
- `useTGridSession()` or session helpers own runtime construction, query state, services, and disposal.
- `TGrid` renders a configured session; `TableRoute` and `SchemaTableGridView` connect standard table routes.
- Table-aware clients preserve Sapporta queries, lookups, row saves, auth, and record navigation.
- Direct `BaseGrid` and `ColumnPreset` contracts live in standalone Grid Reference.


## Related documentation

- [Table-aware grids and customization](/docs/guides/generated-surfaces/table-aware-grids-and-customization/)
