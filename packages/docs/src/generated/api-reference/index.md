# Sapporta API reference

> Every symbol published by the Sapporta packages, with the specifier to import it from and its exact declaration. Generated from the published declaration files — this is the API as shipped, not a summary of it.

Describes `@sapporta/shared@0.3.0`, `@sapporta/server@0.6.0`, `@sapporta/honest@0.3.12`, `@sapporta/grid@0.4.1`, `@sapporta/frontend@0.5.0`, `@sapporta/ui@0.2.13`.

Read this instead of opening declaration files under `node_modules`.

## Find a symbol by name

- [Symbol index](https://sapporta.com/api-reference/symbols.md): every exported name and the specifier that publishes it. Start here when you know the name but not the import path.

## Conventions

- Every page states the package version it documents. Confirm the installed version with `node -p "require('<package>/package.json').version"` before relying on a signature.
- Prefer the narrowest specifier that publishes a symbol. Root barrels re-export their subpaths and link to them rather than repeating signatures.
- Signatures are the published declarations verbatim. Behaviour a signature cannot express is covered by the guides at https://sapporta.com/docs.md.

## @sapporta/shared 0.3.0

- [@sapporta/shared](https://sapporta.com/api-reference/shared/index.md): 13 documented, 111 re-exported from subpaths.
- [@sapporta/shared/filter](https://sapporta.com/api-reference/shared/filter.md): 42 documented.
- [@sapporta/shared/value-kind](https://sapporta.com/api-reference/shared/value-kind.md): 4 documented.
- [@sapporta/shared/temporal](https://sapporta.com/api-reference/shared/temporal.md): 25 documented.
- [@sapporta/shared/daterange](https://sapporta.com/api-reference/shared/daterange.md): 16 documented.
- [@sapporta/shared/csv](https://sapporta.com/api-reference/shared/csv.md): 3 documented.
- [@sapporta/shared/grid-dataset](https://sapporta.com/api-reference/shared/grid-dataset.md): 13 documented.
- [@sapporta/shared/record-id](https://sapporta.com/api-reference/shared/record-id.md): 2 documented.
- [@sapporta/shared/row-scope](https://sapporta.com/api-reference/shared/row-scope.md): 7 documented.
- [@sapporta/shared/error](https://sapporta.com/api-reference/shared/error.md): 1 documented.
- [@sapporta/shared/validation](https://sapporta.com/api-reference/shared/validation.md): 11 documented.
- [@sapporta/shared/contracts](https://sapporta.com/api-reference/shared/contracts.md): 112 documented, split by group.
- [@sapporta/shared/client](https://sapporta.com/api-reference/shared/client.md): 6 documented.

## @sapporta/server 0.6.0

- [@sapporta/server](https://sapporta.com/api-reference/server/index.md): 204 documented, 25 re-exported from subpaths, split by group.
- [@sapporta/server/table](https://sapporta.com/api-reference/server/table.md): 26 documented.
- [@sapporta/server/errors](https://sapporta.com/api-reference/server/errors.md): 10 documented.
- [@sapporta/server/testing](https://sapporta.com/api-reference/server/testing.md): 2 documented.
- [@sapporta/server/create-project](https://sapporta.com/api-reference/server/create-project.md): 4 documented.
- [@sapporta/server/source-link-runtime](https://sapporta.com/api-reference/server/source-link-runtime.md): 0 documented.
- [@sapporta/server/cli](https://sapporta.com/api-reference/server/cli.md): 6 documented.
- [@sapporta/server/cli/commands](https://sapporta.com/api-reference/server/cli/commands.md): 1 documented.
- [@sapporta/server/cli/client](https://sapporta.com/api-reference/server/cli/client.md): 7 documented.
- [@sapporta/server/cli/http-client](https://sapporta.com/api-reference/server/cli/http-client.md): 4 documented.
- [@sapporta/server/cli/format](https://sapporta.com/api-reference/server/cli/format.md): 3 documented.
- [@sapporta/server/cli/render](https://sapporta.com/api-reference/server/cli/render.md): 2 documented.

## @sapporta/honest 0.3.12

- [@sapporta/honest](https://sapporta.com/api-reference/honest/index.md): 11 documented.

## @sapporta/grid 0.4.1

- [@sapporta/grid](https://sapporta.com/api-reference/grid/index.md): 190 documented, 3 re-exported from subpaths, split by group.
- [@sapporta/grid/advanced](https://sapporta.com/api-reference/grid/advanced.md): 17 documented.
- [@sapporta/grid/column-preset](https://sapporta.com/api-reference/grid/column-preset.md): 84 documented, split by group.
- [@sapporta/grid/lookup](https://sapporta.com/api-reference/grid/lookup.md): 18 documented.
- [@sapporta/grid/lookup/react](https://sapporta.com/api-reference/grid/lookup/react.md): 4 documented.
- `@sapporta/grid/index.css` — stylesheet, no exported symbols. Import for side effects.

## @sapporta/frontend 0.5.0

- [@sapporta/frontend](https://sapporta.com/api-reference/frontend/index.md): 189 documented, 128 re-exported from subpaths, split by group.
- [@sapporta/frontend/app](https://sapporta.com/api-reference/frontend/app.md): 9 documented.
- [@sapporta/frontend/platform](https://sapporta.com/api-reference/frontend/platform.md): 9 documented.
- [@sapporta/frontend/form](https://sapporta.com/api-reference/frontend/form.md): 3 documented.
- [@sapporta/frontend/schema](https://sapporta.com/api-reference/frontend/schema.md): 5 documented.
- [@sapporta/frontend/auth](https://sapporta.com/api-reference/frontend/auth.md): 18 documented.
- [@sapporta/frontend/auth/runtime](https://sapporta.com/api-reference/frontend/auth/runtime.md): 12 documented.
- [@sapporta/frontend/auth/pages](https://sapporta.com/api-reference/frontend/auth/pages.md): 5 documented.
- [@sapporta/frontend/auth/profile](https://sapporta.com/api-reference/frontend/auth/profile.md): 2 documented.
- [@sapporta/frontend/routes/table](https://sapporta.com/api-reference/frontend/routes/table.md): 3 documented.
- [@sapporta/frontend/routes/new-record](https://sapporta.com/api-reference/frontend/routes/new-record.md): 1 documented.
- [@sapporta/frontend/table/query](https://sapporta.com/api-reference/frontend/table/query.md): 10 documented.
- [@sapporta/frontend/report](https://sapporta.com/api-reference/frontend/report.md): 22 documented.
- [@sapporta/frontend/lookup](https://sapporta.com/api-reference/frontend/lookup.md): 18 documented.
- [@sapporta/frontend/layout](https://sapporta.com/api-reference/frontend/layout.md): 23 documented.
- [@sapporta/frontend/shell](https://sapporta.com/api-reference/frontend/shell.md): 44 documented.
- `@sapporta/frontend/index.css` — stylesheet, no exported symbols. Import for side effects.

## @sapporta/ui 0.2.13

- [@sapporta/ui](https://sapporta.com/api-reference/ui/index.md): 0 documented, 59 re-exported from subpaths.
- `@sapporta/ui/index.css` — stylesheet, no exported symbols. Import for side effects.
- [@sapporta/ui/alert-dialog](https://sapporta.com/api-reference/ui/alert-dialog.md): 10 documented.
- [@sapporta/ui/badge](https://sapporta.com/api-reference/ui/badge.md): 3 documented.
- [@sapporta/ui/button](https://sapporta.com/api-reference/ui/button.md): 3 documented.
- [@sapporta/ui/checkbox](https://sapporta.com/api-reference/ui/checkbox.md): 1 documented.
- [@sapporta/ui/context-menu](https://sapporta.com/api-reference/ui/context-menu.md): 12 documented.
- [@sapporta/ui/dialog](https://sapporta.com/api-reference/ui/dialog.md): 10 documented.
- [@sapporta/ui/input](https://sapporta.com/api-reference/ui/input.md): 1 documented.
- [@sapporta/ui/label](https://sapporta.com/api-reference/ui/label.md): 1 documented.
- [@sapporta/ui/popover](https://sapporta.com/api-reference/ui/popover.md): 4 documented.
- [@sapporta/ui/sheet](https://sapporta.com/api-reference/ui/sheet.md): 9 documented.
- [@sapporta/ui/switch](https://sapporta.com/api-reference/ui/switch.md): 1 documented.
- [@sapporta/ui/tooltip](https://sapporta.com/api-reference/ui/tooltip.md): 4 documented.
- [@sapporta/ui/combobox](https://sapporta.com/api-reference/ui/combobox.md): 2 documented.
- [@sapporta/ui/kbd](https://sapporta.com/api-reference/ui/kbd.md): 1 documented.
- [@sapporta/ui/param-pill](https://sapporta.com/api-reference/ui/param-pill.md): 2 documented.
- [@sapporta/ui/cn](https://sapporta.com/api-reference/ui/cn.md): 1 documented.
- [@sapporta/ui/use-debounce](https://sapporta.com/api-reference/ui/use-debounce.md): 1 documented.
