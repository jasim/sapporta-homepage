---
title: "Guides"
description:
  "Choose an independent guide by application subsystem or operating activity."
---

The guides start where the task-app tutorial finishes. Each one explains a
single Sapporta concept, shows the code or running surface that owns it, and
connects the concept to features you can add to another application.

Use them to deepen one part of an existing project: model data, customize a
record workflow, secure a route, build a domain endpoint, add a report, operate
the live API, or prepare a release. Exact type and command lookups remain in
Reference.

```text
I want to add <feature> to my Sapporta app. Help me choose the relevant guide,
identify the generated or app-owned boundary involved, and give me the smallest
working change I can run and inspect.
```

## Choose by the feature you are adding

- **Model data** covers tables, relationships, semantic columns, validation,
  migrations, search, indexes, and display metadata. Start with
  [tables, columns, and schema metadata](/docs/guides/model-data/tables-columns-and-schema-metadata/).

- **Generated application surfaces** covers record screens, forms, table APIs,
  queries, and Grid-based workflows. Start with
  [generated record screens and forms](/docs/guides/generated-surfaces/record-screens-and-forms/)
  or use
  [Grid-first record workflows](/docs/guides/generated-surfaces/grid-first-record-workflows/)
  when the interaction needs its own layout or editing model.

- **Security** covers authentication, abilities, workspace and user row scope,
  custom data access, and scoped agent tokens. Start with
  [authentication and abilities](/docs/guides/security/authentication-and-abilities/).

- **App-owned features** covers shared ts-rest contracts, custom Hono routes,
  transactions, typed clients, React screens, custom forms, cached table reads,
  uploads, and declared errors.
  Start with
  [custom API endpoints](/docs/guides/app-owned-features/custom-api-endpoints/)
  or
  [custom forms and cached table reads](/docs/guides/app-owned-features/custom-forms-and-table-queries/).

- **Reports** covers route-based `GridDataset` results, formatting,
  drill-through links, and scoped aggregation. Start with
  [route-based reports](/docs/guides/reports/route-based-reports/).

- **Discovery and automation** covers OpenAPI, interface choice, the CLI, data
  operations, and coding-agent workflows. Start with
  [OpenAPI and endpoint discovery](/docs/guides/discovery/openapi-and-endpoint-discovery/).

- **Deployment and operations** covers environment ownership, production builds,
  migration order, mail, runtime services, and diagnostics. Start with
  [application configuration](/docs/guides/operations/application-configuration/).

<!--
Screenshot brief
Suggested asset: /assets/guides/guide-navigation.png
Setup: Build the docs and open the Guides landing page with the full sidebar expanded.
Frame: Capture the guide-group list and sidebar together at desktop width.
Visible proof: The order moves from data modeling and generated surfaces through security, app features, reports, discovery, and operations.
Alt text: Sapporta Guides landing page with the seven guide groups visible in the documentation sidebar.
-->

Most features cross more than one group. A project-progress report, for example,
uses a shared contract, a scoped backend read, a dataset mapper, a typed client,
and a protected React route. Start with the guide for the user-visible outcome;
its next steps and reference links will take you through the supporting layers.
