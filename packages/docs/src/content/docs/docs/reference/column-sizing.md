---
title: "Column sizing"
description: "Choose practical widths for generated tables and report datasets."
---

`width`, `minWidth`, and `maxWidth` on table column metadata and report
`GridDatasetColumn` values are approximate displayed-character counts. They are
not CSS pixels or database length limits; Sapporta turns them into
font-relative grid tracks.

Use `width` for a fixed column. Prefer `minWidth` when a column may use extra
space, and add `maxWidth` when long text should stop growing.

## Starting points

- Title or description: `40`–`80`
- Project, person, or lookup name: `24`–`48`
- Status, priority, or other short controlled value: `12`–`24`
- Date: `12`–`16`
- Labels or tags: `24`–`40`

Size for the formatted value people need to scan, not the longest value the
database can store. Leave numeric and date report columns unsized when their
built-in defaults are sufficient.

## Examples

Table metadata:

```ts
columns: {
  title: { minWidth: 64 },
  assignee_id: { label: "Assignee", minWidth: 32 },
  status: { minWidth: 20 },
}
```

Report dataset columns:

```ts
columns: [
  { id: "title", label: "Task", kind: "text", minWidth: 80 },
  { id: "project", label: "Project", kind: "text", minWidth: 40 },
  { id: "status", label: "Status", kind: "text", minWidth: 20 },
  { id: "dueDate", label: "Due date", kind: "date" },
]
```

## Related documentation

- [Table and column metadata](/docs/reference/schema/table-and-column-metadata/)
- [GridDataset](/docs/reference/reports/grid-dataset/)
- [ColumnPreset](/grid/reference/column-preset/)
