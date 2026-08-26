---
title: "@sapporta/server/table"
package: "@sapporta/server"
version: "0.6.0"
specifier: "@sapporta/server/table"
---

> Sapporta API reference for `@sapporta/server@0.6.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/server/table

Import from `@sapporta/server/table`. Documented from `@sapporta/server@0.6.0`; confirm the installed version with `node -p "require('@sapporta/server/package.json').version"`.

26 symbols documented here.

## Types (12)

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
  links: …;
}
// 15 members; inferred types elided. Read the full type from the declaration file if needed.
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

## Functions and components (13)

### bool

```ts
function bool<TName extends string>(name: TName): import("drizzle-orm/sqlite-core").SQLiteBooleanBuilderInitial<TName>;
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

### uniqueIndex

Re-exported from `drizzle-orm`. See that package for its declaration.

## Values, classes, and namespaces (1)

### sqliteTable

Re-exported from `drizzle-orm`. See that package for its declaration.
