---
title: "App-Owned Features"
description:
  "Build product-specific features beside generated tables with contracts,
  handlers, OpenAPI, clients, and React screens."
---

Generated tables cover ordinary record work. App-owned features cover business
actions your application owns: triage a task, approve an expense, import a
statement, allocate a payment, post a journal entry, or render a domain report.

The usual chain is:

```text
shared contract
  -> backend handler
  -> mounted route
  -> OpenAPI
  -> typed frontend client
  -> React screen
```

A small contract captures the wire shape once:

```ts
export const tasksContract = c.router({
  triageTask: c.mutation({
    method: "POST",
    path: "/tasks/:id/triage",
    body: triageTaskBodySchema,
    responses: { 200: triageTaskResponseSchema },
  }),
});
```

Then the API and frontend import the same contract. Request types, response
types, validation, OpenAPI, and browser calls stay aligned.

The full walkthrough is
[Building Your Own Feature](/docs/building-your-own-feature/overview/).
