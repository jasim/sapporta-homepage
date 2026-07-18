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
  `defaultSort`, and `width`.
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

- [Search, indexes, and display metadata](/docs/guides/model-data/search-indexes-and-display-metadata/)
- [Column sizing](/docs/reference/column-sizing/)
- [Table validation](/docs/reference/schema/table-validation/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
