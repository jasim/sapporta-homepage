---
title: "GridDataset"
description:
  "Look up report dataset identity, levels, columns, nodes, footers, formatting,
  and validation."
---

## Public surface

```ts
import {
  gridDatasetSchema,
  type GridDataset,
} from "@sapporta/shared/grid-dataset";
```

Parse the complete mapper result with `gridDatasetSchema` before returning or
testing it.

## Top-level fields

| Field        | Type                          | Required |
| ------------ | ----------------------------- | -------- |
| `name`       | `string`                      | yes      |
| `label`      | `string`                      | yes      |
| `rootLevel`  | `string`                      | yes      |
| `levels`     | record of level name to level | yes      |
| `nodes`      | `GridDatasetNode[]`           | yes      |
| `footerRows` | `GridDatasetFooterRow[]`      | no       |

`name` is stable renderer identity. The current renderer combines it with the
level name for persisted column sizing, so changing it can change saved layout
identity. `label` is display text and may include a date baseline. The screen
must render the label itself; `ReportGridDataset` does not render it as a
heading.

`stats` and `errors` are not `GridDataset` members. Summary cards are a separate
frontend surface through `ReportSummaryStats` and `ReportStat[]`;
report-specific error handling belongs outside the dataset.

## Level

| Field              | Type                   | Required |
| ------------------ | ---------------------- | -------- |
| `label`            | `string`               | no       |
| `columns`          | `GridDatasetColumn[]`  | yes      |
| `childLevels`      | `string[]`             | yes      |
| `defaultCollapsed` | `boolean`              | no       |
| `tree`             | `GridDatasetLevelTree` | no       |

`rootLevel` must name the level used by root nodes. Each child level named by a
level should have a matching entry in `levels`. `defaultCollapsed: true` starts
the level's rows collapsed.

## Tree level

A level with `tree` shows rows that name a parent row of the same level as one
tree under one header. For example, an expense report can show accounts that
name their parent account in `parent_id`. Each row is indented by its depth in
the tree column, and a row with children has a chevron that expands or collapses
it.

| Field          | Type     | Required |
| -------------- | -------- | -------- |
| `parentColumn` | `string` | yes      |
| `column`       | `string` | no       |

`parentColumn` names a column of the level that holds the parent row's `rowKey`.
A `null`, `undefined`, or `""` value marks a top-level row. The value is
compared with row keys as a string: the parent value `12` matches the row key
`"12"`, but not the row key `"account:12"`. The parent column can be
`visuallyHidden`.

`column` names the visible column that shows the hierarchy. It defaults to the
first visible text column, or to the first visible column when the level has no
text column. In the narrow cards layout, this column is the title of each card.

A tree level declares no `childLevels`. Its nodes are one flat list, and each
node names its parent in the parent column instead of nesting under it through
`children`. A row whose parent is not among the level's nodes is shown at top
level. Rows start expanded, and `defaultCollapsed: true` starts them collapsed.

In the tree column, pressing Enter opens the cell's link, and pressing Space
expands or collapses the row. When the cell has no link, Enter also expands or
collapses the row.

Sorting a column orders the rows among their siblings at every depth. Footer
rows stay below the tree. A tree level can also be a child level of another
level, such as accounts under an "Income" or "Expenses" section row.

`ReportGridDataset` does not add up values, so the dataset carries each parent
row's total.

`ReportGridDataset` rejects a dataset in which a tree level also declares child
levels, names a parent column the level does not have, or names a tree column
that is not visible. Call `gridDatasetTreeProblems(dataset)` from
`@sapporta/shared/grid-dataset` to check the parent and tree columns in a
mapper test. It returns one message per problem.

## Column

Required fields:

- `id: string`
- `label: string`
- `kind: "text" | "number" | "boolean" | "date" | "timestamp"`

Optional fields accepted by the schema:

- `displayFormat: "currency" | "percentage"`
- `textDisplay: "multiLine" | "markdown"`
- `visuallyHidden: boolean`
- `width`, `minWidth`, `maxWidth`: numbers interpreted as approximate
  displayed-character counts
- `colorRule: "positive" | "negative" | "signed"`
- `zeroDisplay: "blank" | "dot"`
- `strong: boolean`
- `notes: string`
- `sortable`, `filterable`, `searchable`: booleans

The current report adapter consumes the display, sizing, hidden, color, zero,
strong, and sorting fields. Although the schema accepts `notes`, `filterable`,
and `searchable`, the current `ReportGridDataset` adapter does not expose
filter/search behavior for them and configures report filtering as `none`.

Keep node values semantic: numbers remain numbers, percentage values are ratios
such as `0.4`, booleans remain booleans, and date/timestamp values use their
canonical boundary representation. Presentation metadata controls rendering.

`colorRule: "negative"` and the negative side of `"signed"` paint with
`--sap-numeric-negative`, which follows `--sap-negative` unless the application
sets it; see
[Theme tokens and scales](/docs/reference/frontend/theme-tokens-and-scales/).

`kind` selects the column preset, and `"date"` and `"timestamp"` are separate
presets with separate default widths. A `date` column renders `2026-08-23`; a
`timestamp` column renders `2026-08-23 16:38` in the active workspace's time
zone, and names the moment it leaves out — `2026-08-24 02:00:00 (UTC+05:30)` —
when a reader hovers the cell. The declared `kind` decides which of the two
shapes a column reads in, so a column reads the same way in every row even where
the values underneath it vary. A value in neither canonical shape is rendered as
the text it arrived as.

## Node

Required fields:

- `rowKey: string`
- `levelName: string`
- `columns: Record<string, unknown>`

Optional fields:

- `rollup: Record<string, unknown>`
- `children: Record<string, GridDatasetNode[]>`
- `childFooterRows: Record<string, GridDatasetFooterRow[]>`
- `kind: "opening" | "closing" | "subtotal"`

Use a stable domain identity for `rowKey`, not a display label or array
position. Source values belong in `columns`; computed parent values may live in
`rollup`. Nested rows are grouped by child level in `children`.

Columns marked `visuallyHidden` are omitted from the rendered Grid but remain in
node data. They are not secret and must be authorized before serialization.

## Footer row

```ts
type GridDatasetFooterRow = {
  rowKey: string;
  columns: Record<string, unknown>;
};
```

Root totals use `footerRows`. Totals for a child collection use
`childFooterRows` on the parent node. Footer values follow the same semantic
number and ratio rules as ordinary nodes.

## Rendering

`ReportGridDataset` from `@sapporta/frontend/report` renders a parsed dataset:

- `dataset`: the `GridDataset`.
- `links` and `linkContext`: cell links and the input they read; see
  [Report links](/docs/reference/reports/report-links/).
- `renderCell`: cell renderers keyed by level name, then column id. A renderer
  receives the preset's own cell as `defaultContent` and sits inside the
  column's link.
- `columnSizing`: every ColumnPreset column-sizing option except `storageKey`,
  including `minWidths`; see
  [Column sizing](/docs/reference/column-sizing/#raise-the-built-in-widths).
  Dragged widths are stored under
  `sapporta:report-grid-columns:<dataset name>:<level>`.

Give `renderCell` and `columnSizing` stable identities, at module level or in
`useMemo`; the grid is rebuilt whenever either changes.

Nested levels are indented by `--sap-report-grid-nested-indent`, `18px` by
default. Each depth of a tree level is indented by `--sap-grid-tree-indent`,
also `18px` by default.

## Related documentation

- [Report datasets and formatting](/docs/guides/reports/report-datasets-and-formatting/)
- [Report links](/docs/reference/reports/report-links/)
- [Column sizing](/docs/reference/column-sizing/)
