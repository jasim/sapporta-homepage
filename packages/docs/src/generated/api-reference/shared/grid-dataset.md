---
title: "@sapporta/shared/grid-dataset"
package: "@sapporta/shared"
version: "0.7.0"
specifier: "@sapporta/shared/grid-dataset"
---

> Sapporta API reference for `@sapporta/shared@0.7.0`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/shared/grid-dataset

Import from `@sapporta/shared/grid-dataset`. Documented from `@sapporta/shared@0.7.0`; confirm the installed version with `node -p "require('@sapporta/shared/package.json').version"`.

24 symbols documented here.

## Types (9)

### GridDataset

```ts
type GridDataset = z.output<typeof gridDatasetSchema>;
```

### GridDatasetColumn

```ts
type GridDatasetColumn = z.output<typeof gridDatasetColumnSchema>;
```

### GridDatasetColumnKind

```ts
type GridDatasetColumnKind = z.output<typeof gridDatasetColumnKindSchema>;
```

### GridDatasetColumnReference

```ts
type GridDatasetColumnReference = z.output<typeof gridDatasetColumnReferenceSchema>;
```

### GridDatasetFooterRow

```ts
type GridDatasetFooterRow = z.output<typeof gridDatasetFooterRowSchema>;
```

### GridDatasetLevel

```ts
type GridDatasetLevel = z.output<typeof gridDatasetLevelSchema>;
```

### GridDatasetLevelSort

```ts
type GridDatasetLevelSort = z.output<typeof gridDatasetLevelSortSchema>;
```

### GridDatasetLevelTree

```ts
type GridDatasetLevelTree = z.output<typeof gridDatasetLevelTreeSchema>;
```

### GridDatasetNode

```ts
type GridDatasetNode = {
    rowKey: string;
    levelName: string;
    columns: Record<string, unknown>;
    rollup?: Record<string, unknown>;
    children?: Record<string, GridDatasetNode[]>;
    childFooterRows?: Record<string, GridDatasetFooterRow[]>;
    kind?: "opening" | "closing" | "subtotal";
};
```

## Functions and components (6)

### gridDatasetLinkProblems

Checks that every declarative link in a dataset reads only columns its level actually has.

```ts
function gridDatasetLinkProblems(dataset: GridDataset): string[];
```

### gridDatasetReferenceIds

The ids of the rows each referenced table is named by, across every level, node, child and footer row of the dataset.

```ts
function gridDatasetReferenceIds(dataset: GridDataset): Map<string, RecordId[]>;
```

### gridDatasetReferenceProblems

Checks that every `reference` column names an `idColumn` its level has.

```ts
function gridDatasetReferenceProblems(dataset: GridDataset): string[];
```

### gridDatasetSortProblems

Checks that every `sortBy` entry is a column of the level.

```ts
function gridDatasetSortProblems(dataset: GridDataset): string[];
```

### gridDatasetTreeColumn

The column that shows a tree level's hierarchy: the declared `tree.column`, else the first visible text column, else the first visible column.

```ts
function gridDatasetTreeColumn(level: GridDatasetLevel): string | null;
```

### gridDatasetTreeProblems

Checks the columns each tree level names: its parent column is a column of the level, and its tree column is a visible column of the level.

```ts
function gridDatasetTreeProblems(dataset: GridDataset): string[];
```

## Values, classes, and namespaces (9)

### gridDatasetColumnKindSchema

```ts
const gridDatasetColumnKindSchema: z.ZodEnum<{
    number: "number";
    boolean: "boolean";
    text: "text";
    date: "date";
    timestamp: "timestamp";
}>;
```

### gridDatasetColumnReferenceSchema

The table rows a report column names.

```ts
const gridDatasetColumnReferenceSchema: z.ZodObject<{
    table: z.ZodString;
    idColumn: z.ZodString;
}, z.core.$strip>;
```

### gridDatasetColumnSchema

