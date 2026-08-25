---
title: "Grid-first record workflows"
description:
  "Choose a generated table screen, table-aware Grid, GridCore, or application
  screen from who owns the rows and the work."
---

A grid is not one abstraction in Sapporta. The generated table screen, TGrid,
and GridCore preserve different amounts of table meaning. Choose the row and
cache owner first, then read the focused implementation guide.

## Choose who owns the rows

| Need | Surface | Data or cache owner |
| --- | --- | --- |
| Ordinary CRUD, filters, lookups, child collections, and export | Generated table screen | Generated table surface and server |
| Registered table with custom columns, renderers, hierarchy, or Grid composition | TGrid, normally through `TableGridView` | Table-aware Grid session |
| Temporary, composite, calculated, or browser-owned rows | GridCore, usually with `ColumnPreset` | Application source and runtime |
| Custom route, layout, workflow, URL state, commands, or non-grid controls | Application React screen | Screen coordinates query, Grid, and action owners |
| Reusable, authoritative scoped aggregate | Application report route and screen | Server route plus typed client and query |

The generated route is the default because it already has table metadata,
lookups, generated clients, URL query state, record links, and row-safe writes.
TGrid retains those table services while the application chooses the
composition. GridCore starts from a schema and data source you supply.
`ColumnPreset` can add standard editors and codecs to GridCore, but it does not
turn application rows into registered table rows.

Use ordinary controls for singleton values, forms, wizards, and compact panels
around a Grid. A custom screen can keep generated screens as the system of
record while adding one focused projection or command beside them.

## Continue with the selected surface

- [Grid interaction and selection](/docs/guides/generated-surfaces/grid-interaction-and-selection/)
  chooses keyboard, active-row, activation, and selection behavior.
- [Table-aware grids and customization](/docs/guides/generated-surfaces/table-aware-grids-and-customization/)
  keeps one registered table's query, lookup, URL, and save behavior.
- [Low-level TGrid sessions](/docs/guides/generated-surfaces/low-level-tgrid-sessions/)
  owns explicit hierarchy, session lifecycle, and external reload registration.
- [Bounded GridCore projections](/docs/guides/application-code/bounded-gridcore-projections/)
  renders small application calculated rows.
- [Custom workflow screens](/docs/guides/application-code/custom-workflow-screens/)
  coordinates generated reads and application actions without making Grid own the
  workflow.
- [Route-based reports](/docs/guides/reports/route-based-reports/) owns reusable
  or authoritative aggregates.

## Keep persistence on the server

The host or data source supplies stable row keys. Grid owns focus, editing
state, selection, hierarchy, drafts, and subscriptions. A generated table route
or application endpoint owns authentication, row scope, domain validation,
conflicts, and transactions. Hidden columns, fixed filters, row keys, and
selection state are presentation, not authorization.

## Related documentation

- [Choose a Grid layer](/grid/start/choose-a-grid-layer/)
- [Grid core model](/grid/guides/core-model/)
- [Columns and editors](/grid/guides/columns-and-editors/)
