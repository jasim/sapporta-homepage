---
title: "Semantic value boundaries"
description:
  "Preserve table values across generated forms, HTTP, application code, Grid,
  and SQLite."
---

## Identity

Sapporta semantic column kinds define the generated editor, JSON value,
application value, and Drizzle storage conversion for each table column.

## Supported flow

Generated table values follow one directional model:

```text
form input -> parsed application value -> JSON request value -> Drizzle value
Drizzle value -> JSON response value -> parsed domain value -> editor value
```

Generated record forms and ColumnPreset parse editor text before a write.
Generated table routes validate JSON primitives. Drizzle semantic column
factories own SQLite conversion. App-owned contracts parse domain values at the
shared Zod boundary.

## Value matrix

| Semantic value            | Form or Grid value                             | JSON wire value               | Application and Drizzle value                                                            | SQLite value                                | Parser and serializer                        | Empty or null behavior                                                                                                        |
| ------------------------- | ---------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Text                      | `string`                                       | `string`                      | `string`                                                                                 | `TEXT`                                      | identity; JSON string                        | `null` is distinct from `""`. An untouched new-record field is omitted; a cleared text input submits `""`.                    |
| Select-backed text        | one declared option string                     | the same string               | the same string                                                                          | `TEXT`                                      | select option identity; JSON string          | An untouched new-record field is omitted. Use `null` only for a nullable column.                                              |
| Number, money, percentage | finite `number` after editor parsing           | JSON number                   | `number`                                                                                 | `REAL`                                      | numeric editor parser; JSON number           | A cleared new-record input is omitted. Grid or direct updates can send `null` to a nullable column.                           |
| Boolean                   | `boolean`                                      | JSON boolean                  | `boolean`                                                                                | SQLite integer through Drizzle boolean mode | checkbox state; JSON boolean                 | An untouched new-record checkbox is omitted. After interaction, `false` is submitted as a value.                              |
| Date                      | `YYYY-MM-DD` editor string                     | canonical `YYYY-MM-DD` string | `Temporal.PlainDate` after domain parsing; generated table clients may retain the string | canonical `TEXT`                            | shared date input and Temporal helpers       | A cleared new-record input is omitted. Grid or direct updates can send `null` to a nullable column.                           |
| Timestamp                 | `datetime-local` input converted to an instant | canonical ISO instant string  | `Temporal.Instant` after domain parsing; generated table clients may retain the string   | canonical UTC `TEXT`                        | shared datetime input and Temporal helpers   | A cleared new-record input is omitted. Grid or direct updates can send `null` to a nullable column.                           |
| Foreign key               | target primary-key `string` or `number`        | the same JSON primitive       | the same primary-key type                                                                | target-compatible `TEXT` or `INTEGER`       | lookup value identity; JSON string or number | Preserve the target type through lookup state. An untouched or cleared new-record picker is omitted; updates can send `null`. |

The generic generated-table client accepts rows as `Record<string, unknown>`
because the table name is selected at runtime. Per-table OpenAPI schemas still
describe the concrete columns. App-owned domain code should use a shared ts-rest
contract and Zod schema when it needs a statically typed row or workflow value.

## Select-backed text

Select metadata adds a controlled editor and, when inferred validation is used,
generated enum validation to a text column. A custom `meta.validation` schema
replaces that inferred rule. Select metadata does not change the stored value
type.

```ts
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

const mealTypeSchema = z.enum(MEAL_TYPES);

const meals = sapportaTable({
  drizzle: mealsTable,
  meta: {
    rowLabelColumns: ["name"],
    selects: [
      { type: "select", column: "meal_type", options: [...MEAL_TYPES] },
    ],
  },
});
```

The form value, generated table request, database value, generated response, and
ColumnPreset select value are all one of the declared strings. App-owned
contracts can reuse `mealTypeSchema` when they need literal-union inference.

## Unset and cleared generated forms

The generated New Record form initializes every editable field to `null` and
omits nullish values before create. This preserves database defaults and lets
the server distinguish an absent field from a submitted value.

- An untouched checkbox looks unchecked but remains absent. Once the user
  interacts with it, `false` is a submitted value.
- Cleared numeric, date, timestamp, lookup, and select controls become `null` in
  form state and are omitted from the create body.
- Text inputs preserve `""`; empty text and `null` are distinct values.
- Grid writes and direct generated-table updates do not run new-record
  compaction. They can send explicit `null` for nullable columns.

An omitted create field uses a database default when one exists. Otherwise the
column must be nullable or validation/database constraints reject the row.

## Public conversion helpers

- `parsePlainDate`, `formatPlainDate`, `parseCanonicalInstant`, and
  `formatCanonicalInstant` from `@sapporta/shared/temporal` convert domain
  Temporal values at an app-owned contract boundary.
- `formatPlainDateForDateInput`, `parseDateInputToPlainDateString`,
  `formatInstantForDateTimeLocalInput`, and
  `parseDateTimeLocalInputToCanonicalInstantString` connect browser inputs to
  canonical wire strings.
- ColumnPreset constructors from `@sapporta/grid/column-preset` provide the
  standard text, number, date, boolean, select, lookup, and foreign-key editor
  codecs. A custom column can supply `parse`, `format`, and `compare` when its
  value model differs.
- `parseFiltersForTable()` and `encodeTypedFilters()` from
  `@sapporta/shared/filter` preserve typed filter values until the URL boundary.
- `LookupPicker` and table lookup helpers preserve string or number primary-key
  values through selection and lookup caches.

## App-owned contracts

An app-owned endpoint defines its domain value at the shared contract. Parse a
date or timestamp there when service code should receive Temporal values. Keep
the wire schema and database schema distinct when their runtime types differ.

```ts
const createPlanBody = z.object({
  name: z.string().min(1),
  starts_on: z.string().transform(parsePlainDate),
  meal_type: mealTypeSchema,
  target_calories: z.number().finite().positive(),
});
```

The ts-rest adapter consumes the transformed request value, so the route handler
receives `Temporal.PlainDate`. Table `meta.validation` does not consume
transform output and should only validate the record presented to the save
pipeline.

## Direct generated-table calls

Inspect the mounted endpoint before constructing a raw request:

```bash
pnpm exec sapporta endpoints show "PUT /api/tables/meals/{id}"
```

Generated row updates use `PUT`. Send JSON primitives from the matrix and omit
server-owned workspace or user-scope fields.

## Framework assessment

The generated surface already has semantic metadata, Temporal helpers,
ColumnPreset codecs, typed filter helpers, and per-table OpenAPI schemas. These
APIs cover generated forms, generated Grid writes, filters, and app-owned
contract parsing.

A schema-derived domain row codec is not part of the generic table client. The
generic client cannot infer a compile-time row type from a runtime table name.
App-owned workflows should declare a shared Zod contract instead of casting a
generic generated row into a domain type.

## Related documentation

- [Table definitions](/docs/reference/schema/table-definitions/)
- [Table validation](/docs/reference/schema/table-validation/)
- [Table endpoints](/docs/reference/http/table-endpoints/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
- [ColumnPreset](/grid/reference/column-preset/)
