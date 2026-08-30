---
title: "@sapporta/grid — Types"
package: "@sapporta/grid"
version: "0.6.0"
specifier: "@sapporta/grid"
---

> Sapporta API reference for `@sapporta/grid@0.6.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/grid — Types

Import from `@sapporta/grid`. Documented from `@sapporta/grid@0.6.0`; confirm the installed version with `node -p "require('@sapporta/grid/package.json').version"`.

113 of 191 symbols published from `@sapporta/grid`. Other groups: [Functions and components](https://sapporta.com/api-reference/grid/index-functions.md), [Values, classes, and namespaces](https://sapporta.com/api-reference/grid/index-values.md).

### Brand

```ts
type Brand<T, B extends string> = T & {
    readonly [__brand]: B;
};
```

### BuildRowsRequest

```ts
type BuildRowsRequest<F = unknown> = (query: RowQuery<F>) => FetchPageRequest<F>;
```

### CellActionApi

```ts
type CellActionApi = {
    readonly rowExpansion: {
        canToggle: (target: {
            path: GridPath;
            row: LevelRow;
        }) => boolean;
        isExpanded: (target: {
            path: GridPath;
            rowId: RowId;
        }) => boolean;
        toggle: (target: {
            path: GridPath;
            rowId: RowId;
        }) => void;
    };
};
```

### CellActivation

```ts
type CellActivation = {
    readonly startsOn: readonly CellActivationGesture[];
    readonly describe: CellActivationDescription;
    readonly run: (ctx: CellActivationContext) => void | Promise<void>;
};
```

### CellActivationColumnContext

```ts
type CellActivationColumnContext = {
    readonly id: ColId;
    readonly name: string;
    readonly meta?: unknown;
};
```

### CellActivationContext

```ts
type CellActivationContext = {
    readonly trigger: CellActivationTrigger;
    readonly value: unknown;
    readonly row: LevelRow;
    readonly column: CellActivationColumnContext;
    readonly path: GridPath;
    readonly coord: Coord;
    readonly actions: CellActionApi;
};
```

### CellActivationDescription

```ts
type CellActivationDescription = string | ((ctx: CellActivationContext) => CellActivationState);
```

### CellActivationGesture

```ts
type CellActivationGesture = "enter" | "space" | "click" | "doubleClick";
```

### CellActivationState

```ts
type CellActivationState = {
    readonly label: string;
    readonly availability: CellAvailability;
};
```

### CellActivationTrigger

```ts
type CellActivationTrigger = {
    readonly kind: "keyboard";
    readonly gesture: "enter" | "space";
} | {
    readonly kind: "pointer";
    readonly gesture: "click" | "doubleClick";
};
```

### CellAvailability

```ts
type CellAvailability = {
    readonly kind: "enabled";
} | {
    readonly kind: "disabled";
    readonly reason?: string;
};
```

### CellChange

```ts
type CellChange = {
    readonly rowKey: RowKey;
    readonly colId: ColId;
    readonly value: unknown;
};
```

### CellCursor

```ts
type CellCursor = {
    readonly path: GridPath;
    readonly rowId: RowId;
    readonly colId: ColId;
};
```

### CellEditBehavior

```ts
type CellEditBehavior = {
    readonly editor: ComponentType<CellEditorProps>;
    readonly startsOn: readonly CellEditGesture[];
};
```

### CellEditGesture

```ts
type CellEditGesture = "enter" | "type" | "doubleClick";
```

### CellEditorProps

```ts
type CellEditorProps = {
    readonly editStart: CellEditorStart;
    readonly value: unknown;
    readonly row: LevelRow;
    readonly column: ColumnSchema;
    readonly path: GridPath;
    readonly anchor: HTMLElement;
    readonly commit: (newValue: unknown, commit?: CommitTarget) => void;
    readonly cancel: () => void;
};
```

### CellEditorStart

```ts
type CellEditorStart = {
    readonly trigger: "type";
    readonly typedSeed: string;
} | {
    readonly trigger: NonTypedCellEditGesture;
};
```

### CellNavigationIntent

```ts
type CellNavigationIntent = {
    readonly type: "commitMove";
    readonly target: Exclude<CommitTarget, "stay">;
} | {
    readonly type: "moveColumn";
    readonly direction: "left" | "right" | "rowStart" | "rowEnd";
    readonly extend: boolean;
} | {
    readonly type: "moveRow";
    readonly direction: "up" | "down";
    readonly colPolicy: ColPolicy;
    readonly extend: boolean;
} | {
    readonly type: "moveRowDelta";
    readonly delta: number;
    readonly colPolicy: "preserve";
    readonly extend: boolean;
} | {
    readonly type: "moveGridEdge";
    readonly edge: "first" | "last";
    readonly colPolicy: "preserve";
    readonly extend: boolean;
} | {
    readonly type: "startEdit";
    readonly coord: Coord;
    readonly trigger: "type";
    readonly initial: string;
} | {
    readonly type: "startEdit";
    readonly coord: Coord;
    readonly trigger: NonTypedCellEditGesture;
    readonly initial?: never;
} | {
    readonly type: "activateCell";
    readonly coord: Coord;
    readonly trigger: CellActivationTrigger;
} | {
    readonly type: "activateRow";
    readonly rowId: RowId;
    readonly coord: Coord;
    readonly trigger: RowActivationTrigger;
} | {
    readonly type: "cellPressed";
    readonly target: Coord;
    readonly extend: boolean;
} | {
    readonly type: "rowPressed";
    readonly target: RowId;
    readonly origin: {
        readonly kind: "cell";
        readonly target: Coord;
    } | {
        readonly kind: "row-control";
    };
    readonly gesture: RowSelectionGesture;
} | {
    readonly type: "clearCellSelection";
} | {
    readonly type: "clearRowSelection";
} | {
    readonly type: "focusFirstCell";
} | {
    readonly type: "toggleActiveRowSelection";
};
```

### CellRenderActivation

```ts
type CellRenderActivation = {
    readonly label: string;
    readonly availability: CellAvailability;
    readonly run: () => void;
};
```

### CellRenderProps

```ts
type CellRenderProps = {
    readonly value: unknown;
    readonly row: LevelRow;
    readonly column: ColumnSchema;
    readonly path: GridPath;
    /** Whether this cell is also the data-backed row-selection header. */
    readonly rowHeader?: boolean;
    readonly activation: CellRenderActivation | null;
};
```

### CellSelectionRectangle

The displayed rows and columns covered by a cell selection.

```ts
type CellSelectionRectangle = {
    readonly rows: readonly LevelRow[];
    readonly columns: readonly ColumnSchema[];
};
```

### CellSelectionStatus

```ts
type CellSelectionStatus = "none" | "in-selection" | "focus" | "editing";
```

### ColId

```ts
type ColId = string;
```

### ColPolicy

```ts
type ColPolicy = "preserve" | "first" | "last";
```

### ColumnSchema

```ts
type ColumnSchema = {
    readonly id: ColId;
    readonly name: string;
    readonly renderCell: (props: CellRenderProps) => ReactNode;
    readonly compare?: (a: unknown, b: unknown) => number;
    readonly edit?: CellEditBehavior;
    readonly activation?: CellActivation;
    readonly copy?: GridColumnCopyBehavior;
    readonly meta?: unknown;
};
```

### CommitTarget

```ts
type CommitTarget = NavigationDirection | "stay";
```

### ControllerState

```ts
type ControllerState = {
    readonly liveCellFocus: Coord | null;
    readonly cellSelection: CellSelectionState | null;
    readonly editing: EditingState | null;
    readonly liveRowFocus: RowId | null;
    readonly rowSelection: RowSelection;
};
```

### Coord

```ts
type Coord = {
    readonly rowId: RowId;
    readonly colId: ColId;
};
```

### CreateNodeResult

```ts
type CreateNodeResult = {
    readonly node: TreeNode;
    readonly atIndex: number;
};
```

### CursorPlacement

```ts
type CursorPlacement = "selectAll" | "atEnd";
```

### DisplayedRowRef

```ts
type DisplayedRowRef = {
    readonly id: RowId;
    readonly kind: LevelRowKind;
};
```

### DisplayedRows

```ts
type DisplayedRows = {
    readonly rows: readonly LevelRow[];
    readonly rowById: ReadonlyMap<RowId, LevelRow>;
    readonly rowIndexById: ReadonlyMap<RowId, number>;
};
```

### DisplayedRowSequence

```ts
type DisplayedRowSequence = {
    readonly rows: readonly DisplayedRowRef[];
};
```

### EditingState

```ts
type EditingState = {
    readonly coord: Coord;
    readonly editStart: CellEditorStart;
};
```

### FetchPageRequest

```ts
type FetchPageRequest<F = unknown> = {
    readonly sort?: readonly SortDescriptor[];
    readonly filter?: F;
    readonly page: number;
    readonly pageSize: number;
};
```

### FetchPageResponse

```ts
type FetchPageResponse = {
    readonly nodes: readonly TreeNode[];
    readonly totalCount?: number;
    readonly footerRows?: readonly FooterRow[];
};
```

### FilterQueryCapability

```ts
type FilterQueryCapability<TFilter = unknown> = {
    readonly current: () => TFilter | undefined;
    readonly set: (filter: TFilter | undefined) => Promise<SourceLoadResult>;
};
```

### FooterLevelRow

```ts
type FooterLevelRow = Extract<LevelRow, {
    kind: "footer";
}>;
```

### FooterRow

```ts
type FooterRow = {
    readonly rowKey: RowKey;
    readonly columns: Readonly<Record<ColId, unknown>>;
};
```

### GridAction

```ts
type GridAction = StartEditAction | {
    readonly type: "CANCEL_EDIT";
} | {
    readonly type: "COMMIT_EDIT";
    readonly value: unknown;
    readonly commit: CommitTarget;
};
```

### GridActiveRow

A live, displayed row resolved from the runtime's global active cursor.

```ts
type GridActiveRow<Kind extends LevelRowKind = LevelRowKind> = Kind extends LevelRowKind ? {
    readonly row: LevelRowOfKind<Kind>;
    readonly level: GridLevelRuntime;
} : never;
```

### GridChromeContext

```ts
type GridChromeContext = {
    path: GridPath;
    levelName: string;
    presentation: GridPresentation;
    schema: readonly ColumnSchema[];
    rowHeaderColumn: RowHeaderColumn;
};
```

### GridColumnCopyBehavior

```ts
type GridColumnCopyBehavior = (context: {
    readonly path: GridPath;
    readonly column: ColumnSchema;
    readonly rows: readonly LevelRow[];
}) => readonly GridCopyColumn[] | Promise<readonly GridCopyColumn[]>;
```

### GridCopyColumn

```ts
type GridCopyColumn<TRow = LevelRow> = {
    readonly header: string;
    readonly valueAt: (row: TRow, rowIndex: number) => unknown;
};
```

### GridCopyContextMenuProps

```ts
type GridCopyContextMenuProps = {
    children: ReactNode;
    /**
     * Domain-supplied menu entries appended after the copy items. Receives the
     * grid target the menu was opened on (null outside cells). Consumers use
     * this for schema-derived contributions such as row and cell links; the
     * grid itself stays domain-agnostic.
     */
    renderExtraItems?: (target: GridCopyTarget | null) => ReactNode;
};
```

### GridCopyCsvOptions

```ts
type GridCopyCsvOptions = {
    includeHeaders: boolean;
};
```

### GridCopyTarget

```ts
type GridCopyTarget = {
    path: CellCursor["path"];
    selection: CellSelectionState;
};
```

### GridDataSource

```ts
type GridDataSource = {
    readonly rootSource: () => LevelDataSource;
    readonly resolveChild: (parentPath: GridPath, parentRowKey: RowKey, childLevelName: string) => LevelDataSource;
    readonly dispose: () => void;
};
```

### GridEffect

```ts
type GridEffect = {
    readonly type: "focusContainer";
} | {
    readonly type: "focusCellEditor";
    readonly cursor: CursorPlacement;
} | {
    readonly type: "scrollFocusIntoView";
    readonly coord: Coord;
} | {
    readonly type: "scrollRowIntoView";
    readonly rowId: RowId;
};
```

### GridEmptyContext

```ts
type GridEmptyContext = GridChromeContext & {
    state: Extract<LevelSourceState, {
        status: "ready";
    }>;
    phantomCount: number;
};
```

### GridEvents

```ts
type GridEvents = {
    mutationCommitted: MutationCommittedEvent;
    cellSelectionChanged: {
        readonly path: GridPath;
        readonly selection: CellSelectionState | null;
    };
    rowSelectionChanged: {
        readonly path: GridPath;
        readonly selection: RowSelection;
    };
    /** A configured keyboard or pointer gesture activated the current row. */
    rowActivated: {
        readonly activeRow: GridActiveRow;
        readonly trigger: RowActivationTrigger;
    };
    cellReconciled: {
        readonly path: GridPath;
        readonly event: ReconcileEvent;
    };
    levelStatusChanged: {
        readonly path: GridPath;
        readonly status: LevelStatus;
        readonly error?: Error;
    };
    phantomRowCommitted: {
        readonly path: GridPath;
        readonly rowKey: RowKey;
        readonly node: TreeNode;
        readonly atIndex: number;
    };
    phantomRowCreateFailed: {
        readonly path: GridPath;
        readonly rowKey: RowKey;
        readonly reason: string;
    };
    cellActivationError: {
        readonly path: GridPath;
        readonly coord: Coord;
        readonly trigger: CellActivationTrigger;
        readonly error: unknown;
    };
};
```

### GridInteractionConfig

```ts
type GridInteractionConfig = CellGridInteractionConfig | RowListInteractionConfig;
```

### GridLevelChrome

```ts
type GridLevelChrome = {
    renderHeader?: (ctx: GridChromeContext) => ReactNode;
    renderStatus?: (ctx: GridStatusContext) => ReactNode;
    renderEmpty?: (ctx: GridEmptyContext) => ReactNode;
    /**
     * Renders chrome derived from the current cell range, such as totals beneath
     * selected numeric columns. The callback runs only while the range resolves
     * to rows and columns that are still displayed.
     */
    renderSelectionSummary?: (ctx: GridSelectionSummaryContext) => ReactNode;
    levelContainerClassName?: (ctx: GridChromeContext) => string | undefined;
    levelContainerStyle?: (ctx: GridChromeContext) => CSSProperties | undefined;
};
```

### GridLevelRuntime

The public runtime for one registered grid path.

```ts
type GridLevelRuntime = {
  path: …;
  schema: …;
  data: …;
  displayedRows: …;
  displayedRowSequence: …;
  displayedRow: …;
  dataRowTarget: …;
  subscribeDisplayedRows: …;
  subscribeDisplayedRowSequence: …;
  subscribeDisplayedRow: …;
  activeRow: …;
  selectedRows: …;
  selectedRowIds: …;
  rowInteractionSnapshot: …;
  subscribeActiveRow: …;
  subscribeSelectedRows: …;
  subscribeSelectedRowIds: …;
  subscribeRowInteractionSnapshot: …;
  selectRow: …;
  setRowSelection: …;
  toggleRowSelection: …;
  extendRowSelectionTo: …;
  clearRowSelection: …;
  isExpanded: …;
  subscribeExpansion: …;
  expand: …;
  collapse: …;
  toggleExpand: …;
  writeCell: …;
  applyChanges: …;
  createRow: …;
  removeRow: …;
  drafts: …;
}
// 33 members; inferred types elided. Read the full type from the declaration file if needed.
```

### GridPath

```ts
type GridPath = Brand<string, "GridPath">;
```

### GridPointerInput

Renderer-neutral pointer input used before a semantic activation exists.

```ts
type GridPointerInput = {
    readonly gesture: "click" | "doubleClick";
    readonly button: number;
    readonly altKey: boolean;
    readonly ctrlKey: boolean;
    readonly metaKey: boolean;
    readonly shiftKey: boolean;
};
```

### GridPresentation

```ts
type GridPresentation = "tabular" | "cards";
```

### GridRowActivatedEvent

```ts
type GridRowActivatedEvent = GridEvents["rowActivated"];
```

### GridRuntime

The application-facing control surface for one running grid.

```ts
type GridRuntime = {
    /** The immutable schema snapshot used by this runtime. */
    readonly schema: GridSchema;
    /** The immutable interaction configuration used by this runtime. */
    readonly interaction: GridInteractionConfig;
    /** The eagerly registered root level. */
    readonly root: GridLevelRuntime;
    /**
     * Returns the current registration for a path.
     * The call fails when the path has not been expanded or was unregistered.
     */
    level(path: GridPath): GridLevelRuntime;
    /** Returns an identity-stable snapshot of current level registrations. */
    registeredLevels(): readonly GridLevelRuntime[];
    /**
     * Observes additions and removals in the level registry. Source state, row
     * data, selection, and ordinary expansion changes do not wake it.
     */
    subscribeLevels(listener: () => void): () => void;
    /** Reads the current row and its latest displayed values. */
    activeRow(): GridActiveRow | null;
    /** Observes active-row identity and displayed-value changes. */
    subscribeActiveRow(listener: () => void): () => void;
    /** Resolves static level schema from a well-formed path. */
    schemaAt(path: GridPath): LevelSchema;
    /** Builds and removes validated row-operation targets across paths. */
    readonly rowOperations: GridRowOperations;
    /**
     * Observes a typed host event. Events describe commands and outcomes; they
     * are separate from the subscriptions used to render current state.
     */
    on<E extends keyof GridEvents>(event: E, listener: (payload: GridEvents[E]) => void): () => void;
    /** Stops notifications and releases resources. Repeated calls are safe. */
    dispose(): void;
};
```

### GridSchema

```ts
type GridSchema = {
    readonly levels: Readonly<Record<string, LevelSchema>>;
    readonly rootLevel: string;
};
```

### GridSelectionSummaryContext

The level and resolved cell range passed to `renderSelectionSummary`.

```ts
type GridSelectionSummaryContext = GridChromeContext & {
    selection: CellSelectionRectangle;
};
```

### GridStatusContext

```ts
type GridStatusContext = GridChromeContext & {
    state: LevelSourceState;
    retry?: () => Promise<SourceLoadResult>;
};
```

### InMemoryGridDataSourceOpts

```ts
type InMemoryGridDataSourceOpts<F = unknown> = {
    schema: GridSchema;
    tree: readonly TreeNode[];
    levels: {
        [levelName: string]: InMemoryLevelOpts<F>;
    };
};
```

### InMemoryLevelOpts

```ts
type InMemoryLevelOpts<F = unknown> = Omit<InMemoryLevelSourceOpts<F>, "initialNodes" | "columns" | "options"> & {
    readonly?: boolean;
};
```

### LevelDataSource

```ts
type LevelDataSource = {
    readonly state: () => LevelSourceState;
    readonly subscribe: (fn: () => void) => () => void;
    readonly dispose: () => void;
    readonly query?: LevelQueryCapabilities;
    readonly write?: WriteCapability;
};
```

### LevelOptions

```ts
type LevelOptions = {
    readonly defaultCollapsed?: boolean;
    readonly allowPhantoms?: boolean;
};
```

### LevelQueryCapabilities

```ts
type LevelQueryCapabilities = {
    readonly sort?: SortQueryCapability;
    readonly filter?: FilterQueryCapability<unknown>;
    readonly refetch?: () => Promise<SourceLoadResult>;
};
```

### LevelRow

```ts
type LevelRow = {
    readonly kind: "data";
    readonly id: RowId;
    readonly rowSelectable: boolean;
    readonly columns: Readonly<Record<ColId, unknown>>;
    readonly hasChildren: boolean;
    readonly source: TreeNode;
} | {
    readonly kind: "rollup";
    readonly id: RowId;
    readonly rowSelectable: boolean;
    readonly columns: Readonly<Record<ColId, unknown>>;
    readonly source: TreeNode;
} | {
    readonly kind: "opening";
    readonly id: RowId;
    readonly rowSelectable: boolean;
    readonly columns: Readonly<Record<ColId, unknown>>;
    readonly source: TreeNode;
} | {
    readonly kind: "closing";
    readonly id: RowId;
    readonly rowSelectable: boolean;
    readonly columns: Readonly<Record<ColId, unknown>>;
    readonly source: TreeNode;
} | {
    readonly kind: "subtotal";
    readonly id: RowId;
    readonly rowSelectable: boolean;
    readonly columns: Readonly<Record<ColId, unknown>>;
    readonly source: TreeNode;
} | {
    readonly kind: "footer";
    readonly id: RowId;
    readonly rowSelectable: boolean;
    readonly columns: Readonly<Record<ColId, unknown>>;
    readonly source: FooterRow;
} | {
    readonly kind: "phantom";
    readonly id: RowId;
    readonly rowSelectable: boolean;
    readonly columns: Readonly<Record<ColId, unknown>>;
    readonly source: PhantomRow;
};
```

### LevelRowKind

```ts
type LevelRowKind = "data" | "rollup" | "opening" | "closing" | "subtotal" | "footer" | "phantom";
```

### LevelRowOfKind

```ts
type LevelRowOfKind<Kind extends LevelRowKind> = Extract<LevelRow, {
    kind: Kind;
}>;
```

### LevelSchema

```ts
type LevelSchema = {
    readonly name: string;
    readonly columns: readonly ColumnSchema[];
    readonly rowHeaderColumn: RowHeaderColumn;
    readonly options: LevelOptions;
    readonly childLevels: readonly string[];
};
```

### LevelSnapshot

```ts
type LevelSnapshot = {
    readonly nodes: readonly TreeNode[];
    readonly footerRows?: readonly FooterRow[];
};
```

### LevelSourceState

```ts
type LevelSourceState = {
    readonly status: "initialLoading";
    readonly snapshot: LevelSnapshot;
} | {
    readonly status: "ready";
    readonly snapshot: LevelSnapshot;
} | {
    readonly status: "refreshing";
    readonly snapshot: LevelSnapshot;
    readonly previous: LevelSnapshot;
} | {
    readonly status: "initialError";
    readonly snapshot: LevelSnapshot;
    readonly error: Error;
} | {
    readonly status: "refreshError";
    readonly snapshot: LevelSnapshot;
    readonly previous: LevelSnapshot;
    readonly error: Error;
};
```

### LevelStatus

```ts
type LevelStatus = LevelSourceState["status"];
```

### LoadedRowsBoundaryEvent

```ts
type LoadedRowsBoundaryEvent = {
    readonly kind: "cell";
    readonly loadPath: GridPath;
    readonly direction: "before" | "after";
    readonly origin: CellCursor;
    readonly colPolicy: ColPolicy;
    readonly extend: boolean;
} | {
    readonly kind: "row";
    readonly loadPath: GridPath;
    readonly direction: "before" | "after";
    readonly origin: RowCursor;
    readonly extend: boolean;
};
```

### NavigationDirection

```ts
type NavigationDirection = "up" | "down" | "left" | "right" | "next" | "prev" | "rowStart" | "rowEnd" | "start" | "end" | "pageUp" | "pageDown";
```

### NonTypedCellEditGesture

```ts
type NonTypedCellEditGesture = Exclude<CellEditGesture, "type">;
```

### PatchCellResponse

```ts
type PatchCellResponse = {
    readonly kind: "value";
    readonly value: unknown;
} | {
    readonly kind: "patch";
    readonly patch: Readonly<Record<ColId, unknown>>;
} | {
    readonly kind: "row";
    readonly node: TreeNode;
} | {
    readonly kind: "reload";
};
```

### PathDecomposition

```ts
type PathDecomposition = {
    readonly rootLevelName: string;
    readonly edges: readonly PathEdge[];
};
```

### PathEdge

```ts
type PathEdge = {
    readonly rowKey: RowKey;
    readonly levelName: string;
};
```

### PhantomRowsConfig

```ts
type PhantomRowsConfig = false | {
    readonly isBlank?: (columns: Readonly<Record<ColId, unknown>>) => boolean;
    readonly makeRowKey?: (context: {
        readonly path: import('./identity').GridPath;
        readonly existing: readonly PhantomRow[];
    }) => RowKey;
};
```

### PhantomRowState

```ts
type PhantomRowState = {
    readonly kind: "editing";
} | {
    readonly kind: "saving";
} | {
    readonly kind: "failed";
    readonly reason: string;
};
```

### ReconcileEvent

```ts
type ReconcileEvent = {
    readonly kind: "agreed";
    readonly rowKey: RowKey;
    readonly colId: ColId;
    readonly value: unknown;
} | {
    readonly kind: "diverged";
    readonly rowKey: RowKey;
    readonly colId: ColId;
    readonly optimisticValue: unknown;
    readonly authoritativeValue: unknown;
    readonly priorValue: unknown;
} | {
    readonly kind: "rejected";
    readonly rowKey: RowKey;
    readonly colId: ColId;
    readonly optimisticValue: unknown;
    readonly reason: string;
    readonly priorValue: unknown;
};
```

### RestEndpointFactory

```ts
type RestEndpointFactory<F = unknown> = (ctx: {
    ancestors: AncestorChain;
}) => RestLevelSourceOpts<F>;
```

### RestGridDataSourceOpts

```ts
type RestGridDataSourceOpts<F = unknown> = {
    schema: GridSchema;
    endpoints: {
        [levelName: string]: RestEndpointFactory<F>;
    };
};
```

### RowActivationConfig

```ts
type RowActivationConfig = {
    readonly startsOn: readonly RowActivationGesture[];
};
```

### RowActivationGesture

```ts
type RowActivationGesture = "enter" | "click" | "doubleClick";
```

### RowActivationTrigger

```ts
type RowActivationTrigger = {
    readonly kind: "keyboard";
    readonly gesture: "enter";
} | {
    readonly kind: "pointer";
    readonly gesture: "click" | "doubleClick";
};
```

### RowCapabilities

```ts
type RowCapabilities = {
    editable: boolean;
    focusable: boolean;
    selectable: boolean;
    rowSelectable: boolean;
    canExpand: boolean;
};
```

### RowCursor

```ts
type RowCursor = {
    readonly path: GridPath;
    readonly rowId: RowId;
};
```

### RowDirection

```ts
type RowDirection = "up" | "down" | "first" | "last" | {
    readonly delta: number;
};
```

### RowHeaderColumn

```ts
type RowHeaderColumn<ColumnName extends string = ColId> = {
    readonly column: ColumnName;
} | "empty-selectable-cell" | "none";
```

### RowId

```ts
type RowId = Brand<string, "RowId">;
```

### RowInteractionSnapshot

```ts
type RowInteractionSnapshot = {
    readonly activeRowId: RowId | null;
    readonly selectedRowIds: readonly RowId[];
    readonly statusByRowId: ReadonlyMap<RowId, RowInteractionStatus>;
};
```

### RowInteractionStatus

```ts
type RowInteractionStatus = "idle" | "selected" | "cursor" | "cursor-selected";
```

### RowKey

```ts
type RowKey = string;
```

### RowNavigationIntent

```ts
type RowNavigationIntent = {
    readonly type: "moveActiveRow";
    readonly direction: "up" | "down";
    readonly extend: boolean;
} | {
    readonly type: "moveActiveRowDelta";
    readonly delta: number;
    readonly extend: boolean;
} | {
    readonly type: "moveActiveRowEdge";
    readonly edge: "first" | "last";
    readonly extend: boolean;
} | {
    readonly type: "focusFirstRow";
} | {
    readonly type: "toggleActiveRowSelection";
} | {
    readonly type: "clearRowSelection";
} | {
    readonly type: "activateRow";
    readonly rowId: RowId;
    readonly trigger: RowActivationTrigger;
} | {
    readonly type: "expandActiveRow";
} | {
    readonly type: "collapseActiveRow";
} | {
    readonly type: "toggleActiveRowExpansion";
};
```

### RowOperationTarget

```ts
type RowOperationTarget<Kind extends LevelRow["kind"] = LevelRow["kind"]> = Kind extends LevelRow["kind"] ? {
    readonly row: LevelRowOfKind<Kind>;
    readonly [issuedRowOperationTarget]: true;
} : never;
```

### RowQuery

```ts
type RowQuery<F = unknown> = {
    page: number;
    pageSize: number;
    sort?: readonly SortDescriptor[];
    filter?: F;
};
```

### RowQueryChange

```ts
type RowQueryChange = "changed" | "unchanged";
```

### RowQueryState

```ts
type RowQueryState<F = unknown> = {
    current(): RowQuery<F>;
    setSortState(sort: readonly SortDescriptor[] | undefined): RowQueryChange;
    setFilterState(filter: F | undefined): RowQueryChange;
    setPageState(page: number, pageSize: number): RowQueryChange;
};
```

### RowRemovalResult

```ts
type RowRemovalResult = {
    readonly kind: "complete";
    readonly removed: readonly RowOperationTarget<"data">[];
} | {
    readonly kind: "partial";
    readonly removed: readonly RowOperationTarget<"data">[];
    readonly failed: RowOperationTarget<"data">;
    readonly unattempted: readonly RowOperationTarget<"data">[];
    readonly error: unknown;
};
```

### RowSelection

```ts
type RowSelection = null | {
    readonly kind: "single";
    readonly rowId: RowId;
} | {
    readonly kind: "range";
    readonly anchor: RowId;
    readonly head: RowId;
} | {
    readonly kind: "set";
    readonly rowIds: ReadonlySet<RowId>;
};
```

### RowSelectionGesture

```ts
type RowSelectionGesture = "replace" | "extend" | "toggle";
```

### RuntimeArgs

```ts
type RuntimeArgs = {
    /** Static levels, columns, and parent-child relationships for this runtime. */
    readonly schema: GridSchema;
    /** Acquires the root source and child sources as paths are registered. */
    readonly dataSource: GridDataSource;
    /** Chooses cell-grid or row-list behavior for the runtime's full lifetime. */
    readonly interaction?: GridInteractionConfig;
    /** Optional draft channel. The runtime creates and owns one when omitted. */
    readonly phantoms?: PhantomChannel;
    /** Enables and configures automatic append-row drafts. */
    readonly phantomRows?: PhantomRowsConfig;
    readonly onLoadedRowsBoundary?: (event: LoadedRowsBoundaryEvent) => Promise<SourceLoadResult> | false;
    /** Initial host event listeners. They are installed before root acquisition. */
    readonly on?: {
        readonly [E in keyof GridEvents]?: (payload: GridEvents[E]) => void;
    };
    /** Receives observer failures without interrupting a runtime transition. */
    readonly onObserverError?: (error: unknown) => void;
};
```

### RuntimeLevelDataSource

```ts
type RuntimeLevelDataSource = {
    readonly state: () => LevelSourceState;
    readonly subscribe: (fn: () => void) => () => void;
    readonly query?: LevelQueryCapabilities;
    readonly canWrite: boolean;
    readonly onReconcile: (fn: (event: ReconcileEvent) => void) => () => void;
};
```

### SortDescriptor

```ts
type SortDescriptor = {
    readonly colId: ColId;
    readonly direction: "asc" | "desc";
};
```

### SortQueryCapability

```ts
type SortQueryCapability = {
    readonly current: () => readonly SortDescriptor[] | undefined;
    readonly set: (sort: readonly SortDescriptor[] | undefined) => Promise<SourceLoadResult>;
};
```

### SourceLoadResult

```ts
type SourceLoadResult = {
    readonly kind: "ready";
    readonly state: Extract<LevelSourceState, {
        status: "ready";
    }>;
} | {
    readonly kind: "error";
    readonly state: Extract<LevelSourceState, {
        status: "initialError" | "refreshError";
    }>;
} | {
    readonly kind: "unchanged";
    readonly state: LevelSourceState;
} | {
    readonly kind: "superseded";
} | {
    readonly kind: "disposed";
};
```

### StartEditAction

```ts
type StartEditAction = {
    readonly type: "START_EDIT";
    readonly coord: Coord;
    readonly trigger: "type";
    readonly initial: string;
} | {
    readonly type: "START_EDIT";
    readonly coord: Coord;
    readonly trigger: NonTypedCellEditGesture;
    readonly initial?: never;
};
```

### TreeBackedLevelRow

```ts
type TreeBackedLevelRow = Extract<LevelRow, {
    kind: "data" | "rollup" | "opening" | "closing" | "subtotal";
}>;
```

### TreeNode

```ts
type TreeNode = {
    readonly rowKey: RowKey;
    readonly levelName: string;
    readonly columns: Readonly<Record<ColId, unknown>>;
    readonly rollup?: Readonly<Record<ColId, unknown>>;
    readonly children?: Readonly<Record<string, TreeNode | readonly TreeNode[]>>;
    readonly childFooterRows?: Readonly<Record<string, readonly FooterRow[]>>;
    readonly kind?: "opening" | "closing" | "subtotal";
};
```

### WriteCapability

```ts
type WriteCapability = {
    readonly setCell: (rowKey: RowKey, colId: ColId, value: unknown) => void;
    readonly applyChanges: (changes: readonly CellChange[]) => void;
    readonly createNode: (node: TreeNode, atIndex?: number) => Promise<CreateNodeResult>;
    readonly removeNode: (rowKey: RowKey) => void | Promise<void>;
    readonly onReconcile: (fn: (event: ReconcileEvent) => void) => () => void;
    readonly canAppendRow?: () => boolean;
};
```
