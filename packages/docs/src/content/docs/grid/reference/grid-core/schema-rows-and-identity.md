---
title: "Schema, rows, paths, and identity"
description:
  "Look up GridCore schema, tree-level, source-row, path, coordinate, and row-id
  types."
---

Use this page when defining a Grid schema or translating host row identity into
Grid paths and row ids.

## Identity

Every source row provides a stable `rowKey`. A `GridPath` identifies one
rendered level. A `RowId` combines the path, displayed row kind, and row key.

```ts
type ColId = string;
type RowKey = string;
type GridPath = Brand<string, "GridPath">;
type RowId = Brand<string, "RowId">;
type Coord = { readonly rowId: RowId; readonly colId: ColId };

function rootPath(rootLevelName: string): GridPath;
function childPath(
  parent: GridPath,
  parentRowKey: RowKey,
  childLevelName: string,
): GridPath;
function makeRowId(path: GridPath, rowKey: RowKey): RowId;
function pathOfRowId(id: RowId): GridPath;
function rowKeyOfRowId(id: RowId): RowKey;
```

Use these helpers instead of constructing or parsing path and row-id strings.
Row keys may contain `.`, `#`, and `%`; the identity helpers escape them.

## Schema and rows

```ts
type GridSchema = {
  readonly levels: Readonly<Record<string, LevelSchema>>;
  readonly rootLevel: string;
};

type LevelSchema = {
  readonly name: string;
  readonly columns: readonly ColumnSchema[];
  readonly rowHeaderColumn:
    { readonly column: ColId } | "empty-selectable-cell" | "none";
  readonly options: LevelOptions;
  readonly childLevels: readonly string[];
  readonly tree?: LevelTreeConfig;
};

type TreeNode = {
  readonly rowKey: RowKey;
  readonly levelName: string;
  readonly columns: Readonly<Record<ColId, unknown>>;
  readonly rollup?: Readonly<Record<ColId, unknown>>;
  readonly children?: Readonly<Record<string, TreeNode | readonly TreeNode[]>>;
  readonly childFooterRows?: Readonly<Record<string, readonly FooterRow[]>>;
  readonly kind?: "opening" | "closing" | "subtotal";
};
```

`TreeNode.rowKey` is required. The schema does not derive row identity from a
column or array index.

```ts
const schema = {
  rootLevel: "projects",
  levels: {
    projects: {
      name: "projects",
      rowHeaderColumn: "none",
      columns: projectColumns,
      options: {},
      childLevels: ["tasks"],
    },
    tasks: {
      name: "tasks",
      rowHeaderColumn: "none",
      columns: taskColumns,
      options: {},
      childLevels: [],
    },
  },
} satisfies GridSchema;

const tree = [
  {
    rowKey: "project-1",
    levelName: "projects",
    columns: { name: "Migration" },
  },
] satisfies TreeNode[];
```

Runtime row reads return the `LevelRow` discriminated union. Branch on
`row.kind` before using kind-specific fields. The union includes `data`,
`rollup`, `opening`, `closing`, `subtotal`, `footer`, and `phantom` rows.

## Tree levels

A level with `tree` shows rows of the same level that refer to each other
through a parent-key field, such as accounts with a `parent_id`, as one tree
under one header:

```ts
type LevelTreeConfig = {
  readonly parentKeyField: string;
  readonly parentKeyValue?: (parent: TreeNode) => unknown;
  readonly defaultExpanded?: boolean; // default true
};
```

- `parentKeyField` names the field of `TreeNode.columns` that holds the parent's
  row key. `null`, `undefined`, and `""` mark a top-level row. The value is
  compared with row keys as `String(value)`.
- `parentKeyValue` reads the value `addChild` writes into a new child's
  parent-key field from the parent row. Supply it when the field holds a typed
  key, such as a number. `String()` of the value must equal the parent's row
  key. Without it, a child stores the parent's row key.
- A tree level declares no `childLevels`. `validateLevelTree(levelName, level)`
  checks both rules and throws with the level name; `createGridRuntime()` runs
  the same check.

The source delivers a flat list. The grid derives each row's depth, visibility,
and expansion from it and leaves out rows under a collapsed ancestor. Data and
draft rows of a tree level carry `row.tree`:

```ts
type TreeRowFacts = {
  readonly depth: number; // 0 at top level
  readonly parentId: RowId | null;
  readonly childCount: number;
  readonly expanded: boolean; // always false without children
  readonly positionInSet: number; // 1-based among siblings
  readonly setSize: number;
  readonly context: boolean;
};
```

Counts describe the source snapshot plus drafts, so a collapsed parent still
reports its children. `context` is `true` for a row present only because a
descendant matched the source's filter. `row.tree` is absent on every row of a
level without `tree`.

## Related documentation

- [Core model](/grid/guides/core-model/)
- [Hierarchical grids](/grid/guides/hierarchical-grids/)
- [Level runtime](/grid/reference/grid-core/level-runtime/)
- [Summary rows and footers](/grid/guides/advanced-rows/summary-rows-and-footers/)
