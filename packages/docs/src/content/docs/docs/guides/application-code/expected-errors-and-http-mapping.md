---
title: "Expected errors and HTTP mapping"
description:
  "Map one typed domain-error family to declared HTTP responses and parse only
  its strict status/code pairs in the browser."
---

Use status codes to describe expected failures at the HTTP boundary:

- `404` means a row is absent or invisible to the request.
- `409` means valid input conflicts with current resource state.
- `422` means the request parsed but the workflow cannot accept a value derived
  or validated by the server.
- `502` means an upstream system failed or returned unusable data.

## Map the domain family once

A domain module raises one typed expected-error family. In the task-completion
slice, that family carries the declared status and strict feature payload. The
adapter catches it once:

```ts
try {
  const auth = c.get("auth");

  return {
    status: 200,
    body: completeTask({ db: c.get("db"), auth }, request.params.id),
  };
} catch (error) {
  return taskCompletionErrorResponse(error);
}
```

`taskCompletionErrorResponse()` accepts only `TaskCompletionError`, covers the
family's declared `404` and `409` variants, and rethrows everything else.
Unexpected database, programming, and infrastructure failures stay on the
central error path.

Declare each feature-owned status in the shared contract. Request parsing owns
the generic `400`; shared authentication middleware owns `401` and `403` outside
the feature response map.

On the frontend, `ApiError.body` remains `unknown`. Parse the exported strict
feature schema before using a code for recovery, and require the declared
status/code pair. A schema-valid body with the wrong status is not a supported
recovery branch.

## Related documentation

- [Domain workflows and transactions](/docs/guides/application-code/domain-workflows-and-transactions/)
- [Typed API clients](/docs/guides/application-code/typed-api-clients/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
