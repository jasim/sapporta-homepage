---
title: "Phantom rows and inserts"
description: "Manage unsaved insert rows through the path-local draft API."
---

Use phantom rows for local insertion state before the data source creates an
authoritative row. They are separate from source data, so the data source does
not see them until a level runtime commits a nonblank draft into a real source
row.

## Phantom states

A phantom can be:

- `editing` while the user is filling in a draft row
- `saving` while the create request is in flight
- `failed` when create failed and the draft should remain visible with an error

Keep phantom validation and persistence in the source or save path. The grid
keeps the draft row visible and stable; your host code decides when a draft is
blank, how to create the authoritative row, and how to show failure text.

## Draft API

Use the path-local draft API for imperative workflows:

```ts
const level = runtime.root;

level.drafts.add("new-account", { name: "New account" });
level.drafts.setCell("new-account", "name", "Travel");
await level.drafts.commit("new-account");
```

The draft remains path-local. Its commit uses the current level source's create
capability and returns the resulting authoritative row.

## Verify

Typecheck the example and exercise its visible editing, saving, and failure
states. Use only public `@sapporta/grid` export paths.

See [GridLevelRuntime](/grid/reference/base-grid/level-runtime/) for the
complete draft API and
[Data-source writes and reconciliation](/grid/reference/data-sources/writes-and-reconciliation/)
for the persistence boundary.
