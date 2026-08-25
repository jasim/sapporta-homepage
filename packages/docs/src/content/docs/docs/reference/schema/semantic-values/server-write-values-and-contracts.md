---
title: "Server write values and contracts"
description:
  "Look up authoritative table-write parsing, conversion helpers, application
  value contracts, and public SQL-name boundaries."
---

Frontend decoding provides immediate feedback and produces JSON-compatible
values. It is not an authorization or persistence boundary. This page owns the
authoritative server and application-contract side of semantic values.

## Server write boundary

Generated table writes apply the following server sequence:

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

Grouped counts apply the grouped column's semantic schema before returning a
value. Text, number, and boolean groups keep their JSON primitive type; date and
timestamp groups use canonical strings; and `null` remains an explicit group.

## Public conversion and schema helpers

- `parsePlainDate`, `formatPlainDate`, `parseCanonicalInstant`, and
  `formatCanonicalInstant` from `@sapporta/shared/temporal` convert domain
  Temporal values at application boundaries.
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

## Application contracts

An application endpoint defines its domain value at the shared contract. Parse a
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

The ts-rest adapter consumes the transformed application request schema, so its
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

Generated row updates use `PUT`. Send JSON primitives from the
[generated/client value matrix](/docs/reference/schema/semantic-values/generated-and-client-values/)
and omit server-owned workspace, user-scope, generated-primary-key, and
server-authored reference fields.

## Related documentation

- [Table validation](/docs/reference/schema/table-validation/)
- [Table endpoints](/docs/reference/http/table-endpoints/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
