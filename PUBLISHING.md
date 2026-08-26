# Publishing a Sapporta release to the homepage

The homepage builds against the published `@sapporta/*` packages, and it
documents the published `sapporta` CLI. When a new Sapporta release goes out,
this repository has to pick up the new packages, regenerate everything that is
derived from them, and commit the result.

Day to day the workspace usually points at the local Sapporta checkout
(`pnpm package-sources:use-local`). The sequence below moves it back to npm,
takes the release, and leaves the repository committed.

## The sequence

```bash
pnpm package-sources:update-npm
pnpm package-sources:use-npm
pnpm install
pnpm package-sources:verify
pnpm generate:sapporta-cli-version
pnpm generate:api-reference
pnpm generate:docs-index
pnpm build
pnpm check:api-reference
pnpm check:docs-index
pnpm test:build-scripts
git add .
git commit -m "Update to latest sapporta version"
```

## When the build fails

A Sapporta release can change the framework surface the app compiles against, so
`pnpm build` is the step that fails. Fix the application code — usually in
`packages/api/`, `packages/frontend/`, or `packages/shared/` — then resume:

```bash
pnpm build
pnpm check:api-reference
pnpm check:docs-index
pnpm test:build-scripts
git add .
git commit -m "Update to latest sapporta version"
```

The generated API reference is written from declaration files, not from this
app's code, so fixing the app does not require regenerating it.

## What each step does

- `package-sources:update-npm` asks the registry for the latest version of every
  `@sapporta/*` package and records it in `.package-source-switch.json`.
- `package-sources:use-npm` writes those versions into every `package.json` in
  the workspace, drops the `link:` overrides from `pnpm-workspace.yaml`, and
  removes the source-link runtime flag from the API's `dev` and `start` scripts.
- `install` is what actually brings the new packages down, including into
  `packages/api-reference/`.
- `package-sources:verify` fails if any manifest, workspace override, or lockfile
  entry still disagrees with npm mode.
- `generate:sapporta-cli-version` resolves `sapporta@latest` from the registry and
  writes `packages/docs/src/generated/sapporta-cli.mjs`, which is where the
  install command shown on the site gets its version number. This is the CLI
  package, versioned separately from the `@sapporta/*` libraries.
- `generate:api-reference` reads the `@sapporta/*` declaration files installed
  under `packages/api-reference/` and rewrites
  `packages/docs/src/generated/api-reference/`. It documents whatever is
  installed, so it has to run after `pnpm install` — before that, it would just
  regenerate the previous release.
- `generate:docs-index` rebuilds `packages/docs/src/content/docs/docs.md` from
  `packages/docs/sidebar.mjs`.
- `build` compiles shared, docs, API, and frontend. All three generate steps feed
  files into `packages/docs/src/`, so they run before it; the docs site is built
  from what is on disk at that moment. `prebuild` re-runs
  `generate:sapporta-cli-version` on its own, so that step is cheap insurance
  rather than a duplicate.
- The two `check:` scripts are the CI guards: they fail if the committed
  generated files do not match what a regeneration would produce.

## Back to local Sapporta

```bash
pnpm package-sources:use-local
pnpm install
pnpm package-sources:verify
```

`use:local` points the workspace at the Sapporta checkout recorded in
`.package-source-switch.json` and restores the source-link runtime flag. Pass a
path once if the checkout has moved:

```bash
pnpm package-sources use:local /absolute/path/to/sapporta
```

## Deploy

```bash
./deploy.sh
```

`deploy.sh` re-runs `update-npm`, `use:npm`, a clean `install`, `verify`, and
`build`, then stops and waits: commit anything it changed, type `yes`, and it
pushes `main` to `origin` and to `dokku`. `DEPLOYMENT.md` covers the production
topology and environment.
