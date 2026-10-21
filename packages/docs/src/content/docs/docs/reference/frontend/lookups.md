---
title: "Table lookups and record ids"
description:
  "Look up scoped table lookup capabilities, lookup narrowing, LookupPicker
  props, the row data store, display slots, row refresh, lookup value identity,
  and the RecordId address boundary."
---

## Identity

`@sapporta/frontend/lookup`, `@sapporta/grid/lookup`, and
`@sapporta/shared/record-id`. Every frontend symbol on this page is exported by
`@sapporta/frontend/lookup` and re-exported by `@sapporta/frontend`.

## Contract

- `useLookupStore()` creates one row data store for a component, connected to
  [`invalidateRows`](#refresh-rows-after-a-write) while the component is
  mounted. `useTableLookup(tableName, narrowing?)` returns the
  `LookupCapabilities` for one table, optionally
  [narrowed](#narrow-a-lookup).
- `LookupPicker` renders a scoped picker over those capabilities. It owns remote
  search, selected-label loading for an entry outside the current search page,
  lookup cache subscriptions, `null` clearing, disabled and invalid states, and
  keyboard behavior. Over a table's lookup, it draws options and the chosen
  value with the table's [row display](#display-slots).
- Both are generic over the target table's primary-key type, which extends
  `LookupValue` (`string | number`).
- `LookupEntry` objects are the picker's items and its Base UI selected value.
  Application code translates at the domain boundary with
  `pickedEntry?.value ?? null`.

## Parameterize the hook and the picker together

`useTableLookup<TValue>` and `LookupPicker<TValue>` take the same type argument,
matched to the table's primary key:

```tsx
import { LookupPicker, useTableLookup } from "@sapporta/frontend/lookup";

const accountLookup = useTableLookup<number>("accounts");

<LookupPicker<number>
  id="account-id"
  lookup={accountLookup}
  value={accountId}
  onChange={setAccountId}
  placeholder="Select account"
  allowClear
  ariaInvalid={Boolean(issue)}
/>;
```

Supply the parameter in both places or in neither. `useTableLookup("accounts")`
returns capabilities over `string | number`, which does not satisfy
`LookupPicker<number>`. Omitting both parameters keeps the value
`string | number`, which suits a call site where the key type is not known.

The store is key-agnostic at runtime, so the parameter is an assertion about the
column rather than a conversion.

## Narrow a lookup

```ts
type LookupNarrowing = {
  filter?: readonly FilterDraftCondition[];
  notUnder?: LookupValue;
};

function useTableLookup<TValue extends LookupValue = LookupValue>(
  tableName: string,
  narrowing?: LookupNarrowing,
): LookupCapabilities<TValue, Row>;
```

```tsx
const assetAccounts = useTableLookup<number>("accounts", {
  filter: [{ column: "account_type", op: "in", values: ["asset"] }],
});
const parentChoices = useTableLookup<number>("accounts", {
  notUnder: accountId,
});
```

- `filter` takes conditions in the list filter grammar
  (`FilterDraftCondition` from `@sapporta/shared/filter`):
  `{ column, op, value }`, `{ column, op: "in" | "nin", values }`, or
  `{ column, op: "is", polarity }`. They are sent as `filter[col][op]` on the
  lookup search; repeated conditions on one key are ANDed.
- `notUnder` leaves out that row of a tree table and every row below it, such as
  the choices for the row's own parent. `undefined` narrows nothing.
- Only the search is narrowed. Lookups by id are never narrowed, so a chosen row
  keeps its label after it stops matching.
- Each narrowing has its own label and computed-value caches, keyed by the
  table and the narrowing's content. An equal narrowing built again on each
  render reuses them. A narrowing with no conditions is the table itself.
- `store.table(tableName, narrowing)` on a [row data store](#row-data-store)
  returns the same narrowed row data outside the hook.

The HTTP form is described in
[Narrow a lookup search](/docs/reference/http/query-syntax/#narrow-a-lookup-search).

## `LookupPicker` props

| Prop               | Type                                  | Default       | Meaning                                                                 |
| ------------------ | ------------------------------------- | ------------- | ----------------------------------------------------------------------- |
| `lookup`           | `LookupCapabilities<TValue, TMeta>`   | required      | the lookup to search, usually from `useTableLookup()`                   |
| `value`            | `TValue \| null`                      | required      | the chosen id                                                           |
| `onChange`         | `(value: TValue \| null) => void`     | required      | called with the picked id, or `null` when cleared                       |
| `itemDisplay`      | `LookupPickerItemDisplay`             | none          | how each option is drawn                                                |
| `selectedCaption`  | `"inline" \| "below"`                 | `"inline"`    | where a table lookup draws the chosen row's caption                     |
| `placeholder`      | `string`                              | `"Select..."` | input placeholder                                                       |
| `disabled`         | `boolean`                             | `false`       | disables the picker                                                     |
| `allowClear`       | `boolean`                             | `true`        | shows the clear button                                                  |
| `searchLimit`      | `number`                              | `50`          | the lookup search `limit`                                               |
| `id`               | `string`                              | none          | the input's id, for a `<label htmlFor>`                                 |
| `className`        | `string`                              | none          | classes for the input group, or for the outer element with `"below"`    |
| `ariaInvalid`      | `boolean`                             | none          | sets `aria-invalid` on the input                                        |
| `ariaDescribedBy`  | `string`                              | none          | sets `aria-describedby` on the input                                    |

```ts
type LookupPickerItemDisplay<TValue, TMeta> = {
  fields: readonly Extract<keyof TMeta, string>[];
  component?: ComponentType<LookupPickerItemProps<TValue, TMeta>>;
};

type LookupPickerItemProps<TValue, TMeta> = {
  entry: LookupEntry<TValue, TMeta> & { meta: TMeta };
  defaultContent: ReactNode;
};
```

- `itemDisplay.fields` are sent as the lookup search `fields`, so the search
  matches them. Without `component`, each option draws those fields of
  `entry.meta` side by side. Pass `Row` as the picker's second type argument,
  `LookupPicker<number, Row>`, so `fields` accepts column names.
- `itemDisplay.component` draws each option. Its `defaultContent` is the option
  as the table's label slot draws it, caption included; for a lookup that is not
  a table's row data, it is the entry's label.
- `itemDisplay` applies to options only. The chosen value is drawn with the
  table's label slot.
- Over a table's lookup, each option is drawn on the `"option"` surface and the
  chosen row on the `"selected"` surface. With `selectedCaption: "inline"` the
  caption is drawn inside the input group, at its end, and hidden while the
  search text is not empty. With `"below"` it is drawn on its own line under the
  field at full width; the line is kept while empty, so choosing a value does
  not move the content below.

## Row data store

A row data store holds, per table, the lookup entries (labels) and the computed
values of the rows it has seen, and the display slots that draw them. Each grid
session (`session.lookups`), each `useLookupStore()` component, and each
`ReportGridDataset` holds one.

```ts
function createLookupStore(options?: RowDataStoreOptions): RowDataStore;

type RowDataStoreOptions = {
  rowDisplays?: RowDisplays;
  tables?: () => readonly TableSchema[];
};

type RowDataStore = {
  table(tableName: string, narrowing?: LookupNarrowing): TableRowData;
  foreignKey(column: ColumnSchema): TableRowData | undefined;
  requireForeignKey(args: { tableName: string; column: ColumnSchema }): TableRowData;
  clear(): void;
  invalidateComputed(): void;
  reloadLabels(tableName?: string): void;
  readonly rowDisplays: RowDisplays;
  tableSchema(tableName: string): TableSchema | undefined;
};
```

- `rowDisplays` decides which computed fields lookups ask for. `tables` supplies
  the table schemas for each table's `rowCaption` and computed fields; it
  defaults to the tables the application's schema catalog has loaded.
- `invalidateComputed()` marks every table's computed values out of date. Rows
  on screen read them again, and the old values stay drawn until the new ones
  arrive.
- `reloadLabels(tableName)` reads that table's labels again and marks its
  cached searches stale; with no table, every table's.
- A store made with `createLookupStore()` is not connected to `invalidateRows`;
  connect it with `connectRowDataStore(store)`.

`TableRowData` is a table's `TableLookupSource` (`valueLookup` and
`searchLookup`) plus:

| Member                          | Contract                                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| `tableName`                     | the table's name                                                                               |
| `computedFor(id)`               | the known computed values of the row, by field; the object stays the same until a value changes |
| `hasComputed(id, fields)`       | whether every one of `fields` is known for the row                                             |
| `ensureComputed(ids, fields)`   | asks for the fields not known yet; calls in the same tick are sent as one lookup per table      |
| `storeComputed(values, sentAt)` | stores a response's `computed` member; values from a request sent before the latest invalidation are drawn but read again |
| `lookupComputedFields()`        | the computed fields sent with every lookup of the table                                        |
| `display()`, `labelSlot()`      | the table's display slots, and its `label` slot                                                |
| `schema()`                      | the table's schema, when loaded                                                                |
| `subscribeToComputed(listener)` | calls `listener` when a value is stored or the values are invalidated                          |
| `generation`                    | changes each time the values are invalidated                                                   |

Every lookup of a table carries its label slot's `needs`, its `rowCaption` when
that is a computed field, and the `referenceNeeds` of column slots on foreign
keys that point at the table. A field that a read could not return is not asked
for again until the next invalidation. An id the lookup does not return, such as
a row the user cannot see, has no values, and its slots draw `defaultContent`.

## Refresh rows after a write

```ts
function invalidateRows(tableName?: string): void;
function connectRowDataStore(store: RowDataStore): () => void;
```

- `invalidateRows(tableName)` calls `invalidateComputed()` on every connected
  store and `reloadLabels(tableName)`, which reads that table's labels again.
  With no table, every table's labels are read again.
- Grid sessions connect their stores for their lifetime, and `useLookupStore()`,
  `useTableLookup()`, and `ReportGridDataset` connect theirs while mounted.
- A write through a grid session refreshes its own store and calls the same
  invalidation on every other connected store. The New record page calls
  `invalidateRows(table)` after it creates a row.
- Call `invalidateRows()` after an application endpoint writes rows that
  Sapporta screens may show.
- `connectRowDataStore(store)` returns the function that disconnects the store.
- It refreshes row stores only; TanStack Query caches are invalidated
  separately.

## Display slots

```ts
type RowDisplays = Readonly<Record<string, TableDisplay>>;

type TableDisplay = {
  label?: Slot<LabelSlotProps>;
  columns?: Record<string, ColumnSlot>;
};

type Slot<P> = {
  needs?: readonly string[];
  referenceNeeds?: readonly string[];
  render?: ComponentType<P>;
};

type ColumnSlot = Slot<CellSlotProps> | Slot<ReferenceSlotProps>;
```

- `label` draws a row's identity: the level's own label column in grids (the
  first `rowLabelColumns` column the level shows, which is also the card title)
  and every reference to the row.
- `columns` draws one column of the table's own rows, by column name, in grid
  cells and in the record sheet. A slot on a foreign-key column receives the
  referenced row.
- `needs` lists computed fields of the drawn row that `render` reads.
  `referenceNeeds`, on a foreign-key column only, lists computed fields of the
  referenced row.
- `render` is drawn once every field in `needs` (and, for a reference,
  `referenceNeeds`) is known; until then `defaultContent` is drawn. A slot
  without `render` keeps the default drawing and still asks for its `needs`.
- A grid page read asks for the label slot's `needs` when the level shows its
  label column, and for the `needs` of the column slots of visible columns.
- In narrow cards, a column drawn by a slot with `render` stays visible when its
  own value is empty.

### Slot props

```ts
type Surface = "cell" | "option" | "selected" | "field" | "chip";

type DisplayContext = {
  as: "self" | "reference";
  surface: Surface;
  density: "compact" | "regular";
  source?: { table: string; column?: string; levelPath?: GridPath };
  hierarchyShown: boolean;
  selected?: boolean;
};

type ComputedRecord = Readonly<Record<string, Json>>;

type LabelSlotProps<TComputed = ComputedRecord> = {
  id: LookupValue;
  label: string;
  computed: TComputed;
  row?: Readonly<Row>;
  context: DisplayContext;
  defaultContent: ReactNode;
};

type CellSlotProps<TComputed = ComputedRecord> = {
  value: unknown;
  row: Readonly<Row>;
  computed: TComputed;
  context: DisplayContext;
  defaultContent: ReactNode;
};

type ReferenceSlotProps<TComputed = ComputedRecord> = CellSlotProps<TComputed> & {
  reference: { id: LookupValue; label: string; computed: ComputedRecord } | null;
};
```

| Surface      | Where it is drawn                                               | Default caption |
| ------------ | --------------------------------------------------------------- | --------------- |
| `"cell"`     | grid cells in table and card layouts, at any level; report reference cells | no   |
| `"option"`   | combobox options, grid editor options, filter checklist options | yes             |
| `"selected"` | beside a picker's input, for the chosen value                   | yes             |
| `"field"`    | a read-only value in the record sheet                           | yes             |
| `"chip"`     | a chosen row in a filter chip's summary                         | no; tooltip     |

- `density` is `"compact"` in grid cells and the grid editor, and `"regular"` in
  pickers, forms, the record sheet, and filters.
- `hierarchyShown` is `true` where the view already shows the row's place in its
  tree, such as a tree level's tree column. The default draws no caption there.
- `computed` holds only the fields in the slot's `needs`. `row` holds the row on
  its own label cell, and the lookup entry's visible fields for a reference when
  Sapporta has them.
- `defaultContent` for a label slot is the label with the caption under it where
  the surface shows one. On `"selected"` it is the caption alone, because the
  input shows the label.
- `reference` is `null` when the cell is empty or the referenced row is not
  loaded yet.

### Declaring, merging, and checking

| Function                                 | Contract                                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `defineRowDisplays(displays)`            | returns `displays`, keeping its literal type                                                   |
| `mergeRowDisplays(outer, inner)`         | merges `inner` over `outer` by table, then by slot; a slot set to `{}` restores the default    |
| `checkRowDisplays(displays, tables)`     | throws for a table column, computed field in `needs`, or `referenceNeeds` that does not exist, or `referenceNeeds` on a column that is not a foreign key; tables missing from `tables` are skipped |
| `tableDisplay(schemas, display)`         | types a table's slots by the Zod schemas of its computed fields                                |

`tableDisplay()` returns a `TableDisplay`. Its `needs` accept only the keys of
`schemas`, and `computed` is typed as `ComputedOf<S>`, each field's output type
or `null`. A slot still receives only the fields in its `needs`. The values are
not checked in the browser. Related types: `ComputedSchemas`, `ComputedOf`,
`TypedSlot`, and `TypedTableDisplay`.

A grid session runs `checkRowDisplays()` when it is created, against the
schemas of its levels and of the tables already loaded.

### Precedence

Each layer receives the layer below it as `defaultContent`:

1. A view's own `renderCell` (a TGrid column option, or a report's
   `renderCell`), or a `LookupPicker`'s `itemDisplay.component` for options.
2. The column's slot.
3. The table's label slot.
4. Sapporta's default drawing.

## Components and hooks

| Symbol                                 | Contract                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `RowDisplayProvider({ displays })`     | draws the rows inside it with `displays`, merged over any enclosing provider; keep `displays` stable, because a new value starts new grid sessions |
| `useRowDisplays()`                     | the merged displays of the nearest providers                                                     |
| `RowDataStoreProvider({ store })`      | makes `store` the store that `useRowComputed()` reads; `TGrid` provides its session's store       |
| `useRowDataStore()`                    | the nearest row store, or `null`                                                                 |
| `useRowComputed(table, id, fields)`    | the named computed values of one row: `undefined` until all are known, then exactly those fields; throws outside a row store |
| `RowLabel`                             | draws one row's identity with its table's label slot                                             |
| `DefaultRowLabel({ label, labelContent?, caption? })` | Sapporta's default identity drawing: the label, with the caption under it in muted text |
| `ColumnSlotCell`                       | draws one cell with a column slot, as grids and the record sheet do                              |
| `rowCaptionText(schema, computed, row)` | the caption text: `null` for no caption, `undefined` while a computed caption is not loaded     |
| `referenceEntryRenderer({ data, source, hierarchyShown })` | a grid lookup column `renderEntry` that draws entries with `data`'s label slot |

`useRowComputed()` asks for missing fields on mount and again after each
invalidation. Calls made in the same render are sent as one request per table.

### `RowLabel`

```tsx
<RowLabel
  data={store.table("accounts")}
  id={account.id}
  label={account.name}
  context={{
    as: "reference",
    surface: "field",
    density: "regular",
    hierarchyShown: false,
  }}
/>
```

`RowLabel` takes `data` (a table's row data), `id`, `label`, `context`, and
optionally `row` and `labelContent`, the node that draws the bare label, such as
link-styled text. It asks for the label slot's `needs` and, where the surface
shows a caption, the computed caption. It draws the slot's `render` once the
`needs` are known, and the default drawing until then.

## Cross to an address with `toRecordId`

A lookup id and a `RecordId` are separate types. Lookup entries carry the id as
the database column typed it, so an INTEGER primary key arrives as a JS number.
`RecordId` is that value in an address position — a URL path segment, a query
key, a grid row key — and is always a string, because those transports carry
only strings.

Component state holds the lookup id in its own type. `toRecordId()` marks each
crossing into an address:

```tsx
import { toRecordId } from "@sapporta/shared/record-id";
import { tableRecordQueryOptions } from "@sapporta/frontend/table/query";

const account = useQuery(
  tableRecordQueryOptions({
    tableName: "accounts",
    recordId: toRecordId(accountId),
  }),
);
```

`toRecordId()` accepts `string | number` and returns `RecordId`. It names the
boundary that a bare `String()` leaves unmarked, and it holds for INTEGER and
UUID primary keys alike.

## Compare lookup values by type and value

`lookupValueEquals()` performs item equality and `lookupValueKey()` produces
React keys. Both tag the value with its runtime type:

```ts
lookupValueKey(value); // `${typeof value}:${String(value)}`
```

The number `1` and the string `"1"` therefore produce different keys and never
compare equal. A numeric id that has been widened to a string stops matching its
own lookup entry, which is the failure `toRecordId()` at an explicit boundary
prevents.

## Related documentation

- [Show rows with their captions and display slots](/docs/guides/generated-surfaces/row-captions-and-display-slots/)
- [Computed fields and row captions](/docs/guides/model-data/computed-fields-and-row-captions/)
- [Pick a related row](/docs/guides/application-code/custom-forms-and-validation/#pick-a-related-row)
- [Relationships and lookup behavior](/docs/guides/model-data/relationships-and-lookup-behavior/)
- [Generated lookups and CSV export](/docs/guides/generated-surfaces/generated-lookups-and-csv-export/)
- [Custom forms and validation](/docs/guides/application-code/custom-forms-and-validation/)
- [Table query options](/docs/reference/frontend/table-query-options/)
- [Server write values and contracts](/docs/reference/schema/semantic-values/server-write-values-and-contracts/)
