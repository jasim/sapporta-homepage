---
title: "@sapporta/frontend/lookup"
package: "@sapporta/frontend"
version: "0.12.0"
specifier: "@sapporta/frontend/lookup"
---

> Sapporta API reference for `@sapporta/frontend@0.12.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/frontend/lookup

Import from `@sapporta/frontend/lookup`. Documented from `@sapporta/frontend@0.12.0`; confirm the installed version with `node -p "require('@sapporta/frontend/package.json').version"`.

63 symbols documented here.

## Types (30)

### CachedTableLookupSource

A table lookup source whose caches can be read again after a write.

```ts
type CachedTableLookupSource = {
    valueLookup: CachedValueLookup<LookupValue, Row>;
    searchLookup: TableSearchLookup;
    treeLookup: CachedTreeLookup;
};
```

### CellSlotProps

Props of a `columns` slot: one cell of the table's own rows.

```ts
type CellSlotProps<TComputed = ComputedRecord> = SlotPropsBase & {
    /** The cell's column value. */
    value: unknown;
    row: Readonly<Row>;
    /** The values of the fields the slot `needs`, for this row. */
    computed: TComputed;
};
```

### ColumnSlot

A slot on one column of a table.

```ts
type ColumnSlot = Slot<CellSlotProps> | Slot<ReferenceSlotProps>;
```

### ComputedOf

The values a typed slot receives: each field's value, or `null` for a row that has no value.

```ts
type ComputedOf<S extends ComputedSchemas> = {
    readonly [K in keyof S]: z.output<S[K]> | null;
};
```

### ComputedRecord

Computed field values of one row, by field name.

```ts
type ComputedRecord = Readonly<Record<string, Json>>;
```

### ComputedSchemas

Value schemas of a table's computed fields, by field name.

```ts
type ComputedSchemas = Readonly<Record<string, z.ZodType>>;
```

### DisplayContext

What a slot knows about the place it draws in.

```ts
type DisplayContext = {
    /** Drawn as the row itself, or as a reference to it from another row. */
    as: "self" | "reference";
    surface: Surface;
    /** Grid cells and the grid editor are compact; pickers, forms and the
     *  record sheet are regular. */
    density: "compact" | "regular";
    /** The table, column and grid level showing the row. */
    source?: {
        table: string;
        column?: string;
        levelPath?: GridPath;
    };
    /** The view already shows where this row sits in its table's tree, so a
     *  parent path under the label would repeat it. */
    hierarchyShown: boolean;
    /** For options: the current value. */
    selected?: boolean;
    /** For options in a tree picker, set only on the row being edited, such as
     *  the account whose parent is being chosen: the words drawn after its
     *  label, the picker's `labels.editing`. The row is drawn where it sits, so
     *  the person sees it, but it cannot be picked. */
    editingNote?: string;
};
```

### LabelSlotProps

Props of a `label` slot: a row's identity.

```ts
type LabelSlotProps<TComputed = ComputedRecord> = SlotPropsBase & {
    id: LookupValue;
    /** The row label, built from the table's `rowLabelColumns`. */
    label: string;
    /** The values of the fields the slot `needs`. */
    computed: TComputed;
    /** The row, when it is drawn as itself (`context.as === "self"`). */
    row?: Readonly<Row>;
};
```

### LookupComputedRequest

What one lookup asks for beside its entries, and where it stores them.

```ts
type LookupComputedRequest = {
    fields: readonly string[];
    /** Receives the response's computed values, before its entries are stored. */
    store(values: ComputedValues): void;
};
```

### LookupForColumn

```ts
type LookupForColumn<TMeta = unknown> = (column: ColumnSchema) => LookupCapabilities<LookupValue, TMeta> | undefined;
```

### LookupNarrowing

Narrows a lookup's choices.

```ts
type LookupNarrowing = {
    /** Conditions in the list filter grammar, such as accounts of one type. */
    filter?: readonly FilterDraftCondition[];
    /** Leaves out this row of a tree table and the rows below it, such as when
     *  choosing a row's parent. */
    notUnder?: LookupValue;
};
```

### LookupPickerItemDisplay

Choose table-like fields or a React component for each dropdown item.

```ts
type LookupPickerItemDisplay<TValue extends LookupValue = LookupValue, TMeta = unknown> = {
    /** Fields rendered by this item and therefore included in lookup search.
     *  The options' `entry.meta` holds every visible column either way. */
    fields: readonly Extract<keyof TMeta, string>[];
    component?: ComponentType<LookupPickerItemProps<TValue, TMeta>>;
};
```

### LookupPickerItemProps

```ts
type LookupPickerItemProps<TValue extends LookupValue = LookupValue, TMeta = unknown> = {
    entry: LookupEntry<TValue, TMeta> & {
        meta: TMeta;
    };
    /** What the option draws without this component: for a table's lookup, the
     *  row through the table's label slot; otherwise the label. Return it, or
     *  wrap it, to keep the table's caption. */
    defaultContent: ReactNode;
};
```

### LookupPickerLabels

What a picker says, for wording in the application's own terms, such as "Make it a top-level account" for the clear button of a parent picker.

```ts
type LookupPickerLabels = {
    /** The clear button's accessible name. Default: "Clear selection". */
    clear?: string;
    /** The button that opens the list, its accessible name. Default:
     *  "Open popup". */
    open?: string;
    /** The list when nothing matches. Default: "No results." */
    empty?: string;
    /** A tree picker's list while the tree is read. Default: "Loading…" */
    loading?: string;
    /** A tree picker's list when the tree is too large to send. Default:
     *  "Too many rows to show here. Type to search." */
    tooLarge?: string;
    /** A tree picker's list when the tree could not be read. Default:
     *  "Could not load the choices." */
    loadFailed?: string;
    /** Drawn after the label of the row being edited, in a tree picker
     *  narrowed with `notUnder`. Default: "(being edited)". */
    editing?: string;
};
```

### LookupPickerProps

```ts
type LookupPickerProps<TValue extends LookupValue = LookupValue, TMeta = unknown> = {
    lookup: LookupCapabilities<TValue, TMeta>;
    value: TValue | null;
    onChange: (value: TValue | null) => void;
    /** Draws each option. The chosen value's caption keeps the table's label
     *  slot. */
    itemDisplay?: LookupPickerItemDisplay<TValue, TMeta>;
    /** Where a table's lookup draws the chosen row's caption: `"inline"` inside
     *  the field, at its end; `"below"` on a line of its own under the field,
     *  at full width. The line under the field is kept even while it is empty,
     *  so picking a value never moves what follows. A tree picker draws no
     *  caption: the chosen row's parent path sits before its name. */
    selectedCaption?: "inline" | "below";
    /**
     * For a lookup of a table that declares `meta.tree`: `true` (the default)
     * draws the table as an indented tree, lists a search's matches with their
     * parent paths, and shows the chosen row's parent path before its name.
     * `false` draws the flat search list of any other table.
     */
    tree?: boolean;
    /** The picker's wording; see `LookupPickerLabels`. */
    labels?: LookupPickerLabels;
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;
    searchLimit?: number;
    id?: string;
    className?: string;
    ariaInvalid?: boolean;
    ariaDescribedBy?: string;
};
```

### LookupSearchMode

Where a lookup's search runs: - `"server"`: in SQL on the server, for any table, however large.

```ts
type LookupSearchMode = "server" | "client";
```

### LookupStore

```ts
type LookupStore<TMeta = unknown> = {
    /** A table's lookup; with `narrowing`, its search offers only the rows
     *  that match. `options.search` says where the search runs; see
     *  `LookupSearchMode`. */
    table(tableName: string, narrowing?: LookupNarrowing, options?: {
        search?: LookupSearchMode;
    }): LookupCapabilities<LookupValue, TMeta>;
    foreignKey: LookupForColumn<TMeta>;
    requireForeignKey(args: {
        tableName: string;
        column: ColumnSchema;
    }): LookupCapabilities<LookupValue, TMeta>;
    clear(): void;
};
```

### ReferenceSlotProps

Props of a `columns` slot on a foreign-key column.

```ts
type ReferenceSlotProps<TComputed = ComputedRecord> = CellSlotProps<TComputed> & {
    /** The referenced row, with the values of `referenceNeeds`, or `null`
     *  when the cell is empty or the row is not loaded yet. */
    reference: {
        id: LookupValue;
        label: string;
        computed: ComputedRecord;
    } | null;
};
```

### RowDataStore

A `LookupStore` that also holds the computed values of the rows it has seen, and the display slots that draw them.

```ts
type RowDataStore = {
    /** A table's row data. With `narrowing`, its search offers only the rows
     *  that match; `options.search` says where the search runs. Each
     *  narrowing and search has its own caches. */
    table(tableName: string, narrowing?: LookupNarrowing, options?: {
        search?: LookupSearchMode;
    }): TableRowData;
    foreignKey(column: Parameters<LookupStore["foreignKey"]>[0]): TableRowData | undefined;
    requireForeignKey(args: Parameters<LookupStore["requireForeignKey"]>[0]): TableRowData;
    clear(): void;
    /**
     * Marks every table's computed values as out of date, so the rows on
     * screen read them again. The old values stay drawn until the new ones
     * arrive. Call it after a write, since a value may depend on any row.
     */
    invalidateComputed(): void;
    /** Reads a table's labels again, such as after its rows were edited;
     *  every table's labels when no table is named. */
    reloadLabels(tableName?: string): void;
    /** The display slots the rows of this store are drawn with. */
    readonly rowDisplays: RowDisplays;
    /** The schema of a table, when it is loaded. */
    tableSchema(tableName: string): TableSchema | undefined;
};
```

### RowDataStoreOptions

```ts
type RowDataStoreOptions = {
    /** Display slots by table. Their `needs` decide which computed fields
     *  lookups ask for. */
    rowDisplays?: RowDisplays;
    /** The table schemas, for each table's `rowCaption` and computed fields.
     *  Defaults to the tables the app's schema catalog has loaded. */
    tables?: () => readonly TableSchema[];
};
```

### RowDisplays

Display slots by table name.

```ts
type RowDisplays = Readonly<Record<string, TableDisplay>>;
```

### Slot

```ts
type Slot<P> = {
    /** Computed fields of the drawn row that `render` reads. Sapporta asks for
     *  them wherever the slot is drawn, and draws `render` once all are known. */
    needs?: readonly string[];
    /** On a foreign-key column: computed fields of the referenced row. */
    referenceNeeds?: readonly string[];
    /** Leave it out to keep the default drawing, while still asking for
     *  `needs`. To draw differently on some surfaces, branch on
     *  `context.surface`, and return `defaultContent` where the default
     *  should stay. */
    render?: ComponentType<P>;
};
```

### Surface

Where a row is drawn: - `"cell"`: a grid cell, in table or card layout, at any level; - `"option"`: an option in a combobox or a filter checklist; - `"selected"`: beside a picker's input, for the chosen value; - `"field"`: a read-only value in the record sheet; - `"chip"`: inside a filter chip's one-line summary.

```ts
type Surface = "cell" | "option" | "selected" | "field" | "chip";
```

### TableDisplay

How the rows of one table are drawn.

```ts
type TableDisplay = {
    /** A row's identity: its own label cell, and every reference to it. */
    label?: Slot<LabelSlotProps>;
    /** One cell of this table's own rows, by column name. A slot on a
     *  foreign-key column also decides how this table draws its references. */
    columns?: Record<string, ColumnSlot>;
};
```

### TableLookupSource

```ts
type TableLookupSource = {
    valueLookup: ValueLookup<LookupValue, Row>;
    searchLookup: SearchLookup<LookupValue, Row>;
    /** The table's rows as a tree, for a table that declares `meta.tree`. */
    treeLookup: CachedTreeLookup;
};
```

### TableRowData

Everything a store knows about the rows of one table, keyed by id: the lookup entries (labels) and the computed field values.

```ts
type TableRowData = TableLookupSource & {
    readonly tableName: string;
    /** Computed values known for this row, by field. The reference stays the
     *  same until a value changes. */
    computedFor(id: LookupValue): ComputedRecord | undefined;
    /** Whether every one of `fields` is known for the row. */
    hasComputed(id: LookupValue, fields: readonly string[]): boolean;
    /**
     * Asks for the fields of these rows that are not known yet. Calls made in
     * the same tick are sent together, as one lookup per table. A field that
     * could not be read is not asked for again until the values are
     * invalidated.
     */
    ensureComputed(ids: readonly LookupValue[], fields: readonly string[]): Promise<void>;
    /**
     * Stores the `computed` member of a response for this table. `sentAt` is
     * the `generation` when the request was sent: values from a request sent
     * before the latest invalidation are drawn but read again.
     */
    storeComputed(values: ComputedValues, sentAt: number): void;
    /** Computed fields sent with every lookup of this table, so references
     *  arrive with what their default display draws. */
    lookupComputedFields(): readonly string[];
    /** The table's display slots, from the store's `rowDisplays`. */
    display(): TableDisplay | undefined;
    /** The table's `label` slot, if it declares one. */
    labelSlot(): Slot<LabelSlotProps> | undefined;
    /** The table's schema, when it is loaded. */
    schema(): TableSchema | undefined;
    /** Called whenever a value is stored or the values are invalidated. */
    subscribeToComputed(listener: () => void): () => void;
    /** Changes each time the values are invalidated. */
    readonly generation: number;
};
```

### TableSearchLookup

A table's search, whose cached results can be read again after a write.

```ts
type TableSearchLookup = SearchLookup<LookupValue, Row> & {
    /** Marks every cached search as out of date, such as after a write. */
    markSearchesStale(): void;
};
```

### TreeLookupState

What a tree lookup holds: the tree it last read, and whether a read is under way or failed.

```ts
type TreeLookupState = {
    readonly entries: readonly LookupTreeEntry[];
    readonly status: "idle" | "loading" | "ready" | "error";
    readonly error?: unknown;
};
```

### TypedSlot

A slot whose `needs` are the names in `S`.

```ts
type TypedSlot<S extends ComputedSchemas, P> = {
    needs?: readonly Extract<keyof S, string>[];
    referenceNeeds?: readonly string[];
    render?: ComponentType<P>;
};
```

### TypedTableDisplay

A table's display slots, typed by its computed field schemas.

```ts
type TypedTableDisplay<S extends ComputedSchemas> = {
    label?: TypedSlot<S, LabelSlotProps<ComputedOf<S>>>;
    columns?: Record<string, TypedSlot<S, CellSlotProps<ComputedOf<S>>> | TypedSlot<S, ReferenceSlotProps<ComputedOf<S>>>>;
};
```

## Functions and components (31)

### buildLookupSearchQuery

```ts
function buildLookupSearchQuery(searchText: string, limit?: number, fields?: readonly string[], computed?: readonly string[]): {
    q: string;
    limit?: string;
    fields?: string;
    computed?: string;
};
```

### buildLookupValueQuery

```ts
function buildLookupValueQuery(values: readonly LookupValue[], computed?: readonly string[]): {
    ids: string;
    computed?: string;
};
```

### checkRowDisplays

Checks display slots against the table schemas, and throws on a table, column or computed field that does not exist.

```ts
function checkRowDisplays(displays: RowDisplays, tables: readonly TableSchema[]): void;
```

### ColumnSlotCell

Draws one cell of a table's own rows with the column's slot.

```ts
function ColumnSlotCell({ data, slot, id, value, row, context, defaultContent, reference, }: {
    /** The row data of the cell's own table. */
    data: TableRowData;
    slot: ColumnSlot;
    id: LookupValue;
    value: unknown;
    row: Readonly<Row>;
    context: DisplayContext;
    defaultContent: ReactNode;
    /** For a foreign-key column: the referenced table's row data. */
    reference?: TableRowData;
}): string | number | bigint | boolean | import("react").JSX.Element | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import('react').ReactPortal | import('react').ReactElement<unknown, string | import('react').JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined;
```

### computedQuery

The `computed` query parameter, or nothing when no field is named.

```ts
function computedQuery(computed: readonly string[] | undefined): {
    computed?: string;
};
```

### connectRowDataStore

Keeps `store` current with `invalidateRows` until the returned function is called.

```ts
function connectRowDataStore(store: RowDataStore): () => void;
```

### createLookupStore

Creates a store of the rows a page shows, by table: their labels for references, and their computed field values.

```ts
function createLookupStore(options?: RowDataStoreOptions): RowDataStore;
```

### createTableLookupSource

```ts
function createTableLookupSource(tableName: string, 
/** Called as each lookup is sent. */
computed: (() => LookupComputedRequest) | undefined, 
/** Narrows the search; lookups by id are never narrowed. */
narrowing: LookupNarrowing | undefined, search: LookupSearchMode): CachedTableLookupSource;
```

### DefaultRowLabel

Sapporta's own drawing of a row's identity: the label, with the table's caption under it in smaller, muted text.

```ts
function DefaultRowLabel({ label, labelContent, caption, }: {
    label: string;
    /** What draws the label, when it is more than the text, such as a link. */
    labelContent?: ReactNode;
    caption?: string | null;
}): string | number | bigint | boolean | import("react").JSX.Element | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import('react').ReactPortal | import('react').ReactElement<unknown, string | import('react').JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined>;
```

### defineRowDisplays

Declares how rows are drawn, per table.

```ts
function defineRowDisplays<const T extends RowDisplays>(displays: T): T;
```

### fetchLookup

```ts
function fetchLookup(tableName: string, ids: readonly LookupValue[], computed?: readonly string[]): Promise<LookupResponse>;
```

### fetchLookupEntriesForSearch

```ts
function fetchLookupEntriesForSearch(args: {
    tableName: string;
    searchText: string;
    limit: number;
    fields?: readonly string[];
}): Promise<LookupSearchPage<LookupValue, Row>>;
```

### fetchLookupEntriesForValues

```ts
function fetchLookupEntriesForValues(tableName: string, values: readonly LookupValue[]): Promise<LookupEntry<LookupValue, Row>[]>;
```

### fetchLookupSearch

```ts
function fetchLookupSearch(tableName: string, searchText: string, limit?: number, fields?: readonly string[], computed?: readonly string[], narrowing?: LookupNarrowing): Promise<LookupResponse>;
```

### fetchLookupTree

Every row of a tree table that the narrowing lets through, with the ancestors that place it, in tree order.

```ts
function fetchLookupTree(tableName: string, computed?: readonly string[], narrowing?: LookupNarrowing): Promise<LookupTreeResponse>;
```

### invalidateRows

Tells every connected row store that rows changed: computed values are read again for the rows on screen, and the labels of `tableName` (every table's, when none is named) are read again.

```ts
function invalidateRows(tableName?: string): void;
```

### lookupEntriesFromResponse

```ts
function lookupEntriesFromResponse(response: LookupResponse): LookupEntry<LookupValue, Row>[];
```

### lookupNarrowingQuery

The query parameters of a narrowing.

```ts
function lookupNarrowingQuery(narrowing: LookupNarrowing | undefined): QueryParamRecord;
```

### LookupPicker

```ts
function LookupPicker<TValue extends LookupValue = LookupValue, TMeta = unknown>({ lookup, value, onChange, itemDisplay, selectedCaption, tree, labels, placeholder, disabled, allowClear, searchLimit, id, className, ariaInvalid, ariaDescribedBy, }: LookupPickerProps<TValue, TMeta>): import("react").JSX.Element;
```

### mergeRowDisplays

Merges `inner` over `outer`, by table and then by slot: a table in `inner` replaces only the slots it names.

```ts
function mergeRowDisplays(outer: RowDisplays, inner: RowDisplays): RowDisplays;
```

### referenceEntryRenderer

A `renderEntry` for a foreign-key column of `source.table`: it draws each referenced row with the label slot of the table it references.

```ts
function referenceEntryRenderer(args: {
    /** The row data of the referenced table. */
    data: TableRowData;
    source: DisplayContext["source"];
    hierarchyShown: boolean;
}): LookupEntryRenderer;
```

### rowCaptionText

The text a table's `rowCaption` gives a row: `null` when the table has no caption or the row has no value, `undefined` while a computed caption is not loaded yet.

```ts
function rowCaptionText(schema: TableSchema | undefined, computed: ComputedRecord | undefined, row: Readonly<Row> | undefined): string | null | undefined;
```

### RowDataStoreProvider

Makes `store` the row store that `useRowComputed` reads below it.

```ts
function RowDataStoreProvider({ store, children, }: {
    store: RowDataStore;
    children?: ReactNode;
}): import("react").JSX.Element;
```

### RowDisplayProvider

Draws the rows inside it with `displays`, merged over the displays of any enclosing provider: by table, then by slot.

```ts
function RowDisplayProvider({ displays, children, }: {
    displays: RowDisplays;
    children?: ReactNode;
}): import("react").JSX.Element;
```

### RowLabel

Draws one row's identity with its table's `label` slot: an option, a reference cell, the row's own label cell, a picker's selected value.

```ts
function RowLabel({ data, id, label, context, row, labelContent, }: {
    /** The row data of the row's table, from a row store. */
    data: TableRowData;
    id: LookupValue;
    label: string;
    context: DisplayContext;
    row?: Readonly<Row>;
    /** What draws the bare label, such as the grid's link-styled text. */
    labelContent?: ReactNode;
}): import("react").JSX.Element | null;
```

### tableDisplay

Types a table's display slots by the schemas of its computed fields, which the app declares once and uses on the server too:

```ts
function tableDisplay<S extends ComputedSchemas>(_schemas: S, display: TypedTableDisplay<S>): TableDisplay;
```

### useLookupStore

A row store for a component, such as a form page, that lives as long as the component.

```ts
function useLookupStore(): RowDataStore;
```

### useRowComputed

Computed values of one row, for components that draw outside the display slots, such as a custom cell:

```ts
function useRowComputed(table: string, id: LookupValue | null | undefined, fields: readonly string[]): Readonly<Record<string, Json>> | undefined;
```

### useRowDataStore

The nearest row store, or `null` outside a grid or provider.

```ts
function useRowDataStore(): RowDataStore | null;
```

### useRowDisplays

The display slots of the nearest `RowDisplayProvider`, merged with the providers around it.

```ts
function useRowDisplays(): RowDisplays;
```

### useTableLookup

Lookup capabilities for one table.

```ts
function useTableLookup<TValue extends LookupValue = LookupValue>(tableName: string, narrowing?: LookupNarrowing, options?: {
    search?: LookupSearchMode;
}): LookupCapabilities<TValue, Row>;
```

## Values, classes, and namespaces (2)

### CachedTreeLookup

The rows of a tree table as a tree picker draws them, read once and kept.

```ts
class CachedTreeLookup {
    private readonly loadTree;
    private current;
    private readonly listeners;
    private sent;
    constructor(loadTree: () => Promise<readonly LookupTreeEntry[]>);
    state(): TreeLookupState;
    /** Reads the tree, unless it was read already or is being read. */
    load(): void;
    /** Reads the tree again, if it was ever read. */
    reload(): void;
    subscribe(listener: () => void): () => void;
    private read;
    private set;
}
```

### DEFAULT_LOOKUP_PICKER_LABELS

Sapporta's wording, for each label a picker leaves out.

```ts
const DEFAULT_LOOKUP_PICKER_LABELS: Required<LookupPickerLabels>;
```
