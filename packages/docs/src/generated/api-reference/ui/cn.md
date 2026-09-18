---
title: "@sapporta/ui/cn"
package: "@sapporta/ui"
version: "0.3.0"
specifier: "@sapporta/ui/cn"
---

> Sapporta API reference for `@sapporta/ui@0.3.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/ui/cn

Import from `@sapporta/ui/cn`. Documented from `@sapporta/ui@0.3.0`; confirm the installed version with `node -p "require('@sapporta/ui/package.json').version"`.

3 symbols documented here.

## Types (1)

### ClassMergeScales

The names an app adds to Tailwind's theme scales through `@theme`, beyond the stock ones.

```ts
interface ClassMergeScales {
    /** Font sizes: the `name` in `--text-name`, used as `text-name`. */
    text?: readonly string[];
    /** Letter spacing: the `name` in `--tracking-name`, used as `tracking-name`. */
    tracking?: readonly string[];
    /**
     * Lengths: the `name` in `--height-name` or `--spacing-name`, used as
     * `h-name`, `min-h-name`, `w-name`, `p-name`, and so on.
     */
    spacing?: readonly string[];
}
```

## Functions and components (2)

### cn

Joins class names and resolves Tailwind conflicts, the later class winning.

```ts
function cn(...inputs: ClassValue[]): string;
```

### extendCn

Registers an app's own theme scales with `cn`, so its custom sizes merge correctly everywhere, including inside Sapporta's components.

```ts
function extendCn(extra: ClassMergeScales): void;
```
