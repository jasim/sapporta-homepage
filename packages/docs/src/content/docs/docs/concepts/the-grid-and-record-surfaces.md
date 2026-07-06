---
title: "The Grid And Record Surfaces"
description:
  "See how a Sapporta table becomes a usable product surface, not only a SQL
  table."
---

A Sapporta table becomes a usable product surface. Users get a table screen and
generated forms; developers get the same behavior behind generated table routes.

Generated record surfaces include:

- keyboard-friendly grids
- right-click copy for selected cells and ranges
- sorting, filtering, and search
- lookup labels for foreign keys
- child rows for parent/detail records
- CSV export
- generated create and edit forms
- generated table routes behind the UI

The table definition tells
Sapporta which columns are searchable, which fields are labels, which foreign
keys should display lookup labels, which child tables expand under a row, and
which system-managed columns should stay out of browser and CLI payloads.

Use [Table-Aware Grids](/docs/subsystems/grid/) for deeper customization of
Sapporta schema tables and generated table APIs. Use
[Sapporta Grid Docs](/grid/docs/) when you want the standalone grid package
without the Sapporta framework.
