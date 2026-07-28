---
title: "Guides"
description:
  "Choose the guide that owns a table, workflow, report, security boundary, live
  operation, or deployment change."
---

Start with the result you need and choose the boundary that owns it. Each link
below is the first guide for that job. Its focused follow-ups carry the change
into dependent layers.

Reference pages catalogue types, options, commands, and response shapes. Guides
explain how those pieces compose.

If you have not chosen whether the operation belongs to a generated table,
app-owned route, report, or custom frontend action, start with
[Choose an application interface](/docs/guides/discovery/choose-an-application-interface/).
If you are asking an agent to change repository behavior, use
[Develop with a coding agent](/docs/guides/discovery/develop-with-a-coding-agent/).
Operating records in a running application is a different job.

## Model table-backed features

Start with
[Tables, columns, and schema metadata](/docs/guides/model-data/tables-columns-and-schema-metadata/)
when the outcome changes stored rows, relationships, search metadata, a
migration, or the CRUD behavior derived from the table definition. If a
registered table already exists and ordinary browser CRUD is the requested
surface, start with
[Generated record screens and forms](/docs/guides/generated-surfaces/record-screens-and-forms/).

## Build custom data interfaces

Start with
[Grid-first record workflows](/docs/guides/generated-surfaces/grid-first-record-workflows/)
when you need custom columns or hierarchy for one registered table, or a
temporary, composite, calculated, or browser-owned row model. That guide chooses
among a generated table screen, TGrid, BaseGrid, and an app-owned screen before
you take on their different row and cache responsibilities.

## Build domain workflows

Start with
[Shared contracts and request validation](/docs/guides/app-owned-features/shared-contracts-and-request-validation/)
for a named action, multi-table transaction, integration, or typed React caller
that ordinary table CRUD should not own. The contract fixes the browser-safe
wire shape before the workflow, endpoint, and client are added.

## Secure actions and data

Start with
[Authentication and abilities](/docs/guides/security/authentication-and-abilities/)
when the outcome depends on caller identity or permission. Follow its security
links when workspace authority, row visibility, server-owned values, or an agent
token is the actual boundary.

## Build reports

Start with [Route-based reports](/docs/guides/reports/route-based-reports/) for
a reusable aggregate or read model. The report path then scopes base rows, maps
the dataset, and adds drill-through in that order. For an ad hoc filtered total
or bounded one-column group over one registered table, use
[Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
instead.

## Inspect and operate a running application

Start with
[Choose an application interface](/docs/guides/discovery/choose-an-application-interface/)
when the owning operation or caller is not yet clear. For a bounded live-record
operation performed by an agent, start with
[Use the agent data console](/docs/guides/discovery/use-the-agent-data-console/).
For a known mounted route, the interface guide routes you to OpenAPI discovery
and the project-local CLI.

## Configure and ship

Start with
[Application configuration](/docs/guides/operations/application-configuration/)
for local, same-origin, or split-origin runtime setup. When the specific job is
applying a committed migration during a release or diagnosing migration startup,
start with
[Run migrations in deployed environments](/docs/guides/operations/run-migrations-in-deployed-environments/).

A change may cross several groups. Start at the boundary that owns the requested
behavior, then follow that guide's links to the dependent schema, authority,
API, frontend, report, or runtime layers.
