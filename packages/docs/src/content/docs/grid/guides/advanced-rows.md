---
title: "Advanced rows"
description: "Choose derived summary rows or runtime-owned insertion drafts."
---

Advanced displayed rows support two separate workflows: source-provided summary
output and runtime-owned insertion drafts.

- [Summary rows and footers](/grid/guides/advanced-rows/summary-rows-and-footers/)
  covers rollups, opening and closing rows, subtotals, level footers, and
  parent-scoped child footers.
- [Phantom rows and inserts](/grid/guides/advanced-rows/phantom-rows-and-inserts/)
  covers unsaved insert rows, draft state, persistence, and failure handling.

Both workflows use the displayed-row model, but their ownership differs.
Summary rows arrive in source snapshots. Phantom rows remain local to a
`GridLevelRuntime` until the source creates an authoritative row.

Continue with the [Grid reference](/grid/reference/).
