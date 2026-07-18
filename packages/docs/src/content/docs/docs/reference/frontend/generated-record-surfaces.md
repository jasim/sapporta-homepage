---
title: "Generated record surfaces"
description:
  "Look up generated table routes, record forms, and public form helpers."
---

## Identity

`TableRoute`, `NewRecordRoute`, form components/stores, and table actions from
`@sapporta/frontend`.

## Contract

- `TableRoute` renders a table-aware list/detail surface from serialized schema
  metadata.
- `NewRecordRoute` and `NewRecordPage` render metadata-derived creation forms.
- `RecordFormProvider` and its hooks expose supported custom form integration.
- Generated forms consume required column kinds, Drizzle-derived select options,
  references, defaults, visibility, and API write policy from parsed schema
  metadata.
- Numeric, date, and timestamp controls keep raw draft text while the user
  edits. `parseCreateDraft()` decodes the complete draft on submit and
  associates local issues with public SQL column names without rewriting invalid
  input.
- Optional empty non-text controls are omitted from creates, while an empty text
  input remains `""`. This keeps omission, empty text, and explicit `null`
  distinct.
- Select-backed text renders as a searchable, clearable single-value combobox.
  Lookup controls remain scoped remote pickers.
- Generated routes run inside auth boot and use scoped table HTTP clients.

## Related documentation

- [Generated record screens and forms](/docs/guides/generated-surfaces/record-screens-and-forms/)
