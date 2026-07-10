---
title: "Schema metadata types"
description: "Look up exported schema metadata and wire-shape types."
---

## Identity

Server input types from `@sapporta/server`; normalized wire types from `@sapporta/shared/contracts`.

## Contract

- `TableOptions`, `SapportaMeta`, and `SapportaTableInputMeta` describe authored table input.
- `ColumnMeta`, `SelectMeta`, and `ChildMeta` describe nested authored metadata.
- `TableSchema`, `ColumnSchema`, and `ChildSchema` describe serialized metadata consumed by browser code.
- The authored and normalized shapes are distinct contracts and should not be cast interchangeably.


## Related documentation

- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
