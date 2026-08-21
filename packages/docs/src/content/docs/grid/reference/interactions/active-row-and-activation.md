---
title: "Active rows and row activation"
description:
  "Observe current-row context and configure repeatable semantic row actions."
---

The active row carries application context. It is separate from selected rows,
which identify operation targets. Active-row changes are state; row activation
is a repeatable semantic event.

## Active-row state

```ts
const active = runtime.activeRow();

if (active?.row.kind === "data") {
  renderPreview(active.row.columns);
}

const unsubscribe = runtime.subscribeActiveRow(() => {
  renderPreview(runtime.activeRow()?.row.columns ?? null);
});
```

`runtime.activeRow()` resolves the global cursor across all registered paths. It
returns `{ row, level }` or `null`. The snapshot is identity-stable until the
active path, row identity, displayed row value, or level registration changes.
The subscription follows both cursor movement and changes to the active row's
displayed values.

`runtime.level(path).activeRow()` remains the path-local cursor projection and
returns `RowCursor | null`. When focus moves to a child path, the root level's
active row becomes `null` while `runtime.activeRow()` resolves the child row.

React components use `useGridActiveRow(runtime)`. A component inside
`GridRuntimeProvider` may call `useGridActiveRow()` without an argument. The
hook is already external-store-backed React state; copying it into `useState`
creates a second source of truth.

## Row activation

Configure the input gestures on `activeRow.activation`, then react through the
runtime event:

```ts
type RowActivationConfig = {
  readonly startsOn: readonly ("enter" | "click" | "doubleClick")[];
};

const interaction = {
  ...ROW_PRIMARY_MASTER_DETAIL,
  activeRow: {
    ...ROW_PRIMARY_MASTER_DETAIL.activeRow,
    keyboard: {
      ...ROW_PRIMARY_MASTER_DETAIL.activeRow.keyboard,
      expansion: "left-right",
    },
    activation: { startsOn: ["enter", "doubleClick"] },
  },
} satisfies GridInteractionConfig;

const unsubscribe = runtime.on("rowActivated", ({ activeRow, trigger }) =>
  openRecord(activeRow.row, trigger),
);
```

The event contains the resolved `GridActiveRow` and a normalized trigger:

```ts
type RowActivationTrigger =
  | { readonly kind: "keyboard"; readonly gesture: "enter" }
  | {
      readonly kind: "pointer";
      readonly gesture: "click" | "doubleClick";
    };
```

The public type names are `RowActivationGesture`, `RowActivationConfig`,
`RowActivationTrigger`, `GridPointerInput`, `GridActiveRow`, and
`GridRowActivatedEvent`. `GridPointerInput` is the renderer-neutral pointer
shape used before the runtime accepts a gesture as a semantic activation. The
emitted trigger intentionally retains the gesture kind and omits raw pointer
modifiers.

Activation first moves the configured cursor to the row. The event fires only
when the row resolves as the runtime's active row. Activating the same row twice
emits two events. Listener count does not change interaction policy.

Pointer activation accepts an unmodified primary-button gesture. Alt, Control,
Meta, Shift, or a non-primary button suppresses the semantic activation. A
focusable structural row may activate even when it is not row-selectable, so
consumers must branch on `activeRow.row.kind` before treating columns as a
persisted record.

Interaction validation enforces these invariants:

- activation gestures are unique;
- `click` and `doubleClick` cannot both activate rows;
- row-list Enter cannot own both row activation and hierarchy expansion; and
- in cell-grid mode, editing and configured cell activation take precedence over
  row activation for the same gesture.

`RuntimeArgs.on.rowActivated` installs a listener before the root source is
acquired. `runtime.on("rowActivated", listener)` adds and removes listeners
during the runtime lifetime.

## Related documentation

- [Interaction configuration and presets](/grid/reference/interactions/configuration-and-presets/)
- [Row selection](/grid/reference/interactions/row-selection/)
- [GridCore React APIs](/grid/reference/grid-core/react-api/)
