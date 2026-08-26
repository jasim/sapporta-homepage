---
title: "@sapporta/grid/advanced"
package: "@sapporta/grid"
version: "0.5.0"
specifier: "@sapporta/grid/advanced"
---

> Sapporta API reference for `@sapporta/grid@0.5.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/grid/advanced

Import from `@sapporta/grid/advanced`. Documented from `@sapporta/grid@0.5.0`; confirm the installed version with `node -p "require('@sapporta/grid/package.json').version"`.

17 symbols documented here.

## Types (9)

### CellSelectionState

```ts
type CellSelectionState = {
    readonly anchor: Coord;
    readonly head: Coord;
};
```

### CursorContinuation

```ts
type CursorContinuation = {
    readonly kind: "cell";
    readonly target: CellCursor;
} | {
    readonly kind: "row";
    readonly target: RowCursor;
} | {
    readonly kind: "grid";
    readonly path: GridPath;
};
```

### CursorManager

```ts
interface CursorManager {
    readonly moveCellCursorTo: (target: CellCursor) => void;
    readonly extendCellSelectionTo: (target: CellCursor) => void;
    readonly setCellRange: (path: GridPath, anchor: Coord, head: Coord) => void;
    readonly clearCellRange: (path: GridPath) => void;
    readonly clearCellCursor: () => void;
    readonly currentCellCursor: () => CellCursor | null;
    readonly moveRowCursorTo: (target: RowCursor) => void;
    readonly extendRowSelectionToCursor: (target: RowCursor) => void;
    readonly setRowSelection: (path: GridPath, selection: RowSelection) => void;
    readonly clearRowSelection: (path: GridPath) => void;
    readonly clearRowCursor: () => void;
    readonly currentRowCursor: () => RowCursor | null;
}
```

### GridControllerPublic

```ts
type GridControllerPublic = ReadonlyControllerStore & GridControllerPublicVerbs;
```

### PhantomChannel

```ts
type PhantomChannel = {
    readonly get: (path: GridPath) => readonly PhantomRow[];
    readonly add: (path: GridPath, phantom: PhantomRow) => void;
    readonly remove: (path: GridPath, rowKey: RowKey) => void;
    readonly setCell: (path: GridPath, rowKey: RowKey, colId: ColId, value: unknown) => void;
    readonly setState: (path: GridPath, rowKey: RowKey, state: PhantomRowState) => void;
    readonly update: (path: GridPath, rowKey: RowKey, update: (row: PhantomRow) => PhantomRow) => void;
    readonly subscribe: (path: GridPath, fn: () => void) => () => void;
    readonly dispose: () => void;
};
```

### PhantomRow

```ts
type PhantomRow = {
    readonly rowKey: RowKey;
    readonly columns: Readonly<Record<ColId, unknown>>;
    readonly state: PhantomRowState;
};
```

### PhantomRowLifecycle

```ts
type PhantomRowLifecycle = {
    readonly ensureBlankForEmptyPath: (path: GridPath) => PhantomRow | null;
    readonly reconcileBlankAppendPhantoms: (path: GridPath) => void;
    readonly boundaryCellTarget: (path: GridPath, colId: ColId, colPolicy: "preserve" | "first" | "last") => CellCursor | null;
    readonly boundaryRowTarget: (path: GridPath) => {
        path: GridPath;
        rowId: RowId;
    } | null;
    readonly onCellCursorChanging: (previous: CellCursor | null, next: CellCursor | null) => void;
    readonly onRowCursorChanging: (previous: {
        path: GridPath;
        rowId: RowId;
    } | null, next: {
        path: GridPath;
        rowId: RowId;
    } | null) => void;
    readonly setPhantomCell: (path: GridPath, rowKey: RowKey, colId: ColId, value: unknown) => void;
    readonly isBlank: (columns: Readonly<Record<ColId, unknown>>) => boolean;
};
```

### PhantomRowLifecycleDeps

```ts
type PhantomRowLifecycleDeps = {
    readonly config: PhantomRowsConfig | undefined;
    readonly getSource: (path: GridPath) => LevelDataSource | undefined;
    readonly schemaAt: (path: GridPath) => LevelSchema;
    readonly getPhantoms: (path: GridPath) => readonly PhantomRow[];
    readonly addPhantom: (path: GridPath, phantom: PhantomRow) => void;
    readonly removePhantom: (path: GridPath, rowKey: RowKey) => void;
    readonly setPhantomCell: (path: GridPath, rowKey: RowKey, colId: ColId, value: unknown) => void;
    readonly setPhantomState: (path: GridPath, rowKey: RowKey, state: PhantomRow["state"]) => void;
    readonly commitPhantomRow: (path: GridPath, rowKey: RowKey) => void;
};
```

### RowRemovalRef

```ts
type RowRemovalRef = {
    readonly path: GridPath;
    readonly rowId: RowId;
};
```

## Functions and components (8)

### applyCursorContinuation

Applies a previously computed cursor landing and queues reveal work.

```ts
function applyCursorContinuation(runtime: GridRuntime, continuation: CursorContinuation): void;
```

### cellActivationFor

Describes and runs the configured activation for one displayed cell.

```ts
function cellActivationFor(runtime: GridRuntime, path: GridPath, coord: Coord, trigger?: CellActivationTrigger): CellRenderActivation | null;
```

### controllerFor

Returns the path-local controller for one current level registration.

```ts
function controllerFor(runtime: GridRuntime, path: GridPath): GridControllerPublic;
```

### createPhantomChannel

```ts
function createPhantomChannel(initial?: ReadonlyMap<GridPath, readonly PhantomRow[]>, onObserverError?: ObserverErrorReporter): PhantomChannel;
```

### createPhantomRowLifecycle

```ts
function createPhantomRowLifecycle(deps: PhantomRowLifecycleDeps): PhantomRowLifecycle;
```

### cursorManagerFor

Returns advanced cursor commands for a runtime.

```ts
function cursorManagerFor(runtime: GridRuntime): CursorManager;
```

### materializedChildren

Returns registered child paths for one parent row in schema declaration order.

```ts
function materializedChildren(runtime: GridRuntime, parentPath: GridPath, rowId: RowId): readonly GridPath[];
```

### planCursorContinuationForRowRemoval

Chooses a valid focus landing from the current visible tree before the listed rows are removed.

```ts
function planCursorContinuationForRowRemoval(runtime: GridRuntime, removals: readonly RowRemovalRef[]): CursorContinuation;
```
