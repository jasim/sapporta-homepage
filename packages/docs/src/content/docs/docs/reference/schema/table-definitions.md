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
- Primary and foreign keys use Drizzle integer columns.
- Generated API writes use canonical date and timestamp strings. Direct Drizzle
  code uses `Temporal.PlainDate` and `Temporal.Instant`, and database reads
  return those Temporal values.
- Select and insert types come from `$inferSelect` and `$inferInsert` on the raw
  table.
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
- [Table validation](/docs/reference/schema/table-validation/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
