---
title: "Public symbols"
description:
  "Find any Sapporta export, the specifier to import it from, and its exact
  declaration."
---

## Identity

Entry point to the generated symbol reference, and the package boundaries that
decide which package owns a symbol.

## Complete symbol reference

Every symbol the Sapporta packages publish is generated from their shipped
declaration files and served as Markdown:

- [Sapporta API reference](/api-reference/llms.txt)

Start there for any "what can I import, and what is its type" question. It
carries the exact declaration of every export, states the package version it
describes, and includes a symbol index that maps a name to the specifier that
publishes it. Read it instead of opening declaration files under
`node_modules` — the reference names the specifier, which a file path does not.

The reference is generated from the declaration files of the **published**
packages, so it describes a release rather than the Sapporta working tree. The
two drift between publishes. Check the version the page states against the
`@sapporta/*` versions a project installs before trusting a symbol's presence or
its exact signature.

The pages below explain behavior that a signature cannot express. The generated
reference names the surface; these describe what it does.

## Package boundaries

`@sapporta/server` owns server schema, auth, row helpers, and route
registration. `@sapporta/shared` owns browser-safe contracts and wire values.
`@sapporta/frontend` owns the app shell, generated record surfaces, TGrid, and
report rendering. Standalone `@sapporta/grid` has its own
[Grid Reference](/grid/reference/).

Test utilities live only on `@sapporta/server/testing`; they are not on the
production root export.

Prefer the narrowest specifier that publishes a symbol. Root barrels re-export
their own subpaths, so `@sapporta/frontend/layout` and `@sapporta/frontend` may
both resolve `AppPage` — importing from the narrower one keeps the dependency
honest and the import readable.

## Related documentation

- [Generated and client values](/docs/reference/schema/semantic-values/generated-and-client-values/)
- [Server write values and contracts](/docs/reference/schema/semantic-values/server-write-values-and-contracts/)
- [Row-scoped data helpers](/docs/reference/server/row-scoped-data-helpers/)
- [App shell, routes, and navigation](/docs/reference/frontend/app-shell-routes-and-navigation/)
- [Table query options](/docs/reference/frontend/table-query-options/)
- [TGrid](/docs/reference/frontend/tgrid/)
- [Grid reference](/grid/reference/)
