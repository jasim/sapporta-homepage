---
title: "Semantic value boundaries"
description:
  "Preserve table values across generated forms, HTTP, application code, Grid,
  and SQLite."
---

## Identity

A Sapporta `TableDef` is the shared source for column value semantics. Drizzle
owns SQL names, storage types, nullability, defaults, keys, and enum values.
Sapporta column metadata and semantic kinds own generated presentation and value
behavior.

## Supported write flow

Generated writes keep editor drafts separate from API values:

```text
raw form or Grid draft
-> submit-time or commit-time draft decoding
-> caller-controlled JSON value
-> API write policy and trusted server values
-> authoritative structural parsing and application issues
-> SQL-name to Drizzle-property translation
-> SQLite storage
```

`zodForColumnValue()` defines the structural schema for one present, non-null
column value. Public API schemas and trusted write schemas compose those leaf
rules with their own field-ownership and presence rules. The save pipeline
persists the successful structural parser output.

## Value matrix

| Semantic value            | Form or Grid draft                                    | Generated JSON value         | Direct Drizzle and database read value          | Empty create behavior                                 | Cleared patch behavior       |
| ------------------------- | ----------------------------------------------------- | ---------------------------- | ----------------------------------------------- | ----------------------------------------------------- | ---------------------------- |
| Text                      | raw `string`                                          | the same `string`            | `string`                                        | optional `""` is submitted; untouched is omitted      | `""` is an explicit value    |
| Select-backed text        | one declared option string plus transient search text | selected option string       | selected option string                          | optional clear is omitted                             | `null` for a nullable column |
| Number, money, percentage | raw editor `string` until submit or commit            | finite JSON `number`         | `number`                                        | optional empty input is omitted                       | `null` for a nullable column |
| Boolean                   | untouched `null`, then `boolean` after interaction    | JSON `boolean`               | Drizzle boolean; SQLite integer                 | untouched is omitted; interacted `false` is submitted | submitted `true` or `false`  |
| Date                      | raw `YYYY-MM-DD` input string                         | canonical `YYYY-MM-DD`       | `Temporal.PlainDate`; canonical SQLite `TEXT`   | optional empty input is omitted                       | `null` for a nullable column |
| Timestamp                 | raw `datetime-local` input string                     | canonical ISO instant string | `Temporal.Instant`; canonical UTC SQLite `TEXT` | optional empty input is omitted                       | `null` for a nullable column |
| Foreign key               | target primary-key `string` or `number`               | the same JSON primitive      | target-compatible Drizzle and SQLite value      | optional clear or untouched picker is omitted         | `null` for a nullable column |

A required empty create control produces a field issue. An omitted optional or
defaulted create field preserves normal insert rules. Text `""`, explicit
`null`, and an absent field remain three distinct states.

The generic generated-table client accepts rows as `Record<string, unknown>`
because the table name is chosen at runtime. Per-table OpenAPI schemas still
describe concrete column types. App-owned workflows should use shared ts-rest
and Zod contracts when they need a statically typed domain value.

## Select-backed text

Declare allowed text values once on the Drizzle column:

```ts
import { select } from "@sapporta/server/table";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export const mealsTable = sqliteTable("meals", {
  // Other columns omitted for focus.
  meal_type: select("meal_type", MEAL_TYPES).notNull(),
});
```

`select()` is a typed Drizzle text column. Its enum tuple drives TypeScript
inference, structural Zod validation, generated OpenAPI, serialized table
metadata, form controls, TGrid columns, and filters. Raw Drizzle
`text("meal_type", { enum: MEAL_TYPES })` uses the same runtime derivation when
a Sapporta semantic factory is not needed.

Generated record forms render select-backed text as a searchable, clearable
single-value combobox. The input query filters the declared options and never
becomes the draft value. Generated enum `in` and `nin` filters use a searchable
multi-value combobox with removable chips.

Standalone ColumnPreset select columns accept strings or `{ value, label }`
options. Their inline combobox editor compares option values with exact
`Object.is` identity. A numeric `1` and string `"1"` can therefore coexist, and
the search query cannot be committed as a cell value.

## Draft decoding

Generated create forms store raw numeric, currency, percentage, date, and
timestamp text while the user types. Intermediate input such as `-`, `12.`, or
invalid text stays visible. `parseCreateDraft()` decodes the complete draft once
in the submit handler:

