---
title: "Advanced Grid composition"
description:
  "Use supported imperative cursor, controller, and materialization facades."
---

The root package omits raw controllers, cursor managers, and renderer internals.
Use these APIs only when custom composition must move a cursor, control editing,
or inspect materialized hierarchy outside the ordinary React and runtime
surfaces.

Import the supported composition helpers from `@sapporta/grid/advanced`:

```ts
import {
  cellActivationFor,
  controllerFor,
  cursorManagerFor,
  materializedChildren,
} from "@sapporta/grid/advanced";
```

## Cursor and controller access

```ts
const level = runtime.root;
const rowId = makeRowId(level.path, "task-1");
const cursors = cursorManagerFor(runtime);

cursors.moveCellCursorTo({ path: level.path, rowId, colId: "title" });
cursors.extendCellSelectionTo({ path: level.path, rowId, colId: "status" });
cursors.clearCellRange(level.path);

const controller = controllerFor(runtime, level.path);
controller.startEdit({ rowId, colId: "title" }, "f2");
controller.cancelEdit();
```

`cursorManagerFor(runtime)` returns one identity-stable facade per runtime.
`controllerFor(runtime, path)` returns one facade for the current level
registration. Commands throw after the runtime or registration is disposed.

Advanced helpers are lifetime-checked facades. They do not expose the private
runtime kernel.

## Related documentation

- [Interaction configuration and presets](/grid/reference/interactions/configuration-and-presets/)
- [GridRuntime](/grid/reference/grid-core/grid-runtime/)
- [GridLevelRuntime](/grid/reference/grid-core/level-runtime/)
