# API reference generator

Generates the agent-facing symbol reference served at `/api-reference/`.

Coding agents need two things the guides do not give them: what a package
exports, and the specifier to import it from. Without that they read declaration
files out of `node_modules`, guessing at paths that embed a peer-version hash.
This package answers both from the declarations the packages actually ship.

## What it produces

Markdown under `packages/docs/src/generated/api-reference/`, committed to the
repository and served by the docs site:

- `index.md` — the entry point, also served at `/api-reference/llms.txt`. Lists
  every specifier with its symbol count.
- `symbols.md` — every exported name and the specifier that publishes it. This
  is the lookup that removes path guessing.
- One page per `exports` subpath, carrying each symbol's exact declaration.

Entry points come from each package's `exports` map, so the reference covers the
published surface by construction and cannot drift from it. Barrels that publish
more than `SPLIT_THRESHOLD` symbols are split into type, function, and value
pages, keeping any single page small enough to read.

## Which versions it documents

Whatever is installed here. The `@sapporta/*` dependencies in `package.json` pin
the documented versions, and every generated page states the version it
describes — an application on an older install must be able to tell.

To document newer packages, update the versions the way the repository already
does, then regenerate:

```bash
pnpm package-sources:update-npm
pnpm install
pnpm generate:api-reference
```

## Commands

```bash
pnpm generate:api-reference   # rewrite the generated pages
pnpm check:api-reference      # fail if the committed pages are stale
pnpm --filter ./packages/api-reference test
```

`check` runs in CI. Publishing a new export without regenerating fails it, which
is what keeps the reference trustworthy enough for an agent to prefer over
reading source.

## Why the TypeScript compiler directly

Reading declaration files rather than source makes the declaration text itself
the rendered signature, so nothing is re-rendered and nothing can disagree with
what ships. That removes the work a documentation generator would do here and
leaves only symbol enumeration, which the compiler API answers directly.

`typescript` is pinned in this package alone. The docs site does not depend on
it, so the compiler version used to read declarations moves independently of
anything else in the repository.
