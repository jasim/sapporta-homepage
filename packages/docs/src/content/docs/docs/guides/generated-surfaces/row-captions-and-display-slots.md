---
title: "Show rows with their captions and display slots"
description:
  "See where Sapporta shows a row's caption, change how a table's rows are
  drawn with label and column slots, read computed values in components, and
  refresh rows after a write."
---

Sapporta draws a row's identity wherever the row or a reference to it appears:
grid cells, picker options, the value a picker shows after a choice, the record
sheet, and filter chips. The identity is the row label, built from the table's
`rowLabelColumns`, and the caption named by `meta.rowCaption`, such as an
account's parent path under its name.
[Computed fields and row captions](/docs/guides/model-data/computed-fields-and-row-captions/)
describes how a table declares the caption and its computed fields.

Display slots change how the rows of one table are drawn. A label slot draws a
row's identity everywhere it appears, and a column slot draws one column of the
table's own rows. Both can read computed fields, which Sapporta requests with
the rows that show them.

## See what shows by default

A table with a `rowCaption` shows the caption with no frontend code. The place
where a row is drawn is called its surface, and the caption shows on some
surfaces only:

| Surface      | Where                                                                  | Caption by default            |
| ------------ | ---------------------------------------------------------------------- | ----------------------------- |
| `"option"`   | picker options, grid editor options, filter checklist options          | under the label               |
| `"selected"` | beside a picker's input, for the chosen row                            | inside the field, at its end  |
| `"field"`    | a reference in the record sheet                                        | under the label               |
| `"cell"`     | grid cells in table and card layouts, at every level; report cells     | none; the cell keeps one line |
| `"chip"`     | a chosen row in a filter chip's summary                                | none; the caption is the chip's tooltip |

For example, a task form's account picker lists "Groceries" with "Expenses >
Kitchen" under it, and after a choice the field shows "Groceries" with the path
at its end. The account column of the tasks grid shows "Groceries" alone.

A view that already shows a row's place in its tree shows no caption for that
row. On a tree table, the tree column draws the hierarchy, so a parent path
there would repeat it. The parent column's picker is a different place: there
the parent path tells two rows with the same name apart, so the caption shows.

A caption that is a computed field arrives with the lookups that load labels.
Sapporta adds the field to every lookup of the table, so a reference is drawn
complete without a second request.

## Change how a table's rows are drawn

`RowDisplayProvider` takes display slots by table name, and `defineRowDisplays()`
declares them with their types kept. The following label slot shows an
account's parent path beside its name in grid cells and filter chips, and keeps
Sapporta's drawing on every other surface:

```tsx
// packages/frontend/src/row-displays.tsx
import {
  defineRowDisplays,
  type LabelSlotProps,
} from "@sapporta/frontend/lookup";

function AccountName({
  label,
  computed,
  context,
  defaultContent,
}: LabelSlotProps) {
  const path = computed.parentPath;
  if (typeof path !== "string" || context.hierarchyShown) {
    return defaultContent;
  }
  if (context.surface === "cell" || context.surface === "chip") {
    return (
      <span className="truncate" title={`${path} > ${label}`}>
        {label} <span className="text-sap-muted">({path})</span>
      </span>
    );
  }
  return defaultContent;
}

export const rowDisplays = defineRowDisplays({
  accounts: { label: { needs: ["parentPath"], render: AccountName } },
});
```

Wrap the application root in the provider:

```tsx
// packages/frontend/src/main.tsx
import { RowDisplayProvider } from "@sapporta/frontend/lookup";
import { rowDisplays } from "./row-displays";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <RowDisplayProvider displays={rowDisplays}>
        <SapportaApp />
      </RowDisplayProvider>
    </BrowserRouter>
  </StrictMode>,
);
```

Keep `displays` stable, as a module constant or a `useMemo` value. A new value
starts new grid sessions inside the provider.

A label slot draws:

- the row's own label cell in a grid, which is the first `rowLabelColumns`
  column the level shows and the title of each narrow card;
- every reference to the row: foreign-key cells at every grid level, grid editor
  options, picker options and the chosen value, record sheet references, filter
  checklists and chips, and report cells declared with `reference`.

### Read the slot's props

`render` receives these props:

| Prop             | Contents                                                                          |
| ---------------- | --------------------------------------------------------------------------------- |
| `id`             | the row's primary key                                                             |
| `label`          | the row label                                                                     |
| `computed`       | the values of the fields in `needs`; a value is `null` when the row has none      |
| `row`            | the row's visible fields, when Sapporta has them                                  |
| `context`        | where the row is drawn                                                            |
| `defaultContent` | what Sapporta draws without the slot                                              |

