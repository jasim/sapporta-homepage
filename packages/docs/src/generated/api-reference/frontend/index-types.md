---
title: "@sapporta/frontend — Types"
package: "@sapporta/frontend"
version: "0.6.0"
specifier: "@sapporta/frontend"
---

> Sapporta API reference for `@sapporta/frontend@0.6.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/frontend — Types

Import from `@sapporta/frontend`. Documented from `@sapporta/frontend@0.6.0`; confirm the installed version with `node -p "require('@sapporta/frontend/package.json').version"`.

97 of 189 symbols published from `@sapporta/frontend`. Other groups: [Functions and components](https://sapporta.com/api-reference/frontend/index-functions.md), [Values, classes, and namespaces](https://sapporta.com/api-reference/frontend/index-values.md).

### ClientColumnOptions

```ts
type ClientColumnOptions<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>> = {
    label?: string;
    width?: number | ColumnWidth;
    edit?: "default" | "none" | {
        editor?: "default" | ComponentType<TGridCellEditorContext<RowsByLevel, AppServices, LevelId, RowFieldName<RowsByLevel[LevelId]>>>;
        startsOn?: readonly CellEditGesture[];
    };
    activation?: TGridCellActivation<RowsByLevel, AppServices, LevelId>;
    renderCell?: ComponentType<TGridCellContext<RowsByLevel, AppServices, LevelId>>;
    copy?: TGridColumnCopyBehavior<RowsByLevel, AppServices, LevelId, unknown>;
};
```

### CreateDraftIssue

```ts
type CreateDraftIssue = FieldIssue;
```

### CreateTGridSessionArgs

```ts
type CreateTGridSessionArgs<RowsByLevel extends TGridRowsByLevel = TGridRowsByLevel, AppServices = unknown> = {
    services?: AppServices;
    onQueryUrlChange?: (state: {
        level: TGridLevelId<RowsByLevel>;
        page: number;
        sort: SortDescriptor[];
        filters: TypedFilterCondition[];
        search: string | null;
    }) => void;
    routeQuerySeeds?: Partial<Record<TGridLevelId<RowsByLevel>, TGridRouteQuerySeed>>;
    /** Handle loaded-row edges in the composition that owns the surrounding UI. */
    onLoadedRowsBoundary?: TGridLoadedRowsBoundaryHandler<RowsByLevel, AppServices>;
};
```

### DefineSchemaTGridArgs

```ts
type DefineSchemaTGridArgs = SchemaTGridConfigInput & {
    interaction?: GridInteractionConfig;
};
```

### FetchTableRowsParams

```ts
interface FetchTableRowsParams {
    tableName: string;
    page?: number;
    limit?: number;
    sort?: SortDescriptor[];
    filters?: readonly TypedFilterCondition[];
    search?: string;
}
```

### ForeignKeyRecordFormFieldModel

```ts
type ForeignKeyRecordFormFieldModel = Extract<RecordFormFieldModel, {
    kind: "foreignKey";
}>;
```

### KeyHint

```ts
interface KeyHint {
    /** The key glyph (e.g. "⌘K", "↵", "␣", "⇄"). Rendered in brand ink. */
    key: string;
    /** Short verb/description (e.g. "edit", "new row", "command"). */
    desc: string;
}
```

### LinkResolutionContext

```ts
type LinkResolutionContext = {
    /** The current row's values, keyed by source column name. */
    values: Readonly<Record<string, unknown>>;
    /** Optional display-label lookup for `kind: "table"` link destinations. */
    tableLabel?: (table: string) => string | undefined;
};
```

### PaginationRangeItem

```ts
type PaginationRangeItem = number | "ellipsis";
```

### ParseCreateDraftResult

```ts
type ParseCreateDraftResult = {
    ok: true;
    value: Record<string, unknown>;
} | {
    ok: false;
    issues: CreateDraftIssue[];
};
```

### RecordFormFieldModel

```ts
type RecordFormFieldModel = {
    kind: "text";
    column: ColumnSchema;
} | {
    kind: "number";
    column: ColumnSchema;
} | {
    kind: "currency";
    column: ColumnSchema;
} | {
    kind: "percentage";
    column: ColumnSchema;
} | {
    kind: "date";
    column: ColumnSchema;
} | {
    kind: "timestamp";
    column: ColumnSchema;
} | {
    kind: "checkbox";
    column: ColumnSchema;
} | {
    kind: "select";
    column: ColumnSchema;
    options: readonly string[];
} | {
    kind: "foreignKey";
    column: ColumnSchema;
    lookup: LookupCapabilities;
};
```

### RelatedRowsTableHrefInput

```ts
type RelatedRowsTableHrefInput = {
    tableName: string;
    foreignKey: string;
    parentRowId: string;
    routePath?: string;
};
```

### ResolvedLink

A `NavLink` resolved against one row's values: a concrete destination the UI can render as an anchor or a context-menu entry.

```ts
type ResolvedLink = {
    href: string;
    label: string;
    icon: LinkIcon;
    target: LinkTarget;
};
```

### RowFieldName

```ts
type RowFieldName<Row extends object = Record<string, unknown>> = keyof Row & string;
```

### SchemaTableGridSource

```ts
type SchemaTableGridSource = {
    rootTableName: string;
    tablesByName: Record<string, TableSchema>;
};
```

### SchemaTableGridViewProps

```ts
type SchemaTableGridViewProps = {
    /** Pass the table to show and any loaded schemas needed for expandable rows. */
    source: SchemaTableGridViewSource;
    /** Pass the current page path and router helpers so table controls update the URL. */
    route: TableGridRoute;
    /** Use a stable name, usually the table name, for this table page. */
    registerAs?: string;
    /** Provide this when the page should show a New record action. */
    onNewRecord?: () => void;
    /** Render application-defined actions in the table toolbar and action sheet. */
    actions?: ComponentType<TableGridActionsProps<SchemaTableRowsByLevel>>;
    /** Receive the borrowed live session. TableGridView owns and disposes it. */
    sessionRef?: Ref<TGridSession<SchemaTableRowsByLevel>>;
    /** Replace the standard pager-focus behavior at loaded-row boundaries. */
    onLoadedRowsBoundary?: TGridLoadedRowsBoundaryHandler<SchemaTableRowsByLevel>;
    /** Tune row expansion, row loading, interaction, controls, and styling. */
    viewRelatedRows?: ViewRelatedRowsOption;
    rootRows?: SchemaTableRootRowsOptions;
    relatedRows?: SchemaTableRelatedRowsOptions;
    interaction?: GridInteractionConfig;
    loadLookups?: boolean;
    className?: string;
    gridClassName?: string;
};
```

### SchemaTableGridViewSource

```ts
type SchemaTableGridViewSource = {
    table: TableSchema;
    tablesByName: Record<string, TableSchema>;
};
```

### SchemaTableRelatedRowsOptions

```ts
type SchemaTableRelatedRowsOptions = Omit<TGridLevelQueryConfig, "owner">;
```

### SchemaTableRootRowsOptions

```ts
type SchemaTableRootRowsOptions = RootLevelQueryConfig;
```

### SchemaTableRowsByLevel

```ts
type SchemaTableRowsByLevel = Record<string, Record<string, unknown>>;
```

### SchemaTGridConfigInput

```ts
type SchemaTGridConfigInput = {
    source: SchemaTableGridSource;
    rootRows?: SchemaTableRootRowsOptions;
    relatedRows?: SchemaTableRelatedRowsOptions;
};
```

### TableColumnName

```ts
type TableColumnName = TableColumnSchema["name"];
```

### TableColumnOptions

```ts
type TableColumnOptions<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>, K extends RowFieldName<RowsByLevel[LevelId]>> = {
    label?: string;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    edit?: "default" | "none" | {
        editor?: "default" | ComponentType<TGridCellEditorContext<RowsByLevel, AppServices, LevelId, K>>;
        startsOn?: readonly CellEditGesture[];
    };
    activation?: TGridCellActivation<RowsByLevel, AppServices, LevelId>;
    renderCell?: ComponentType<TGridCellContext<RowsByLevel, AppServices, LevelId>>;
    copy?: TGridColumnCopyBehavior<RowsByLevel, AppServices, LevelId, RowsByLevel[LevelId][K]>;
    saveCellValue?: TGridCellWriteHandler<RowsByLevel, AppServices, LevelId, K>;
};
```

### TableDeleteTarget

```ts
type TableDeleteTarget = RowOperationTarget<"data">;
```

### TableFetchOptions

```ts
type TableFetchOptions = TableReadOptions;
```

### TableGridActionsProps

```ts
type TableGridActionsProps<RowsByLevel extends TGridRowsByLevel, AppServices = unknown> = {
    session: TGridSession<RowsByLevel, AppServices>;
    level: TGridLevelId<RowsByLevel>;
} & ({
    surface: "toolbar";
} | {
    surface: "action-sheet";
    close: () => void;
});
```

### TableGridBinding

```ts
type TableGridBinding<RowsByLevel extends TGridRowsByLevel, AppServices = unknown> = {
    session: TGridSession<RowsByLevel, AppServices> | null;
    table: TableSchema;
    level: TGridLevelId<RowsByLevel>;
    routePath: string;
    onNewRecord?: () => void;
    actions?: ComponentType<TableGridActionsProps<RowsByLevel, AppServices>>;
    viewRelatedRows?: ViewRelatedRowsOption;
    className?: string;
    gridClassName?: string;
};
```

### TableGridNavigate

```ts
type TableGridNavigate = (url: string, options?: {
    replace?: boolean;
}) => void;
```

### TableGridRoute

```ts
type TableGridRoute = {
    path: string;
    searchParams: URLSearchParams;
    navigate: TableGridNavigate;
};
```

### TableGridUrlStateBinding

```ts
type TableGridUrlStateBinding<RowsByLevel extends TGridRowsByLevel> = {
    routePath: string;
    level: TGridLevelId<RowsByLevel>;
    routeQuerySeeds: Partial<Record<TGridLevelId<RowsByLevel>, TGridRouteQuerySeed>>;
    onQueryUrlChange: CreateTGridSessionArgs<RowsByLevel>["onQueryUrlChange"];
    syncSessionFromUrl<AppServices>(session: TGridSession<RowsByLevel, AppServices>): void;
};
```

### TableGridViewProps

```ts
type TableGridViewProps<RowsByLevel extends TGridRowsByLevel, AppServices = unknown> = {
    definition: TGridDefinition<RowsByLevel, AppServices>;
    table: TableSchema;
    route: TableGridRoute;
    services?: AppServices;
    registerAs?: string;
    loadLookups?: boolean;
    onNewRecord?: () => void;
    actions?: ComponentType<TableGridActionsProps<RowsByLevel, AppServices>>;
    /** Receive the borrowed live session. TableGridView owns and disposes it. */
    sessionRef?: Ref<TGridSession<RowsByLevel, AppServices>>;
    /** Replace the standard pager-focus behavior at loaded-row boundaries. */
    onLoadedRowsBoundary?: TGridLoadedRowsBoundaryHandler<RowsByLevel, AppServices>;
    viewRelatedRows?: ViewRelatedRowsOption;
    className?: string;
    gridClassName?: string;
};
```

### TableLevelPager

```ts
type TableLevelPager = {
    page: number;
    pages: number;
    onPageChange: (page: number) => void;
    hrefForPage?: (page: number) => string;
};
```

### TableLevelQuery

```ts
type TableLevelQuery = {
    columns: readonly ColumnSchema[];
    filters: readonly TypedFilterCondition[];
    search: string | null;
    searchable: boolean;
    hasSort: boolean;
    activeFilterCount: number;
    lookupForColumn?: LookupForColumn;
    addFilter: (condition: TypedFilterCondition) => void;
    updateFilter: (id: string, patch: TypedFilterCondition) => void;
    removeFilter: (id: string) => void;
    setSearch: (query: string | null) => void;
    clearSort: () => void;
};
```

### TablePageGridOptions

```ts
type TablePageGridOptions = Omit<SchemaTableGridViewProps, "source" | "route" | "registerAs" | "onNewRecord">;
```

### TablePageMode

```ts
type TablePageMode = "wide" | "narrowCards";
```

### TablePageProps

```ts
type TablePageProps = {
    tableName: string;
    gridOptions?: TablePageGridOptions;
};
```

### TablePatchValueDraftParseResult

```ts
type TablePatchValueDraftParseResult = {
    ok: true;
    value: unknown;
} | {
    ok: false;
    message: string;
};
```

### TableRowsClient

```ts
type TableRowsClient = {
    fetch: typeof fetchTableRows;
    create: typeof createTableRow;
    update: typeof updateTableRow;
    remove: typeof deleteTableRow;
};
```

### TableRowsSelectionParams

```ts
type TableRowsSelectionParams = Pick<FetchTableRowsParams, "sort" | "filters" | "search">;
```

### TableSelection

```ts
type TableSelection = {
    kind: "none";
    count: 0;
} | {
    kind: "rows";
    count: number;
    clear: () => void;
    deleteSelected: () => Promise<void>;
};
```

### TableSelectionSession

```ts
type TableSelectionSession = {
    runtime: {
        readonly rowOperations: Pick<GridRuntime["rowOperations"], "selectedDataTargets" | "remove">;
        registeredLevels(): readonly Pick<GridLevelRuntime, "selectedRowIds" | "clearRowSelection" | "subscribeRowInteractionSnapshot" | "subscribeDisplayedRowSequence">[];
        subscribeLevels(listener: () => void): () => void;
    };
    setErrorBanner: (message: string | null) => void;
};
```

### TableUrlState

```ts
interface TableUrlState {
    page: number;
    sort: SortDescriptor[] | undefined;
    filters: TypedFilterCondition[];
    search: string | null;
}
```

### TableValueDraftDecodeResult

A leaf decoder keeps "empty" separate from both a valid value and invalid input so create and patch callers can assign different presence semantics.

```ts
type TableValueDraftDecodeResult = {
    kind: "value";
    value: unknown;
} | {
    kind: "empty";
} | {
    kind: "invalid";
    message: string;
};
```

### TableViewPreference

```ts
type TableViewPreference = "auto" | "tabular" | "cards";
```

### TGridActiveRow

The TGrid row currently carrying application context.

```ts
type TGridActiveRow<RowsByLevel extends TGridRowsByLevel> = {
    [LevelId in TGridLevelId<RowsByLevel>]: {
        [Kind in LevelRow["kind"]]: TGridActiveRowForKind<RowsByLevel, LevelId, Kind>;
    }[LevelRow["kind"]];
}[TGridLevelId<RowsByLevel>];
```

### TGridAnyTableColumnSpec

```ts
type TGridAnyTableColumnSpec<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>> = {
    [K in RowFieldName<RowsByLevel[LevelId]>]: TGridTableColumnSpec<RowsByLevel, AppServices, LevelId, K>;
}[RowFieldName<RowsByLevel[LevelId]>];
```

### TGridCellActivation

```ts
type TGridCellActivation<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>> = {
    startsOn: readonly CellActivationGesture[];
    describe: string | ((ctx: TGridCellActivationContext<RowsByLevel, AppServices, LevelId>) => CellActivationState);
    run: (ctx: TGridCellActivationContext<RowsByLevel, AppServices, LevelId>) => void | Promise<void>;
};
```

### TGridCellActivationContext

```ts
type TGridCellActivationContext<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>> = TGridCellContext<RowsByLevel, AppServices, LevelId> & {
    trigger: CellActivationTrigger;
    actions: CellActionApi;
};
```

### TGridCellContext

```ts
type TGridCellContext<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>> = {
    levelId: LevelId;
    level: GridLevelRuntime;
    value: unknown;
    row: Readonly<RowsByLevel[LevelId]>;
    column: TGridColumnContext<RowsByLevel[LevelId]>;
    runtime: GridRuntime;
    appServices: AppServices;
    activation: CellRenderActivation | null;
};
```

### TGridCellEditorContext

```ts
type TGridCellEditorContext<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>, K extends RowFieldName<RowsByLevel[LevelId]>> = TGridCellContext<RowsByLevel, AppServices, LevelId> & {
    editStart: CellEditorStart;
    value: RowsByLevel[LevelId][K];
    commit(value: RowsByLevel[LevelId][K], target?: CommitTarget): void;
    cancel(): void;
};
```

### TGridCellWriteContext

```ts
type TGridCellWriteContext<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>, K extends RowFieldName<RowsByLevel[LevelId]>> = {
    levelId: LevelId;
    level: GridLevelRuntime;
    value: RowsByLevel[LevelId][K];
    row: Readonly<RowsByLevel[LevelId]>;
    rowKey: RowKey;
    column: TGridColumnContext<RowsByLevel[LevelId]>;
    runtime: GridRuntime;
    appServices: AppServices;
};
```

### TGridCellWriteHandler

```ts
type TGridCellWriteHandler<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>, K extends RowFieldName<RowsByLevel[LevelId]>> = (context: TGridCellWriteContext<RowsByLevel, AppServices, LevelId, K>) => Promise<TGridCellWriteResult<RowsByLevel, LevelId, K>> | TGridCellWriteResult<RowsByLevel, LevelId, K>;
```

### TGridCellWriteResult

```ts
type TGridCellWriteResult<RowsByLevel extends TGridRowsByLevel, LevelId extends TGridLevelId<RowsByLevel>, K extends RowFieldName<RowsByLevel[LevelId]>> = {
    kind: "value";
    value: RowsByLevel[LevelId][K];
} | {
    kind: "patch";
    patch: Partial<RowsByLevel[LevelId]>;
} | {
    kind: "row";
    row: RowsByLevel[LevelId];
} | {
    kind: "reload";
};
```

### TGridClientColumnSpec

```ts
type TGridClientColumnSpec<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>> = {
    kind: "client";
    id: string;
    options: ClientColumnOptions<RowsByLevel, AppServices, LevelId>;
};
```

### TGridColumnBuildArgs

```ts
type TGridColumnBuildArgs<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>> = {
    levelId: LevelId;
    table: TableSchema;
    specs?: readonly TGridColumnSpec<RowsByLevel, AppServices, LevelId>[];
    includedColumnNames?: readonly TableColumnName[];
    rowKeyColumn: TableColumnName;
    rowHeaderColumn?: RowHeaderColumn | null;
    immutable: boolean;
    expandable: boolean;
    columnMapper: TGridColumnMapper;
    sessionContext: () => TGridSessionContext<RowsByLevel, AppServices>;
};
```

### TGridColumnBuildResult

```ts
type TGridColumnBuildResult = {
    columns: GridColumnSchema[];
    rowHeaderColumn: RowHeaderColumn;
    saveCellValueByColumn: ReadonlyMap<ColId, TGridRuntimeCellWriteHandler<TGridRowsByLevel, unknown, string>>;
};
```

### TGridColumnContext

```ts
type TGridColumnContext<Row extends TGridTableRow> = {
    id: string;
    tableColumnName?: RowFieldName<Row>;
    schema?: TableColumnSchema;
    gridColumn: GridColumnSchema;
};
```

### TGridColumnCopyBehavior

```ts
type TGridColumnCopyBehavior<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>, TValue> = (context: {
    levelId: LevelId;
    level: GridLevelRuntime;
    column: TGridColumnContext<RowsByLevel[LevelId]>;
    rows: readonly Readonly<RowsByLevel[LevelId]>[];
    values: readonly TValue[];
    runtime: GridRuntime;
    appServices: AppServices;
}) => readonly GridCopyColumn<Readonly<RowsByLevel[LevelId]>>[] | Promise<readonly GridCopyColumn<Readonly<RowsByLevel[LevelId]>>[]>;
```

### TGridColumnMapper

```ts
type TGridColumnMapper = {
    columnFor(args: {
        tableName: string;
        column: TableColumnSchema;
        immutable: boolean;
    }): GridColumnSchema;
    metaOf(column: Pick<GridColumnSchema, "meta">): TGridTableColumnMeta | undefined;
};
```

### TGridColumnsBuilder

```ts
type TGridColumnsBuilder<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>> = {
    table<K extends RowFieldName<RowsByLevel[LevelId]>>(columnName: K, options?: TableColumnOptions<RowsByLevel, AppServices, LevelId, K>): TGridTableColumnSpec<RowsByLevel, AppServices, LevelId, K>;
    client(id: string, options: ClientColumnOptions<RowsByLevel, AppServices, LevelId>): TGridClientColumnSpec<RowsByLevel, AppServices, LevelId>;
    remainingTable(options?: {
        exclude?: readonly RowFieldName<RowsByLevel[LevelId]>[];
    }): TGridRemainingTableColumnSpec<RowsByLevel, LevelId>;
};
```

### TGridColumnSpec

```ts
type TGridColumnSpec<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>> = TGridAnyTableColumnSpec<RowsByLevel, AppServices, LevelId> | TGridClientColumnSpec<RowsByLevel, AppServices, LevelId> | TGridRemainingTableColumnSpec<RowsByLevel, LevelId>;
```

### TGridColumnSpecBuilder

```ts
type TGridColumnSpecBuilder<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>> = (columns: TGridColumnsBuilder<RowsByLevel, AppServices, LevelId>) => readonly TGridColumnSpec<RowsByLevel, AppServices, LevelId>[];
```

### TGridDefinition

```ts
type TGridDefinition<RowsByLevel extends TGridRowsByLevel = TGridRowsByLevel, AppServices = unknown> = {
    readonly rootLevel: TGridLevelId<RowsByLevel>;
    readonly interaction?: GridInteractionConfig;
    readonly phantomRows?: PhantomRowsConfig;
    readonly levels: TGridLevelsConfigMap<RowsByLevel, AppServices>;
};
```

### TGridFilter

```ts
type TGridFilter = {
    conditions: TypedFilterCondition[];
    search: string | null;
};
```

### TGridLevelConfig

```ts
type TGridLevelConfig<RowsByLevel extends TGridRowsByLevel, AppServices = unknown, LevelId extends TGridLevelId<RowsByLevel> = TGridLevelId<RowsByLevel>> = {
    table: TableSchema;
    includedColumnNames?: readonly TableColumnName[];
    rowHeaderColumn?: RowHeaderColumn | null;
    columns?: TGridColumnSpecBuilder<RowsByLevel, AppServices, LevelId> | readonly TGridColumnSpec<RowsByLevel, AppServices, LevelId>[];
    childLevels: readonly TGridLevelId<RowsByLevel>[];
    parent?: {
        level: TGridLevelId<RowsByLevel>;
        foreignKey: RowFieldName<RowsByLevel[LevelId]>;
        defaultSort?: string | readonly SortDescriptor[];
    };
    query?: TGridLevelQueryConfig;
    rowsClient?: TableRowsClient;
};
```

### TGridLevelId

```ts
type TGridLevelId<RowsByLevel extends TGridRowsByLevel = TGridRowsByLevel> = keyof RowsByLevel & string;
```

### TGridLevelInfo

```ts
type TGridLevelInfo = {
    levelId: string;
    tableName: string;
    parent?: {
        parentLevelId: string;
        foreignKey: TableColumnName;
    };
    childSchemas: ChildSchema[];
};
```

### TGridLevelQueryConfig

```ts
type TGridLevelQueryConfig = {
    owner?: "host" | "source";
    pageSize?: number | (() => number);
    initialPage?: number;
    initialSort?: readonly SortDescriptor[];
    initialFilters?: readonly FilterCondition[];
    initialSearch?: string | null;
    fixedFilters?: readonly FilterCondition[];
    urlSync?: boolean;
};
```

### TGridLevelQueryState

```ts
type TGridLevelQueryState<RowShape extends TGridTableRow = TGridTableRow> = {
    level: string;
    sort: SortDescriptor[];
    filters: TypedFilterCondition[];
    search: string | null;
    page: number;
    pageSize: number;
    totalCount: number | null;
    errorBanner: string | null;
    setSortState: (sort: SortDescriptor[]) => "changed" | "unchanged";
    setFilterState: (filter: TGridFilter | undefined) => "changed" | "unchanged";
    setPageState: (page: number, pageSize: number) => "changed" | "unchanged";
    setTotalCount: (totalCount: number | null) => void;
    setSort: (sort: SortDescriptor[]) => void;
    clearSort: () => void;
    addFilter: (cond: TypedFilterCondition) => void;
    updateFilter: (id: string, patch: TypedFilterCondition) => void;
    removeFilter: (id: string) => void;
    clearFilters: () => void;
    setSearch: (q: string | null) => void;
    setFilter: (filter: TGridFilter | undefined) => void;
    setPage: (page: number) => void;
    setErrorBanner: (msg: string | null) => void;
    syncFromUrl: (seed: TGridRouteQuerySeed) => void;
};
```

### TGridLevelsConfigMap

```ts
type TGridLevelsConfigMap<RowsByLevel extends TGridRowsByLevel, AppServices = unknown> = {
    [LevelId in TGridLevelId<RowsByLevel>]: TGridLevelConfig<RowsByLevel, AppServices, LevelId>;
};
```

### TGridLoadedRowsBoundaryHandler

```ts
type TGridLoadedRowsBoundaryHandler<RowsByLevel extends TGridRowsByLevel = TGridRowsByLevel, AppServices = unknown> = (event: LoadedRowsBoundaryEvent, levelId: TGridLevelId<RowsByLevel>, session: TGridSession<RowsByLevel, AppServices>) => Promise<SourceLoadResult> | false;
```

### TGridPresentation

```ts
type TGridPresentation = GridPresentation;
```

### TGridQueryState

```ts
type TGridQueryState<RowShape extends TGridTableRow = TGridTableRow> = TGridLevelQueryState<RowShape>;
```

### TGridRemainingTableColumnSpec

```ts
type TGridRemainingTableColumnSpec<RowsByLevel extends TGridRowsByLevel, LevelId extends TGridLevelId<RowsByLevel>> = {
    kind: "remainingTable";
    exclude?: readonly RowFieldName<RowsByLevel[LevelId]>[];
};
```

### TGridRouteQuerySeed

```ts
type TGridRouteQuerySeed = Partial<{
    page: number;
    sort: readonly SortDescriptor[];
    filters: readonly TypedFilterCondition[];
    search: string | null;
}>;
```

### TGridRowActivatedEvent

```ts
type TGridRowActivatedEvent<RowsByLevel extends TGridRowsByLevel> = {
    activeRow: TGridActiveRow<RowsByLevel>;
    trigger: RowActivationTrigger;
};
```

### TGridRowsByLevel

```ts
type TGridRowsByLevel = Record<string, TGridTableRow>;
```

### TGridRuntimeCellWriteHandler

```ts
type TGridRuntimeCellWriteHandler<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>> = (context: {
    levelId: LevelId;
    level: GridLevelRuntime;
    value: unknown;
    row: Readonly<RowsByLevel[LevelId]>;
    rowKey: RowKey;
    runtime: GridRuntime;
    appServices: AppServices;
}) => Promise<TGridRuntimeCellWriteResult> | TGridRuntimeCellWriteResult;
```

### TGridRuntimeCellWriteResult

```ts
type TGridRuntimeCellWriteResult = {
    kind: "value";
    value: unknown;
} | {
    kind: "patch";
    patch: Record<ColId, unknown>;
} | {
    kind: "row";
    row: Record<ColId, unknown>;
} | {
    kind: "reload";
};
```

### TGridRuntimeLevel

```ts
type TGridRuntimeLevel<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>> = {
    levelId: LevelId;
    table: TableSchema;
    config: TGridLevelConfig<RowsByLevel, AppServices, LevelId>;
    queryStore?: unknown;
    csvExportUrl(): string;
};
```

### TGridSession

```ts
type TGridSession<RowsByLevel extends TGridRowsByLevel = TGridRowsByLevel, AppServices = unknown> = TGridSessionContext<RowsByLevel, AppServices> & {
    rootTableName: string;
    queryStore: StoreApi<TGridLevelQueryState<RowsByLevel[TGridLevelId<RowsByLevel>]>>;
    rootSource: RuntimeLevelDataSource;
    columnMapper: TGridColumnMapper;
    levelInfoById: Record<TGridLevelId<RowsByLevel>, TGridLevelInfo>;
    /** Reads the current row with TGrid level and application context. */
    activeRow(): TGridActiveRow<RowsByLevel> | null;
    /** Observes active-row identity and displayed-value changes. */
    subscribeActiveRow(listener: () => void): () => void;
    /** Observes configured row activation gestures. */
    onRowActivate(handler: (event: TGridRowActivatedEvent<RowsByLevel>) => void): () => void;
    getVisibleRows<LevelId extends TGridLevelId<RowsByLevel>>(levelId?: LevelId, path?: GridPath): readonly Readonly<RowsByLevel[LevelId]>[];
    getLoadedRow<LevelId extends TGridLevelId<RowsByLevel>>(rowKey: string, levelId?: LevelId, path?: GridPath): Readonly<RowsByLevel[LevelId]> | undefined;
    getQueryState<LevelId extends TGridLevelId<RowsByLevel>>(levelId?: LevelId): TGridLevelQueryState<RowsByLevel[LevelId]>;
    reloadRows(levelId?: TGridLevelId<RowsByLevel>, path?: GridPath): Promise<SourceLoadResult>;
    setLevelSort(levelId: TGridLevelId<RowsByLevel>, path: GridPath, sort: SortDescriptor[]): Promise<SourceLoadResult>;
    setLevelFilter(levelId: TGridLevelId<RowsByLevel>, path: GridPath, filter: TGridFilter | undefined): Promise<SourceLoadResult>;
    setLevelPage(levelId: TGridLevelId<RowsByLevel>, path: GridPath, page: number, pageSize: number): Promise<SourceLoadResult>;
    setErrorBanner(message: string | null): void;
    lookups: LookupStore;
    lookupForColumn: LookupForColumn;
    csvExportUrl(levelId?: TGridLevelId<RowsByLevel>): string;
    dispose(): void;
};
```

### TGridSessionContext

```ts
type TGridSessionContext<RowsByLevel extends TGridRowsByLevel, AppServices> = {
    rootLevel: TGridLevelId<RowsByLevel>;
    runtime: GridRuntime;
    levels: {
        [LevelId in TGridLevelId<RowsByLevel>]: TGridRuntimeLevel<RowsByLevel, AppServices, LevelId>;
    };
    appServices: AppServices;
    lookups: LookupStore;
};
```

### TGridSourceStatus

```ts
type TGridSourceStatus = {
    status: LevelSourceState["status"];
    error: unknown;
    totalCount: number;
};
```

### TGridTableColumnMeta

```ts
type TGridTableColumnMeta = {
    table: string;
    schema: TableColumnSchema;
    displayType: DisplayType;
};
```

### TGridTableColumnSpec

```ts
type TGridTableColumnSpec<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>, K extends RowFieldName<RowsByLevel[LevelId]> = RowFieldName<RowsByLevel[LevelId]>> = {
    kind: "table";
    columnName: K;
    options?: TableColumnOptions<RowsByLevel, AppServices, LevelId, K>;
};
```

### TGridTableRow

```ts
type TGridTableRow = object;
```

### TGridTableSchemaInput

```ts
type TGridTableSchemaInput = Omit<TableSchema, "name">;
```

### TGridTableSchemaOverrides

```ts
type TGridTableSchemaOverrides<RowShape extends TGridTableRow> = Partial<Omit<TableSchema, "name" | "columns">> & {
    columns?: Partial<Record<RowFieldName<RowShape>, Partial<TableColumnSchema>>>;
};
```

### ThemeMode

```ts
type ThemeMode = "light" | "dark";
```

### UseSchemaTableGridArgs

```ts
type UseSchemaTableGridArgs = Omit<SchemaTableGridViewProps, "sessionRef">;
```

### UseTableGridArgs

```ts
type UseTableGridArgs<RowsByLevel extends TGridRowsByLevel, AppServices = unknown> = Omit<TableGridViewProps<RowsByLevel, AppServices>, "sessionRef">;
```

### UseTableGridUrlStateArgs

```ts
type UseTableGridUrlStateArgs<RowsByLevel extends TGridRowsByLevel> = {
    tableName: string;
    columns: readonly ColumnSchema[];
    route: TableGridRoute;
    level?: TGridLevelId<RowsByLevel>;
    sortPreferenceKey?: string;
};
```

### UseTGridLifecycleArgs

```ts
type UseTGridLifecycleArgs<RowsByLevel extends TGridRowsByLevel, AppServices = unknown> = {
    session: TGridSession<RowsByLevel, AppServices> | null;
    registerAs?: string;
    loadLookups?: boolean;
};
```

### UseTGridQueryStateArgs

```ts
type UseTGridQueryStateArgs<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>> = {
    session: TGridSession<RowsByLevel, AppServices>;
    level: LevelId;
};
```

### UseTGridSessionArgs

```ts
type UseTGridSessionArgs<RowsByLevel extends TGridRowsByLevel, AppServices> = CreateTGridSessionArgs<RowsByLevel, AppServices>;
```

### ViewRelatedRowsContext

```ts
type ViewRelatedRowsContext = {
    parent: {
        table: TableSchema;
        levelId: string;
        rowId: string;
    };
    related: {
        table: TableSchema;
        levelId: string;
        foreignKey: string;
    };
    defaultHref: string;
};
```

### ViewRelatedRowsOption

```ts
type ViewRelatedRowsOption = boolean | {
    label?: string;
    target?: "_self" | "_blank";
    href?: (context: ViewRelatedRowsContext) => string | null;
};
```
