---
title: "@sapporta/server/table"
package: "@sapporta/server"
version: "0.10.0"
specifier: "@sapporta/server/table"
---

> Sapporta API reference for `@sapporta/server@0.10.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/server/table

Import from `@sapporta/server/table`. Documented from `@sapporta/server@0.10.0`; confirm the installed version with `node -p "require('@sapporta/server/package.json').version"`.

37 symbols documented here.

## Types (20)

### ChildMeta

Declares a has-many child relationship for grid display

```ts
interface ChildMeta {
    /** SQL name of the child table */
    table: string;
    /** FK column in the child table that references this parent's PK */
    foreignKey: string;
    /** Display label (defaults to child table's label) */
    label?: string;
    /** Columns to show in nested grid (defaults to all non-PK, non-FK, non-timestamp cols) */
    columns?: string[];
    /** Default sort: "column" or "-column" (defaults to PK asc) */
    defaultSort?: string;
    /** Width hint in approximate character count (same as ColumnMeta.width) */
    width?: number;
}
```

### ColumnMeta

Per-column metadata for display and behavior

```ts
interface ColumnMeta {
  kind: …;
  displayFormat: …;
  textDisplay: …;
  label: …;
  visuallyHidden: …;
  width: …;
  minWidth: …;
  maxWidth: …;
  additive: …;
  colorRule: …;
  zeroDisplay: …;
  strong: …;
  notes: …;
  apiWritable: …;
  gridEditable: …;
  links: …;
}
// 16 members; inferred types elided. Read the full type from the declaration file if needed.
```

### ComputedBatch

The rows one loader run computes values for, and what the loader may use to compute them.

```ts
interface ComputedBatch<TTable extends AnySQLiteTable = AnySQLiteTable> {
    /** The table whose rows these are. */
    readonly table: TableDef<TTable>;
    /** The rows to compute for, as primary keys, in the order the read
     *  returned them. Read the rows themselves, or other tables, through
     *  `scopedRows(batch.db, batch.auth, table)`. */
    readonly ids: readonly RecordId[];
    /**
     * Runs `compute` once per batch for each `key`, and gives every caller the
     * same result. Use it when two fields come from one query, such as buy and
     * sell volume from one scan of trades, or when one field is built from
     * another's values: both call the same function through `once`.
     */
    once<T>(key: string, compute: () => Promise<T>): Promise<T>;
    readonly db: BetterSQLite3Database;
    /** The auth of the request. Read other tables through
     *  `scopedRows(batch.db, batch.auth, table)`, so values never come from rows
     *  the request may not read. */
    readonly auth: SapportaAuthContext;
}
```

### ComputedField

One computed field of a table.

```ts
interface ComputedField<TTable extends AnySQLiteTable = AnySQLiteTable, TValue extends Json = Json> {
    /** How the value reads. It chooses the default formatting, and it is listed
     *  in the table's metadata. */
    kind: ComputedFieldKind;
    /** Display label. Defaults to the name in title case, as for columns. */
    label?: string;
    /** Notes on what the value means, shown in the table's metadata. */
    notes?: string;
    /**
     * Schema of one value. Every value except `null` is checked against it,
     * and it documents the value in the generated OpenAPI.
     */
    schema?: z.ZodType<TValue>;
    /**
     * Computes the values for a batch of rows. It runs inside reads, including
     * the lookups a picker sends while someone types, so it must not write.
     */
    load: ComputedFieldLoader<TTable, TValue>;
    /** Set by `treePath()`: the field is a tree table's parent path, joined
     *  with `separator`. `meta.tree.path` names such a field. */
    treePath?: {
        readonly separator: string;
    };
}
```

### ComputedFieldKind

How a computed value reads.

```ts
type ComputedFieldKind = ValueKind | "json";
```

### ComputedFieldLoader

Computes a field's values for a batch of rows.

```ts
type ComputedFieldLoader<TTable extends AnySQLiteTable = AnySQLiteTable, TValue extends Json = Json> = (batch: ComputedBatch<TTable>) => Promise<ReadonlyMap<RecordId, TValue | null>> | ReadonlyMap<RecordId, TValue | null>;
```

### SapportaMeta

Normalized Sapporta metadata attached to a TableDef.

```ts
interface SapportaMeta {
    /** Display label for the table */
    label: string;
    /** Columns whose values build a row's human-readable label — used in FK
     *  dropdowns, lookup responses, and anywhere a row is referenced rather
     *  than displayed in full. Multiple columns are concatenated with a space. */
    rowLabelColumns: readonly [string, ...string[]];
    /** Whether records are immutable (no update/delete) */
    immutable: boolean;
    /**
     * Declares the row isolation boundary used by built-in table operations and
     * reference validation helpers.
     */
    rowScope: RowScope;
    /**
     * Explicit reference rules keyed by source SQL column name. Use this for
     * logical FKs that do not have Drizzle .references() metadata, or to mark
     * proven FK columns as server-managed with apiSettable: false.
     */
    references: Record<string, ReferenceRule>;
    /** Default sort order applied when no explicit sort is requested.
     *  Accepts a Drizzle orderBy expression: `desc(myTable.date)` or `asc(myTable.name)`.
     *  Server-only — does not serialize to the UI schema API. */
    defaultSort?: SQL;
    /** Has-many child relationships for nested grid display */
    children: ChildMeta[];
    /**
     * Row-level navigation links (related data, drill-down reports), in
     * addition to the drill-into links Sapporta derives from `children`.
     * Offered in the row's context menu in table and report UIs.
     */
    rowLinks: NavLink[];
    /** Per-column metadata keyed by column name */
    columns: Record<string, ColumnMeta>;
    /**
     * Values that represent a row during table search. Search is enabled for all
     * visible application columns by default.
     */
    search: NormalizedTableSearch;
    /** Same-table parent/child rows. Absent for an ordinary flat table. */
    tree?: TreeMeta;
    /**
     * A column or computed field whose text the default display of a row draws
     * under its label, such as an account's parent path. It shows wherever the
     * row is shown or referenced: pickers, the record sheet, and grid cells
     * that opt in.
     */
    rowCaption?: string;
}
```

### SapportaTableInputMeta

Sparse public metadata accepted by `sapportaTable()`.

```ts
type SapportaTableInputMeta = Omit<SapportaMeta, SapportaMetaDefaultedField> & {
    label?: string;
    immutable?: boolean;
    references?: Record<string, ReferenceRule>;
    children?: ChildMeta[];
    rowLinks?: NavLink[];
    columns?: Record<string, ColumnMeta>;
    /** Defaults to `"allColumns"`. Use `false` to disable table search. */
    search?: TableSearch;
    /** Rows of this table form a tree through a self-referencing column. */
    tree?: TreeMetaInput;
    /**
     * Defaults to `workspaceUserScoped`, the strictest row boundary. Use
     * `workspaceGlobal` or `systemGlobal` only for data that intentionally has a
     * broader visibility boundary.
     */
    rowScope?: RowScope;
};
```

### SearchSelf

Values from the current table node that participate in table search.

```ts
type SearchSelf = false | "allColumns" | readonly string[];
```

### TableDef

The complete table description consumed by Sapporta.

```ts
interface TableDef<TTable extends AnySQLiteTable = AnySQLiteTable> {
    /** The Drizzle SQLite table object */
    drizzle: TTable;
    /** SQL table name extracted from the Drizzle table */
    sqlName: string;
    /** Sapporta metadata */
    meta: SapportaMeta;
    /** Computed fields by name, as declared in `TableOptions`. */
    computed?: Readonly<Record<string, ComputedField>>;
    /** Runtime form of the application validation declared in `TableOptions`. */
    validate?(value: Readonly<Record<string, unknown>>, context: {
        operation: "insert" | "patch";
        addIssue(field: string, message: string): void;
    }): void;
}
```

### TableOptions

Options for the sapportaTable() function

```ts
interface TableOptions<TTable extends AnySQLiteTable> {
    /** The Drizzle sqliteTable definition */
    drizzle: TTable;
    /** Sapporta metadata */
    meta: SapportaTableInputMeta;
    /**
     * Adds operation-aware application issues after structural parsing.
     *
     * For an insert, auth and other trusted server code have already added their
     * required fields. For a patch, `value` contains only the submitted fields.
     * Field keys are inferred public SQL column names.
     */
    validate?(value: TableValidationValue<TTable>, context: TableValidationContext<TTable>): void;
    /**
     * Values of each row that the server computes when a read asks for them by
     * name, such as an account's parent path or an item's stock on hand. Their
     * names must differ from the column names.
     */
    computed?: Record<string, ComputedField<TTable>>;
}
```

### TableSearch

Describes the values that represent one root row during table search.

```ts
type TableSearch = false | "allColumns" | {
    self?: SearchSelf;
    children?: Readonly<Record<string, TableSearch>>;
};
```

### TableValidation

Application validation that runs after Sapporta's structural write parser.

```ts
type TableValidation<TTable extends AnySQLiteTable> = (value: TableValidationValue<TTable>, context: TableValidationContext<TTable>) => void;
```

### TableValidationContext

```ts
interface TableValidationContext<TTable extends AnySQLiteTable> {
    /** Inserts contain the prepared row; patches contain only submitted fields. */
    operation: "insert" | "patch";
    /** Attach an issue to a public SQL column name, or to `$` for the row. */
    addIssue(field: TableValidationField<TTable>, message: string): void;
}
```

### TableValidationField

```ts
type TableValidationField<TTable extends AnySQLiteTable> = (keyof InferInsertModel<TTable, {
    dbColumnNames: true;
}> & string) | "$";
```

### TableValidationValue

```ts
type TableValidationValue<TTable extends AnySQLiteTable> = Readonly<Partial<CanonicalInsertValue<TTable>>>;
```

### TreeMeta

`TreeMetaInput` with its defaults resolved.

```ts
type TreeMeta = TableTree;
```

### TreeMetaInput

Declares that the rows of a table form a tree: each row may name a parent row of the same table, such as an account's `parent_id`.

```ts
interface TreeMetaInput {
    /** Nullable column that is a foreign key to this table's primary key. */
    parentColumn: string;
    /** Column that shows the hierarchy. Defaults to the first row label column. */
    column?: string;
    /** Whether rows start expanded. Defaults to `true`. */
    defaultExpanded?: boolean;
    /**
     * What a search or filter keeps besides the matching rows. Defaults to
     * `"ancestors-and-descendants"`: each match's ancestors and its whole
     * subtree. `"ancestors"` keeps only the ancestors.
     */
    matchContext?: TreeMatchContext;
    /**
     * Orders the top-level rows by the values of one column, such as
     * `{ column: "account_type", values: ["Asset", "Liability", "Equity",
     * "Revenue", "Expense"] }`. Top-level rows whose value is not listed come
     * last. Within one value, and below the top level, rows follow
     * `defaultSort`. The table page's tree and the table's pickers use this
     * order; a sort the user picks replaces it.
     */
    rootOrder?: {
        column: string;
        values: readonly string[];
    };
    /**
     * The computed field, made with `treePath()`, that gives each row's parent
     * path. A picker on the table draws a chosen row with this path before its
     * name, and each search match with its path.
     */
    path?: string;
}
```

### TreePathOptions

```ts
interface TreePathOptions {
    /** Placed between two ancestors' labels. Defaults to `" > "`. */
    separator?: string;
    /** Column whose value names each ancestor. Defaults to the row label. */
    column?: string;
    /** Display label of the field. */
    label?: string;
}
```

### TreePathRelationOptions

```ts
interface TreePathRelationOptions {
    /** Name of the relation in the `with recursive` list. Defaults to
     *  `tree_paths`. */
    name?: string;
    /** Placed between two ancestors' labels. Defaults to `" > "`. */
    separator?: string;
    /** Column whose value names each row. Defaults to the row label. */
    column?: string;
}
```

## Functions and components (16)

### bool

```ts
function bool<TName extends string>(name: TName): import("drizzle-orm/sqlite-core").SQLiteBooleanBuilderInitial<TName>;
```

### computedField

Declares a computed field.

```ts
function computedField<TTable extends AnySQLiteTable = AnySQLiteTable, TValue extends Json = Json>(field: ComputedField<TTable, TValue>): ComputedField<TTable, TValue>;
```

### date

`TEXT` (ISO `YYYY-MM-DD`) + kind `"date"`.

```ts
function date<TName extends string>(name: TName): import("drizzle-orm/sqlite-core").SQLiteCustomColumnBuilder<{
    name: "";
    dataType: "custom";
    columnType: "SQLiteCustomColumn";
    data: Temporal.PlainDate;
    driverParam: string;
    enumValues: undefined;
}>;
```

### index

Re-exported from `drizzle-orm`. See that package for its declaration.

### integer

Re-exported from `drizzle-orm`. See that package for its declaration.

### isAutoManagedTimestampColumn

```ts
function isAutoManagedTimestampColumn(name: string): boolean;
```

### money

```ts
function money<TName extends string>(name: TName): import("drizzle-orm/sqlite-core").SQLiteRealBuilderInitial<TName>;
```

### number

```ts
function number<TName extends string>(name: TName): import("drizzle-orm/sqlite-core").SQLiteRealBuilderInitial<TName>;
```

### percentage

```ts
function percentage<TName extends string>(name: TName): import("drizzle-orm/sqlite-core").SQLiteRealBuilderInitial<TName>;
```

### sapportaTable

Define the joined table description used throughout Sapporta.

```ts
function sapportaTable<TTable extends AnySQLiteTable>(options: TableOptions<TTable>): TableDef<TTable>;
```

### select

A text column whose allowed values are declared once on the Drizzle column.

```ts
function select<const TOptions extends readonly [string, ...string[]], TName extends string>(name: TName, options: TOptions): import("drizzle-orm/sqlite-core").SQLiteTextBuilderInitial<TName, import("drizzle-orm").Writable<TOptions>, number | undefined>;
```

### text

```ts
function text<TName extends string>(name: TName): import("drizzle-orm/sqlite-core").SQLiteTextBuilderInitial<TName, [string, ...string[]], number | undefined>;
```

### timestamp

`TEXT` (canonical `YYYY-MM-DDTHH:mm:ssZ`) + kind `"timestamp"`.

```ts
function timestamp<TName extends string>(name: TName): import("drizzle-orm/sqlite-core").SQLiteCustomColumnBuilder<{
    name: "";
    dataType: "custom";
    columnType: "SQLiteCustomColumn";
    data: Temporal.Instant;
    driverParam: string;
    enumValues: undefined;
}>;
```

### treePath

A computed field for a table with `meta.tree`: the labels of each row's ancestors, from the top down, joined by `separator`.

```ts
function treePath(options?: TreePathOptions): ComputedField;
```

### treePathRelation

The paths of a tree table's rows as a SQL relation, for reports and other code that runs raw SQL.

```ts
function treePathRelation(table: TableDef, auth: SapportaAuthContext, options?: TreePathRelationOptions): SQL;
```

### uniqueIndex

Re-exported from `drizzle-orm`. See that package for its declaration.

## Values, classes, and namespaces (1)

### sqliteTable

Re-exported from `drizzle-orm`. See that package for its declaration.
