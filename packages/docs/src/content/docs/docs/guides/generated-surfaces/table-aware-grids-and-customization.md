---
title: "Table-aware grids and customization"
description: "Choose the highest-level Sapporta table grid and customize it without losing table behavior."
---

Choose the highest-level Sapporta table grid and customize it without losing table behavior.

Generated table routes own ordinary screens. `TGrid`, `TableRoute`, and `SchemaTableGridView` provide table-aware customization through `@sapporta/frontend`.

For the programmer, the project can change columns, query ownership, saves, or hierarchy while retaining schema metadata and row-safe table clients.
For the application user, users keep lookup labels, navigation, copy behavior, and record links in a specialized grid.

## System boundary

- Use generated routes until the page needs a different workflow or presentation.
- Use `TGrid` for Sapporta table metadata and table-route integration.
- Use standalone `BaseGrid` only when the screen owns its row and data-source model.
- Dispose custom sessions with the component lifecycle.

## Task-app example

A project-progress grid can retain task lookup labels and generated record links while presenting status columns in a domain-specific order.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [TGrid](/docs/reference/frontend/tgrid/)
- [Choose a Grid layer](/grid/start/choose-a-grid-layer/)
