---
title: "Stage multi-row drafts in a Grid"
description:
  "Collect repeating draft rows in a Grid over an application-owned in-memory
  source, then transform them into table writes or one domain endpoint."
---

Some workflows collect a repeating structure that no single stored table
matches: an invoice's lines, a shift roster, a bill of materials, a batch of
readings. The draft lives in the browser, carries its own row shape, and is
transformed on save, often across several tables or into one named domain
action. It is a logical representation of a domain concept rather than a view of
a table.

A Grid over an application-owned in-memory source stages that draft. Its draft
and phantom-row APIs own row identity, insertion, cell editing, and per-row
failure state, so the screen keeps the domain shape and the transform.

## Choose the layer

Compose GridCore with ColumnPreset over `inMemoryGridDataSource`. The rows are
application-owned and temporary, so the registered-table Grid layers, which
imply generated CRUD and row security, do not apply. The
[Grid layer guide](/grid/start/choose-a-grid-layer/) records the full
comparison, and
[phantom rows and inserts](/grid/guides/advanced-rows/phantom-rows-and-inserts/)
covers the insertion model.

TanStack Form's `mode="array"` fields suit a short repeating group of ordinary
inputs. A Grid earns its place once the rows want columns, keyboard navigation,
or per-row state.

## Keep one owner for the rows

The surrounding form owns the header fields, submit state, and submit errors.
The Grid runtime owns the staged rows. Reading the rows from the runtime at
submit keeps one copy; mirroring them into form state creates two.

## Decide where the draft becomes persistent shape

The screen maps rows to table writes at submit, or posts the draft to one
app-owned typed endpoint that owns the transform and the transaction.

An endpoint fits when the save spans several tables, needs one transaction, or
encodes a domain rule. The draft row type then belongs in the shared contract so
the screen and the route agree on it, and the route commits every write or none
of them through a
[parent-detail transaction](/docs/guides/app-owned-features/parent-detail-transactions/).

Direct table writes fit a draft that resolves to rows in one table and needs no
cross-row rule.

## Related documentation

- [Custom forms and validation](/docs/guides/app-owned-features/custom-forms-and-validation/)
- [Bounded GridCore projections](/docs/guides/app-owned-features/bounded-gridcore-projections/)
- [Parent-detail transactions](/docs/guides/app-owned-features/parent-detail-transactions/)
- [In-memory and REST data sources](/grid/reference/data-sources/in-memory-and-rest-sources/)
- [Editing and saving](/grid/guides/editing-and-saving/)
