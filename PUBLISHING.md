# Publishing a Sapporta release to the homepage

The site builds against the published `@sapporta/*` packages and documents the
published `sapporta` CLI. This is the sequence for taking a new release all the
way to production. The workspace normally points at the local Sapporta checkout;
the first step moves it back to npm.

## The sequence

```bash
pnpm package-sources:update-npm
pnpm package-sources:use-npm
rm -rf packages/*/node_modules
find packages -maxdepth 2 -name pnpm-lock.yaml -delete
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
git push origin main
git push dokku main
```

`pnpm build` is the step that fails when a release changes the framework surface.
Fix the app code in `packages/api/`, `packages/frontend/`, or `packages/shared/`,
re-run `pnpm build`, and carry on from there. The generated API reference is
written from declaration files, not from this app, so that fix does not require
regenerating it.

Push only after the build and both `check:` scripts pass. `git push dokku main`
is the deploy: dokku builds the `Dockerfile` and restarts the app.
`DEPLOYMENT.md` covers the production topology and environment.

## npm's `latest` lags behind a publish

The registry can take an hour or more to serve a just-published version, so
`update-npm` and `generate:sapporta-cli-version` may both resolve to the previous
release. **If the user names the versions they published, use those instead of
whatever the registry returns.**

For `@sapporta/*`: edit the `npm` map in `.package-source-switch.json` by hand
and start the sequence at `use-npm`. Do not run `update-npm` — it overwrites that
map with whatever the registry is currently serving. `verify` compares the
manifests against the map, so the workspace stays consistent either way.

For the `sapporta` CLI: `generate:sapporta-cli-version` always fetches
`sapporta@latest`, and `prebuild` re-runs it, so a hand-edited version is
overwritten by `pnpm build`. Write the version into
`packages/docs/src/generated/sapporta-cli.mjs` after the full build, then rebuild
the docs alone — that skips the root `prebuild`:

```bash
pnpm --filter ./packages/docs build
```

## What each step does

- `package-sources:update-npm` — records each `@sapporta/*` latest version in
  `.package-source-switch.json`. The only step that changes those versions.
- `package-sources:use-npm` — writes those versions into every `package.json`,
  drops the `link:` overrides from `pnpm-workspace.yaml`, and removes the
  source-link runtime flag from the API's `dev` and `start` scripts.
- `rm -rf` and `find … -delete` — clear per-package `node_modules` and any stray
  per-package lockfiles, so nothing survives from local link mode.
- `install` — brings the packages down, including into `packages/api-reference/`.
- `package-sources:verify` — fails if a manifest, workspace override, or lockfile
  entry still disagrees with npm mode.
- `generate:sapporta-cli-version` — writes `sapporta@latest` into
  `packages/docs/src/generated/sapporta-cli.mjs`, which supplies the version in
  the install command shown on the site. The CLI is versioned separately from the
  `@sapporta/*` libraries.
- `generate:api-reference` — rewrites
  `packages/docs/src/generated/api-reference/` from the declaration files
  installed under `packages/api-reference/`. Must run after `install`, or it
  regenerates the previous release.
- `generate:docs-index` — rebuilds `packages/docs/src/content/docs/docs.md` from
  `packages/docs/sidebar.mjs`.
- `build` — all three generate steps write into `packages/docs/src/`, so they run
  before it; the docs build reads what is on disk.
- `check:api-reference`, `check:docs-index` — CI guards; they fail if the
  committed generated files are stale.
- `git push dokku main` — deploys. `origin` is GitHub only.

## Back to local Sapporta

```bash
pnpm package-sources:use-local
pnpm install
pnpm package-sources:verify
```

Pass a path once if the checkout moved:

```bash
pnpm package-sources use:local /absolute/path/to/sapporta
```
