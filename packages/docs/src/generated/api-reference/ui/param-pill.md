---
title: "@sapporta/ui/param-pill"
package: "@sapporta/ui"
version: "0.2.12"
specifier: "@sapporta/ui/param-pill"
---

> Sapporta API reference for `@sapporta/ui@0.2.12`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/ui/param-pill

Import from `@sapporta/ui/param-pill`. Documented from `@sapporta/ui@0.2.12`; confirm the installed version with `node -p "require('@sapporta/ui/package.json').version"`.

2 symbols documented here.

## Types (1)

### ParamPillProps

```ts
interface ParamPillProps {
    /** Left cap — dim label (e.g., "account", "period"). */
    label: ReactNode;
    /** Middle cell — the current value, rendered in fg. Monospace when `mono`. */
    value: ReactNode;
    /** Mono the value cell (for identifiers and dates). Default false. */
    mono?: boolean;
    /** Click opens an editor / picker. If omitted, the pill is static. */
    onClick?: () => void;
    /** Show the trailing chevron "▾". Default true when onClick is provided. */
    dropdown?: boolean;
    /** Replaces the automatic chevron affordance — e.g., a clear ✕. */
    trailing?: ReactNode;
    /** True when the pill is the currently open one in a popover dance. */
    active?: boolean;
    /** Adds a small colored dot before the label (e.g., status indicator). */
    dot?: string;
    className?: string;
}
```

## Functions and components (1)

### ParamPill

Segmented [ label | value | chevron ] pill.

```ts
function ParamPill({ label, value, mono, onClick, dropdown, trailing, active, dot, className, }: ParamPillProps): import("react").JSX.Element;
```
