# Framework sync

Hand-written docs cover `../sapporta` through:

213c4b88a6fe28cf019f880bd97393f21a8b5a69  2026-09-28  frontend: let a schema table grid take its own columns

## Notes

- Coverage was not a strict prefix before this sync: the sidebar rail
  (`e5eb1d30`) and the Cmd/Ctrl-click row toggle (`031d6ecd`) had already been
  documented ahead of the `916e406` marker, so they needed no new work here.

## Open

- The getting-started screenshots still show the sidebar before the quiet-look
  change (`3e103365`): recapture `generated-app-welcome.jpg` and
  `task-app-created.png`.
- `packages/api-reference/package.json` pins the last release, so the generated
  symbol reference lags the hand-written pages until the next publish. Bump the
  `@sapporta/*` versions and run `pnpm generate:api-reference` for the release
  carrying these changesets; the new symbols include `pendingMigrations`,
  `applyMigrations`, `gridEditable`, `TableGridHeaderVariant`, and
  `expandTGridColumnSpecs`.
- `titleCaseIdentifier` in `@sapporta/shared/labels` has no hand-written page;
  the generated reference covers it.
- `e59cd71b` `createTestAuthContext` in `@sapporta/server/testing`: no
  hand-written page covers the test utilities.
