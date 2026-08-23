---
title: "@sapporta/ui/sheet"
package: "@sapporta/ui"
version: "0.2.12"
specifier: "@sapporta/ui/sheet"
---

> Sapporta API reference for `@sapporta/ui@0.2.12`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/ui/sheet

Import from `@sapporta/ui/sheet`. Documented from `@sapporta/ui@0.2.12`; confirm the installed version with `node -p "require('@sapporta/ui/package.json').version"`.

9 symbols documented here.

## Values, classes, and namespaces (9)

### Sheet

```ts
const Sheet: typeof DialogPrimitive.Root;
```

### SheetClose

```ts
const SheetClose: React.ForwardRefExoticComponent<Omit<import('@base-ui/react').AlertDialogCloseProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;
```

### SheetContent

```ts
const SheetContent: React.ForwardRefExoticComponent<Omit<SheetContentProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
```

### SheetDescription

```ts
const SheetDescription: React.ForwardRefExoticComponent<Omit<import('@base-ui/react').AlertDialogDescriptionProps, "ref"> & React.RefAttributes<HTMLParagraphElement>>;
```

### SheetHeader

```ts
const SheetHeader: {
    ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element;
    displayName: string;
};
```

### SheetOverlay

```ts
const SheetOverlay: React.ForwardRefExoticComponent<Omit<import('@base-ui/react').AlertDialogBackdropProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
```

### SheetPortal

```ts
const SheetPortal: React.ForwardRefExoticComponent<Omit<import('@base-ui/react').AlertDialogPortalProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
```

### SheetTitle

```ts
const SheetTitle: React.ForwardRefExoticComponent<Omit<import('@base-ui/react').AlertDialogTitleProps, "ref"> & React.RefAttributes<HTMLHeadingElement>>;
```

### SheetTrigger

```ts
const SheetTrigger: React.ForwardRefExoticComponent<Omit<SheetTriggerProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;
```
