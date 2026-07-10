---
title: "GridDataset"
description: "Look up report dataset columns, nodes, hierarchy, footers, stats, formatting, and validation."
---

## Identity

`GridDataset`, related types, and `gridDatasetSchema` from `@sapporta/shared/grid-dataset`.

## Contract

- Columns use stable `id` values and declare value/display semantics.
- Nodes use stable `rowKey` and `levelName`; source values live in `columns` and computed parent values in `rollup`.
- Nested rows use `children`; root totals use `footerRows`; group totals use `childFooterRows`.
- `stats` carry compact answers and `errors` carry non-fatal report issues.
- Hidden identifiers remain in the dataset for frontend link resolvers.

## Minimal lookup

```ts
import { gridDatasetSchema, type GridDataset } from "@sapporta/shared/grid-dataset";
```

## Related documentation

- [Report datasets and formatting](/docs/guides/reports/report-datasets-and-formatting/)
