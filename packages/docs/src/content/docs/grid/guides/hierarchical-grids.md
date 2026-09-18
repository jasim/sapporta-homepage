---
title: "Hierarchical grids"
description:
  "Render nested levels with stable identity and local or lazy child data, and
  same-level rows as a tree."
---

Hierarchical grids use multiple levels. The root level renders first. Child
levels render under expanded parent rows.

```ts
const schema: GridSchema = {
  rootLevel: "projects",
  levels: {
    projects: {
      name: "projects",
      rowHeaderColumn: "none",
      childLevels: ["tasks"],
      columns: [text({ id: "name", name: "Project", edit: "default" })],
      options: {},
    },
    tasks: {
      name: "tasks",
      rowHeaderColumn: "none",
      childLevels: [],
      columns: [text({ id: "title", name: "Task", edit: "default" })],
      options: {},
    },
  },
};
```

In memory, nested rows live under `children`:

```ts
const tree: TreeNode[] = [
  {
    rowKey: "p1",
    levelName: "projects",
    columns: { name: "Launch" },
    children: {
      tasks: [
        {
          rowKey: "t1",
          levelName: "tasks",
          columns: { title: "Draft checklist" },
        },
      ],
    },
  },
];
```

For remote data, a child request should include the parent path and row key. The
server can then load only the children for that parent.

Use hierarchy when the user needs to work with related rows in place. If the
screen is only showing totals, subtotals, or drill links, a readonly result
surface may be a better fit than an editable grid.

## Render a local tree

Use `inMemoryGridDataSource()` when the full tree is already available in
browser state:

```tsx
import {
  GridLevel,
  GridRuntimeProvider,
  createGridRuntime,
  inMemoryGridDataSource,
  useGridRuntimeEffect,
  type GridSchema,
  type TreeNode,
} from "@sapporta/grid";
import { text } from "@sapporta/grid/column-preset";

const schema: GridSchema = {
  rootLevel: "projects",
  levels: {
    projects: {
      name: "projects",
      rowHeaderColumn: "none",
      columns: [text({ id: "name", name: "Project", edit: "default" })],
      childLevels: ["tasks"],
      options: {},
    },
    tasks: {
      name: "tasks",
      rowHeaderColumn: "none",
      columns: [text({ id: "title", name: "Task", edit: "default" })],
      childLevels: [],
      options: {},
    },
  },
};

const tree: TreeNode[] = [
  {
    rowKey: "project-1",
    levelName: "projects",
    columns: { name: "Launch" },
    children: {
      tasks: [
        {
          rowKey: "task-1",
          levelName: "tasks",
          columns: { title: "Review plan" },
        },
      ],
    },
  },
];

export function ProjectGrid() {
  const runtime = useGridRuntimeEffect(
    () =>
      createGridRuntime({
        schema,
        dataSource: inMemoryGridDataSource({
          schema,
          tree,
          levels: {
            projects: {
              sortMode: "client",
              filterMode: "none",
              paginationMode: "none",
            },
            tasks: {
              sortMode: "client",
              filterMode: "none",
              paginationMode: "none",
            },
          },
        }),
      }),
    [],
  );

  if (!runtime) return null;

  return (
    <GridRuntimeProvider runtime={runtime}>
      <GridLevel path={runtime.root.path} />
    </GridRuntimeProvider>
  );
}
```

Path-like level ids such as `projects.tasks` can make a larger hierarchy easier
to read, but they are still grid level ids. They do not have to match route
paths, database names, or backend resource names.

## Tree data

Some rows refer to other rows of the same kind. For example, an account can have
a parent account through a `parent_id` column. A tree level shows such rows as
one list under one header. The hierarchy is shown in one column: each row is
indented by its depth, and a row with children has a chevron that expands or
collapses it. The other columns stay aligned across all depths.

A tree level differs from `childLevels`. An expanded row with child levels opens
a nested grid of another level, with its own header and columns. A tree level
declares no `childLevels`, so a row's chevron has one meaning.

Declare `tree` on the level. `parentKeyField` names the field of
`TreeNode.columns` that holds the parent's row key; `null`, `undefined`, or `""`
marks a top-level row. The tree column is the column wrapped with
`withTreeColumn`, which draws the indentation and the chevron:

