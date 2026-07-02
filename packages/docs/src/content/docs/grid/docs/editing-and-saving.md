---
title: "Editing And Saving"
description:
  "Handle editable cells, save behavior, local patches, and server validation
  with Sapporta Grid."
---

Editable columns declare that the user may change a value:

```ts
text({ id: "title", name: "Title", edit: "default" });
number({ id: "quantity", name: "Qty", edit: "default" });
```

That declaration gives the grid enough information to start editing from the
configured gestures and to keep focus stable while the editor is open. Saving is
still your application boundary.

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
