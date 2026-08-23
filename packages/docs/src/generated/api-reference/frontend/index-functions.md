---
title: "@sapporta/frontend — Functions and components"
package: "@sapporta/frontend"
version: "0.5.0"
specifier: "@sapporta/frontend"
---

> Sapporta API reference for `@sapporta/frontend@0.5.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/frontend — Functions and components

Import from `@sapporta/frontend`. Documented from `@sapporta/frontend@0.5.0`; confirm the installed version with `node -p "require('@sapporta/frontend/package.json').version"`.

85 of 189 symbols published from `@sapporta/frontend`. Other groups: [Types](https://sapporta.com/api-reference/frontend/index-types.md), [Values, classes, and namespaces](https://sapporta.com/api-reference/frontend/index-values.md).

### applySchemaOverrides

```ts
function applySchemaOverrides<RowsByLevel extends TGridRowsByLevel, LevelId extends TGridLevelId<RowsByLevel>>(_levelId: LevelId, schema: TableSchema, overrides: TGridTableSchemaOverrides<RowsByLevel[LevelId]>): TableSchema;
```

### buildRecordFormFields

```ts
function buildRecordFormFields(args: {
    table: TableSchema;
    lookups: LookupStore;
}): RecordFormFieldModel[];
```

### buildSchemaTGridConfig

```ts
function buildSchemaTGridConfig<AppServices = unknown>({ source, rootRows, relatedRows, }: SchemaTGridConfigInput): {
    rootLevel: string;
    levels: TGridLevelsConfigMap<SchemaTableRowsByLevel, AppServices>;
};
```

### buildTableRowsQuery

Add pagination to a table selection for the paged rows endpoint.

```ts
function buildTableRowsQuery(params: Omit<FetchTableRowsParams, "tableName">): QueryParamRecord;
```

### buildTableSearchParams

```ts
function buildTableSearchParams(state: {
    page: number;
    sort: SortDescriptor[] | undefined;
    filters: readonly TypedFilterCondition[];
    search: string | null;
}): URLSearchParams;
```

### buildTableSelectionQuery

Serialize the filter, sort, and search selection shared by paged reads and CSV exports.

```ts
function buildTableSelectionQuery(params: TableRowsSelectionParams): QueryParamRecord;
```

### buildTGridColumnsForTable

```ts
function buildTGridColumnsForTable<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>>(args: TGridColumnBuildArgs<RowsByLevel, AppServices, LevelId>): TGridColumnBuildResult;
```

### catalogTableLabel

Display-label lookup for link destinations, backed by the loaded schema catalog.

```ts
function catalogTableLabel(table: string): string | undefined;
```

### clearTableSelection

```ts
function clearTableSelection(session: TableSelectionSession | undefined): void;
```

### createColumnsBuilder

```ts
function createColumnsBuilder<RowsByLevel extends TGridRowsByLevel, AppServices = unknown, LevelId extends TGridLevelId<RowsByLevel> = TGridLevelId<RowsByLevel>>(levelId: LevelId): TGridColumnsBuilder<RowsByLevel, AppServices, LevelId>;
```

### createRecord

```ts
function createRecord(tableName: string, data: Record<string, unknown>): Promise<Record<string, unknown> | Record<string, unknown>[]>;
```

### createTableRow

```ts
function createTableRow(tableName: string, data: Row): Promise<{
    data: Row | Row[];
}>;
```

### createTGridColumnMapper

```ts
function createTGridColumnMapper(args: {
    lookups: LookupStore;
}): TGridColumnMapper;
```

### createTGridColumnsBuilder

```ts
function createTGridColumnsBuilder<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>>(_levelId: LevelId): TGridColumnsBuilder<RowsByLevel, AppServices, LevelId>;
```

### createTGridSession

```ts
function createTGridSession<RowsByLevel extends TGridRowsByLevel = TGridRowsByLevel, AppServices = unknown>(definition: TGridDefinition<RowsByLevel, AppServices>, args?: CreateTGridSessionArgs<RowsByLevel, AppServices>): TGridSession<RowsByLevel, AppServices>;
```

### decodeTableValueDraft

Decode one raw table-control value without applying create or patch rules.

```ts
function decodeTableValueDraft(column: ColumnSchema, draft: unknown): TableValueDraftDecodeResult;
```

### defineSchemaTGrid

```ts
function defineSchemaTGrid({ interaction, ...config }: DefineSchemaTGridArgs): TGridDefinition<SchemaTableRowsByLevel>;
```

### defineTableSchema

```ts
function defineTableSchema(name: string, input: TGridTableSchemaInput): TableSchema;
```

### defineTGrid

```ts
function defineTGrid<RowsByLevel extends TGridRowsByLevel = TGridRowsByLevel, AppServices = unknown>(definition: TGridDefinition<RowsByLevel, AppServices>): TGridDefinition<RowsByLevel, AppServices>;
```

### deleteSelectedTableRows

```ts
function deleteSelectedTableRows(session: TableSelectionSession | undefined): Promise<void>;
```

### deleteTableRow

```ts
function deleteTableRow(tableName: string, id: RecordId): Promise<SingleRow>;
```

### fetchTableRow

```ts
function fetchTableRow(tableName: string, recordId: RecordId, options?: TableFetchOptions): Promise<SingleRow>;
```

### fetchTableRows

```ts
function fetchTableRows(params: FetchTableRowsParams, options?: TableFetchOptions): Promise<PaginatedRows>;
```

### fieldModelForColumn

Returns the Sapporta field model derived for one SQL column.

```ts
function fieldModelForColumn(fields: readonly RecordFormFieldModel[], columnName: string): RecordFormFieldModel;
```

### foreignKeyFieldModelForColumn

Returns the foreign-key field model derived for one SQL column.

```ts
function foreignKeyFieldModelForColumn(fields: readonly RecordFormFieldModel[], columnName: string): ForeignKeyRecordFormFieldModel;
```

### FormField

```ts
function FormField({ field, value, issue, onChange }: FormFieldProps): import("react").JSX.Element;
```

### handleResolvedLinkClick

Anchor click handler that upgrades in-app navigation to a client-side route change while preserving native anchor behavior for modified clicks (new tab, download, etc.).

```ts
function handleResolvedLinkClick(event: {
    defaultPrevented: boolean;
    button: number;
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    preventDefault(): void;
}, link: Pick<ResolvedLink, "href" | "target">): void;
```

### isExternalHref

True when the href leaves the app: it carries a scheme ("https:", "mailto:") rather than an in-app path.

```ts
function isExternalHref(href: string): boolean;
```

### LinkIconGlyph

```ts
function LinkIconGlyph({ icon, className, }: {
    icon: LinkIcon;
    className?: string;
}): import("react").JSX.Element;
```

### LinkMenuItems

Context-menu entries for the targeted cell and row: the cell's links first, then the row's, one entry per destination.

```ts
function LinkMenuItems({ cellLinks, rowLinks, }: {
    cellLinks?: readonly ResolvedLink[];
    rowLinks?: readonly ResolvedLink[];
}): import("react").JSX.Element | null;
```

### linkRel

`rel` for anchors that open a new tab: sever opener access.

```ts
function linkRel(target: LinkTarget | undefined): "noopener noreferrer" | undefined;
```

### navigateToNewRecord

```ts
function navigateToNewRecord(tableName: string): void;
```

### NewRecordPage

```ts
function NewRecordPage({ tableSchema }: {
    tableSchema: TableSchema;
}): import("react").JSX.Element;
```

### normalizeForeignKeyScalarFilters

```ts
function normalizeForeignKeyScalarFilters(filters: FilterCondition[], columns: readonly ColumnSchema[] | undefined): FilterCondition[];
```

### normalizeTableViewPreference

```ts
function normalizeTableViewPreference(value: string | null): TableViewPreference;
```

### openResolvedLink

Open a resolved link the way an anchor would: new tab for `_blank`, client-side route navigation for in-app paths (falling back to a full page load when the router bridge is not initialized), and a plain location change for external URLs.

```ts
function openResolvedLink(link: Pick<ResolvedLink, "href" | "target">): void;
```

### parseCreateDraft

Decode metadata-driven form drafts once, immediately before submission.

```ts
function parseCreateDraft(table: TableSchema, draft: Readonly<Record<string, unknown>>): ParseCreateDraftResult;
```

### parseTablePatchValueDraft

Decode one edited patch value for a generated update body.

```ts
function parseTablePatchValueDraft(column: ColumnSchema, draft: unknown): TablePatchValueDraftParseResult;
```

### parseTableSearchParams

```ts
function parseTableSearchParams(searchParams: URLSearchParams, columns: readonly ColumnSchema[]): TableUrlState;
```

### registerTGridSession

```ts
function registerTGridSession(rootTableName: string, session: TGridSessionReloadHandle): void;
```

### relatedRowsTableHref

```ts
function relatedRowsTableHref({ tableName, foreignKey, parentRowId, routePath, }: RelatedRowsTableHrefInput): string;
```

### reloadTGridRows

```ts
function reloadTGridRows(rootTableName: string): void;
```

### resolveLink

Resolve one declarative link against a row.

```ts
function resolveLink(link: NavLink, context: LinkResolutionContext): ResolvedLink | null;
```

### resolveLinks

Resolve a list of declarative links against a row, dropping links whose bound values are missing and deduplicating identical destinations.

```ts
function resolveLinks(links: readonly NavLink[] | undefined, context: LinkResolutionContext): ResolvedLink[];
```

### resolveTableGridPresentation

```ts
function resolveTableGridPresentation(args: {
    mode: TablePageMode;
    preference: TableViewPreference;
}): GridPresentation;
```

### resolveTablePageMode

```ts
function resolveTablePageMode(width: number): TablePageMode;
```

### resolveTGridCellLinks

```ts
function resolveTGridCellLinks(column: TableColumnSchema, row: LevelRow): ResolvedLink[];
```

### resolveTGridRowLinks

```ts
function resolveTGridRowLinks(rowLinks: readonly NavLink[] | undefined, row: LevelRow): ResolvedLink[];
```

### sanitizeSortDescriptors

```ts
function sanitizeSortDescriptors(value: readonly unknown[], validColIds: ReadonlySet<ColId>): SortDescriptor[];
```

### SchemaTableGridView

```ts
function SchemaTableGridView({ source, route, registerAs, onNewRecord, actions, sessionRef, onLoadedRowsBoundary, viewRelatedRows, rootRows, relatedRows, interaction, loadLookups, className, gridClassName, }: SchemaTableGridViewProps): import("react").JSX.Element;
```

### selectedTableDeleteTargets

```ts
function selectedTableDeleteTargets(session: TableSelectionSession | undefined): readonly TableDeleteTarget[];
```

### startTGridLookupLoading

```ts
function startTGridLookupLoading<RowsByLevel extends TGridRowsByLevel, AppServices = unknown>(session: Pick<TGridSession<RowsByLevel, AppServices>, "runtime">): () => void;
```

### tableColumnPresetWidth

```ts
function tableColumnPresetWidth(column: TableColumnSchema): ColumnWidth | undefined;
```

### tableFilteredByUrl

URL for a table view pre-filtered by column equalities.

```ts
function tableFilteredByUrl(table: string, column: string, value: unknown): string;
function tableFilteredByUrl(table: string, filters: Record<string, unknown>): string;
```

### tableGridUrlForQueryState

```ts
function tableGridUrlForQueryState(routePath: string, page: number, state: {
    sort: TGridLevelQueryState<TGridTableRow>["sort"];
    filters: readonly TypedFilterCondition[];
    search: TGridLevelQueryState<TGridTableRow>["search"];
}): string;
```

### TableGridView

```ts
function TableGridView<RowsByLevel extends TGridRowsByLevel, AppServices = unknown>({ definition, table, route, services, registerAs, loadLookups, onNewRecord, actions, sessionRef, onLoadedRowsBoundary, viewRelatedRows, className, gridClassName, }: TableGridViewProps<RowsByLevel, AppServices>): import("react").JSX.Element;
```

### tableLoadErrorMessage

```ts
function tableLoadErrorMessage(err: unknown): string;
```

### TablePage

```ts
function TablePage({ tableName, gridOptions }: TablePageProps): import("react").JSX.Element;
```

### tableQuerySeedFromUrlState

```ts
function tableQuerySeedFromUrlState(args: {
    searchParams: URLSearchParams;
    parsed: {
        page: number;
        filters: TypedFilterCondition[];
        search: string | null;
    };
    sort: SortDescriptor[] | undefined;
}): TGridRouteQuerySeed;
```

### tableViewPreferenceKey

```ts
function tableViewPreferenceKey(tableName: string): string;
```

### TGrid

```ts
function TGrid<RowsByLevel extends TGridRowsByLevel, AppServices = unknown>({ session, className, style, viewRelatedRows, presentation, onRowActivate, }: {
    session: TGridSession<RowsByLevel, AppServices>;
    className?: string;
    style?: CSSProperties;
    viewRelatedRows?: ViewRelatedRowsOption;
    presentation?: TGridPresentation;
    /** Receives configured Enter, click, or double-click row activations. */
    onRowActivate?: (event: TGridRowActivatedEvent<RowsByLevel>) => void;
}): import("react").JSX.Element;
```

### unregisterTGridSession

```ts
function unregisterTGridSession(rootTableName: string): void;
```

### updateTableRow

```ts
function updateTableRow(tableName: string, id: RecordId, data: Row): Promise<SingleRow>;
```

### useCurrentTGridSession

```ts
function useCurrentTGridSession<RowsByLevel extends TGridRowsByLevel, AppServices>(): TGridSessionContext<RowsByLevel, AppServices>;
```

### useKeyHints

Publish a route-local set of hints for the lifetime of the component.

```ts
function useKeyHints(hints: KeyHint[]): void;
```

### useSchemaTableGrid

```ts
function useSchemaTableGrid({ source, route, registerAs, onNewRecord, actions, onLoadedRowsBoundary, viewRelatedRows, rootRows, relatedRows, interaction, loadLookups, className, gridClassName, }: UseSchemaTableGridArgs): TableGridBinding<SchemaTableRowsByLevel>;
```

### useTableGrid

```ts
function useTableGrid<RowsByLevel extends TGridRowsByLevel, AppServices = unknown>({ definition, table, route, services, registerAs, loadLookups, onNewRecord, actions, onLoadedRowsBoundary, viewRelatedRows, className, gridClassName, }: UseTableGridArgs<RowsByLevel, AppServices>): TableGridBinding<RowsByLevel, AppServices>;
```

### useTableGridUrlState

```ts
function useTableGridUrlState<RowsByLevel extends TGridRowsByLevel>({ tableName, columns, route, level, sortPreferenceKey, }: UseTableGridUrlStateArgs<RowsByLevel>): TableGridUrlStateBinding<RowsByLevel>;
```

### useTableLevelPager

```ts
function useTableLevelPager<RowsByLevel extends TGridRowsByLevel, AppServices = unknown>(session: TGridSession<RowsByLevel, AppServices>, level: TGridLevelId<RowsByLevel>, routePath: string): TableLevelPager;
```

### useTableLevelQuery

```ts
function useTableLevelQuery<RowsByLevel extends TGridRowsByLevel, AppServices = unknown>(session: TGridSession<RowsByLevel, AppServices>, level?: TGridLevelId<RowsByLevel>): TableLevelQuery;
```

### useTablePageMode

```ts
function useTablePageMode(): {
    ref: RefObject<HTMLDivElement | null>;
    mode: TablePageMode;
};
```

### useTableSelection

```ts
function useTableSelection<RowsByLevel extends TGridRowsByLevel, AppServices = unknown>(session: TGridSession<RowsByLevel, AppServices>): TableSelection;
```

### useTableViewPreference

```ts
function useTableViewPreference(tableName: string): {
    preference: TableViewPreference;
    setPreference: (preference: TableViewPreference) => void;
};
```

### useTGridActiveRow

Reads the TGrid row currently carrying application context.

```ts
function useTGridActiveRow<RowsByLevel extends TGridRowsByLevel, AppServices>(session: TGridSession<RowsByLevel, AppServices> | null): TGridActiveRow<RowsByLevel> | null;
```

### useTGridCell

```ts
function useTGridCell<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>>(levelId: LevelId): TGridCellContext<RowsByLevel, AppServices, LevelId>;
```

### useTGridCellEditor

```ts
function useTGridCellEditor<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>, K extends RowFieldName<RowsByLevel[LevelId]>>(levelId: LevelId, _column: K): TGridCellEditorContext<RowsByLevel, AppServices, LevelId, K>;
```

### useTGridLifecycle

```ts
function useTGridLifecycle<RowsByLevel extends TGridRowsByLevel, AppServices = unknown>({ session, registerAs, loadLookups, }: UseTGridLifecycleArgs<RowsByLevel, AppServices>): void;
```

### useTGridQueryState

```ts
function useTGridQueryState<RowsByLevel extends TGridRowsByLevel, AppServices, LevelId extends TGridLevelId<RowsByLevel>>(args: UseTGridQueryStateArgs<RowsByLevel, AppServices, LevelId>): TGridLevelQueryState<RowsByLevel[LevelId]>;
```

### useTGridSession

```ts
function useTGridSession<RowsByLevel extends TGridRowsByLevel, AppServices>(definition: TGridDefinition<RowsByLevel, AppServices>, args?: UseTGridSessionArgs<RowsByLevel, AppServices>): TGridSession<RowsByLevel, AppServices> | null;
```

### useTGridSourceField

```ts
function useTGridSourceField<RowsByLevel extends TGridRowsByLevel, AppServices, T>(session: TGridSession<RowsByLevel, AppServices>, pick: (snapshot: LevelSnapshot) => T): T;
```

### useTGridSourceStateField

```ts
function useTGridSourceStateField<RowsByLevel extends TGridRowsByLevel, AppServices, T>(session: TGridSession<RowsByLevel, AppServices>, pick: (state: LevelSourceState) => T): T;
```

### useTGridSourceStatus

```ts
function useTGridSourceStatus<RowsByLevel extends TGridRowsByLevel, AppServices = unknown>(session: TGridSession<RowsByLevel, AppServices>): TGridSourceStatus;
```

### visiblePaginationItems

```ts
function visiblePaginationItems(page: number, pages: number, siblingCount?: number): PaginationRangeItem[];
```

### withTGridCellLinks

Wraps a mapped grid column so declared cell links render and activate.

```ts
function withTGridCellLinks(gridColumn: GridColumnSchema, column: TableColumnSchema): GridColumnSchema;
```

### withTGridSessionContext

```ts
function withTGridSessionContext<RowsByLevel extends TGridRowsByLevel, AppServices>(session: TGridSessionContext<RowsByLevel, AppServices>, children: ReactNode): ReactNode;
```
