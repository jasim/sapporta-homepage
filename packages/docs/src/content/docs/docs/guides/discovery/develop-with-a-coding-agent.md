---
title: "Develop with a coding agent"
description:
  "Specify a bounded repository change, then review the code, generated
  artifacts, negative checks, and live evidence produced by a coding agent."
---

Sapporta projects give a coding agent stable ownership boundaries: schema,
migration, contract, route, authorization, client, and screen. A useful request
names the observable outcome and the invariant that must survive the change.

This guide is for changing source code in a Sapporta repository. To inspect or
change records in an already-running application, use
[the agent data console](/docs/guides/discovery/use-the-agent-data-console/)
instead.

## Connect the running application when the task needs it

Before the first request, decide whether the agent needs the running application
at all. Repository-only work can start from `AGENTS.md` and the Sapporta skill;
it does not need a bearer token merely to inspect or edit source.

When the task also needs protected endpoint discovery, live rows, or runtime
read-back, create a token in the intended workspace and use the setup prompt
from `/account/profile`. Open the agent at the project root before pasting it,
because the prompt instructs the agent to configure that checkout's private CLI
environment and record the command future sessions should use. The
[agent access guide](/docs/guides/security/agent-access-and-scoped-tokens/)
covers the credential boundary, secret-bearing handoff, and revocation
lifecycle.

## Describe an outcome another reviewer can verify

A bounded request gives the agent room to follow local conventions without
leaving the reviewer to infer what success means. Copy this structure and
replace each placeholder with facts from the repository:

```text
Outcome:
Starting point:
Owning boundary:
Authority and invariants:
Observable success:
Required negative checks:
Files or surfaces to inspect:
Reference links:
```

The starting point should tell the agent to read the repository's `AGENTS.md`
and name the nearest existing schema, route, screen, or configuration file. When
an outcome crosses schema, authorization, API, and frontend boundaries, ask for
a short plan before edits so each responsibility has an explicit owner.

The generated `AGENTS.md` covers the conventions an agent would otherwise
invent: where each kind of change belongs, sample data through `pnpm seed` and
`openScriptRuntime()` for any other script, and the rule that a day is resolved
in the workspace's time zone rather than read from the host clock. An agent that
starts there writes the project's conventions rather than its own.

## Keep authority at its owning layer

Name the boundary the outcome belongs to and let the agent find the file. The
[project file map](/docs/reference/project/project-files/) lists every path,
its owner, and what to do after the edit; its "Where a change goes" table is the
lookup an agent performs.

The client must not choose workspace, owner, role, or scope merely because a
field appears in a form or payload. Ask the agent to keep those values and the
corresponding authorization checks on the server.

## Review evidence in layers

Start with the focused diff. Confirm that the change stays within the requested
outcome and follows the package boundaries in `AGENTS.md`. Then inspect the
artifacts that apply:

- Schema changes have named migration SQL that was reviewed before application.
- Shared contracts remain browser-safe and contract paths rely on the parent
  `/api` mount.
- Application handlers are registered and mounted. When they should appear in
  OpenAPI, their documentation surface is composed as well.
- Abilities, data authority, row scope, and server-owned values remain on the
  server.
- Typed clients and screens handle declared success, loading, stale, and error
  states without inventing a second wire shape.
- Focused tests and build output are included with the exact commands that
  produced them.

The generated project provides a workspace build:

```bash
pnpm build
```

That command proves the workspace builds. It does not prove that a route is
mounted, a migration was applied, or a state transition preserved its invariant.

## Prove success, read it back, and check failure

Run the smallest positive check that exercises the owning boundary. For a
mutation, read back the affected record, event, aggregate, or screen state
instead of treating an HTTP success as proof of every side effect. For a route,
confirm both runtime mounting and documented discovery when both are intended.

Choose negative checks that the change can actually prove:

- unauthenticated or missing-ability access;
- a wrong-workspace or invisible row;
- invalid input;
- a conflict or stale state;
- an unapplied migration;
- an unavailable runtime dependency.

For a transaction, show that a rejected branch leaves no partial write. For
security-sensitive lookup, confirm that hidden and absent rows do not reveal
different information. Record any case the available fixture or environment
could not prove rather than turning it into a passing claim.

Project instructions carry local workflow. When the Sapporta skill is installed,
it adds framework-specific checks and conventions. Review still follows source,
generated artifacts, and live behavior rather than the agent's summary.

## Record limits and choose the next owner

Finish with the known limits, low-level escape hatches used, and the next
focused guide or reference. Running-application discovery and record operations
are conditional evidence for a repository change; they remain owned by the
live-operation guides.

## Related guides and reference

- [Guide index](/docs/guides/)
- [Choose an application interface](/docs/guides/discovery/choose-an-application-interface/)
- [Use the agent data console](/docs/guides/discovery/use-the-agent-data-console/)
- [Agent access and scoped tokens](/docs/guides/security/agent-access-and-scoped-tokens/)
- [Project file map](/docs/reference/project/project-files/)
- [Project and discovery commands](/docs/reference/cli/project-and-discovery-commands/)
