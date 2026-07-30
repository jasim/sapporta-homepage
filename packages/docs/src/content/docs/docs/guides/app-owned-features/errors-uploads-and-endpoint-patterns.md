---
title: "Errors, uploads, and endpoint patterns"
description:
  "Choose the focused endpoint guide for expected failures, multipart uploads,
  or non-JSON and raw responses."
---

These endpoint patterns share the contract boundary but solve different
problems. Read only the page required by the operation:

- [Expected errors and HTTP mapping](/docs/guides/app-owned-features/expected-errors-and-http-mapping/)
  covers one typed domain-error family, declared status/code pairs, adapter
  mapping, and browser parsing.
- [Multipart file uploads](/docs/guides/app-owned-features/multipart-file-uploads/)
  covers contract declaration, the handler `files` argument, row-safe target
  checks, file limits, and multipart exercise.
- [Non-JSON and raw responses](/docs/guides/app-owned-features/non-json-and-raw-responses/)
  covers typed text/CSV responses and the narrow cases that require a raw
  `Response`.

The shared contract owns the wire shape. The route adapter owns request parsing
and HTTP translation. Domain code owns invariants. Unexpected failures remain
on the application's central error path.

## Related documentation

- [Shared contracts and request validation](/docs/guides/app-owned-features/shared-contracts-and-request-validation/)
- [Custom API endpoints](/docs/guides/app-owned-features/custom-api-endpoints/)
- [Contract helpers and wire types](/docs/reference/contracts/contract-helpers-and-wire-types/)
