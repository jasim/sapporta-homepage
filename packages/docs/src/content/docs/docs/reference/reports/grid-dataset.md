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

| Field              | Type                  | Required |
| ------------------ | --------------------- | -------- |
| `label`            | `string`              | no       |
| `columns`          | `GridDatasetColumn[]` | yes      |
| `childLevels`      | `string[]`            | yes      |
| `defaultCollapsed` | `boolean`             | no       |

`rootLevel` must name the level used by root nodes. Each child level named by a
level should have a matching entry in `levels`.

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

## Related documentation

- [Report datasets and formatting](/docs/guides/reports/report-datasets-and-formatting/)
- [Report links](/docs/reference/reports/report-links/)
- [Column sizing](/docs/reference/column-sizing/)
