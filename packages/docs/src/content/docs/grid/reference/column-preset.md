---
title: "ColumnPreset"
description:
  "Look up ColumnPreset constructors, options, formatting, editing, copy, and
  sizing APIs."
---

## Identity

`@sapporta/grid/column-preset`.

```ts
import {
  boolean,
  column,
  currency,
  date,
  foreignKey,
  identifier,
  lookupValue,
  number,
  percentage,
  rowSelectionColumn,
  select,
  text,
} from "@sapporta/grid/column-preset";
```

## ColumnPreset API

ColumnPreset helpers return ordinary `ColumnSchema` values. They are the
recommended starting point for most GridCore columns.

### Constructors

```ts
function identifier<TMeta = unknown>(
  options: ColumnPresetOptions<TMeta>,
): ColumnSchema;
function text<TMeta = unknown>(options: TextColumnOptions<TMeta>): ColumnSchema;
function number<TMeta = unknown>(
  options: NumberColumnOptions<TMeta>,
): ColumnSchema;
function currency<TMeta = unknown>(
  options: NumberColumnOptions<TMeta>,
): ColumnSchema;
function percentage<TMeta = unknown>(
  options: NumberColumnOptions<TMeta>,
): ColumnSchema;
function date<TMeta = unknown>(
  options: ColumnPresetOptions<TMeta>,
): ColumnSchema;
function boolean<TMeta = unknown>(
  options: ColumnPresetOptions<TMeta>,
): ColumnSchema;
function select<TMeta = unknown>(
  options: SelectColumnOptions<TMeta>,
): ColumnSchema;
function lookupValue<TMeta = unknown>(
  options: LookupColumnOptions<TMeta>,
): ColumnSchema;
function foreignKey<TMeta = unknown>(
  options: LookupColumnOptions<TMeta>,
): ColumnSchema;
function column<TMeta = unknown>(
  options: ColumnPresetOptions<TMeta>,
): ColumnSchema;
```

### Common Options

```ts
type ColumnPresetOptions<TMeta = unknown> = {
  kind?: ColumnPresetKind;
  id: ColId;
  name: string;
  align?: "left" | "right" | "center";
  width?: ColumnWidth;
  edit?:
    | "default"
    | "none"
    | {
        editor?: "default" | ComponentType<CellEditorProps>;
        startsOn?: readonly CellEditGesture[];
      };
  // Refuses the plain Delete and Backspace clear for a column that must not be
  // empty. Without it, those keys clear an editable cell.
  disableBackspaceCellClear?: true;
  activation?: CellActivation;
  sortable?: boolean;
  format?: (value: unknown) => string;
  parse?: (value: string, props: CellEditorProps) => unknown;
  compare?: (a: unknown, b: unknown) => number;
  // PresetCellRenderProps adds defaultContent: the preset's own cell, to
  // wrap (for example in CellTooltip) or replace.
  renderCell?: (props: PresetCellRenderProps) => ReactNode;
  copy?: GridColumnCopyBehavior;
  meta?: TMeta;
};
```

`align` sets the column's alignment on the grid `ColumnSchema`, so the header and
any cell a custom `renderCell` wraps keep it. A preset sets it from its kind:
numbers right, booleans center.

### Widths

```ts
type ColumnWidth =
  | "compact"
  | "content"
  | "fill"
  | "numeric"
  | "date"
  | "timestamp"
  | "enum"
  | "foreignKey"
  | { min?: number; ideal?: number; max?: number }
  | { track: string };

type NamedColumnWidth = Extract<ColumnWidth, string>;
type ColumnWidthMinimums = Partial<Record<NamedColumnWidth, number>>;
```

Each constructor gives its column a named width unless `width` is set. A column
with no width fills the remaining space, `minmax(0, 1fr)`. Each named width
resolves to a CSS grid track:

