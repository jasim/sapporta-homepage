---
title: "Table and column metadata"
description:
  "Look up table, child, tree, column, select, search, and visibility metadata."
---

## Identity

`SapportaMeta`, `SapportaTableInputMeta`, `ColumnMeta`, `ChildMeta`,
`TreeMetaInput`, `TreeMeta`, `columnBySqlName()`, and `columnPropertyName()`
from `@sapporta/server`; serialized `TableSchema`, `ColumnSchema`,
`ChildSchema`, and `TableTree` from `@sapporta/shared/contracts`.

## Contract

- `SapportaTableInputMeta` is the sparse authoring shape accepted by
  `sapportaTable()`. `SapportaMeta` is its normalized server form.
- Authoring metadata includes `label`, required `rowLabelColumns`, `rowScope`,
  `immutable`, `references`, `defaultSort`, `children`, `columns`, `search`, and
  `tree`.
- `rowLabelColumns` must contain at least one real SQL column name from the
  current table. Labels concatenate those stored values; they do not resolve
  referenced-row labels.
- `rowScope` defaults to `workspaceUserScoped`, which requires `workspace_id`
  and `scoped_to_user_id`. `workspaceGlobal` requires `workspace_id`;
  `systemGlobal` requires neither scope column.
- Child metadata includes `table`, `foreignKey`, `label`, `columns`,
  `defaultSort`, and `width`. Child display metadata does not configure search.
- `tree` declares that the rows form a tree through a self-referencing column,
  such as an account's `parent_id`. It takes `parentColumn` (required), `column`
  (the column that shows the hierarchy, default the first `rowLabelColumns`
  entry), `defaultExpanded` (default `true`), and `matchContext`
  (`"ancestors-and-descendants"` by default, or `"ancestors"`), which sets what
  a search or filter keeps besides the matching rows.
- `parentColumn` must be a nullable, single-column foreign key to the same
  table's primary key, declared with Drizzle `.references()` or a
  `meta.references` rule. `column` must be a visible column, and the table
  cannot also list itself in `meta.children`. A violation fails the boot with
  the table and column in the message.
- The stock table page shows a tree table as one list with the hierarchy in the
  tree column, loads all its rows at once (up to 1,000), and shows each search
  or filter match under its ancestors. The `meta.children` entries of a tree
  table become row links, and a row expands into its child rows of the same
  table. See
  [Show a table as a tree](/docs/guides/model-data/show-a-table-as-a-tree/).
- `search` is `false`, `"allColumns"`, or an object with optional `self` and
  `children`. Search defaults to `"allColumns"`. A `self` value is `false`,
  `"allColumns"`, or an array of SQL column names; `children` is a recursive
  record keyed by SQL child table names already declared in `meta.children`.
- An empty `self: []` is invalid; use `self: false` to search descendants
  without searching values from the current table.
- `"allColumns"` includes visible application columns at the current node.
  Foreign keys search the target row label, not the stored ID. Has-many
  traversal is explicit, and expanded child grids do not inherit the root search
  term.
- Column metadata includes semantic kind, formatting, label, visibility, width
  bounds, additive behavior, color/zero/strong hints, notes, and `apiWritable`.
- Select options belong to the Drizzle column. Use Sapporta `select()` or raw
  Drizzle `text(name, { enum: options })`; schema extraction serializes the same
  option list for browser controls.
- `columnBySqlName(table, sqlName)` returns the table's `SQLiteColumn` or
  `null`. `columnPropertyName(table, column)` performs the reverse lookup and
  returns the Drizzle property name or `null`. SQL column names remain the
  public query vocabulary even when a Drizzle property uses a different name.
- Application validation belongs to the top-level `validate()` callback on
  `sapportaTable()`. It composes with structural column validation.
- `apiWritable: false` removes a column from generated write schemas and forms,
  and generated table APIs reject callers that submit it. Reference-level
  `apiSettable: false` applies the same policy to a server-authored foreign key.
- A table declaring `meta.children` declares the child's foreign key
  non-writable, through either `references: { fk: { apiSettable: false } }` on
  the child or `columns: { fk: { apiWritable: false } }`. Either removes the key
  from the child insert shape, which is what the master-with-`$details` create
  branch is built on. Without one of them a `$details` row carrying that key is
  accepted and the value is silently replaced by the created master's key.
- Browser `TableSchema` contains `name`, `label`, `immutable`, `columns`,
  `children`, optional `rowLinks`, `rowLabelColumns`, optional `rowCount`,
  `searchable`, and optional `tree` with every field resolved. It does not
  serialize row scope, abilities, request authority, authoring references,
  validation callbacks, the table-level Drizzle `defaultSort`, or the recursive
  search plan.
- Visual metadata, hidden fields, and a protected frontend route do not replace
  server authorization or row scope.

## Related documentation

- [Tables, columns, and schema metadata](/docs/guides/model-data/tables-columns-and-schema-metadata/)
- [Configure table search](/docs/guides/model-data/configure-table-search/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Column sizing](/docs/reference/column-sizing/)
- [Table validation](/docs/reference/schema/table-validation/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
