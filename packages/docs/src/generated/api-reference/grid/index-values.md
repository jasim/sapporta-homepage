---
title: "@sapporta/grid — Values, classes, and namespaces"
package: "@sapporta/grid"
version: "0.6.0"
specifier: "@sapporta/grid"
---

> Sapporta API reference for `@sapporta/grid@0.6.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/grid — Values, classes, and namespaces

Import from `@sapporta/grid`. Documented from `@sapporta/grid@0.6.0`; confirm the installed version with `node -p "require('@sapporta/grid/package.json').version"`.

14 of 191 symbols published from `@sapporta/grid`. Other groups: [Types](https://sapporta.com/api-reference/grid/index-types.md), [Functions and components](https://sapporta.com/api-reference/grid/index-functions.md).

### CELL_EDITING_GRID

Spreadsheet-style editing with rectangular cell selection.

```ts
const CELL_EDITING_GRID: {
    mode: "cell-grid";
    activeCell: {
        kind: "enabled";
        keyboard: {
            arrows: {
                tabular: "grid";
                cards: "field-list";
            };
        };
    };
    selectedCells: {
        kind: "range";
    };
    activeRow: {
        kind: "none";
    };
    selectedRows: {
        kind: "none";
    };
};
```

### CELL_EDITING_NO_SELECTION_GRID

Spreadsheet-style editing with one active cell and no cell range.

```ts
const CELL_EDITING_NO_SELECTION_GRID: {
    mode: "cell-grid";
    activeCell: {
        kind: "enabled";
        keyboard: {
            arrows: {
                tabular: "grid";
                cards: "field-list";
            };
        };
    };
    selectedCells: {
        kind: "none";
    };
    activeRow: {
        kind: "none";
    };
    selectedRows: {
        kind: "none";
    };
};
```

### CELL_GRID_WITH_ACTIVE_ROW

Cell-first navigation that also exposes the active cell's row as context.

```ts
const CELL_GRID_WITH_ACTIVE_ROW: {
    mode: "cell-grid";
    activeCell: {
        kind: "enabled";
        keyboard: {
            arrows: {
                tabular: "grid";
                cards: "field-list";
            };
        };
    };
    selectedCells: {
        kind: "range";
    };
    activeRow: {
        kind: "from-active-cell";
    };
    selectedRows: {
        kind: "none";
    };
};
```

### CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION

Cell-first navigation with a separate multi-row operation selection.

```ts
const CELL_GRID_WITH_INDEPENDENT_ROW_SELECTION: {
    mode: "cell-grid";
    activeCell: {
        kind: "enabled";
        keyboard: {
            arrows: {
                tabular: "grid";
                cards: "field-list";
            };
        };
    };
    selectedCells: {
        kind: "range";
    };
    activeRow: {
        kind: "from-active-cell";
    };
    selectedRows: {
        kind: "enabled";
        mode: "multi";
        sync: {
            kind: "independent";
        };
    };
};
```

### CELL_GRID_WITH_ROW_CLICK_ACTIVATION

Cell-first navigation with independent multi-row selection whose rows also emit a semantic activation on plain click.

```ts
const CELL_GRID_WITH_ROW_CLICK_ACTIVATION: {
    activeRow: {
        kind: "from-active-cell";
        activation: {
            startsOn: "click"[];
        };
    };
    mode: "cell-grid";
    activeCell: {
        kind: "enabled";
        keyboard: {
            arrows: {
                tabular: "grid";
                cards: "field-list";
            };
        };
    };
    selectedCells: {
        kind: "range";
    };
    selectedRows: {
        kind: "enabled";
        mode: "multi";
        sync: {
            kind: "independent";
        };
    };
};
```

### CELL_PRIMARY_WITH_SELECTED_SIDE_PANEL_ROW

Cell-first navigation with one independently chosen row operation target.

```ts
const CELL_PRIMARY_WITH_SELECTED_SIDE_PANEL_ROW: {
    mode: "cell-grid";
    activeCell: {
        kind: "enabled";
        keyboard: {
            arrows: {
                tabular: "grid";
                cards: "field-list";
            };
        };
    };
    selectedCells: {
        kind: "range";
    };
    activeRow: {
        kind: "from-active-cell";
    };
    selectedRows: {
        kind: "enabled";
        mode: "single";
        sync: {
            kind: "independent";
        };
    };
};
```

### CELL_PRIMARY_WITH_SIDE_PANEL_ROW

Cell-first navigation where the active cell's row is also the single operation target.

```ts
const CELL_PRIMARY_WITH_SIDE_PANEL_ROW: {
    mode: "cell-grid";
    activeCell: {
        kind: "enabled";
        keyboard: {
            arrows: {
                tabular: "grid";
                cards: "field-list";
            };
        };
    };
    selectedCells: {
        kind: "range";
    };
    activeRow: {
        kind: "from-active-cell";
    };
    selectedRows: {
        kind: "enabled";
        mode: "single";
        sync: {
            kind: "follows-active-row";
        };
    };
};
```

### DEFAULT_CELL_EDIT_GESTURES

```ts
const DEFAULT_CELL_EDIT_GESTURES: readonly CellEditGesture[];
```

### defaultGridLevelChrome

```ts
const defaultGridLevelChrome: GridLevelChrome;
```

### firstFocusableRow

```ts
const firstFocusableRow: (d: DisplayedRows, c: CapabilitiesFn) => LevelRow | null;
```

### lastFocusableRow

```ts
const lastFocusableRow: (d: DisplayedRows, c: CapabilitiesFn) => LevelRow | null;
```

### ROW_MULTISELECT_LIST

Full-row navigation with independent multi-row operation selection.

```ts
const ROW_MULTISELECT_LIST: {
    mode: "row-list";
    activeCell: {
        kind: "none";
    };
    selectedCells: {
        kind: "none";
    };
    activeRow: {
        kind: "from-row-cursor";
        keyboard: {
            arrows: "move-active-row";
            shiftArrows: "extend-selected-rows";
            expansion: "none";
        };
    };
    selectedRows: {
        kind: "enabled";
        mode: "multi";
        sync: {
            kind: "independent";
        };
    };
};
```

### ROW_PRIMARY_MASTER_DETAIL

Full-row navigation with the active row as the single operation target.

```ts
const ROW_PRIMARY_MASTER_DETAIL: {
    mode: "row-list";
    activeCell: {
        kind: "none";
    };
    selectedCells: {
        kind: "none";
    };
    activeRow: {
        kind: "from-row-cursor";
        keyboard: {
            arrows: "move-active-row";
            shiftArrows: "move-active-row";
            expansion: "enabled";
        };
    };
    selectedRows: {
        kind: "enabled";
        mode: "single";
        sync: {
            kind: "follows-active-row";
        };
    };
};
```

### ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION

Full-row navigation with semantic activation on Enter and double-click.

```ts
const ROW_PRIMARY_MASTER_DETAIL_WITH_ACTIVATION: {
    activeRow: {
        activation: {
            startsOn: ("enter" | "doubleClick")[];
        };
        kind: "from-row-cursor";
        keyboard: {
            arrows: "move-active-row";
            shiftArrows: "move-active-row";
            expansion: "enabled";
        };
    };
    mode: "row-list";
    activeCell: {
        kind: "none";
    };
    selectedCells: {
        kind: "none";
    };
    selectedRows: {
        kind: "enabled";
        mode: "single";
        sync: {
            kind: "follows-active-row";
        };
    };
};
```
