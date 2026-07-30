---
title: "Schema, rows, paths, and identity"
description:
  "Look up BaseGrid schema, source-row, path, coordinate, and row-id types."
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

## Related documentation

- [Core model](/grid/guides/core-model/)
- [Hierarchical grids](/grid/guides/hierarchical-grids/)
- [Summary rows and footers](/grid/guides/advanced-rows/summary-rows-and-footers/)