| Width        | Track                       | Default for                        |
| ------------ | --------------------------- | ---------------------------------- |
| `compact`    | `minmax(48px, max-content)` | `identifier`, `boolean`            |
| `content`    | `max-content`               | `column` with a custom `kind`      |
| `fill`       | `minmax(0, 1fr)`            | `text`, `column` without a `kind`  |
| `numeric`    | `minmax(80px, 112px)`       | `number`, `currency`, `percentage` |
| `date`       | `minmax(112px, 128px)`      | `date`                             |
| `timestamp`  | `minmax(144px, 160px)`      | `timestamp`                        |
| `enum`       | `minmax(96px, max-content)` | `select`                           |
| `foreignKey` | `minmax(144px, 220px)`      | `foreignKey`, `lookupValue`        |

The pixel tracks fit a 12px monospace digit. An application that sets its data
in a larger face raises the floors it needs through `columnSizing.minWidths` on
the preset chrome. A floor above a named width's ceiling lifts the ceiling with
it: `{ numeric: 128 }` turns the numeric track into `minmax(128px, 128px)`, and
`{ content: 120 }` gives `content` a floor, `minmax(120px, max-content)`. An
object width or a `track` width is used as given.

### Select Columns

```ts
const status = select({
  id: "status",
  name: "Status",
  edit: "default",
  width: "enum",
  options: [
    { value: "todo", label: "To do" },
    { value: "doing", label: "Doing" },
    { value: "done", label: "Done" },
  ],
});
```

```ts
type SelectOption = {
  value: unknown;
  label: string;
};

type SelectColumnOptions<TMeta = unknown> = ColumnPresetOptions<TMeta> & {
  options: readonly (SelectOption | string)[];
};
```

The default select editor is a searchable inline combobox. String options use
the same string for their value and label. Object options preserve the exact
`value`; selection uses `Object.is`, so numeric `1` and string `"1"` remain
different options. Search text filters labels and is never committed as the cell
value. Changing or clearing the query does not change the current cell; moving
focus without choosing an option cancels the edit.

### Number Columns

```ts
const estimate = number({
  id: "estimate",
  name: "Estimate",
  edit: "default",
  width: "numeric",
  zeroDisplay: "blank",
});

const variance = currency({
  id: "variance",
  name: "Variance",
  colorRule: "signed",
});

const completion = percentage({
  id: "completion",
  name: "Completion",
  edit: "none",
});
```

`colorRule` colours a numeric cell. `"positive"` paints the value with
`--sap-positive` and `"negative"` with `--sap-numeric-negative`. `"signed"`
paints values above zero with `--sap-positive`, values below zero with
`--sap-numeric-negative`, and zero in the default ink. `--sap-numeric-negative`
follows `--sap-negative` unless the application sets it, so negative figures can
stay in ink while errors stay red.

Number, currency, and percentage editors retain raw text until commit. Their
default parser accepts commas and surrounding whitespace, returns `null` for
empty text, converts finite numeric text to a number, and preserves invalid text
for the host save boundary.

Percentage values are fractions. A cell value of `0.4` renders as `40%`. The
default numeric parser does not divide input by 100, so a value of `40` renders
as `4,000%`.

```ts
type NumericInputParseResult =
  { ok: true; value: number | null } | { ok: false };

function parseNumericInput(value: string): NumericInputParseResult;
```

Use `parseNumericInput()` when a schema-aware host must assign its own meaning
to empty or invalid text. The built-in numeric preset parser returns the parsed
number or `null`, and preserves the original string when parsing fails.

### Custom Formatting

```ts
const duration = number({
  id: "durationMinutes",
  name: "Duration",
  format: (value) => `${Number(value ?? 0)} min`,
  parse: (value) => Number(value.replace("min", "").trim()),
});
```

### Row Selection Column

```ts
function rowSelectionColumn(options?: RowSelectionColumnOptions): ColumnSchema;

type RowSelectionColumnOptions = {
  id?: ColId;
  name?: string;
  width?: ColumnWidth;
  header?: "checkbox" | "blank";
};
```

`rowSelectionColumn()` renders checkbox chrome on top of the runtime's row
selection APIs.

