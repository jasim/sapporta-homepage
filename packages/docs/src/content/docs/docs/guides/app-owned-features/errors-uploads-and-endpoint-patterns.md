---
title: "Errors, uploads, and endpoint patterns"
description: "Model expected failures and non-basic endpoint bodies without weakening the contract boundary."
---

Model expected failures and non-basic endpoint bodies without weakening the contract boundary.

Contracts declare expected statuses and content types. Route adapters translate typed domain errors once and allow unexpected failures to reach the central error boundary.

For the programmer, the project can add multipart files, non-JSON bodies, raw responses, and upstream failure mapping as focused endpoint contracts.
For the application user, clients receive actionable errors and correct content handling for each declared branch.

## System boundary

- Use 404 for missing or invisible rows and 409 for state conflicts.
- Use 422 for valid syntax that violates workflow validation.
- Let the browser set multipart boundaries.
- Keep upload infrastructure separate from the minimal task domain.

## Task-app example

The task example uses complete-task not-found and conflict errors. A separate upload pattern demonstrates `File` fields without adding an attachment table to the tutorial app.


## Verify

1. Run the smallest build, route, table, or browser check that exercises this boundary.
2. Compare the result with the generated record or API surface under the same authenticated workspace.
3. Test one invalid or cross-boundary input when the page changes data or authority.

## Related reference

- [Contract helpers and wire types](/docs/reference/contracts/contract-helpers-and-wire-types/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