```ts
const gridDatasetColumnSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    kind: z.ZodEnum<{
        number: "number";
        boolean: "boolean";
        text: "text";
        date: "date";
        timestamp: "timestamp";
    }>;
    displayFormat: z.ZodOptional<z.ZodEnum<{
        currency: "currency";
        percentage: "percentage";
    }>>;
    textDisplay: z.ZodOptional<z.ZodEnum<{
        multiLine: "multiLine";
        markdown: "markdown";
    }>>;
    visuallyHidden: z.ZodOptional<z.ZodBoolean>;
    width: z.ZodOptional<z.ZodNumber>;
    minWidth: z.ZodOptional<z.ZodNumber>;
    maxWidth: z.ZodOptional<z.ZodNumber>;
    colorRule: z.ZodOptional<z.ZodEnum<{
        positive: "positive";
        negative: "negative";
        signed: "signed";
    }>>;
    zeroDisplay: z.ZodOptional<z.ZodEnum<{
        blank: "blank";
        dot: "dot";
    }>>;
    strong: z.ZodOptional<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
    sortable: z.ZodOptional<z.ZodBoolean>;
    sortBy: z.ZodOptional<z.ZodArray<z.ZodString>>;
    filterable: z.ZodOptional<z.ZodBoolean>;
    searchable: z.ZodOptional<z.ZodBoolean>;
    links: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"table">;
        table: z.ZodString;
        bind: z.ZodRecord<z.ZodString, z.ZodString>;
        label: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodEnum<{
            external: "external";
            "drill-up": "drill-up";
            "drill-into": "drill-into";
            report: "report";
        }>>;
        target: z.ZodOptional<z.ZodEnum<{
            _self: "_self";
            _blank: "_blank";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        kind: z.ZodLiteral<"report">;
        report: z.ZodString;
        bind: z.ZodRecord<z.ZodString, z.ZodString>;
        label: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodEnum<{
            external: "external";
            "drill-up": "drill-up";
            "drill-into": "drill-into";
            report: "report";
        }>>;
        target: z.ZodOptional<z.ZodEnum<{
            _self: "_self";
            _blank: "_blank";
        }>>;
    }, z.core.$strip>, z.ZodObject<{
        kind: z.ZodLiteral<"url">;
        href: z.ZodString;
        bind: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        label: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodEnum<{
            external: "external";
// …declaration truncated at 2500 bytes.
```

### gridDatasetFooterRowSchema

```ts
const gridDatasetFooterRowSchema: z.ZodObject<{
    rowKey: z.ZodString;
    columns: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
```

### gridDatasetLevelSchema

```ts
const gridDatasetLevelSchema: z.ZodObject<{
    label: z.ZodOptional<z.ZodString>;
    columns: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        kind: z.ZodEnum<{
            number: "number";
            boolean: "boolean";
            text: "text";
            date: "date";
            timestamp: "timestamp";
        }>;
        displayFormat: z.ZodOptional<z.ZodEnum<{
            currency: "currency";
            percentage: "percentage";
        }>>;
        textDisplay: z.ZodOptional<z.ZodEnum<{
            multiLine: "multiLine";
            markdown: "markdown";
        }>>;
        visuallyHidden: z.ZodOptional<z.ZodBoolean>;
        width: z.ZodOptional<z.ZodNumber>;
        minWidth: z.ZodOptional<z.ZodNumber>;
        maxWidth: z.ZodOptional<z.ZodNumber>;
        colorRule: z.ZodOptional<z.ZodEnum<{
            positive: "positive";
            negative: "negative";
            signed: "signed";
        }>>;
        zeroDisplay: z.ZodOptional<z.ZodEnum<{
            blank: "blank";
            dot: "dot";
        }>>;
        strong: z.ZodOptional<z.ZodBoolean>;
        notes: z.ZodOptional<z.ZodString>;
        sortable: z.ZodOptional<z.ZodBoolean>;
        sortBy: z.ZodOptional<z.ZodArray<z.ZodString>>;
        filterable: z.ZodOptional<z.ZodBoolean>;
        searchable: z.ZodOptional<z.ZodBoolean>;
        links: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"table">;
            table: z.ZodString;
            bind: z.ZodRecord<z.ZodString, z.ZodString>;
            label: z.ZodOptional<z.ZodString>;
            icon: z.ZodOptional<z.ZodEnum<{
                external: "external";
                "drill-up": "drill-up";
                "drill-into": "drill-into";
                report: "report";
            }>>;
            target: z.ZodOptional<z.ZodEnum<{
                _self: "_self";
                _blank: "_blank";
            }>>;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"report">;
            report: z.ZodString;
            bind: z.ZodRecord<z.ZodString, z.ZodString>;
            label: z.ZodOptional<z.ZodString>;
            icon: z.ZodOptional<z.ZodEnum<{
                external: "external";
                "drill-up": "drill-up";
                "drill-into": "drill-into";
                report: "report";
            }>>;
            target: z.ZodOptional<z.ZodEnum<{
                _self: "_self
// …declaration truncated at 2500 bytes.
```

