---
title: "Table validation"
description:
  "Define generated CRUD validation for create and partial-update requests."
---

## Identity

`meta.validation` accepts a Zod object schema on a `sapportaTable()` definition.
Generated create and update routes run this schema inside the table save
pipeline.

## Contract

- `meta.validation` replaces the inferred table schema. It does not extend or
  merge with the semantic column rules.
- Creates validate the complete prepared row. The row includes trusted workspace
  and user-scope values added by the server. Database-defaulted columns may
  still be absent.
- Updates validate the submitted patch through a partial form of the same Zod
  object. Omitted fields keep their stored values.
- Nullable columns accept `null`. Optional fields may be absent. These states
  are distinct.
- Client payload policy runs before table validation. It rejects auth scope
  fields and references declared with `clientCanSet: false`.
- `clientEditable: false` controls the generated New Record form. It is not a
  server authorization or raw-HTTP payload rule. Enforce a server-owned
  non-reference field in an app-owned endpoint or another explicit server
  policy.
- `meta.immutable: true` allows create and read operations but rejects generated
  update and delete operations before patch preparation and table validation.
- Reference checks verify that submitted foreign keys identify visible rows.
  Database constraints run when Drizzle writes the validated record.
- Table validation checks the record. The save pipeline persists the original
  record, so Zod coercions and transformations are not a normalization step.
  Normalize values before the save call when the workflow requires it.

## Complete table

The following table adds constraints beyond its semantic column kinds. The
amount is a positive finite decimal. The unit is a controlled text value. The
description is nullable. The workspace id is added by row security and included
in the create-validation shape.

```ts
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { number, sapportaTable, text } from "@sapporta/server/table";

export const ingredientsTable = sqliteTable("ingredients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace_id: text("workspace_id").notNull(),
  name: text("name").notNull(),
  amount: number("amount").notNull(),
  unit: text("unit").notNull(),
  description: text("description"),
});

const ingredientValidation = z
  .object({
    workspace_id: z.string().min(1),
    name: z.string().refine((value) => value.trim().length > 0, {
      message: "Name is required",
    }),
    amount: z.number().finite().positive(),
    unit: z.enum(["g", "ml", "serving"]),
    description: z.string().nullable().optional(),
  })
  .strict();

export const ingredients = sapportaTable({
  drizzle: ingredientsTable,
  meta: {
    label: "Ingredients",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["name"],
    validation: ingredientValidation,
    selects: [
      {
        type: "select",
        column: "unit",
        options: ["g", "ml", "serving"],
      },
    ],
    columns: {
      workspace_id: { visuallyHidden: true, clientEditable: false },
    },
  },
});

export default ingredients;
```

The select metadata configures generated forms and Grid editors. The Zod enum
repeats the allowed values because a custom validation schema replaces inferred
select validation. An application can export one `INGREDIENT_UNITS` tuple and
reuse it in both declarations when the values are also part of domain code.

## Validation order

Generated create requests pass through these boundaries:

```text
client payload policy
-> server-owned value insertion
-> visible-reference checks
-> full table validation
-> database constraints
```

Generated update requests use the same sequence without auth-scope insertion.
Table validation receives the accepted patch and applies the schema as a partial
object. A generic `clientEditable: false` field is not removed from a direct
HTTP patch; only the generated New Record form treats that flag as an editing
policy.

## Verify

1. Run `pnpm exec sapporta tables show ingredients` and confirm the table and
   select metadata.
2. Create one valid row through the generated route.
3. Submit a zero, negative, non-finite, or unsupported unit value and confirm a
   422 validation response.
4. Update only `description` and confirm partial validation does not require
   `name`, `amount`, `unit`, or `workspace_id`.
5. Attempt to submit `workspace_id` from the client and confirm payload policy
   rejects it before table validation.

## Related documentation

- [Tables, columns, and schema metadata](/docs/guides/model-data/tables-columns-and-schema-metadata/)
- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
- [Generated table APIs](/docs/guides/generated-surfaces/generated-table-apis/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
