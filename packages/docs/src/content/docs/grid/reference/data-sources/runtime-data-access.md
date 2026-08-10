---
title: "Runtime data access"
description:
  "Read source state and invoke optional query capabilities through
  GridLevelRuntime."
---

`GridLevelRuntime.data` exposes source reads, queries, and reconcile events. It
does not expose raw writes.

```ts
type RuntimeLevelDataSource = {
  state(): LevelSourceState;
  subscribe(listener: () => void): () => void;
  readonly query?: LevelQueryCapabilities;
  readonly canWrite: boolean;
  onReconcile(listener: (event: ReconcileEvent) => void): () => void;
};

const level = runtime.root;
const state = level.data.state();

await level.data.query?.sort?.set([{ colId: "dueDate", direction: "asc" }]);
await level.data.query?.filter?.set({ status: "open" });
await level.data.query?.refetch?.();
```

React components can adapt the facade with `useSyncExternalStore()`:

```tsx
const level = useGridRuntime().level(path);
const state = useSyncExternalStore(
  level.data.subscribe,
  level.data.state,
  level.data.state,
);
```

Use `level.data.subscribe()` directly in non-React hosts.

## Related documentation

- [Data-source contracts and state](/grid/reference/data-sources/contracts-and-state/)
- [Data-source writes and reconciliation](/grid/reference/data-sources/writes-and-reconciliation/)
- [GridLevelRuntime](/grid/reference/base-grid/level-runtime/)
