---
title: "API and SQL commands"
description: "Look up generic HTTP and privileged SQL command grammar."
---

## Identity

API-backed `api` and `sql` command groups.

## Contract

- `api get|post|put|delete <path>` calls an arbitrary mounted application route with supported query/body options.
- `sql query <sql>` accepts JSON `--params` and a result `--limit`.
- `sql execute <sql>` accepts JSON parameters and supported dry-run behavior exposed by command help.
- SQL routes are privileged and bypass generated row helpers and ordinary row-scope guarantees.


## Related documentation

- [Choose an application interface](/docs/guides/discovery/choose-an-application-interface/)
