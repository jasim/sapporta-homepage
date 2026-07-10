---
title: "Shared contracts and request validation"
description: "Define browser-safe wire shapes once for validation, OpenAPI, handlers, and clients."
---

Define browser-safe wire shapes once for validation, OpenAPI, handlers, and clients.

The shared package owns ts-rest contracts, Zod schemas, wire types, serializers, and constants without importing API, database, or React I/O.

For the programmer, the project re-exports each contract and imports the same value at the server and browser boundaries.
For the application user, malformed requests fail before the domain workflow runs, and declared failures retain stable shapes.

## System boundary

- Place contracts under `packages/shared/src/contracts/`.
- Declare path parameters, query, body, responses, summary, and tags.
- Declare every expected non-2xx response.
- Keep the shared package a leaf dependency.

## Task-app example

`completeTaskContract` coerces the task id, accepts an empty body, returns the task and event identifiers, and declares not-found and conflict responses.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Contract helpers and wire types](/docs/reference/contracts/contract-helpers-and-wire-types/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
