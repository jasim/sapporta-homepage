---
title: "Table validation"
description:
  "Compose structural table parsing with operation-aware application issues."
---

## Identity

The top-level `validate(value, context)` option on `sapportaTable()` adds
application issues after Sapporta parses a prepared table write.

## Contract

- Sapporta derives structural rules from the joined `TableDef`. Drizzle owns SQL
  names, nullability, defaults, keys, enum values, and storage types. Semantic
  column kinds own value behavior.
- Application validation composes with structural parsing. It does not replace a
  Zod table schema or redeclare column constraints.
- `value` contains already-parsed values keyed by public SQL column name.
  Numbers are finite numbers. Dates and timestamps are canonical strings.
- `context.operation` is `"insert"` or `"patch"`. A prepared insert includes
  trusted fields supplied by auth or server code. A patch contains only the
  submitted fields.
- `context.addIssue(field, message)` associates an issue with an SQL column
  name. Use `"$"` for a row-level issue.
- Validation callbacks add issues only. They do not transform values. The save
  pipeline persists the successful structural parser output.
- The save boundary rejects control characters in string values before
  structural Zod parsing and application validation.
- Nullable columns accept `null`. Defaulted and nullable insert fields may be
  absent. Every patch field is optional, and an absent field remains unchanged.
- Generated table API write schemas contain only caller-controlled fields.
  Generated primary keys, auth scope fields, `apiWritable: false` columns, and
  references with `apiSettable: false` are excluded from OpenAPI and generated
  client types. Request-time API policy also rejects those fields if submitted.
- `meta.immutable: true` permits generated creates and reads and rejects
  generated updates and deletes before patch parsing or application validation.
- Database constraints run after structural and application validation when
  Drizzle writes the parsed record.

## Complete table

The following table declares the unit options once and adds two application
rules. Structural parsing still owns finite numbers, enum membership,
nullability, required fields, and canonical storage values.

```ts
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { number, sapportaTable, select, text } from "@sapporta/server/table";

const INGREDIENT_UNITS = ["g", "ml", "serving"] as const;

export const ingredientsTable = sqliteTable("ingredients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace_id: text("workspace_id").notNull(),
  name: text("name").notNull(),
  amount: number("amount").notNull(),
  unit: select("unit", INGREDIENT_UNITS).notNull(),
  description: text("description"),
});

export const ingredients = sapportaTable({
  drizzle: ingredientsTable,
  meta: {
    label: "Ingredients",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["name"],
  },
  validate(value, context) {
    if (typeof value.name === "string" && value.name.trim().length === 0) {
      context.addIssue("name", "Name is required.");
    }
    if (typeof value.amount === "number" && value.amount <= 0) {
      context.addIssue("amount", "Amount must be greater than zero.");
    }
  },
});

export default ingredients;
```

`select()` stores `INGREDIENT_UNITS` on the Drizzle text column. The same tuple
drives TypeScript inference, structural Zod validation, generated OpenAPI,
serialized options, the form and Grid comboboxes, and enum filters. The
application callback does not repeat the enum.

The callback is patch-aware without a second partial schema. Updating only
`description` produces `{ description: ... }`, so the name and amount rules do
not run. Inserting a row produces the complete prepared value, including the
server-authored `workspace_id`.

## Validation order

Generated creates and updates use a fixed write path:

```text
API write policy
-> trusted server-value merge
-> visible-reference checks
-> control-character rejection, structural parsing, and canonicalization
-> application validate() issues
-> SQL-name to Drizzle-property translation
-> database constraints
```

Auth must run before authoritative insert parsing because required workspace,
user-scope, or server-authored reference fields are absent from the caller's
body. Generated request schemas still describe caller-controlled values for
OpenAPI and client types. The prepared write is parsed again at the save
boundary after trusted values exist. Generated routes, `scopedRows()`, and
master-detail writes converge on this same save pipeline.

Structural parsing is strict. Unknown or misspelled SQL column names fail before
persistence. Date and timestamp values are canonicalized by the structural
parser, and that parsed output reaches Drizzle. Application validation sees the
same canonical value and cannot substitute a different one.

## Public Zod projections

Use the public helpers when application code needs the same projections:

```ts
import {
  tableApiZod,
  tableWriteZod,
  zodForColumnValue,
} from "@sapporta/server";

const tables = [ingredients];
const callerInsert = tableApiZod.forInsert(ingredients, tables);
const callerPatch = tableApiZod.forPatch(ingredients, tables);
const returnedRow = tableApiZod.forRow(ingredients);

const trustedInsert = tableWriteZod.forInsert(ingredients);
const trustedPatch = tableWriteZod.forPatch(ingredients);
```

`tableApiZod` projects public field ownership and table value rules. Each helper
describes one row value, not a route envelope, array, or master-detail union.
`tableWriteZod` includes server-authored structural columns. Both reuse
`zodForColumnValue()` for the leaf value schema.

## Verify

1. Run `pnpm exec sapporta tables show ingredients` and confirm the unit
   options.
2. Inspect `POST /api/tables/ingredients` and confirm the caller body omits
   `workspace_id` while the returned row includes it.
3. Create one valid row through the generated route.
4. Submit zero, a negative number, non-finite numeric input, blank name, or an
   unsupported unit and confirm a structured 422 response.
5. Update only `description` and confirm patch validation does not require
   `name`, `amount`, `unit`, or `workspace_id`.
6. Attempt to submit `workspace_id` and confirm API write policy rejects it
   before structural parsing.

## Related documentation

- [Tables, columns, and schema metadata](/docs/guides/model-data/tables-columns-and-schema-metadata/)
- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
- [Generated table APIs](/docs/guides/generated-surfaces/generated-table-apis/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
