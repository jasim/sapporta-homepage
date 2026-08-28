---
title: "@sapporta/shared/value-kind"
package: "@sapporta/shared"
version: "0.3.1"
specifier: "@sapporta/shared/value-kind"
---

> Sapporta API reference for `@sapporta/shared@0.3.1`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared/value-kind

Import from `@sapporta/shared/value-kind`. Documented from `@sapporta/shared@0.3.1`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

4 symbols documented here.

## Types (2)

### ColumnMeta

Semantic metadata a column factory stamps on its Drizzle output.

```ts
interface ColumnMeta {
    /** Semantic kind. Drives parse rules and operator applicability. */
    kind: ValueKind;
    /** Presentation-only hint. Does NOT participate in query semantics. */
    displayFormat?: "currency" | "percentage";
    /** Foreign key target, if this column references another table. */
    foreignKey?: {
        table: string;
        column: string;
    };
    /** Enumeration options, if this column is restricted to a fixed set. */
    options?: readonly string[];
}
```

### ValueKind

```ts
type ValueKind = "text" | "number" | "boolean" | "date" | "timestamp";
```

## Functions and components (1)

### isOperatorApplicable

Sole reader of the matrix.

```ts
function isOperatorApplicable(kind: ValueKind, op: Operator): boolean;
```

## Values, classes, and namespaces (1)

### OPERATOR_APPLICABILITY

The operator-applicability matrix — as data, not branches.

```ts
const OPERATOR_APPLICABILITY: Record<ValueKind, readonly Operator[]>;
```
