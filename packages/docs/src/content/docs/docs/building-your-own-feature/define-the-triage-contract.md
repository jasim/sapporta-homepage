---
title: "Define The Triage Contract"
description: "Add a shared ts-rest contract for POST /api/tasks/:id/triage."
---

Create `packages/shared/src/contracts/tasks.ts` and export it from the shared
contracts index.

High-level route shape:

```ts
export const tasksContract = c.router({
  triageTask: c.mutation({
    method: "POST",
    path: "/tasks/:id/triage",
    pathParams: z.object({ id: z.coerce.number().int() }),
    body: z.object({
      status: z.enum(["open", "in_progress", "blocked", "done"]),
      priority: z.enum(["low", "normal", "high"]),
      assignee_id: z.number().int().nullable(),
      due_date: z.string().nullable(),
      note: z.string().trim().optional(),
    }),
    responses: {
      200: z.object({
        data: z.object({
          task_id: z.number(),
          status: z.string(),
          priority: z.string(),
          assignee_id: z.number().nullable(),
          event_id: z.number(),
          comment_id: z.number().optional(),
        }),
      }),
      404: errorBodySchema,
      409: errorBodySchema,
      422: errorBodySchema,
    },
  }),
});
```

Keep the shared package pure. It should contain request/response schemas and
wire-format types, not React components, Hono handlers, Drizzle queries, or
database access.

Next:
[Implement The Backend Action](/docs/building-your-own-feature/implement-the-backend-action/).
