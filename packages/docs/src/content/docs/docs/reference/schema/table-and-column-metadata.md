---
title: "Table and column metadata"
description:
  "Look up table, child, column, select, search, and visibility metadata."
---

## Identity

`SapportaMeta`, `SapportaTableInputMeta`, `ColumnMeta`, and `ChildMeta` from
`@sapporta/server`.

## Contract

- Table metadata includes `label`, required `rowLabelColumns`, `rowScope`,
  `immutable`, `references`, `defaultSort`, `children`, `columns`, and `search`.
- Child metadata includes `table`, `foreignKey`, `label`, `columns`,
  `defaultSort`, and `width`. Child display metadata does not configure search.
- `search` is `false`, `"allColumns"`, or an object with optional `self` and
  `children`. Search defaults to `"allColumns"`. A `self` value is `false`,
  `"allColumns"`, or an array of SQL column names; `children` is a recursive
  record keyed by SQL child table names already declared in `meta.children`.
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
- Visual metadata does not replace server authorization.

## Related documentation

- [Search table rows and relationships](/docs/guides/model-data/search-indexes-and-display-metadata/)
- [Column sizing](/docs/reference/column-sizing/)
- [Table validation](/docs/reference/schema/table-validation/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
