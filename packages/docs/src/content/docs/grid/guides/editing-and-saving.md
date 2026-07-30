---
title: "Editing and saving"
description:
  "Connect editor commits to local or remote persistence and reconcile
  authoritative rows."
---

Editable columns declare that the user may change a value:

```ts
text({ id: "title", name: "Title", edit: "default" });
number({ id: "quantity", name: "Qty", edit: "default" });
```

That declaration gives the grid enough information to start editing from the
configured gestures and to keep focus stable while the editor is open. Saving is
still your application boundary.

Preset editors keep presentation drafts separate from committed row values.
Numeric editors retain incomplete or invalid text until commit. Select editors
retain their search query separately and commit only an option's exact value.
The preset parser runs when the editor commits, not on each keystroke.

Generic parsers do not know whether empty means omit, reject, or persist `null`.
They also preserve invalid numeric text instead of silently replacing it with
`null`. A schema-aware host or save handler applies those presence and
validation rules.

For local grids, the in-memory data source can apply cell changes to local row
state. For server grids, send the patch to your own endpoint and reconcile the
result.

Use a server response shape that can represent the normal cases:

- accept the new value
- return a multi-field patch
- return the full row after server-side calculation
- reject the edit with a validation message
- reload the level when the edit changes row membership

Keep domain rules outside the renderer. A renderer can show status, validation,
and pending state, but the save path should be testable without mounting the
React grid.

## Verify

Typecheck the example and exercise its visible loading, ready, interaction, and
failure states. Use only public `@sapporta/grid` export paths. Continue with
[Data-source writes and reconciliation](/grid/reference/data-sources/writes-and-reconciliation/).