`context` has these fields:

| Field            | Values                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------- |
| `as`             | `"self"` for the row's own label cell; `"reference"` when another row or a picker names it |
| `surface`        | `"cell"`, `"option"`, `"selected"`, `"field"`, or `"chip"`                              |
| `density`        | `"compact"` in grid cells and the grid editor; `"regular"` elsewhere                    |
| `source`         | `{ table, column?, levelPath? }`: the table, column, and grid level showing the row     |
| `hierarchyShown` | `true` when the view already shows the row's place in its tree                          |
| `selected`       | for options: whether the option is the current value                                    |

Return `defaultContent` to keep Sapporta's drawing, or wrap it. On the
`"selected"` surface the input already shows the label, so `defaultContent` is
the caption alone.

`render` is drawn as soon as every field in `needs` is known for the row. Until
then, `defaultContent` is drawn. A slot without `render` keeps the default
drawing and still makes Sapporta request its `needs`.

### Request the fields a slot needs

`needs` lists the computed fields of the drawn row that `render` reads. Sapporta
requests them in the same reads that bring the rows:

- A grid level's page read asks for the label slot's `needs` when the level
  shows its label column, and for each visible column slot's `needs`. A hidden
  column costs nothing.
- Every lookup of the table asks for the label slot's `needs`, the computed
  `rowCaption`, and the `referenceNeeds` of column slots that point at the
  table.
- Values still missing are requested in one lookup per table for all rows drawn
  in the same tick.

A grid session checks its slots when it starts. A slot that names a table,
column, or computed field that does not exist throws an error that names it.

## Draw one column with a column slot

A `columns` slot draws one column of a table's own rows, in grid cells and in
the record sheet. It receives the cell's `value`, the `row`, its own
`computed` values, and `defaultContent`:

```tsx
import {
  defineRowDisplays,
  type CellSlotProps,
} from "@sapporta/frontend/lookup";

function StockCell({ computed, defaultContent }: CellSlotProps) {
  const onHand = computed.onHand;
  if (typeof onHand !== "number") return defaultContent;
  return (
    <span>
      {defaultContent} <span className="text-sap-muted">({onHand} left)</span>
    </span>
  );
}

export const rowDisplays = defineRowDisplays({
  items: {
    columns: { reorder_level: { needs: ["onHand"], render: StockCell } },
  },
});
```

On a foreign-key column, `referenceNeeds` names computed fields of the
referenced row. The slot receives that row as `reference`, with `id`, `label`,
and `computed`, or `null` when the cell is empty or the row is not loaded yet:

```tsx
import type { ReferenceSlotProps } from "@sapporta/frontend/lookup";

function TaskAccount({ reference, defaultContent }: ReferenceSlotProps) {
  const path = reference?.computed.parentPath;
  return typeof path === "string" ? (
    <span title={path}>{defaultContent}</span>
  ) : (
    defaultContent
  );
}

defineRowDisplays({
  tasks: {
    columns: {
      account_id: { referenceNeeds: ["parentPath"], render: TaskAccount },
    },
  },
});
```

In narrow card layouts, a field drawn by a slot with `render` stays visible when
its own column value is empty, because the slot may draw from computed values.

## Type slots by the computed field schemas

`tableDisplay()` types a table's slots by the Zod schemas of its computed
fields. Keep the schemas in the shared package, so the server's `computedField`
declarations and the frontend's slots use the same ones:

```ts
// packages/shared/src/computed.ts
import { z } from "zod";

export const itemComputed = { onHand: z.number(), stockLine: z.string() };
```

```tsx
import { defineRowDisplays, tableDisplay } from "@sapporta/frontend/lookup";
import { itemComputed } from "my-app-shared";

export const rowDisplays = defineRowDisplays({
  items: tableDisplay(itemComputed, {
    label: {
      needs: ["onHand"],
      render: ({ label, computed }) => (
        <span>
          {label} ({computed.onHand ?? 0})
        </span>
      ),
    },
  }),
});
```

`needs` then accepts only the schemas' names, and `computed.onHand` is typed as
`number | null`. The type lists every field of the schemas, but a slot receives
only the fields in its `needs`. `tableDisplay()` does not check values; the
server checks them against the same schemas.

## Know which drawing applies

The drawings are stacked, and each layer receives the layer below it as
`defaultContent`:

1. A view's own `renderCell`, such as a TGrid column's `renderCell` option, or a
   report's `renderCell`.
