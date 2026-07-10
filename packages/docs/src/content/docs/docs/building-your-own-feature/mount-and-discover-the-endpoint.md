---
title: "Mount And Discover The Endpoint"
description:
  "Expose the triage route under /api, add a typed frontend client, and verify
  OpenAPI discovery."
---

Route files under `packages/api/app/` are not exposed automatically. Mount the
route from `packages/api/app.ts` so the final route is:

```text
POST /api/tasks/{id}/triage
```

Do not add this route to public routes. Triage is a protected workspace action.

Add a typed client in `packages/frontend/src/api.ts`:

```ts
export const tasksApi = createApiClient(tasksContract, {
  baseUrl: getApiBase,
});
```

Pass `getApiBase` itself, not `getApiBase()`, so local Vite proxying and
production deployment stay aligned.

Verify discovery:

```bash
pnpm build
pnpm dev
pnpm exec sapporta endpoints show "POST /api/tasks/{id}/triage"
```

Next:
[Build The Triage Screen](/docs/building-your-own-feature/build-the-triage-screen/).
