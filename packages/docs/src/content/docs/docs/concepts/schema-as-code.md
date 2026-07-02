---
title: "Schema As Code"
description:
  "Understand how Drizzle storage definitions and Sapporta table metadata work
  together."
---

Drizzle owns storage and migrations. Sapporta metadata owns product behavior:
labels, search, generated forms, row scope, relationships, lookup display,
children, and client edit policy.

A compact task table looks like this:

```ts
export const tasksTable = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace_id: text("workspace_id").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull(),
});

export const tasks = sapportaTable({
  drizzle: tasksTable,
  meta: {
    label: "Tasks",
    rowScope: "workspaceGlobal",
    rowLabelColumns: ["title"],
    search: { columns: ["title", "status"] },
  },
});
```

When you change table code, generate and review a migration, apply it, then
verify the running app:

```bash
pnpm --filter ./packages/api db:generate --name add_tasks
pnpm --filter ./packages/api db:migrate
pnpm --filter ./packages/api db:check
pnpm exec sapporta tables show tasks
```

For the metadata catalog and column factory lookup, use
[Table Definitions](/docs/reference/table-definitions/).
