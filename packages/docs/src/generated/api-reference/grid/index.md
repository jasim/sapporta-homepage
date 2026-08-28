---
title: "@sapporta/grid"
package: "@sapporta/grid"
version: "0.5.1"
specifier: "@sapporta/grid"
---

> Sapporta API reference for `@sapporta/grid@0.5.1`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/grid

Import from `@sapporta/grid`. Documented from `@sapporta/grid@0.5.1`; confirm the installed version with `node -p "require('@sapporta/grid/package.json').version"`.

190 symbols are published directly from this specifier — too many for one page, so they are grouped below.

## Pages

- [Types (113)](https://sapporta.com/api-reference/grid/index-types.md) — Brand, BuildRowsRequest, CellActionApi, CellActivation, CellActivationColumnContext, CellActivationContext, CellActivationDescription, CellActivationGesture, CellActivationState, CellActivationTrigger, CellAvailability, CellChange, CellCursor, CellEditBehavior, CellEditGesture, CellEditorProps, CellEditorStart, CellNavigationIntent, CellRenderActivation, CellRenderProps, CellSelectionRectangle, CellSelectionStatus, ColId, ColPolicy, ColumnSchema, CommitTarget, ControllerState, Coord, CreateNodeResult, CursorPlacement, DisplayedRowRef, DisplayedRows, DisplayedRowSequence, EditingState, FetchPageRequest, FetchPageResponse, FilterQueryCapability, FooterLevelRow, FooterRow, GridAction, GridActiveRow, GridChromeContext, GridColumnCopyBehavior, GridCopyColumn, GridCopyContextMenuProps, GridCopyCsvOptions, GridCopyTarget, GridDataSource, GridEffect, GridEmptyContext, GridEvents, GridInteractionConfig, GridLevelChrome, GridLevelRuntime, GridPath, GridPointerInput, GridPresentation, GridRowActivatedEvent, GridRuntime, GridSchema, GridSelectionSummaryContext, GridStatusContext, InMemoryGridDataSourceOpts, InMemoryLevelOpts, LevelDataSource, LevelOptions, LevelQueryCapabilities, LevelRow, LevelRowKind, LevelRowOfKind, LevelSchema, LevelSnapshot, LevelSourceState, LevelStatus, LoadedRowsBoundaryEvent, NavigationDirection, NonTypedCellEditGesture, PatchCellResponse, PathDecomposition, PathEdge, PhantomRowsConfig, PhantomRowState, ReconcileEvent, RestEndpointFactory, RestGridDataSourceOpts, RowActivationConfig, RowActivationGesture, RowActivationTrigger, RowCapabilities, RowCursor, RowDirection, RowHeaderColumn, RowId, RowInteractionSnapshot, RowInteractionStatus, RowKey, RowNavigationIntent, RowOperationTarget, RowQuery, RowQueryChange, RowQueryState, RowRemovalResult, RowSelection, RowSelectionGesture, RuntimeArgs, RuntimeLevelDataSource, SortDescriptor, SortQueryCapability, SourceLoadResult, StartEditAction, TreeBackedLevelRow, TreeNode, WriteCapability
- [Functions and components (64)](https://sapporta.com/api-reference/grid/index-functions.md) — activationStartsOn, capabilitiesFor, capabilitiesOf, CellActivationButton, childPath, coordsEqual, createGridRuntime, cycleSort, decomposePath, describeCellActivation, editStartsOn, ExpandableCellFrame, filterSourceNodes, footerSourceForRow, GridCopyContextMenu, GridLevel, GridRuntimeProvider, hostBackedRowQuery, inMemoryGridDataSource, isDisplayedPhantomRowId, isFooterRow, isTreeBackedRow, makeRowId, makeSelection, nextFocusableRow, parseChildPath, parseSortString, pathOfRowId, phantomKeyFromDisplayedRowId, resolveCellSelectionRectangle, restGridDataSource, rootPath, rowExpansionActivation, rowInteractionStatusFor, rowKeyOfRowId, rowsInSelection, selectionContainsCoord, selectionFocus, selectionIsSingleCell, serializeGridCopyTargetToCsv, sliceSourceNodes, sortOrderEqual, sortSourceNodes, sourceOwnedRowQuery, stringifySortOrder, trailingEdge, treeNodeForRow, useActiveCell, useActiveCellForPath, useActiveRow, useCellSelection, useCellSelectionRectangle, useDisplayedRow, useDisplayedRowSequence, useGridActiveRow, useGridRuntime, useGridRuntimeEffect, useLevelSnapshot, usePhantoms, useRowInteractionSnapshot, useSelectedRowIds, useSelectedRows, validateLevelRowHeaderColumn, withRowExpansionColumn
- [Values, classes, and namespaces (13)](https://sapporta.com/api-reference/grid/index-values.md) — CELL_EDITING_GRID, CELL_EDITING_NO_SELECTION_GRID, CELL_GRID_WITH_ACTIVE_ROW, CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION, CELL_PRIMARY_WITH_SELECTED_SIDE_PANEL_ROW, CELL_PRIMARY_WITH_SIDE_PANEL_ROW, DEFAULT_CELL_EDIT_GESTURES, defaultGridLevelChrome, firstFocusableRow, lastFocusableRow, ROW_MULTISELECT_LIST, ROW_PRIMARY_MASTER_DETAIL, ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION

## Also available from narrower specifiers (3)

These are exported by `@sapporta/grid` too, but their signatures live on the narrower page. Prefer the narrower specifier in application code.

- `@sapporta/grid/advanced` — CellSelectionState, PhantomChannel, PhantomRow
