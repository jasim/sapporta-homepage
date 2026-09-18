---
title: "Table, row, and report commands"
description:
  "Look up table inspection, row CRUD, scoped counts, and generic report
  invocation."
---

## Identity

API-backed `tables`, `rows`, and `api` command groups.

## Contract

- `rows list <table>` accepts `--limit`, `--page`, `--sort`, `--q`, JSON
  `--where`, JSON `--fixed`, and `--tree <mode>`. `--where` and `--fixed` take
  the same `{"column":{"operator":value}}` object; `--where` becomes
  `filter[...]` conditions and `--fixed` becomes `fixed[...]` conditions.
- On a table with `meta.tree`, `--tree ancestors` or
  `--tree ancestors-and-descendants` returns each `--q` or `--where` match with
  its ancestors (and its subtree). The rows around the matches also satisfy
  `--fixed`:

  ```bash
  pnpm exec sapporta rows list accounts --q taxes --tree ancestors \
    --fixed '{"archived":{"eq":false}}'
  ```

- `rows get <table> <id>` reads one visible row.
- `rows count <table>` counts visible rows without loading complete records. It
  accepts JSON `--where` and optional `--group-by <column>`. Grouped counts
  accept `--order asc|desc` and `--limit <number>`; both options require
  `--group-by`.
- `rows create <table> --values <json>` accepts one object or an array.
- `rows update <table> <id> --values <json>` updates one visible row;
  `rows delete` removes one.
- A scalar count renders one `count` column. A grouped count renders `value` and
  `count` columns. JSON output preserves the HTTP result's discriminated `total`
  or `grouped` envelope.
- Report routes are called through `api get` or `api post`; there is no separate
  `reports` command group.

## Related documentation

- [Use the agent data console](/docs/guides/discovery/use-the-agent-data-console/)
- [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Show a table as a tree](/docs/guides/model-data/show-a-table-as-a-tree/)
