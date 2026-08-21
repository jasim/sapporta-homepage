---
title: "Clipboard API"
description: "Find the standalone clipboard export boundary and the canonical copy guide."
---

## Identity

Clipboard and copy-menu exports are available from `@sapporta/grid/grid`.
`GridCopyContextMenu` adds the standard copy commands to a standalone GridCore
composition. `ColumnSchema.copy` and the ColumnPreset `copy` option define the
clipboard columns contributed by one visible column.

## Behavior

Use [Copying grid data](/grid/guides/copying-grid-data/) for selection behavior,
default and labeled-value columns, custom copy functions, headers, asynchronous
values, and CSV materialization.

Row selection is not clipboard selection. See
[Interaction configuration and presets](/grid/reference/interactions/configuration-and-presets/)
for the cell-grid selection model.