2. The column's slot.
3. The table's label slot, on the label column and on references.
4. Sapporta's default drawing.

A `LookupPicker`'s `itemDisplay.component` sits above the label slot in the
same way; see
[Pick a related row](/docs/guides/application-code/custom-forms-and-validation/#pick-a-related-row).

Providers nest. An inner `RowDisplayProvider` merges its displays over the outer
ones, by table and then by slot, so a table in the inner provider replaces only
the slots it names. Setting a slot to `{}` restores the default drawing for that
view:

```tsx
<RowDisplayProvider displays={{ accounts: { label: {} } }}>
  <AccountsAuditScreen />
</RowDisplayProvider>
```

## Read computed values in your own components

`useRowComputed(table, id, fields)` returns the named computed values of one
row. It returns `undefined` until every named field is known, and then exactly
those fields:

```tsx
import { useRowComputed } from "@sapporta/frontend/lookup";

function OnHandBadge({ itemId }: { itemId: number }) {
  const values = useRowComputed("items", itemId, ["onHand"]);
  if (!values) return null;
  return <span className="text-sap-meta">{String(values.onHand ?? 0)}</span>;
}
```

Calls made in the same render are sent as one request per table. The hook reads
the nearest row store. Inside a TGrid, each cell has the grid session's store.
Elsewhere, provide one with `RowDataStoreProvider`:

```tsx
import {
  RowDataStoreProvider,
  useLookupStore,
} from "@sapporta/frontend/lookup";

function ItemSummaryPage() {
  const store = useLookupStore();
  return (
    <RowDataStoreProvider store={store}>
      <OnHandBadge itemId={12} />
    </RowDataStoreProvider>
  );
}
```

Without a store, `useRowComputed` throws an error that says so.

`RowLabel` draws one row's identity with its table's label slot, for a component
that shows a row outside the built-in surfaces. It takes the table's row data
(`store.table(name)`), the `id`, the `label`, and a `context`; see
[Table lookups and record ids](/docs/reference/frontend/lookups/#rowlabel).

## Tell rows apart in filters

A filter on a foreign-key column draws its rows with the row display. Each
option of the filter's checklist is drawn on the `"option"` surface, so the
caption shows under the label, as in pickers. For example, "Fuel" under Car and
"Fuel" under Generator show their different parent paths.

A filter chip draws each chosen row on the `"chip"` surface. By default the chip
shows the label alone, and the caption becomes the chip's tooltip. A label slot
that branches on `context.surface === "chip"`, as `AccountName` above does, can
show the caption inside the chip.

## Refresh rows after a write

Every grid session, form page, picker, and report holds its own row store. A
write through a Sapporta grid or the New record page refreshes every connected
store on screen: computed values are read again for the rows shown, and the
written table's labels are read again. The old values stay drawn until the new
ones arrive, so the screen does not flash.

A write through an application endpoint is unknown to Sapporta. Call
`invalidateRows()` after it succeeds:

```ts
import { invalidateRows } from "@sapporta/frontend/lookup";

await renameAccount({ id, name });
invalidateRows("accounts");
```

`invalidateRows(table)` reads the computed values of every connected store
again, because a computed value can depend on any row, and reads the labels of
`table` again. `invalidateRows()` with no table reads every table's labels
again.

Grid sessions connect their stores while they are mounted, and so do stores from
`useLookupStore()`, `useTableLookup()`, and `ReportGridDataset`. A store made
with `createLookupStore()` connects with `connectRowDataStore(store)`, which
returns the function that disconnects it.

`invalidateRows()` refreshes row stores only. Refresh the TanStack Query caches
of the same rows as described in
[Cached table reads and refresh](/docs/guides/application-code/cached-table-reads-and-refresh/).

## Use displays outside React

React grid sessions take their displays from the nearest `RowDisplayProvider`.
Code outside React passes them directly:

```ts
import { createTGridSession } from "@sapporta/frontend";
import { createLookupStore } from "@sapporta/frontend/lookup";

const session = createTGridSession(definition, { rowDisplays });
const store = createLookupStore({ rowDisplays });
```

## Related documentation

- [Computed fields and row captions](/docs/guides/model-data/computed-fields-and-row-captions/)
- [Table lookups and record ids](/docs/reference/frontend/lookups/)
- [Custom forms and validation](/docs/guides/application-code/custom-forms-and-validation/#pick-a-related-row)
- [Name table rows in report cells](/docs/guides/reports/report-reference-columns/)
- [Table-aware grids and customization](/docs/guides/generated-surfaces/table-aware-grids-and-customization/)