```ts
const columns = [
  rowSelectionColumn(),
  text({ id: "title", name: "Title", edit: "default" }),
];
```

### ColumnPreset Helpers

```ts
function preset(column: ColumnSchema): ColumnPreset | undefined;
function meta<TMeta = unknown>(column: ColumnSchema): TMeta | undefined;
function kind(column: ColumnSchema): ColumnPresetKind | undefined;
function width(column: ColumnSchema): ColumnWidth | undefined;
function parse(
  column: ColumnSchema,
): ((value: string, props: CellEditorProps) => unknown) | undefined;
function lookupCapabilities(
  column: ColumnSchema,
): LookupCapabilities | undefined;
function trackForColumn(
  column: ColumnSchema,
  overrides?: Readonly<Record<ColId, number>>,
  minWidths?: ColumnWidthMinimums,
): string;
function templateColumns(
  columns: readonly ColumnSchema[],
  overrides?: ColumnSizingOverrides,
  minWidths?: ColumnWidthMinimums,
): string;
```

Use `templateColumns` when you build custom chrome that must align with the
grid's column widths. Pass the same `minWidths` the grid uses, so both resolve
the named widths to the same tracks. `overrides` maps column ids to widths in
pixels, such as widths a person dragged.

```tsx
const style = {
  display: "grid",
  gridTemplateColumns: templateColumns(schema.levels.tasks.columns),
};
```

### Preset Chrome and Column Sizing

```ts
function chrome<TMeta = unknown, TFilter = unknown>(
  options?: PresetChromeOptions<TMeta, TFilter>,
): GridLevelChrome;

type PresetChromeOptions<TMeta = unknown, TFilter = unknown> = {
  columnSizing?: ColumnSizingOptions;
  renderColumnHeaderMenu?: (
    props: ColumnHeaderMenuProps<TMeta, TFilter>,
  ) => ReactNode;
  commandOverrides?: (
    level: HeaderLevelState<TFilter>,
  ) => Partial<GridLevelCommands<TFilter>>;
  renderLevelLabelAction?: (context: {
    path: GridPath;
    levelName: string;
  }) => ReactNode;
};

type ColumnSizingOptions = {
  storageKey?:
    string | ((context: ColumnSizingStorageKeyContext) => string | undefined);
  enabled?: boolean;
  minPx?: number;
  minWidths?: ColumnWidthMinimums;
};
```

`columnPreset.chrome()` returns the level chrome that renders the preset's
header row and lays out its column tracks. Pass it to `GridLevel` as `chrome`:

```tsx
const presetChrome = columnPreset.chrome({
  columnSizing: {
    storageKey: ({ levelName }) => `ledger:columns:${levelName}`,
    minWidths: { numeric: 128, timestamp: 176 },
  },
});

<GridLevel path={rootPath("entries")} chrome={presetChrome} />;
```

- `storageKey` names the `localStorage` entry that remembers widths a person
  drags. A function receives the level's `path`, `levelName`, and `schema`, so
  each level keeps its own widths.
- `enabled` turns drag-to-resize on or off. It defaults to on when a storage key
  resolves, and off otherwise.
- `minPx` is the narrowest a column can be dragged to, `48` by default.
- `minWidths` raises the floors of the named widths for columns nobody has
  dragged.
- `renderLevelLabelAction` renders a control after a nested level's caption, such
  as a link that opens that level's rows on their own page. The generated grids
  use it for the related-rows link; return `null` to render nothing. The caption
  itself is the level's title-cased name, at the data size, so
  `JOURNAL_ENTRIES` reads as `Journal Entries`.

Give `GridLevel` a stable chrome: build it at module level or in `useMemo`.

## Related documentation

- [Columns and editors](/grid/guides/columns-and-editors/)
- [Editing and saving](/grid/guides/editing-and-saving/)
- [Copying grid data](/grid/guides/copying-grid-data/)
- [Row selection](/grid/reference/interactions/row-selection/)
