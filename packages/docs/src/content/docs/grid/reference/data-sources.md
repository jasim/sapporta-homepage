---
title: "Data-source reference"
description: "Choose the narrow source contract, runtime access, write, or built-in adapter reference."
---

Data-source types and factories are exported from `@sapporta/grid`. A grid
source resolves one level source for every materialized path. The runtime then
uses that source for display state, optional queries, and optional writes.

Choose the reference that matches the coding task:

- [Data-source contracts and state](/grid/reference/data-sources/contracts-and-state/)
  for `GridDataSource`, `LevelDataSource`, snapshots, loading and error state,
  query capabilities, and source lifecycle.
- [Runtime data access](/grid/reference/data-sources/runtime-data-access/) for
  `GridLevelRuntime.data`, query calls, subscriptions, and React observation.
- [Data-source writes and reconciliation](/grid/reference/data-sources/writes-and-reconciliation/)
  for writable sources, level mutation methods, and authoritative results.
- [In-memory and REST data sources](/grid/reference/data-sources/in-memory-and-rest-sources/)
  for the built-in local and remote source factories and query-state ownership.

Start with the [Data sources guide](/grid/guides/data-sources/) when choosing
between local, remote, and custom ownership.
