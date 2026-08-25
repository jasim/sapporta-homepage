---
title: "Table definitions"
description:
  "Look up Sapporta table wrappers, semantic column factories, and inferred row
  types."
---

## Identity

`@sapporta/server/table` and Drizzle `sqliteTable` declarations.

## Contract

- `sapportaTable({ drizzle, meta, validate })` joins one raw Drizzle table with
  Sapporta metadata and application validation as a `TableDef`.
- Semantic factories are `text`, `select`, `number`, `money`, `percentage`,
  `bool`, `date`, and `timestamp`.
- `select(name, options)` stores its allowed string values on the Drizzle text
  column. The same tuple drives TypeScript inference, structural validation,
  OpenAPI, metadata, forms, grids, and filters.
- Each factory is generic in its column name and preserves the name literal, so
  a row read through `TableRow` keys each column by its database name and keeps
  its own value type. `select()` keeps its enum values as a union.
- Primary keys may be numeric or string-valued. A foreign-key column must use
  the same value/storage type as its target; lookup values preserve that type.
  Sapporta does not promise a separate runtime diagnostic for every mismatched
  Drizzle declaration.
- `meta.rowLabelColumns` is a non-empty list of real SQL column names on the
  current table. Runtime labels concatenate their non-empty row values and fall
  back to the primary key only when every configured label value is empty.
- Generated API reads and writes use canonical date and timestamp strings.
  Direct Drizzle code uses `Temporal.PlainDate` and `Temporal.Instant`, and
  database reads return those Temporal values.
- Select and insert types come from `$inferSelect` and `$inferInsert` on the raw
  table. They describe the hydrated Drizzle row, so they are server types, not
  the wire row.
- Sapporta's public table boundaries use SQL column names. Drizzle property
  names are translated immediately around database calls.

## Minimal lookup

```ts
import {
  sapportaTable,
  text,
  select,
  date,
  timestamp,
} from "@sapporta/server/table";
```

## Related documentation

- [Tables, columns, and schema metadata](/docs/guides/model-data/tables-columns-and-schema-metadata/)
- [Relationships and lookup behavior](/docs/guides/model-data/relationships-and-lookup-behavior/)
- [Table validation](/docs/reference/schema/table-validation/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
