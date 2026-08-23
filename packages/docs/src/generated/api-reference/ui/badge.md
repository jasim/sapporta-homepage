---
title: "@sapporta/ui/badge"
package: "@sapporta/ui"
version: "0.2.12"
specifier: "@sapporta/ui/badge"
---

> Sapporta API reference for `@sapporta/ui@0.2.12`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/ui/badge

Import from `@sapporta/ui/badge`. Documented from `@sapporta/ui@0.2.12`; confirm the installed version with `node -p "require('@sapporta/ui/package.json').version"`.

3 symbols documented here.

## Types (1)

### BadgeProps

```ts
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
}
```

## Functions and components (1)

### Badge

```ts
function Badge({ className, variant, ...props }: BadgeProps): React.JSX.Element;
```

## Values, classes, and namespaces (1)

### badgeVariants

```ts
const badgeVariants: (props?: ({
    variant?: "default" | "secondary" | "destructive" | "outline" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
```