```tsx
import {
  inMemoryGridDataSource,
  withTreeColumn,
  type GridSchema,
  type TreeNode,
} from "@sapporta/grid";
import { text } from "@sapporta/grid/column-preset";

const schema: GridSchema = {
  rootLevel: "accounts",
  levels: {
    accounts: {
      name: "accounts",
      rowHeaderColumn: "none",
      childLevels: [],
      tree: { parentKeyField: "parent_id" },
      columns: [
        withTreeColumn(text({ id: "name", name: "Account", edit: "default" })),
        text({ id: "description", name: "Description" }),
      ],
      options: {},
    },
  },
};

// A flat list: the grid builds the tree from parent_id.
const tree: TreeNode[] = accounts.map((account) => ({
  rowKey: String(account.id),
  levelName: "accounts",
  columns: account,
}));

const dataSource = inMemoryGridDataSource({
  schema,
  tree,
  levels: {
    accounts: {
      sortMode: "client",
      filterMode: "none",
      paginationMode: "none",
    },
  },
});
```

The source delivers a flat list that is already sorted and filtered. The grid
keeps the source order among siblings, so a sort orders the siblings at every
depth. Rows start expanded unless `tree.defaultExpanded` is `false`.

A row whose parent is not in the list, for example because it was filtered out,
is shown at the top level. A loop of parent keys is cut at its first row in
source order: that row is shown at the top level, and the loop is reported
through `onObserverError`.

`createGridRuntime()` checks the tree declaration. A host that builds level
schemas can call `validateLevelTree(levelName, level)` to report a missing
`parentKeyField` or a tree level with `childLevels` where the level is declared.

### Expand, collapse, and add children

`level.tree` expands and collapses rows and reads the structure. It is `null` on
a level without `tree`:

```ts
const accounts = runtime.root.tree!;
accounts.collapse(expensesId);
accounts.reveal(federalId); // expands every ancestor
accounts.expandAll();
accounts.parentOf(federalId);
accounts.childrenOf(expensesId);
```

`addChild(parentRowId, columns?)` adds a draft row under a data row, expands the
parent and its ancestors, and returns the draft's row id. The draft's parent-key
field holds the parent's row key, so committing the draft creates the row under
its parent. `columns` supplies other starting values. A child draft that nobody
typed into is removed when the cursor leaves it.

The row key is a string. When the parent-key field holds a typed key, such as an
integer id, set `tree.parentKeyValue` so a draft child stores the same value as
the rows the source delivers:

```ts
tree: {
  parentKeyField: "parent_id",
  parentKeyValue: (parent) => parent.columns.id,
},
```

`String()` of the returned value must equal the parent's row key; `addChild`
throws otherwise.

Collapsing a row moves the cursor out of the hidden rows, and hidden rows leave
the row selection. The `treeExpansionChanged` event reports every expansion
change, for a host that remembers expansion.

In a row list with `activeRow.keyboard.expansion: "enabled"`, Right expands a
row or moves to its first child, Left collapses a row or moves to its parent,
and Space toggles. In a cell grid, Space on the tree column toggles, and Enter
toggles when the tree cell is not editable.

### Filter a tree

A filtered tree stays connected, so a match deep in the tree is shown under its
ancestors. With `filterMode: "client"`, the in-memory source keeps each match's
ancestors and each match's descendants. Set `treeMatchContext: "ancestors"` in
the level's source options to keep only the ancestors.

A custom source lists the ancestors that do not match themselves in
`LevelSnapshot.treeContextRowKeys`, or in `treeContextRowKeys` on a REST
`fetchPage` response. `filterTreeSourceNodes()` takes a flat list, a row
predicate, and `{ parentKeyField, matchContext }`, and returns the kept `nodes`,
their `contextRowKeys`, and the `matchCount`. The grid marks context rows with
`row.tree.context` and `data-tree-context`, so they can be styled as context.
When a filtered result holds a different set of rows than the one before it, the
grid expands every context row, so each match is visible even if its ancestor
was collapsed.

## Verify

Typecheck the example and exercise its visible loading, ready, interaction, and
failure states. Use only public `@sapporta/grid` export paths.

Continue with
[Schema, rows, paths, and identity](/grid/reference/grid-core/schema-rows-and-identity/)
and
[Data-source contracts and state](/grid/reference/data-sources/contracts-and-state/).
