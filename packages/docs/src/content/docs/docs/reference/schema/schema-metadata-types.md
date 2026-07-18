---
title: "Schema metadata types"
description: "Look up exported schema metadata and wire-shape types."
---

## Identity

Server input types from `@sapporta/server`; normalized wire types from
`@sapporta/shared/contracts`.

## Contract

- `TableOptions`, `TableDef`, `SapportaMeta`, and `SapportaTableInputMeta`
  describe authored and joined server table definitions.
- `ColumnMeta` and `ChildMeta` describe nested authored metadata.
- `TableValidationValue`, `TableValidationField`, and `TableValidationContext`
  describe the top-level application-validation callback.
- `TableSchema`, `ColumnSchema`, and `ChildSchema` describe serialized metadata
  consumed by browser code.
- Every serialized `ColumnSchema` has a required semantic `kind`. Schema
  extraction uses a factory-declared kind or derives one from the Drizzle data
  type, and the frontend parses the metadata response before rendering controls.
- Serialized columns use public SQL names and expose select options derived from
  the Drizzle column plus `apiWritable` write policy when declared.
- The authored and normalized shapes are distinct contracts and should not be
  cast interchangeably.

## Related documentation

- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