### gridDatasetLevelSortSchema

One key of a level's starting sort.

```ts
const gridDatasetLevelSortSchema: z.ZodObject<{
    column: z.ZodString;
    direction: z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>;
}, z.core.$strip>;
```

### gridDatasetLevelTreeSchema

Rows of one level that refer to each other, such as accounts with a `parent_id`, shown as one tree under the level's header.

```ts
const gridDatasetLevelTreeSchema: z.ZodObject<{
    parentColumn: z.ZodString;
    column: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
```

### gridDatasetNodeSchema

```ts
const gridDatasetNodeSchema: z.ZodType<GridDatasetNode>;
```

### gridDatasetSchema

```ts
const gridDatasetSchema: z.ZodObject<{
    name: z.ZodString;
    label: z.ZodString;
    rootLevel: z.ZodString;
    levels: z.ZodRecord<z.ZodString, z.ZodObject<{
        label: z.ZodOptional<z.ZodString>;
        columns: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            kind: z.ZodEnum<{
                number: "number";
                boolean: "boolean";
                text: "text";
                date: "date";
                timestamp: "timestamp";
            }>;
            displayFormat: z.ZodOptional<z.ZodEnum<{
                currency: "currency";
                percentage: "percentage";
            }>>;
            textDisplay: z.ZodOptional<z.ZodEnum<{
                multiLine: "multiLine";
                markdown: "markdown";
            }>>;
            visuallyHidden: z.ZodOptional<z.ZodBoolean>;
            width: z.ZodOptional<z.ZodNumber>;
            minWidth: z.ZodOptional<z.ZodNumber>;
            maxWidth: z.ZodOptional<z.ZodNumber>;
            colorRule: z.ZodOptional<z.ZodEnum<{
                positive: "positive";
                negative: "negative";
                signed: "signed";
            }>>;
            zeroDisplay: z.ZodOptional<z.ZodEnum<{
                blank: "blank";
                dot: "dot";
            }>>;
            strong: z.ZodOptional<z.ZodBoolean>;
            notes: z.ZodOptional<z.ZodString>;
            sortable: z.ZodOptional<z.ZodBoolean>;
            sortBy: z.ZodOptional<z.ZodArray<z.ZodString>>;
            filterable: z.ZodOptional<z.ZodBoolean>;
            searchable: z.ZodOptional<z.ZodBoolean>;
            links: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"table">;
                table: z.ZodString;
                bind: z.ZodRecord<z.ZodString, z.ZodString>;
                label: z.ZodOptional<z.ZodString>;
                icon: z.ZodOptional<z.ZodEnum<{
                    external: "external";
                    "drill-up": "drill-up";
                    "drill-into": "drill-into";
                    report: "report";
                }>>;
                target: z.ZodOptional<z.ZodEnum<{
                    _self: "_self";
                    _blank: "_blank";
                }>>;
            }, z.core.$strip>, z.ZodObject<{
                kind: z.ZodLiteral<"report">;
                report: z.ZodString;
                bind: z.ZodRecord<z.ZodString, z.Zo
// …declaration truncated at 2500 bytes.
```
