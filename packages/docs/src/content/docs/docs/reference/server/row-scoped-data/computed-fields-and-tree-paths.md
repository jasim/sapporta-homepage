---
title: "Computed fields and tree paths"
description:
  "Look up computeFields, the treePath computed field, and the
  treePathRelation SQL relation for tree tables."
---

## Identity

`computeFields()`, `ComputeFieldsInput`, `treePath()`, `TreePathOptions`,
`treePathRelation()`, `TreePathRelationOptions`, `ComputedValues`, and `Json`
from `@sapporta/server`. `treePath()` and `treePathRelation()` are also exported
by `@sapporta/server/table`. Declaring computed fields on a table is described
in [Table definitions](/docs/reference/schema/table-definitions/#computed-fields).

## `computeFields()`

```ts
function computeFields<TTable extends AnySQLiteTable>(
  input: ComputeFieldsInput<TTable>,
): Promise<ComputedValues>;

interface ComputeFieldsInput<TTable extends AnySQLiteTable> {
  db: BetterSQLite3Database;
  auth: SapportaAuthContext;
  table: TableDef<TTable>;
  ids: readonly RecordId[];
  names: readonly string[];
}

type ComputedValues = Record<string, Record<string, Json>>;
```

```ts
const overdue = await scopedRows(db, auth, invoices).findMany({
  where,
  limit: 100,
});
const balances = await computeFields({
  db,
  auth,
  table: customers,
  ids: [...new Set(overdue.map((invoice) => toRecordId(invoice.customer_id)))],
  names: ["balance"],
});
```

- The result maps each name to an object keyed by every id of `ids`, holding the
  field's value or `null`. It is the same `computed` member that the generated
  table API returns.
- Repeated names are computed once. With no names, the result is `{}` and no
  loader runs.
- A name the table does not declare throws an error that lists the table's
  computed fields.
- Each loader runs once per call, and the loaders run concurrently. They share
  one `once()` cache for the call.
- A loader that throws, a result that leaves out an id, or a value its `schema`
  rejects rejects the promise, with the table, field, and ids in the message.
- `computeFields()` performs no HTTP, paging, or row reads of its own, and it
  does not check that the request may read `ids`. Pass ids of rows that a scoped
  read returned.

The generated list, single-row, and lookup handlers call `computeFields()` after
their reads.

## `treePath()`

```ts
function treePath(options?: TreePathOptions): ComputedField;

interface TreePathOptions {
  separator?: string; // default " > "
  column?: string; // default: the row label
  label?: string;
}
```

```ts
meta: {
  rowLabelColumns: ["name"],
  tree: { parentColumn: "parent_id" },
  rowCaption: "parentPath",
},
computed: { parentPath: treePath() },
```

- The field has kind `"text"` and the notes "Labels of the row's ancestors,
  from the top down."
- Each value is the labels of the row's ancestors, from the top down, joined by
  `separator`. A row with no parent, or with no visible parent, has `null`.
- An ancestor is named by its row label: the non-empty `rowLabelColumns` values
  joined by a space, or the primary key when all are empty. With `column`, it is
  named by that column's value as text.
- One recursive query per batch reads the batch's rows and their ancestors.
  Every step reads only rows the request may see, so a path stops at the nearest
  ancestor the request cannot see and never names it.
- A loop in the parent data ends the walk for that row.
- A table without `meta.tree` fails the read that asks for the field.

## `treePathRelation()`

```ts
function treePathRelation(
  table: TableDef,
  auth: SapportaAuthContext,
  options?: TreePathRelationOptions,
): SQL;

interface TreePathRelationOptions {
  name?: string; // default "tree_paths"
  separator?: string; // default " > "
  column?: string; // default: the row label
}
```

`treePathRelation()` returns one member of a `with recursive` list, for reports
and other code that runs raw or synchronous SQL:

```ts
const paths = treePathRelation(accounts, auth);
const rows = db.all<{ id: number; name: string; parent_path: string | null }>(
  sql`with recursive ${paths}
      select a.id, a.name, p.parent_path
      from accounts a
      left join tree_paths p on p.id = a.id`,
);
```

The member is `name(id, parent_path, path) as (...)`:

| Column        | Value                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------ |
| `id`          | the row's primary key                                                                      |
| `parent_path` | the labels of the row's ancestors, from the top down, joined by `separator`; `NULL` for a row with no visible parent |
| `path`        | `parent_path`, `separator`, and the row's own label; the row's own label when `parent_path` is `NULL` |

- The relation reads only rows that `auth` may see, through the table's
  `ownedRows()` predicate. It starts at every visible row whose parent is `NULL`
  or not visible, and walks down one level of visible children per step. A path
  therefore stops at the nearest ancestor the request cannot see, and the paths
  equal the `treePath()` values: `parent_path` is the `treePath()` value of the
  row.
- Labels follow the same rule as `treePath()`. A whole real number prints as
  JavaScript prints it, `4` and not `4.0`. With `column`, a row is named by that
  column's value, and `NULL` becomes an empty string.
- Rows in a loop of parents that never reaches a top-level row have no row in
  the relation, and neither do the rows below them.
- The relation computes the path of every visible row. SQLite does not push an
  outer `where id in (...)` filter into a recursive relation, so filtering the
  relation to a few ids still walks the whole visible tree.
- Put the member first in a `with recursive` list and add other members after
  it, separated by commas. The relation's own column names do not clash with
  the table's columns.
- A table without `meta.tree` throws when `treePathRelation()` is called.

## Related documentation

- [Computed fields and row captions](/docs/guides/model-data/computed-fields-and-row-captions/)
- [Table definitions](/docs/reference/schema/table-definitions/#computed-fields)
- [Scoped report helpers](/docs/reference/reports/scoped-report-helpers/)
- [Name table rows in report cells](/docs/guides/reports/report-reference-columns/)
- [Table row-security guards](/docs/reference/server/row-scoped-data/table-row-security-guards/)
