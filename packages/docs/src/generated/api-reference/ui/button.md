---
title: "@sapporta/ui/button"
package: "@sapporta/ui"
version: "0.2.15"
specifier: "@sapporta/ui/button"
---

> Sapporta API reference for `@sapporta/ui@0.2.15`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/ui/button

Import from `@sapporta/ui/button`. Documented from `@sapporta/ui@0.2.15`; confirm the installed version with `node -p "require('@sapporta/ui/package.json').version"`.

3 symbols documented here.

## Types (1)

### ButtonProps

```ts
interface ButtonProps extends Omit<ButtonPrimitive.Props, "className">, VariantProps<typeof buttonVariants> {
    className?: string;
}
```

## Values, classes, and namespaces (2)

### Button

```ts
const Button: React.ForwardRefExoticComponent<Omit<ButtonProps, "ref"> & React.RefAttributes<HTMLElement>>;
```

### buttonVariants

```ts
const buttonVariants: (props?: ({
    variant?: "link" | "default" | "secondary" | "destructive" | "outline" | "ghost" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
```
