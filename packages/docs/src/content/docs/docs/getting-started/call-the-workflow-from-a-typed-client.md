---
title: "Call the workflow from a typed client"
description: "Create a frontend client from the complete-task contract and preserve declared success and error shapes."
---

The browser imports the shared contract and receives an inferred client method. It does not redefine path parameters, request bodies, response fields, or errors.

> Checkpoint: C09 → C10

## Agent approach

```text
Read the local project instructions and use the Sapporta skill. Starting at C09, implement this outcome: The browser imports the shared contract and receives an inferred client method. It does not redefine path parameters, request bodies, response fields, or errors. Reach C10, run the validation described on this page, and report changed files and checks. Preserve server-controlled scope fields and use generated APIs for ordinary CRUD.
```

## Review the agent's work

- `packages/frontend/src/api.ts` imports only browser-safe shared code.
- `baseUrl: getApiBase` passes the resolver function instead of evaluating it at module load.
- Non-2xx responses throw `ApiError` with status and parsed body.

## Code approach

```ts
import { createApiClient } from "@sapporta/shared/client";
import { getApiBase } from "@sapporta/frontend/platform";
import { completeTaskContract } from "task-app-shared";

export const taskActionsApi = createApiClient(completeTaskContract, {
  baseUrl: getApiBase,
});

await taskActionsApi.completeTask({ params: { id: taskId }, body: {} });
```

## Observe and verify

The client typechecks, reaches the endpoint through the development proxy, and retains the declared 404 and 409 response bodies in `ApiError`.

## What you built

The contract now spans validation, OpenAPI, handler types, and the browser call. The next page places the action inside the app shell.

Continue with [the related guide](/docs/guides/app-owned-features/typed-api-clients/) or use [the exact reference](/docs/reference/contracts/typed-client-creation/).
