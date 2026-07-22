---
title: "Generated record surfaces and form helpers"
description:
  "Look up generated record routes, TanStack Form integration, metadata-derived
  fields, draft parsing, and submission-error helpers."
---

## Identity

Generated record routes, form components, and form helpers are exported from
`@sapporta/frontend`. Presentation-neutral validation values are exported from
`@sapporta/shared/validation`.

Generated create screens use TanStack Form directly. The previous
`RecordFormProvider`, record-form store, and record-form hooks are not public
integration points.

## Generated routes and components

- `TableRoute` renders the table-aware list and record surface for serialized
  table metadata.
- `NewRecordRoute` connects the generated `/tables/:tableName/new` route.
- `NewRecordPage` renders a metadata-derived create form for one `TableSchema`.
- `FormField` renders one `RecordFormFieldModel`. It accepts `field`, `value`,
  `issue`, and `onChange` values and supplies the matching label, input,
  combobox, checkbox, or scoped lookup.

`NewRecordPage` creates a TanStack Form instance. TanStack Form owns draft
values, submit validation, field errors, form errors, and pending state. A
successful create calls `createTableRow()`, reloads mounted TGrid sessions for
the table with `reloadTGridRows()`, invalidates the table's public TanStack
Query prefix, and replaces the route with the table page.

## Field metadata

```ts
import {
  buildRecordFormFields,
  fieldModelForColumn,
  foreignKeyFieldModelForColumn,
} from "@sapporta/frontend";

const fields = buildRecordFormFields({ table, lookups });
const title = fieldModelForColumn(fields, "title");
const project = foreignKeyFieldModelForColumn(fields, "project_id");
```

`buildRecordFormFields({ table, lookups })` returns one
`RecordFormFieldModel` for each editable column. The union contains `text`,
`number`, `currency`, `percentage`, `date`, `timestamp`, `checkbox`, `select`,
and `foreignKey` variants. Select models include their declared options.
Foreign-key models include scoped lookup capabilities.

Generated primary keys, system-managed scope columns, and columns excluded by
the table write policy do not produce editable field models.

`fieldModelForColumn()` returns the model for one SQL column name and throws
when the field is absent. `foreignKeyFieldModelForColumn()` also verifies that
the model is a foreign key. These failures identify a mismatch between the
application form and the current table metadata; they are not user-validation
results.

The matching exported types are `RecordFormFieldModel` and
`ForeignKeyRecordFormFieldModel`.

## Create-draft parsing

```ts
const parsed = parseCreateDraft(table, formValues);
if (!parsed.ok) {
  return Object.fromEntries(
    parsed.issues.map((issue) => [issue.field, issue.message]),
  );
}

await createTableRow(table.name, parsed.value);
```

`parseCreateDraft(table, draft)` performs a non-mutating submit-time decode.
Its result is either `{ ok: true, value }` or `{ ok: false, issues }`.
`ParseCreateDraftResult` names this union. `CreateDraftIssue` remains as a
deprecated alias; use `FieldIssue` from `@sapporta/shared/validation`.

- Numeric, currency, percentage, date, and timestamp controls may retain raw
  text while the user edits. The parser converts valid complete drafts at
  submit time.
- Optional empty non-text values are omitted. Omission preserves database
  defaults and optional insert behavior.
- Empty text remains `""`. It is never converted to `null`.
- Required empty values and invalid drafts produce `FieldIssue` values keyed by
  public SQL column name.
- Values for non-editable columns are ignored. Client metadata does not grant
  write authority.

The parser implements create presence and wire-decoding rules. The server still
owns API write policy, trusted scope values, reference visibility,
authorization, structural validation, application validation, and database
constraints. Patch parsing is a separate contract because omission means
"leave unchanged" during update.

## Submission errors

```ts
import {
  FormSubmissionError,
  fieldIssuesForSubmissionError,
  firstFormErrorMessage,
} from "@sapporta/frontend/form";
```

- `FormSubmissionError(issues)` carries local `FieldIssue[]` values. Its
  `issues` array is copied at construction.
- `fieldIssuesForSubmissionError(error)` returns copied issues from a
  `FormSubmissionError` or recognized field details from a Sapporta
  `ApiError`. Other errors produce `[]`.
- `firstFormErrorMessage(errors)` converts the first TanStack Form field error
  to display text. It supports strings, `Error` instances, objects with a
  string `message`, and other printable values. An empty list returns
  `undefined`.

Generated create forms map recognized API validation details into TanStack
Form's field error map and keep the API summary as the form-level error. A
field issue may use a direct `field` name or a nested path such as
`lines.0.quantity`.

## Shared validation values

`@sapporta/shared/validation` exports:

```ts
interface FieldIssue {
  field: string;
  message: string;
}

interface ApiProblem {
  summary: string;
  code?: string;
  fieldIssues: readonly FieldIssue[];
}
```

- `fieldIssuesFromZodError(error)` preserves nested Zod paths with dot
  notation. A pathless issue uses the field name `form`.
- `apiProblemFromBody(body)` validates a Sapporta error body and returns its
  summary, optional code, and recognized field details. Invalid bodies return
  `undefined`. Unrecognized detail entries are ignored.

These helpers normalize transport and validation data. Application code still
decides how server field names map to a domain form and which summary the user
can act on.

## Related documentation

- [Generated record screens and forms](/docs/guides/generated-surfaces/record-screens-and-forms/)
- [Table query options](/docs/reference/frontend/table-query-options/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
- [Semantic value boundaries](/docs/reference/schema/semantic-value-boundaries/)
