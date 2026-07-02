---
title: "Reference"
description:
  "Reference notes for Sapporta Grid package imports, runtime concepts, and
  standalone usage boundaries."
---

## Package imports

```ts
import {
  GridLevel,
  GridRuntimeProvider,
  createGridRuntime,
  inMemoryGridDataSource,
  restGridDataSource,
  rootPath,
  useGridRuntimeEffect,
} from "@sapporta/grid";
```

```ts
import {
  boolean,
  column,
  currency,
  date,
  foreignKey,
  identifier,
  lookupValue,
  number,
  percentage,
  rowSelectionColumn,
  select,
  text,
} from "@sapporta/grid/column-preset";
```

## Core terms

| Term         | Meaning                                                                       |
| ------------ | ----------------------------------------------------------------------------- |
| `GridSchema` | The levels, columns, relationships, and row key rules for a grid              |
| Level        | A row type the grid can render                                                |
| Root level   | The top-level level rendered at `rootPath(rootLevel)`                         |
| Child level  | A level rendered under a parent row                                           |
| Row key      | Stable row identity within one level                                          |
| Runtime      | The object that owns focus, selection, editing, snapshots, and reconciliation |
| Data source  | The object that fetches, saves, creates, or removes rows for levels           |

## Standalone boundary

`@sapporta/grid` does not require a Sapporta project. It does not depend on
Sapporta frontend routes, generated table APIs, reports, auth, or server table
contracts.

If an example imports the full Sapporta frontend package, it is a full Sapporta
app example, not a standalone Grid example.
