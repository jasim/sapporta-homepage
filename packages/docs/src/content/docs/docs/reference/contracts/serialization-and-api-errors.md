---
title: "Serialization and API errors"
description:
  "Look up Temporal wire values, common HTTP error bodies, and typed-client
  failures."
---

## Identity

Temporal helpers from `@sapporta/shared/temporal`, error schema from
`@sapporta/shared/contracts`, validation normalization from
`@sapporta/shared/validation`, and `ApiError` from `@sapporta/shared/client`.

## Contract

- Calendar dates use ISO `YYYY-MM-DD` strings and parse as `Temporal.PlainDate`
  at typed boundaries.
- Timestamps use canonical ISO instants and parse as `Temporal.Instant` where
  the schema declares them.
- HTTP errors carry a structured body declared by the owning contract or
  infrastructure boundary.
- `ApiError` represents a non-2xx HTTP response that reaches client unwrapping.
  Its numeric `status` is preserved and its `body` is `unknown`.
- Network failures remain transport failures rather than fabricated HTTP
  statuses. Response-schema validation failures also pass through as validation
  failures instead of becoming `ApiError`.
- Validation failures and domain failures remain separate declared response
  branches.
- `FieldIssue` represents one presentation-neutral `{ field, message }`
  validation issue. `fieldIssuesFromZodError()` preserves nested paths with dot
  notation and maps pathless issues to `form`.
- `apiProblemFromBody()` accepts only a valid Sapporta error body. It returns
  `{ summary, code?, fieldIssues }`, recognizes direct `field` values and Zod
  `path` arrays, and ignores unrecognized details. Invalid bodies return
  `undefined`.
- `apiProblemFromBody()` is suitable for display normalization. Its optional
  generic `code` is not exhaustive proof for a feature-specific recovery branch.
- When recovery changes behavior, parse `ApiError.body` with the exported strict
  feature schema and require the expected status/code pair.
- Expected service/store failures use one HTTP-aware typed error family carrying
  status and payload, plus one exhaustive route-edge adapter. Errors outside
  that family escape to the application's central path.
- Malformed bodies, status/code mismatches, transport failures,
  response-validation failures, and unexpected errors do not enter a declared
  recovery branch.
- Protected feature contracts list their feature-owned failures. The shared
  authentication middleware owns common `401` and `403` envelopes outside each
  feature contract.

## Related documentation

- [Expected errors and HTTP mapping](/docs/guides/application-code/expected-errors-and-http-mapping/)
- [Generated record surfaces and form helpers](/docs/reference/frontend/generated-record-surfaces/)
