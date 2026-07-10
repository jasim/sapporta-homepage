---
title: "Table definitions"
description: "Look up Sapporta table wrappers, semantic column factories, and inferred row types."
---

## Identity

`@sapporta/server/table` and Drizzle `sqliteTable` declarations.

## Contract

- `sapportaTable({ drizzle, meta })` wraps one raw Drizzle table with Sapporta metadata.
- Semantic factories are `text`, `number`, `money`, `percentage`, `bool`, `date`, and `timestamp`.
- Primary and foreign keys use Drizzle integer columns.
- Date and timestamp runtime values use `Temporal.PlainDate` and `Temporal.Instant`.
- Select and insert types come from `$inferSelect` and `$inferInsert` on the raw table.

## Minimal lookup

```ts
import { sapportaTable, text, date, timestamp } from "@sapporta/server/table";
```

## Related documentation

- [Tables, columns, and schema metadata](/docs/guides/model-data/tables-columns-and-schema-metadata/)
