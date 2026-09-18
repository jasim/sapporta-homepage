---
title: "Hierarchical grids"
description: "Render nested levels with stable identity and local or lazy child data."
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
## Verify
Typecheck the example and exercise its visible loading, ready, interaction, and failure states. Use only public `@sapporta/grid` export paths.
Continue with
[Schema, rows, paths, and identity](/grid/reference/grid-core/schema-rows-and-identity/)
and
[Data-source contracts and state](/grid/reference/data-sources/contracts-and-state/).

## Tree data

Some rows refer to other rows of the same kind. For example, an account can
have a parent account through a `parent_id` column. A tree level shows such rows
as one list under one header. The hierarchy is shown only in one column: each
row is indented by its depth, and a row with children has a chevron that
expands or collapses it. The other columns stay aligned across all depths.

This is different from `childLevels`. An expanded row with child levels opens a
nested grid of another level, with its own header and columns. A tree level
declares no `childLevels`.

Declare `tree` on the level. `parentKeyField` names the field of
`TreeNode.columns` that holds the parent's row key; `null`, `undefined`, or
`""` marks a top-level row. Wrap the tree column with `withTreeColumn` so it
draws the indentation and the chevron:

```tsx
import { withTreeColumn, type GridSchema, type TreeNode } from "@sapporta/grid";
import { text } from "@sapporta/grid/column-preset";

const schema: GridSchema = {
  rootLevel: "accounts",
  levels: {
    accounts: {
      name: "accounts",
      rowHeaderColumn: "none",
      childLevels: [],
      tree: { parentKeyField: "parent_id", column: "name" },
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
```

The source still delivers a flat list that is already sorted and filtered. The
grid keeps the source order among siblings, so a sort orders the siblings at
every depth. Rows start expanded unless `tree.defaultExpanded` is `false`.

A row whose parent is not in the list, for example because it was filtered out,
is shown at the top level. A loop of parent keys is cut, shown once, and
reported through `onObserverError`.

### Expand, collapse, and add children

`level.tree` expands and collapses rows and reads the structure:

```ts
const tree = runtime.root.tree!;
tree.collapse(expensesId);
tree.reveal(federalId); // expands every ancestor
tree.expandAll();
tree.parentOf(federalId);
tree.childrenOf(expensesId);
```

`tree.addChild(parentRowId)` adds a draft row under a row and expands that
row. The draft's parent-key field is filled in, so committing the draft creates
the row under its parent. Pass `columns` to give the field a typed value, such
as a number instead of the row key string. A child draft that nobody typed into
is removed when the cursor leaves it.

Collapsing a row moves the cursor out of the hidden rows, and hidden rows leave
the row selection. The `treeExpansionChanged` event reports every expansion
change, for a host that wants to remember it.

In a row list with `activeRow.keyboard.expansion: "enabled"`, Right expands a
row or moves to its first child, Left collapses a row or moves to its parent,
and Space toggles. In a cell grid, Space on the tree column toggles.

### Filtering a tree

A filtered tree must stay connected, so a match deep in the tree is shown under
its ancestors. With `filterMode: "client"`, the in-memory source keeps each
match's ancestors and, by default, each match's descendants. Set
`treeMatchContext: "ancestors"` on the level to keep only the ancestors.

A custom source lists the ancestors that do not match themselves in
`LevelSnapshot.treeContextRowKeys`. The grid marks those rows with
`row.tree.context` and `data-tree-context`, so they can be styled as context
instead of results. When a new filtered result arrives, the grid expands those
rows again, so each match is visible even if its ancestor was collapsed.
