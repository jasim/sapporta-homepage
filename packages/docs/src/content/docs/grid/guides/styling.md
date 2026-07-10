---
title: "Styling"
description: "Style grid sizing and public row, cell, level, selection, and editing states."
---

Import the package stylesheet once:

```ts
import "@sapporta/grid/index.css";
```

Then put the grid inside a container with stable dimensions:

```tsx
<div className="task-grid-shell">
  <GridRuntimeProvider runtime={runtime}>
    <GridLevel path={rootPath("tasks")} />
  </GridRuntimeProvider>
</div>
```

```css
.task-grid-shell {
  block-size: min(42rem, 80vh);
  border: 1px solid var(--rule);
  min-inline-size: 0;
}
```

Stable dimensions matter because focus rings, editors, hover state, and loading
state should not resize the page around the user.

Use rendered data attributes for interaction styling:

```css
.task-grid-shell [data-row-active="true"] {
  background: color-mix(in srgb, var(--accent) 8%, transparent);
}

.task-grid-shell [data-cell-status="focus"] {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}
```

Do not recreate focus, selection, or active-row state in CSS classes that are
managed outside the runtime. The data attributes already follow the configured
interaction preset.

Rows expose stable attributes for interaction state:

| Attribute                 | Meaning                                      |
| ------------------------- | -------------------------------------------- |
| `data-row-active`         | The row currently carrying row-level focus.  |
| `data-row-selected`       | The row is part of the row operation target. |
| `data-row-kind`           | The rendered row kind.                       |
| `data-row-selectable`     | The row can participate in row selection.    |

Cells expose `data-cell-status` values such as `focus`, `in-selection`, and
`editing`. Style those attributes instead of mirroring runtime state into local
CSS classes. That keeps the visual state aligned with the keyboard and
selection preset.
## Verify
Typecheck the example and exercise its visible loading, ready, interaction, and failure states. Use only public `@sapporta/grid` export paths.
Continue with [Grid Reference](/grid/reference/).
