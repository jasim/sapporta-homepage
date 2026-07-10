---
title: "Table, row, and report commands"
description: "Look up table inspection, row CRUD, and generic report invocation."
---

## Identity

API-backed `tables`, `rows`, and `api` command groups.

## Contract

- `rows list <table>` accepts `--limit`, `--page`, `--sort`, `--q`, and JSON `--where`.
- `rows get <table> <id>` reads one visible row.
- `rows create <table> --values <json>` accepts one object or an array.
- `rows update <table> <id> --values <json>` updates one visible row; `rows delete` removes one.
- Report routes are called through `api get` or `api post`; there is no separate `reports` command group in 0.2.6.


## Related documentation

- [Use the agent data console](/docs/guides/discovery/use-the-agent-data-console/)
