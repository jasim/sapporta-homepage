---
title: "Custom forms and validation"
description:
  "Compose TanStack Form with Sapporta table metadata, semantic draft decoding,
  and local or remote validation issues."
---

A custom form composes live `TableSchema` metadata, TanStack Form draft state,
and the server write path. It should not create a second schema. Load existing
records through the focused
[cached table reads guide](/docs/guides/app-owned-features/cached-table-reads-and-refresh/).

## Keep state ownership explicit

Use one owner for each kind of state:

| State                                                            | Owner                  |
| ---------------------------------------------------------------- | ---------------------- |
| Draft values, dirty state, local validation, submit state        | TanStack Form          |
| Table metadata, semantic draft decoding, generated CRUD requests | Sapporta frontend APIs |
| Domain request shape, success destination, cache effects, layout | Application screen     |
| Write policy, row scope, authoritative validation, transactions  | Server route           |

## Build a metadata-derived form

```tsx
import { useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import {
  FormField,
  buildRecordFormFields,
  firstFormErrorMessage,
  useLookupStore,
} from "@sapporta/frontend";

function TaskEditor({ task, table }: { task: Task; table: TableSchema }) {
  const lookups = useLookupStore();
  const fields = useMemo(
    () => buildRecordFormFields({ table, lookups }),
    [lookups, table],
  );
  const form = useForm({
    defaultValues: {
      title: task.title,
      project_id: task.project_id,
      due_date: task.due_date,
    } as Record<string, unknown>,
    onSubmit: async ({ value }) => submitTask(value),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit().catch(() => undefined);
      }}
    >
      {fields.map((fieldModel) => (
        <form.Field key={fieldModel.column.name} name={fieldModel.column.name}>
          {(field) => (
            <FormField
              field={fieldModel}
              value={field.state.value}
              issue={firstFormErrorMessage(field.state.meta.errors)}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
      ))}
      <button type="submit">Save task</button>
    </form>
  );
}
```

`buildRecordFormFields()` derives editable fields, semantic control kinds,
select options, and scoped foreign-key lookups from the current table schema.
The form may render only a subset or arrange fields into domain sections. Use
`fieldModelForColumn()` and `foreignKeyFieldModelForColumn()` when the layout
names specific fields.

Workflow values that are not table columns remain ordinary TanStack Form fields.
Application-specific controls can consume a Sapporta field model without using
`FormField` when the default rendering does not fit.

## Name the form instance's type

`ReturnType<typeof useForm<MealDraft>>` and `ReactFormExtendedApi<MealDraft>`
both fail — twelve type parameters, no defaults. Every `form.Field` under the
bad annotation then degrades to `any`. Wrap `useForm` in one hook per form and
name its return type:

```ts
function useMealDraftForm(defaults: MealDraft) {
  return useForm({/* ... */});
}

type MealForm = ReturnType<typeof useMealDraftForm>;
```

Keep validators and `onSubmit` inside the hook so `MealForm` covers them. Reach
for `createFormHook`/`withForm` only when pieces are shared across forms.

## Validate with a Standard Schema

`validators: { onChange: schema }` checks the schema's **input** type and
discards the transformed output — `z.coerce`, `.trim()` and friends report the
draft valid and leave the form value exactly as typed. Re-parse inside
`onSubmit` when the server needs the transformed value.

Where fields come from table metadata, prefer no schema at all:
`parseCreateDraft()` already reports required and invalid columns from the live
`TableSchema`.

## Decode creates at submit time

For an ordinary one-table create, keep raw form text until submit and call
`parseCreateDraft()` once:

```ts
const parsed = parseCreateDraft(table, value);
if (!parsed.ok) {
  throw new FormSubmissionError(parsed.issues);
}

await createTableRow(table.name, parsed.value);
```

This decode preserves incomplete editor text during interaction. It omits
optional empty non-text fields, preserves empty text as `""`, canonicalizes
valid semantic values, and reports required or invalid fields. It does not
replace server validation.

Update forms need an explicit patch transform. Create omission and patch
omission have different meanings. A create omission permits a default; a patch
omission leaves the stored field unchanged.

Use an app-owned typed endpoint when one submit changes several tables or
performs a named domain action. TanStack Form still owns the draft, but the
application contract owns the request shape and the server owns the transaction.

## Map local and remote issues

`fieldIssuesForSubmissionError()` handles local `FormSubmissionError` values and
recognized Sapporta API validation details. Nested paths remain names such as
`lines.0.quantity`. Application code maps server fields when its form uses a
different field vocabulary.

Inside `onSubmit`, catch the rejection, convert the issues, and call
`formApi.setErrorMap({ onSubmit: { form, fields } })`. Keep a form-level
fallback for transport failures and details that do not name one field. Clear
stale errors from one form-level `listeners.onChange` rather than per-field
handlers, and catch the promise returned by `form.handleSubmit()` after the
errors have been rendered.

Never write from `validators.onSubmitAsync` — the row exists by the time the
validator reports failure. Use it only for read-only pre-write checks such as a
uniqueness probe.

## TanStack Form idioms

Sapporta composes TanStack Form with no wrapper or adapter, so the
[upstream React guides](https://tanstack.com/form/latest/docs/framework/react/guides/)
apply directly. Non-obvious points:

- `useSelector(form.store, selector)` in logic, `form.Subscribe` in JSX.
  `useStore` is deprecated.
- `isDirty` never resets — use `!isDefaultValue` to stop nagging once values
  match what was loaded.
- Dependent fields: field `listeners.onChange` + `validators.onChangeListenTo`,
  never `useEffect`.
- `validationLogic: revalidateLogic()` — validate on submit, then live.
- Submit button: `aria-disabled`, not `disabled`; gate on
  `!canSubmit || isPristine`.
- Also: `onSubmitInvalid`, `formOptions()`.

## Related reference

- [Stage multi-row drafts in a Grid](/docs/guides/app-owned-features/staged-multi-row-drafts/)
- [Table lookups and record ids](/docs/reference/frontend/lookups/)
- [Generated record surfaces and form helpers](/docs/reference/frontend/generated-record-surfaces/)
- [Cached table reads and refresh](/docs/guides/app-owned-features/cached-table-reads-and-refresh/)
- [Typed API clients](/docs/guides/app-owned-features/typed-api-clients/)
