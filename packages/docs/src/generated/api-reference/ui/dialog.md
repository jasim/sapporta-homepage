---
title: "@sapporta/ui/dialog"
package: "@sapporta/ui"
version: "0.2.15"
specifier: "@sapporta/ui/dialog"
---

> Sapporta API reference for `@sapporta/ui@0.2.15`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/ui/dialog

Import from `@sapporta/ui/dialog`. Documented from `@sapporta/ui@0.2.15`; confirm the installed version with `node -p "require('@sapporta/ui/package.json').version"`.

10 symbols documented here.

## Values, classes, and namespaces (10)

### Dialog

```ts
const Dialog: typeof DialogPrimitive.Root;
```

### DialogClose

```ts
const DialogClose: React.ForwardRefExoticComponent<Omit<import('@base-ui/react').AlertDialogCloseProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;
```

### DialogContent

```ts
const DialogContent: React.ForwardRefExoticComponent<Omit<import('@base-ui/react').AlertDialogPopupProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
```

### DialogDescription

```ts
const DialogDescription: React.ForwardRefExoticComponent<Omit<import('@base-ui/react').AlertDialogDescriptionProps, "ref"> & React.RefAttributes<HTMLParagraphElement>>;
```

### DialogFooter

```ts
const DialogFooter: {
    ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element;
    displayName: string;
};
```

### DialogHeader

```ts
const DialogHeader: {
    ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element;
    displayName: string;
};
```

### DialogOverlay

```ts
const DialogOverlay: React.ForwardRefExoticComponent<Omit<import('@base-ui/react').AlertDialogBackdropProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
```

### DialogPortal

```ts
const DialogPortal: React.ForwardRefExoticComponent<Omit<import('@base-ui/react').AlertDialogPortalProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
```

### DialogTitle

```ts
const DialogTitle: React.ForwardRefExoticComponent<Omit<import('@base-ui/react').AlertDialogTitleProps, "ref"> & React.RefAttributes<HTMLHeadingElement>>;
```

### DialogTrigger

```ts
const DialogTrigger: React.ForwardRefExoticComponent<Omit<DialogTriggerProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;
```
