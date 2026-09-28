---
title: "Theme tokens and scales"
description:
  "Look up the colour, radius, elevation, type, and height tokens Sapporta's
  components read, and override them from an application stylesheet."
---

## Identity

`@sapporta/ui/index.css`: the `--sap-*` palette, radius, and elevation
variables, the `sap-*` Tailwind theme scales, and the shadcn-compatible aliases.
`cn` and `extendCn` from `@sapporta/ui/cn`.

Every Sapporta primitive, the shell, the table, report, auth, and account
screens, and the grid preset read these tokens. One declaration changes all of
them.

## Where overrides go

The generated `packages/frontend/src/app.css` imports Tailwind, then Sapporta's
stylesheets, then holds the application's own CSS, which has the last word:

```css
@import "tailwindcss";
@import "@sapporta/ui/index.css";
@import "@sapporta/grid/index.css";
@import "@sapporta/frontend/index.css";
@source "./";

/* Palette, radii, and elevation: runtime variables. */
:root {
  --sap-brand: #2c6a4f;
  --sap-numeric-negative: var(--sap-fg);
  --sap-radius: 8px;
}

[data-theme="dark"] {
  --sap-brand: #7cc4a0;
}

/* Type, tracking, and height tiers: Tailwind theme scales. */
@theme inline {
  --text-sap-body: 16px;
  --height-sap-row: 48px;
  --height-sap-ctl: 44px;
}

body {
  font-size: 16px;
}
```

- Palette, radius, and elevation tokens are CSS variables on `:root` and
  `[data-theme="dark"]`. Redeclare them under the same selectors.
- Type, tracking, and height tiers are Tailwind theme variables. Redeclare them
  in an `@theme inline` block.
- The `body` base rule sets `13px` directly. An application on a larger scale
  sets its own `body` font size.

