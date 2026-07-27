---
title: "Table and column metadata"
description:
  "Look up table, child, column, select, search, and visibility metadata."
---

## Identity

`SapportaMeta`, `SapportaTableInputMeta`, `ColumnMeta`, and `ChildMeta` from
`@sapporta/server`; serialized `TableSchema`, `ColumnSchema`, and `ChildSchema`
from `@sapporta/shared/contracts`.

## Contract

- `SapportaTableInputMeta` is the sparse authoring shape accepted by
  `sapportaTable()`. `SapportaMeta` is its normalized server form.
- Authoring metadata includes `label`, required `rowLabelColumns`, `rowScope`,
  `immutable`, `references`, `defaultSort`, `children`, `columns`, and `search`.
- `rowLabelColumns` must contain at least one real SQL column name from the
  current table. Labels concatenate those stored values; they do not resolve
  referenced-row labels.
- `rowScope` defaults to `workspaceUserScoped`, which requires `workspace_id`
  and `scoped_to_user_id`. `workspaceGlobal` requires `workspace_id`;
  `systemGlobal` requires neither scope column.
- Child metadata includes `table`, `foreignKey`, `label`, `columns`,
  `defaultSort`, and `width`. Child display metadata does not configure search.
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
- Application validation belongs to the top-level `validate()` callback on
  `sapportaTable()`. It composes with structural column validation.
- `apiWritable: false` removes a column from generated write schemas and forms,
  and generated table APIs reject callers that submit it. Reference-level
  `apiSettable: false` applies the same policy to a server-authored foreign key.
- Browser `TableSchema` contains `name`, `label`, `immutable`, `columns`,
  `children`, optional `rowLinks`, `rowLabelColumns`, optional `rowCount`, and
  `searchable`. It does not serialize row scope, abilities, request authority,
  authoring references, validation callbacks, the table-level Drizzle
  `defaultSort`, or the recursive search plan.
- Visual metadata, hidden fields, and a protected frontend route do not replace
  server authorization or row scope.

## Related documentation

- [Tables, columns, and schema metadata](/docs/guides/model-data/tables-columns-and-schema-metadata/)
- [Search table rows and relationships](/docs/guides/model-data/search-indexes-and-display-metadata/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Column sizing](/docs/reference/column-sizing/)
- [Table validation](/docs/reference/schema/table-validation/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
