---
title: "Guides"
description:
  "Use these guides to build a secure production database application from a
  user requirement."
---

Sapporta builds a database application from a set of definitions rather than
hand-written wiring: you declare the records, the screens, the processes, the
access rules, the reports, and the runtime, and the framework turns those
declarations into a running app. Each of those is a layer, and a real feature
usually crosses several of them — but it always has one layer that drives the
result, with the others supporting it.

These guides walk that path from the highest layer down. You start by finding
which layer your task lives in, then work through the records that get stored,
the screens people use to reach them, the processes that span several records,
the rules that decide who can do what, the reports that summarize everything,
and finally the runtime that ships it to a real environment. Most changes
touch more than one layer, so the aim is to find the controlling layer first
and then follow the links into the rest only as far as the feature needs.

## Find the layer your task lives in

Sapporta draws a clean line between changing the application and using it.
Reshaping a table, a route, or an access rule is development work: you change
definitions, generate a migration, and release it. Working with data inside an
already-running app is different — the definitions stay put, and you move
records through the browser screens Sapporta already generated, or through a
scoped interface when the caller is an agent or an integration rather than a
person.

When the controlling layer isn't obvious,
[Choose an application interface](/docs/guides/discovery/choose-an-application-interface/)
sorts it out. If the task reshapes the app's tables, routes, or rules, start
with
[Develop with a coding agent](/docs/guides/discovery/develop-with-a-coding-agent/).
If it works on data inside a running app through a bounded, agent-driven
operation, use
[Use the agent data console](/docs/guides/discovery/use-the-agent-data-console/).

## Define the records the application stores

Every Sapporta feature starts with a table definition. You describe what a
record holds and how it connects to the others, and Sapporta derives the
storage layout, the search metadata, and the default create-read-update-delete
operations from that single definition. Because the table is the foundation
every other layer builds on, changing its shape means the existing data has to
move with it — which is why a migration always travels with a schema change.

For the shape itself, see
[Tables, columns, and schema metadata](/docs/guides/model-data/tables-columns-and-schema-metadata/).
If the generated browser screens for those records are all your requirement
needs, you can stop early at
[Generated record screens and forms](/docs/guides/generated-surfaces/record-screens-and-forms/).

## Choose how people reach those records

Once the records exist, the next layer decides how a person gets to them.
Sapporta generates screens that handle the common case of working with one
record at a time, and for many features that is the whole job. But people
often work in a different shape — comparing rows side by side, walking a
hierarchy, scanning columns stitched together from several tables, watching
values calculated on the fly — and a single-record form just gets in the way
of that.

When your requirement looks like that,
[Grid-first record workflows](/docs/guides/generated-surfaces/grid-first-record-workflows/)
lays out the options. It compares a generated table screen, TGrid, BaseGrid,
and an app-owned screen on who controls the rows and the cache, so the surface
you pick matches how people actually work.

## Add processes that span records

Sapporta's generated CRUD takes care of the everyday single-record moves, but
business work frequently reaches across several records at once: an approval
that updates three tables, a transaction that must succeed or fail as a unit,
a step that calls an external system in the middle. For operations like that,
Sapporta lets you write an app-owned endpoint that owns the whole process, and
reach it from the browser through a shared contract.

When CRUD is not enough to hold the process together,
[Shared contracts and request validation](/docs/guides/app-owned-features/shared-contracts-and-request-validation/)
is the guide. The shared contract defines the request and response that cross
the browser boundary, and it ties a typed React caller on one side to the
server endpoint on the other.

## Decide who can act, and on which records

Every Sapporta feature that touches data has to answer two questions: who is
allowed to do this, and which records are they allowed to reach? Sapporta
keeps those answers in three stacked layers — authentication, which
establishes who the caller is; abilities, which decide which actions they may
take; and row security, which decides which records they see. Because the
layers are stacked, a feature behaves the same for every caller without you
repeating the same checks in each handler.

When the result depends on identity or permission, start with
[Authentication and abilities](/docs/guides/security/authentication-and-abilities/).
Its linked guides carry the rest of the story — workspace authority, row
visibility, server-owned values, agent tokens — so access stays consistent as
the feature grows.

## Summarize records in reports

Once records are workable and protected, the next question people ask is
aggregate: not "what's in this record?" but "what's happening across all of
them?" Sapporta answers that with a reusable report, which selects the
authorized records, maps them into the dataset someone actually needs, and
offers drill-through links that carry a number back to the records behind it.

For that kind of summary, use
[Route-based reports](/docs/guides/reports/route-based-reports/). For
something lighter — an ad hoc filtered total or a bounded one-column count —
[Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/) is
often enough on its own.

## Configure the deployment

A feature that runs on your machine is not yet one that runs for anyone else.
Sapporta's runtime settings connect the feature to its target environment, and
their shape depends on how the frontend and API are arranged — sharing an
origin, or running separately. And because every schema change needs a
committed migration before it reaches production, a release usually pairs
configuration with a migration step.

For local, same-origin, or split-origin runtime configuration, use
[Application configuration](/docs/guides/operations/application-configuration/).
For the migration step itself, use
[Run migrations in deployed environments](/docs/guides/operations/run-migrations-in-deployed-environments/).

The layers form a single path from user requirement to deployed feature. Most
changes touch several, but one of them controls the result you were asked
for. Find that layer's guide first, then follow its links into the dependent
work — data, security, API, frontend, reports, or runtime — as far as the
feature needs it.
