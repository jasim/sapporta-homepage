# Framework sync

Hand-written docs cover `../sapporta` through:

213c4b88a6fe28cf019f880bd97393f21a8b5a69  2026-09-28  frontend: let a schema table grid take its own columns

## Notes

- Coverage was not a strict prefix before this sync: the sidebar rail
  (`e5eb1d30`) and the Cmd/Ctrl-click row toggle (`031d6ecd`) had already been
  documented ahead of the `916e406` marker, so they needed no new work here.
- The row display commits are documented ahead of the `213c4b88` marker, and
  the commits between the marker and them are not: computed fields and
  `meta.rowCaption` (`cdefd835`), lookup `renderEntry` and cache reloads
  (`1ed5c052`), the row data store and display slots (`52c8acda`),
  `LookupPicker` composition and `selectedCaption` (`82ed1582`),
  `invalidateRows` (`eb8fa6d0`), filter row display (`1e1df09f`),
  `treePathRelation` (`2c79a537`), lookup narrowing and `notUnder`
  (`a3b6de03`), and report reference columns (`aaae9c2d`, `3db1aee3`,
  `ed9d3a8f`). A later sync that advances the marker past them needs no new
  work for these commits.

## Open

- The getting-started screenshots still show the sidebar before the quiet-look
  change (`3e103365`): recapture `generated-app-welcome.jpg` and
  `task-app-created.png`.
- `packages/api-reference/package.json` pins the last release, so the generated
  symbol reference lags the hand-written pages until the next publish. Bump the
  `@sapporta/*` versions and run `pnpm generate:api-reference` for the release
  carrying these changesets; the new symbols include `pendingMigrations`,
  `applyMigrations`, `gridEditable`, `TableGridHeaderVariant`,
  `expandTGridColumnSpecs`, and the row display symbols (`computedField`,
  `computeFields`, `treePath`, `treePathRelation`, `attachReferenceComputed`,
  `RowDisplayProvider`, `useRowComputed`, `invalidateRows`, and others).
- `titleCaseIdentifier` in `@sapporta/shared/labels` has no hand-written page;
  the generated reference covers it.
- `e59cd71b` `createTestAuthContext` in `@sapporta/server/testing`: no
  hand-written page covers the test utilities.
