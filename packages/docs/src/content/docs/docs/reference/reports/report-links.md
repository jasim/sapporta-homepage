---
title: "Report links"
description:
  "Look up report cell-link resolvers, context, link fields, and primary-link
  behavior."
---

## Public surface

```ts
import type {
  ReportCellLink,
  ReportCellLinkContext,
  ReportCellLinkResolvers,
} from "@sapporta/frontend/report";
```

Links are frontend policy. They are passed to `ReportGridDataset` and are not
serialized in `GridDataset`.

## Resolver shape

`ReportCellLinkResolvers<TInput>` is keyed by level name and then by cell column
ID:

```ts
const links = {
  project: {
    cell: {
      project: (context) => [
        {
          label: "Open project",
          href: "/tables/projects?filter[id][eq]=1",
        },
      ],
    },
  },
} satisfies ReportCellLinkResolvers<ProjectProgressQuery>;
```

Each cell resolver returns `ReportCellLink[]`. The current renderer follows only
the first returned link; later entries are not rendered as secondary actions.

The public resolver type does not expose general row or footer resolver slots.
Footer rows do not invoke cell resolvers. An ordinary synthetic node may invoke
a configured cell resolver, so return `[]` when it lacks a safe identifier.

## Resolver context

`ReportCellLinkContext<TInput>` contains:

- `dataset`: the complete `GridDataset`;
- `node`: the current Grid tree node;
- `levelName`: the current level key;
- `input`: `TInput | undefined`;
- `ancestors`: ancestor dataset nodes;
- `column`: the current `GridDatasetColumn`; and
- `value`: the current cell value.

Pass report input with the renderer's `linkContext` prop:

```tsx
<ReportGridDataset
  dataset={dataset}
  links={links}
  linkContext={{ input: query }}
/>
```

`linkContext` supplies only the report input. The renderer derives the other
context fields from the dataset and current cell.

## Link fields

`ReportCellLink` has:

| Field    | Type                                                   | Required |
| -------- | ------------------------------------------------------ | -------- |
| `label`  | `string`                                               | yes      |
| `href`   | `string`                                               | yes      |
| `kind`   | `"drill-down" \| "record" \| "route" \| "external"`    | no       |
| `icon`   | `"drill-up" \| "drill-into" \| "report" \| "external"` | no       |
| `target` | `"_self" \| "_blank"`                                  | no       |

Use `target: "_blank"` only for a deliberate new browsing context.

## Security

Hidden IDs can support a resolver, but they remain part of the report response
and must already be authorized. Resolver checks prevent broken navigation; they
do not create authority. Every destination applies its own ability and
row-visibility rules.

## Related documentation

- [Drill-through and cross-report links](/docs/guides/reports/drill-through-and-cross-report-links/)
- [Query syntax](/docs/reference/http/query-syntax/)