`useDocumentTheme()` decides which palette applies; see
[Theme mode](/docs/reference/frontend/app-shell/layout-and-sidebar/#theme-mode).

## Palette

The light palette sits on `:root` and the dark palette on `[data-theme="dark"]`,
with identical names. Each `--sap-*` token is also a Tailwind colour, for
`bg-*`, `text-*`, `border-*`, and `ring-*`.

| Token                                                               | Utility name                                                  | Paints                                                            |
| ------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| `--sap-bg`                                                          | `sap-bg`                                                      | Page background                                                   |
| `--sap-surface`                                                     | `sap-surface`                                                 | Page body, cards, grids, popovers                                 |
| `--sap-sidebar`                                                     | `sap-sidebar`                                                 | Status bar, compact bottom navigation, grid header fallback       |
| `--sap-nested-bg`                                                   | `sap-nested`                                                  | Nested grid levels, muted wash                                    |
| `--sap-chip-bg`                                                     | `sap-chip`                                                    | Chips, secondary buttons                                          |
| `--sap-row`, `--sap-row-hover`                                      | `sap-row`, `sap-row-hover`                                    | Rows, and the hover wash behind rows, menu items, and `bg-accent` |
| `--sap-border`, `--sap-border-strong`, `--sap-border-soft`          | `sap-border`, `sap-border-strong`, `sap-border-soft`          | Borders, from default to strongest to faintest                    |
| `--sap-fg`, `--sap-fg-soft`, `--sap-fg-muted`, `--sap-fg-subtle`    | `sap-fg`, `sap-soft`, `sap-muted`, `sap-subtle`               | Text, from primary to faintest                                    |
| `--sap-brand`, `--sap-brand-soft`                                   | `sap-brand`, `sap-brand-soft`                                 | Brand emphasis and its tint                                       |
| `--sap-selection`                                                   | `sap-selection`                                               | Active and selected grid cells                                    |
| `--sap-focus-ring`                                                  | `sap-focus-ring`                                              | Focus rings                                                       |
| `--sap-link`, `--sap-drill-down-link`, `--sap-drill-down-link-soft` | `sap-link`, `sap-drill-down-link`, `sap-drill-down-link-soft` | Links and report drill-through links                              |
| `--sap-loading-indicator-bar`                                       | `sap-loading-indicator-bar`                                   | Loading bar                                                       |
| `--sap-positive`, `--sap-warning`                                   | `sap-positive`, `sap-warning`                                 | Positive figures and warnings                                     |
| `--sap-negative`                                                    | `sap-negative`                                                | Errors, error text, and destructive actions                       |
| `--sap-numeric-negative`                                            | `sap-numeric-negative`                                        | Negative figures; follows `--sap-negative` unless set             |
| `--sap-active-nav-bg`, `--sap-nav-count-bg`                         | `sap-active-nav`, `sap-nav-count`                             | Avatar tiles, the compact navigation's active item, nav counts    |
| `--sap-nav-bg`, `--sap-nav-fg`, `--sap-nav-icon`                    | `sap-nav`, `sap-nav-fg`, `sap-nav-icon`                       | Navigation sidebar plane, row text, and icons                     |
| `--sap-nav-section`, `--sap-nav-hover-bg`, `--sap-nav-selected-bg`  | `sap-nav-section`, `sap-nav-hover`, `sap-nav-selected`        | Sidebar section labels, row hover, and the current page's wash    |
| `--sap-kbd-bg`, `--sap-kbd-inverted-bg`                             | `sap-kbd`, `sap-kbd-inverted`                                 | Keyboard hint chips, on light and on filled surfaces              |

`--sap-numeric-negative` paints `colorRule: "negative"`, negative `signed`
values, and negative report summary figures. Set it apart from `--sap-negative`
when negative numbers are ordinary data, such as money out in a ledger, so that
errors stay red and figures stay in ink.

The `--sap-nav-*` tokens paint the navigation sidebar. Redeclare them to restyle
it without moving `--sap-sidebar` or `--sap-active-nav-bg`, which also paint the
status bar, grid headers, the compact bottom navigation, and avatar tiles.

## Radii and elevation

| Token             | Default | Utility      | Used by                                        |
| ----------------- | ------- | ------------ | ---------------------------------------------- |
| `--sap-radius-sm` | `3px`   | `rounded-sm` | Context menu items, close and chevron buttons  |
| `--sap-radius`    | `6px`   | `rounded-md` | Buttons, inputs, badges, account menu items    |
| `--sap-radius-lg` | `8px`   | `rounded-lg` | Menus, tooltips, grid popups, the account menu |
| `--sap-radius-xl` | `10px`  | `rounded-xl` | Popovers, dialogs, alert dialogs               |

`--radius`, `--radius-sm`, `--radius-lg`, and `--radius-xl` are aliases for
shadcn components and read the `--sap-radius*` values. Override the
`--sap-radius*` names.

`--sap-shadow-elevated`, emitted as `shadow-sap-elevated`, is the one shadow for
floating layers: popovers, menus, dialogs, sheets, tooltips, a revealed
collapsed sidebar, and the grid's header menu and editor popups. Surfaces in the
page flow, such as buttons, inputs, badges, checkboxes, and switches, carry no
shadow.

## Shadcn-compatible aliases

The unprefixed names keep shadcn utilities such as `bg-primary`,
`text-muted-foreground`, and `bg-accent` working. Each delegates to a `--sap-*`
token, so override the canonical token rather than the alias.

| Alias                                       | Reads                               |
| ------------------------------------------- | ----------------------------------- |
| `--background`, `--foreground`              | `--sap-bg`, `--sap-fg`              |
| `--card`, `--popover`                       | `--sap-surface`                     |
| `--primary`, `--primary-foreground`         | `--sap-fg`, `--sap-bg`              |
| `--secondary`                               | `--sap-chip-bg`                     |
| `--muted`, `--muted-foreground`             | `--sap-nested-bg`, `--sap-fg-muted` |
| `--accent`                                  | `--sap-row-hover`                   |
| `--destructive`, `--destructive-foreground` | `--sap-negative`, `--sap-bg`        |
| `--border`, `--input`                       | `--sap-border`                      |
| `--ring`                                    | `--sap-brand`                       |
| `--sidebar-accent`                          | `--sap-active-nav-bg`               |

A base rule in `@layer base` sets `border-color: var(--border)` on every
element, so a `border` utility without a colour draws in `--sap-border`. An
application's own base rules still take precedence.

## Type scale

Ten tiers, named by role. Tailwind's own `text-xs` to `text-lg` remain
available.

| Utility            | Default  | Used for                                                          |
| ------------------ | -------- | ----------------------------------------------------------------- |
| `text-sap-tiny`    | `9px`    | Sort indicators and other tertiary glyphs                         |
| `text-sap-micro`   | `10px`   | Stat card labels                                                  |
| `text-sap-label`   | `10.5px` | Section labels, grid column headers, navigation counts            |
| `text-sap-meta`    | `11px`   | Helper text, badges, tooltips, status bar, card-view level titles |
| `text-sap-menu`    | `11.5px` | Menu items, select cells, page header subtitle                    |
| `text-sap-data`    | `12px`   | Inline data: IDs, dates, references, chips                        |
| `text-sap-emph`    | `12.5px` | Buttons, inputs, search                                           |
| `text-sap-body`    | `13px`   | Data rows, page header title, labels, toasts                      |
| `text-sap-mark`    | `14.5px` | Wordmark                                                          |
| `text-sap-display` | `18px`   | Dialog, sheet, and screen headings; stat values                   |

## Tracking and heights

| Utility                | Default  | Used for                              |
| ---------------------- | -------- | ------------------------------------- |
| `tracking-sap-display` | `0`      | Wordmark, stat values                 |
| `tracking-sap-head`    | `0.06em` | Grid column headers, uppercase labels |
| `tracking-sap-label`   | `0.06em` | Stat card labels                      |
| `tracking-sap-section` | `0.08em` | Menu and view-switch section labels   |

The height tiers are registered under `--height-*`, so they produce `h-sap-*`
and `min-h-sap-*` utilities and no padding, width, or gap utilities.

| Utility        | Default | Used for                                                             |
| -------------- | ------- | -------------------------------------------------------------------- |
| `h-sap-row`    | `32px`  | Data rows                                                            |
| `h-sap-header` | `29px`  | Grid header, child rows, compact buttons                             |
| `h-sap-ctl`    | `30px`  | Buttons, inputs, search, pagers, navigation items, combobox, filters |
| `h-sap-bar`    | `24px`  | Status bar, chip strips                                              |
| `h-sap-topbar` | `52px`  | Page header                                                          |

The grid's own spacing, such as cell padding and nested indents, is tuned
through `--sap-grid-*` variables; see
[Grid styling](/grid/guides/styling/#tune-the-presets-spacing).

## Class merging

`cn(...inputs)` joins class names and resolves Tailwind conflicts, the later
class winning. It knows the `text-sap-*`, `tracking-sap-*`, and `h-sap-*`
scales, so `cn("text-sap-body", "text-sap-fg")` keeps a size and a colour, and a
caller's `h-11` replaces a component's `h-sap-ctl`.

An application that adds its own scales through `@theme` registers their names
once at startup, before anything renders:

```ts
import { extendCn } from "@sapporta/ui/cn";

extendCn({
  text: ["display", "title", "body"],
  spacing: ["control"],
});
```

- `text` names font sizes: `--text-<name>`, used as `text-<name>`.
- `tracking` names letter spacings: `--tracking-<name>`, used as
  `tracking-<name>`.
- `spacing` names lengths in `--height-<name>` or `--spacing-<name>`, used as
  `h-<name>`, `min-h-<name>`, `w-<name>`, `p-<name>`, and so on.

The registration applies to every `cn` call, including those inside Sapporta's
components, so application classes passed through `className` merge correctly.
An unregistered `text-<name>` reads as a colour, and `cn` drops whichever of two
such classes comes first.

## Related documentation

- [Layout and sidebar](/docs/reference/frontend/app-shell/layout-and-sidebar/)
- [Column sizing](/docs/reference/column-sizing/)
- [Grid styling](/grid/guides/styling/)