- commas and surrounding whitespace are accepted as numeric editor syntax;
- finite numeric text becomes a number;
- date and timestamp text becomes a canonical wire string;
- select, lookup, and boolean controls retain their already-typed values;
- optional empty non-text controls are omitted;
- optional empty text remains `""`;
- required empty values and invalid drafts produce issues keyed by public SQL
  column name.

A failed decode returns issues separately and does not mutate the form draft.
Editing one field clears only that field's stale issue.

TGrid composes the same leaf decoder with patch rules at cell commit. Clearing a
non-text cell is an explicit `null`; leaving a field out of the surrounding
patch leaves it unchanged. Invalid raw text is preserved and reaches the
authoritative server validation boundary because the generic Grid codec does not
return local field issues.

## Server write boundary

Frontend decoding provides immediate feedback and produces JSON-compatible
values. It is not an authorization or persistence boundary. Generated table
writes apply the following server sequence:

```text
API field-ownership policy
-> trusted scope and server-value merge
-> visible-reference checks
-> tableWriteZod structural parsing
-> top-level validate() application issues
-> Drizzle write
```

This order allows a required workspace, user-scope, or server-authored reference
field to be absent from the public request and present in the prepared insert.
Generated routes therefore use public API schemas for OpenAPI and client typing,
then perform authoritative parsing at the save boundary after auth preparation.
Generated routes, direct `scopedRows()` operations, and master-detail writes
converge on the same parser.

Dates and timestamps emerge from structural parsing as canonical strings. Those
parsed values are passed to the Drizzle custom types, which accept canonical
strings for Sapporta writes and Temporal values for direct Drizzle application
code. Database reads return Temporal values. Generated response schemas convert
them back to canonical JSON strings.

## Public conversion and schema helpers

- `parsePlainDate`, `formatPlainDate`, `parseCanonicalInstant`, and
  `formatCanonicalInstant` from `@sapporta/shared/temporal` convert domain
  Temporal values at app-owned boundaries.
- `formatPlainDateForDateInput`, `parseDateInputToPlainDateString`,
  `formatInstantForDateTimeLocalInput`, and
  `parseDateTimeLocalInputToCanonicalInstantString` connect browser inputs to
  canonical wire strings.
- `parseNumericInput()` from `@sapporta/grid/column-preset` decodes generic
  numeric editor grammar as a finite number, empty candidate, or invalid input.
- ColumnPreset constructors provide standard text, number, date, boolean,
  select, lookup, and foreign-key editor codecs. A custom column can supply
  `parse`, `format`, and `compare` when its value model differs.
- `tableApiZod.forInsert()`, `forPatch()`, and `forRow()` describe one public
  table API value. `tableWriteZod` describes trusted save-boundary values.
- `zodForColumnValue(table, column)` returns the shared leaf schema, and
  `getColumnEnumValues(column)` reads the Drizzle enum declaration.
- `parseFiltersForTable()` and `encodeTypedFilters()` preserve typed filter
  values until the URL boundary.
- `LookupPicker` and table lookup helpers preserve string or number primary-key
  values through selection and lookup caches.

## App-owned contracts

An app-owned endpoint defines its domain value at the shared contract. Parse a
date or timestamp there when service code should receive Temporal values. Keep
the route wire schema and database schema distinct when their runtime types
differ.

```ts
const mealTypeSchema = z.enum(MEAL_TYPES);

const createPlanBody = z.object({
  name: z.string().min(1),
  starts_on: z.string().transform(parsePlainDate),
  meal_type: mealTypeSchema,
  target_calories: z.number().finite().positive(),
});
```

The ts-rest adapter consumes the transformed app-owned request schema, so its
route handler receives `Temporal.PlainDate`. This is separate from generated
table validation, whose top-level `validate()` callback receives canonical
prepared write values and adds issues without transforming them.

## Public names

Generated payloads, metadata, filters, validation issues, and returned row
objects use SQL column names. A Drizzle table may expose `workspace_id` through
the TypeScript property `workspaceId`. Sapporta translates that public SQL name
to the Drizzle property immediately around the database call and projects
returned rows back to SQL names.

Inspect a mounted endpoint before constructing a raw generated-table request:

```bash
pnpm exec sapporta endpoints show "PUT /api/tables/meals/{id}"
```

Generated row updates use `PUT`. Send JSON primitives from the matrix and omit
server-owned workspace, user-scope, generated-primary-key, and server-authored
reference fields.

## Related documentation

- [Table definitions](/docs/reference/schema/table-definitions/)
- [Table validation](/docs/reference/schema/table-validation/)
- [Table endpoints](/docs/reference/http/table-endpoints/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
- [ColumnPreset](/grid/reference/column-preset/)
