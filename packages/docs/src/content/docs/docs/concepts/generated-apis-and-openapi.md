---
title: "Generated APIs And OpenAPI"
description:
  "Understand the table routes and live OpenAPI discovery Sapporta creates from
  schema metadata."
---

Each registered table gets generated routes under `/api/tables/<table>`:

```text
GET    /api/tables/tasks
GET    /api/tables/tasks/:id
POST   /api/tables/tasks
PUT    /api/tables/tasks/:id
DELETE /api/tables/tasks/:id
GET    /api/tables/tasks/_lookup
GET    /api/tables/tasks/export.csv
```

The running app also publishes a live OpenAPI document. The CLI reads that
document:

```bash
pnpm exec sapporta describe
pnpm exec sapporta describe "GET /api/tables/tasks"
pnpm exec sapporta tables show tasks
```

Use generated table APIs for ordinary row work. Use app-owned endpoints for
domain actions, state transitions, imports, reports, and multi-table behavior
that needs custom rules.

Exact route shapes and filter grammar live in
[Table APIs](/docs/reference/table-apis/) and
[Filter Syntax](/docs/reference/filter-syntax/).
