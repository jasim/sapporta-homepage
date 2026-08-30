---
title: "@sapporta/grid — Functions and components"
package: "@sapporta/grid"
version: "0.6.0"
specifier: "@sapporta/grid"
---

> Sapporta API reference for `@sapporta/grid@0.6.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/grid — Functions and components

Import from `@sapporta/grid`. Documented from `@sapporta/grid@0.6.0`; confirm the installed version with `node -p "require('@sapporta/grid/package.json').version"`.

64 of 191 symbols published from `@sapporta/grid`. Other groups: [Types](https://sapporta.com/api-reference/grid/index-types.md), [Values, classes, and namespaces](https://sapporta.com/api-reference/grid/index-values.md).

### activationStartsOn

```ts
function activationStartsOn(column: ColumnSchema, gesture: CellActivationGesture): boolean;
```

### capabilitiesFor

```ts
function capabilitiesFor(kind: LevelRowKind): RowCapabilities;
```

### capabilitiesOf

```ts
function capabilitiesOf(row: LevelRow): RowCapabilities;
```

### CellActivationButton

```ts
function CellActivationButton({ activation, gridPart, children, }: {
    activation: CellRenderActivation;
    gridPart: string;
    children: ReactNode;
}): import("react").JSX.Element;
```

### childPath

Appends one parent-row and child-level edge to a path.

```ts
function childPath(parent: GridPath, parentRowKey: RowKey, childKey: string): GridPath;
```

### coordsEqual

Compares two cell coordinates by row and column identity.

```ts
function coordsEqual(a: Coord, b: Coord): boolean;
```

### createGridRuntime

```ts
function createGridRuntime(args: RuntimeArgs): GridRuntime;
```

### cycleSort

```ts
function cycleSort(order: readonly SortDescriptor[], colId: ColId, mode: "replace" | "extend"): SortDescriptor[];
```

### decomposePath

```ts
function decomposePath(path: GridPath): PathDecomposition;
```

### describeCellActivation

```ts
function describeCellActivation(activation: CellActivation, context: CellActivationContext): CellActivationState;
```

### editStartsOn

```ts
function editStartsOn(column: ColumnSchema, gesture: CellEditGesture): boolean;
```

### ExpandableCellFrame

```ts
function ExpandableCellFrame({ activation, path, rowId, children, }: {
    activation: CellRenderActivation | null;
    path: GridPath;
    rowId: RowId;
    children?: ReactNode;
}): import("react").JSX.Element;
```

### filterSourceNodes

```ts
function filterSourceNodes(nodes: readonly TreeNode[], predicate: RowPredicate | undefined): readonly TreeNode[];
```

### footerSourceForRow

```ts
function footerSourceForRow(row: LevelRow): FooterRow | null;
```

### GridCopyContextMenu

```ts
function GridCopyContextMenu({ children, renderExtraItems, }: GridCopyContextMenuProps): import("react").JSX.Element;
```

### GridLevel

```ts
function GridLevel({ path, chrome, presentation, }: {
    path: GridPath;
    chrome?: GridLevelChrome;
    presentation: GridPresentation;
}): import("react").JSX.Element;
```

### GridRuntimeProvider

```ts
function GridRuntimeProvider({ runtime, children, }: {
    runtime: GridRuntime;
    children: ReactNode;
}): import("react").JSX.Element;
```

### hostBackedRowQuery

```ts
function hostBackedRowQuery<F = unknown>(state: RowQueryState<F>): RowQueryState<F>;
```

### inMemoryGridDataSource

```ts
function inMemoryGridDataSource<F = unknown>(opts: InMemoryGridDataSourceOpts<F>): GridDataSource;
```

### isDisplayedPhantomRowId

Reports whether a displayed row id belongs to a draft row.

```ts
function isDisplayedPhantomRowId(rowId: RowId): boolean;
```

### isFooterRow

```ts
function isFooterRow(row: LevelRow): row is FooterLevelRow;
```

### isTreeBackedRow

```ts
function isTreeBackedRow(row: LevelRow): row is TreeBackedLevelRow;
```

### makeRowId

Creates the source-backed data-row identity for a path and row key.

```ts
function makeRowId(path: GridPath, rowKey: RowKey): RowId;
```

### makeSelection

```ts
function makeSelection(coord: Coord): CellSelectionState;
```

### nextFocusableRow

```ts
function nextFocusableRow(displayed: DisplayedRows, fromIndex: number, step: 1 | -1, capabilities: CapabilitiesFn): LevelRow | null;
```

### parseChildPath

```ts
function parseChildPath(parent: GridPath, child: GridPath): {
    rowKey: RowKey;
    childKey: string;
} | null;
```

### parseSortString

```ts
function parseSortString(s: string | null | undefined, validColIds: ReadonlySet<ColId>): SortDescriptor[];
```

### pathOfRowId

Returns the exact grid path encoded in a row identity.

```ts
function pathOfRowId(id: RowId): GridPath;
```

### phantomKeyFromDisplayedRowId

Returns a draft row's local key, or `null` for every other row kind.

```ts
function phantomKeyFromDisplayedRowId(rowId: RowId): RowKey | null;
```

### resolveCellSelectionRectangle

Resolves a stored cell selection against the rows and columns currently displayed by a level.

```ts
function resolveCellSelectionRectangle(selection: CellSelectionState, displayed: DisplayedRows, columns: readonly ColumnSchema[]): CellSelectionRectangle | null;
```

### restGridDataSource

```ts
function restGridDataSource<F = unknown>(opts: RestGridDataSourceOpts<F>): GridDataSource;
```

### rootPath

Creates the only path registered during runtime construction.

```ts
function rootPath(rootLevelName: string): GridPath;
```

### rowExpansionActivation

```ts
function rowExpansionActivation(options?: {
    startsOn?: readonly CellActivationGesture[];
}): CellActivation;
```

### rowInteractionStatusFor

```ts
function rowInteractionStatusFor(rowId: RowId, snapshot: RowInteractionSnapshot): RowInteractionStatus;
```

### rowKeyOfRowId

Returns the path-local row key encoded in a row identity.

```ts
function rowKeyOfRowId(id: RowId): RowKey;
```

### rowsInSelection

```ts
function rowsInSelection(s: CellSelectionState, displayed: DisplayedRows): readonly RowId[];
```

### selectionContainsCoord

```ts
function selectionContainsCoord(selection: CellSelectionState, coord: Coord, displayed: DisplayedRows, colOrder: readonly ColId[]): boolean;
```

### selectionFocus

```ts
function selectionFocus(s: CellSelectionState): Coord;
```

### selectionIsSingleCell

```ts
function selectionIsSingleCell(s: CellSelectionState): boolean;
```

### serializeGridCopyTargetToCsv

```ts
function serializeGridCopyTargetToCsv(runtime: GridRuntime, target: GridCopyTarget, options: GridCopyCsvOptions): Promise<string | null>;
```

### sliceSourceNodes

```ts
function sliceSourceNodes(nodes: readonly TreeNode[], slice: {
    offset: number;
    limit: number;
}): readonly TreeNode[];
```

### sortOrderEqual

```ts
function sortOrderEqual(a: readonly SortDescriptor[], b: readonly SortDescriptor[]): boolean;
```

### sortSourceNodes

```ts
function sortSourceNodes(nodes: readonly TreeNode[], sort: readonly SortDescriptor[] | undefined, columns: readonly ColumnSchema[]): readonly TreeNode[];
```

### sourceOwnedRowQuery

```ts
function sourceOwnedRowQuery<F = unknown>(initial: RowQuery<F>): RowQueryState<F>;
```

### stringifySortOrder

```ts
function stringifySortOrder(order: readonly SortDescriptor[]): string | null;
```

### trailingEdge

```ts
function trailingEdge(path: GridPath): {
    parentPath: GridPath;
    parentRowKey: RowKey;
    childLevelName: string;
} | null;
```

### treeNodeForRow

```ts
function treeNodeForRow(row: LevelRow): TreeNode | null;
```

### useActiveCell

```ts
function useActiveCell(): CellCursor | null;
```

### useActiveCellForPath

```ts
function useActiveCellForPath(path: GridPath): Coord | null;
```

### useActiveRow

```ts
function useActiveRow(path: GridPath): RowCursor | null;
```

### useCellSelection

```ts
function useCellSelection(path: GridPath): CellSelectionState | null;
```

### useCellSelectionRectangle

Resolves one path's live cell range to the displayed rows and columns it currently covers.

```ts
function useCellSelectionRectangle(path: GridPath): CellSelectionRectangle | null;
```

### useDisplayedRow

```ts
function useDisplayedRow(path: GridPath, rowId: RowId): LevelRow;
```

### useDisplayedRowSequence

```ts
function useDisplayedRowSequence(path: GridPath): DisplayedRowSequence;
```

### useGridActiveRow

Reads the row currently carrying application context across the grid.

```ts
function useGridActiveRow(explicitRuntime?: GridRuntime): GridActiveRow | null;
```

### useGridRuntime

```ts
function useGridRuntime(): GridRuntime;
```

### useGridRuntimeEffect

```ts
function useGridRuntimeEffect(createRuntime: () => GridRuntime, deps: DependencyList): GridRuntime | null;
```

### useLevelSnapshot

```ts
function useLevelSnapshot(path: GridPath): LevelSnapshot;
```

### usePhantoms

```ts
function usePhantoms(path: GridPath): readonly PhantomRow[];
```

### useRowInteractionSnapshot

```ts
function useRowInteractionSnapshot(path: GridPath): RowInteractionSnapshot;
```

### useSelectedRowIds

```ts
function useSelectedRowIds(path: GridPath): readonly RowId[];
```

### useSelectedRows

```ts
function useSelectedRows(path: GridPath): RowSelection;
```

### validateLevelRowHeaderColumn

```ts
function validateLevelRowHeaderColumn(levelName: string, level: Pick<LevelSchema, "columns" | "rowHeaderColumn">, label?: string): void;
```

### withRowExpansionColumn

```ts
function withRowExpansionColumn(column: ColumnSchema, options?: RowExpansionColumnOptions): ColumnSchema;
```
