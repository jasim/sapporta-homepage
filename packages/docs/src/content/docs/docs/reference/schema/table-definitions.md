---
title: "Table definitions"
description:
  "Look up Sapporta table wrappers, semantic column factories, and inferred row
  types."
---

## Identity

`@sapporta/server/table` and Drizzle `sqliteTable` declarations.

## Contract

- `sapportaTable({ drizzle, meta, validate, computed })` joins one raw Drizzle
  table with Sapporta metadata, application validation, and
  [computed fields](#computed-fields) as a `TableDef`.
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
  computedField,
  treePath,
} from "@sapporta/server/table";
```

## Computed fields

A computed field is a named value of each row that the server computes when a
read names it in its `computed` parameter. It is not stored, cannot be written,
and is not part of the row object.
[Computed fields and row captions](/docs/guides/model-data/computed-fields-and-row-captions/)
shows the workflow.

```ts
export const items = sapportaTable({
  drizzle: itemsTable,
  meta: { rowLabelColumns: ["description"], rowCaption: "stockLine" },
  computed: {
    onHand: computedField({
      kind: "number",
      schema: z.number(),
      notes: "Units in stock.",
      load: ({ ids, db, auth }) => loadOnHand(db, auth, ids),
    }),
  },
});
```

`computedField()`, `treePath()`, and the types below are exported by both
`@sapporta/server/table` and `@sapporta/server`.

### `computedField(field)`

`computedField()` returns its argument. It exists so that TypeScript infers the
value type from `schema` or from `load`.

```ts
type ComputedFieldKind =
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "timestamp"
  | "json";

interface ComputedField<TTable, TValue extends Json = Json> {
  kind: ComputedFieldKind;
  label?: string;
  notes?: string;
  schema?: z.ZodType<TValue>;
  load: ComputedFieldLoader<TTable, TValue>;
}

type ComputedFieldLoader<TTable, TValue extends Json = Json> = (
  batch: ComputedBatch<TTable>,
) =>
  | Promise<ReadonlyMap<RecordId, TValue | null>>
  | ReadonlyMap<RecordId, TValue | null>;
```

| Member   | Contract                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------ |
| `kind`   | how the value reads; it chooses the default formatting and is listed in `TableSchema.computed`   |
| `label`  | display label; defaults to the name in sentence case, so `parentPath` reads "Parent path"        |
| `notes`  | explanation of the value, listed in `TableSchema.computed` and in the OpenAPI response schema   |
| `schema` | checked against every value except `null`; documents the value in the generated OpenAPI          |
| `load`   | computes the values for one batch; it runs inside reads, including picker lookups, and must not write |

`"json"` is any JSON value that is not one scalar. `Json` is the JSON value type
from `@sapporta/shared/contracts`.

### `ComputedBatch`

```ts
interface ComputedBatch<TTable> {
  readonly table: TableDef<TTable>;
  readonly ids: readonly RecordId[];
  once<T>(key: string, compute: () => Promise<T>): Promise<T>;
  readonly db: BetterSQLite3Database;
  readonly auth: SapportaAuthContext;
}
```

- `ids` are the rows' primary keys as `RecordId` strings, in the order the read
  returned the rows. Read the rows, or other tables, through
  `scopedRows(batch.db, batch.auth, table)`.
- `once(key, compute)` runs `compute` once per batch for each `key` and gives
  every caller the same promise. Two fields that share a query, or one field
  built from another's values, call the same function through it.
- The returned map holds every id of the batch, keyed by the same strings.
  `null` is the only "no value". A missing id, a value `schema` rejects, or a
  thrown error fails the whole read.
- Loaders of one call run concurrently, each once per call.

### `treePath(options?)`

`treePath()` returns a `ComputedField` of kind `"text"` for a table with
`meta.tree`: the labels of each row's ancestors, from the top down, joined by
`separator`. A top-level row has `null`.

```ts
interface TreePathOptions {
  separator?: string; // default " > "
  column?: string; // default: the row label
  label?: string;
}
```

It reads only rows the request may see, so a path stops at the nearest ancestor
the request cannot see. A table without `meta.tree` fails the read that asks
for the field. See
[Computed fields and tree paths](/docs/reference/server/row-scoped-data/computed-fields-and-tree-paths/#treepath).

### Name rules

`sapportaTable()` throws when:

- a name does not start with a letter or `_` and contain only letters, digits,
  and `_`;
- a name starts with `$`, which Sapporta reserves;
- a name equals a column name of the same table;
- `meta.rowCaption` names neither a column nor a computed field.

`TableDef.computed` holds the declared fields by name and is absent when the
table declares none. The browser receives each field's `name`, `label`, `kind`,
and `notes` in `TableSchema.computed`; loaders and schemas stay on the server.

## Related documentation

- [Tables, columns, and schema metadata](/docs/guides/model-data/tables-columns-and-schema-metadata/)
- [Computed fields and row captions](/docs/guides/model-data/computed-fields-and-row-captions/)
- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/#row-caption)
- [Relationships and lookup behavior](/docs/guides/model-data/relationships-and-lookup-behavior/)
- [Table validation](/docs/reference/schema/table-validation/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
