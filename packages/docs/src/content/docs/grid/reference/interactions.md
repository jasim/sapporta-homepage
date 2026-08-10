---
title: "Grid interactions"
description: "Choose the narrow configuration, active-row, activation, or row-selection reference."
---

Interaction configuration is fixed for the lifetime of a `GridRuntime`. The
configuration separates four kinds of state:

- keyboard focus identifies the active cell or row cursor;
- cell selection identifies a rectangular copy or editing range;
- active-row context identifies one current row across the Grid; and
- row selection identifies operation targets.

Choose the reference that matches the coding task:

- [Interaction configuration and presets](/grid/reference/interactions/configuration-and-presets/)
  for cell-grid versus row-list behavior, keyboard semantics, cell ranges, and
  the exported presets.
- [Active rows and row activation](/grid/reference/interactions/active-row-and-activation/)
  for master-detail context and repeatable Enter, click, or double-click actions.
- [Row selection](/grid/reference/interactions/row-selection/) for single,
  range, or multi-row operation targets, subscriptions, and selection chrome.

Other interaction surfaces live with their owning APIs:

- [GridRuntime](/grid/reference/base-grid/grid-runtime/) owns cross-path row
  operation targets.
- [Advanced Grid composition](/grid/reference/base-grid/advanced-composition/)
  owns imperative cursor and controller access.
- [Grid DOM state contract](/grid/reference/dom-and-styling-contract/) owns
  public interaction-state attributes.
