---
title: "Guides"
description:
  "Follow a Sapporta feature from stored data to its runtime and operating
  boundary."
---

The guides start where the task-app tutorial ends. Each guide answers one
implementation question: which part of Sapporta owns this behavior, what is the
smallest useful change, and where must the boundary remain explicit?

Reference pages catalogue types, options, commands, and response shapes. Guides
explain how those pieces compose.

## Choose the owning boundary

Start with
[model data](/docs/guides/model-data/tables-columns-and-schema-metadata/) when
the feature is still a property of a stored record. Drizzle owns SQL
constraints. Sapporta metadata owns generated labels, search, forms, grids, and
row scope. Continue to
[table search](/docs/guides/model-data/search-indexes-and-display-metadata/)
when a root row should also be found through foreign-key labels or nested child
records.

Continue with
[generated record screens](/docs/guides/generated-surfaces/record-screens-and-forms/)
when ordinary CRUD is the workflow. Move to
[Grid-first workflows](/docs/guides/generated-surfaces/grid-first-record-workflows/)
when the page needs a different interaction or row model.

Read
[authentication and abilities](/docs/guides/security/authentication-and-abilities/)
before adding a protected action. Authentication establishes the caller,
abilities permit an operation, and row security limits the data that operation
may observe.

Use
[app-owned features](/docs/guides/app-owned-features/shared-contracts-and-request-validation/)
for a named domain action, multi-table transaction, integration, or screen that
is not ordinary table CRUD. The shared contract defines the wire boundary; the
API owns authorization and persistence; the frontend owns interaction state.

Use [reports](/docs/guides/reports/route-based-reports/) for reusable read
models. Reports scope base rows first, map them into `GridDataset`, and resolve
navigation in the frontend.

Use
[discovery and automation](/docs/guides/discovery/openapi-and-endpoint-discovery/)
to inspect and operate the live application. Use
[deployment and operations](/docs/guides/operations/application-configuration/)
when the question concerns process configuration, migration order, durable
storage, mail, or failure diagnosis.

A feature may cross several groups. Begin with the user-visible operation, then
follow its contract toward storage and authority. That order preserves the
meaning of the feature while its implementation crosses packages.
