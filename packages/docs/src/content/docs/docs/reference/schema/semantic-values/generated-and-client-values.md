---
title: "Generated and client values"
description:
  "Preserve semantic values through generated forms, table HTTP payloads, Grid
  editors, and client-side draft decoding."
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
- date and timestamp text becomes a canonical wire string, resolved in the
  active workspace's time zone;
- select, lookup, and boolean controls retain their already-typed values;
- optional empty non-text controls are omitted;
- optional empty text remains `""`;
- required empty values and invalid drafts produce issues keyed by public SQL
  column name.

A failed decode returns issues separately and does not mutate the form draft.
Editing one field clears only that field's stale issue.

`parseCreateDraft()`, the table-draft decoders, and the filter-day codecs read
`appTimeZone()` themselves. A date or timestamp control takes no zone option:
the zone is published once per page load from the auth-context response, so
every call site would otherwise pass the same expression.

TGrid composes the same leaf decoder with patch rules at cell commit. Clearing a
non-text cell is an explicit `null`; leaving a field out of the surrounding
patch leaves it unchanged. Invalid raw text is preserved and reaches the
authoritative server validation boundary because the generic Grid codec does not
return local field issues.

## Related documentation

- [Generated record surfaces and form helpers](/docs/reference/frontend/generated-record-surfaces/)
- [TGrid](/docs/reference/frontend/tgrid/)
- [Table endpoints](/docs/reference/http/table-endpoints/)
- [Server write values and contracts](/docs/reference/schema/semantic-values/server-write-values-and-contracts/)
- [Days and time zones](/docs/reference/server/days-and-time-zones/)
- [ColumnPreset](/grid/reference/column-preset/)
