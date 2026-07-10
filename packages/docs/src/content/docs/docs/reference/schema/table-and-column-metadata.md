---
title: "Table and column metadata"
description: "Look up table, child, column, select, search, and visibility metadata."
---

## Identity

`SapportaMeta`, `SapportaTableInputMeta`, `ColumnMeta`, `SelectMeta`, and `ChildMeta` from `@sapporta/server`.

## Contract

- Table metadata includes `label`, required `rowLabelColumns`, `rowScope`, `selects`, `immutable`, `validation`, `references`, `defaultSort`, `children`, `columns`, and `search`.
- Child metadata includes `table`, `foreignKey`, `label`, `columns`, `defaultSort`, and `width`.
- Column metadata includes semantic kind, formatting, label, visibility, width bounds, additive behavior, color/zero/strong hints, notes, and client editability.
- Visual metadata does not replace server authorization.


## Related documentation

- [Search, indexes, and display metadata](/docs/guides/model-data/search-indexes-and-display-metadata/)
