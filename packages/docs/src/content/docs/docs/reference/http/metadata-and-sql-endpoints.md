---
title: "Metadata and SQL endpoints"
description: "Look up framework metadata routes and privileged SQL HTTP surfaces."
---

## Identity

Framework routes registered under `/api/meta` and `/api/sql` when enabled.

## Contract

- Metadata routes expose project and registered table schema needed by generated clients.
- SQL query routes return rows; SQL execute routes perform privileged changes.
- SQL bypasses table helpers, trusted-value preparation, reference checks, and ordinary row visibility.
- Registration, authorization, limits, parameters, and dry-run behavior are visible in the running OpenAPI document.


## Related documentation

- [Choose an application interface](/docs/guides/discovery/choose-an-application-interface/)
