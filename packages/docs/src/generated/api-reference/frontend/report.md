---
title: "@sapporta/frontend/report"
package: "@sapporta/frontend"
version: "0.6.1"
specifier: "@sapporta/frontend/report"
---

> Sapporta API reference for `@sapporta/frontend@0.6.1`. Index: https://sapporta.com/api-reference/llms.txt

# @sapporta/frontend/report

Import from `@sapporta/frontend/report`. Documented from `@sapporta/frontend@0.6.1`; confirm the installed version with `node -p "require('@sapporta/frontend/package.json').version"`.

23 symbols documented here.

## Types (12)

### ReportCellLink

```ts
type ReportCellLink = {
    label: string;
    href: string;
    /** Menu-entry icon. Defaults to `external` for hrefs that leave the app,
     *  `drill-into` otherwise. */
    icon?: LinkIcon;
    target?: "_self" | "_blank";
};
```

### ReportCellLinkContext

```ts
type ReportCellLinkContext<TInput = unknown> = {
    dataset: GridDataset;
    node: TreeNode;
    levelName: string;
    input: TInput | undefined;
    ancestors: GridDatasetNode[];
    column: GridDatasetColumn;
    value: unknown;
};
```

### ReportCellLinkResolvers

```ts
type ReportCellLinkResolvers<TInput = unknown> = Record<string, {
    cell?: Record<string, (context: ReportCellLinkContext<TInput>) => ReportCellLink[]>;
    /** Row-level links offered in the row's context menu. */
    row?: (context: ReportRowLinkContext<TInput>) => ReportCellLink[];
}>;
```

### ReportGridDatasetProps

```ts
interface ReportGridDatasetProps<TInput = unknown> {
    dataset: GridDataset;
    links?: ReportCellLinkResolvers<TInput>;
    linkContext?: {
        input: TInput;
    };
}
```

### ReportRowLinkContext

```ts
type ReportRowLinkContext<TInput = unknown> = Omit<ReportCellLinkContext<TInput>, "column" | "value">;
```

### ReportRunButtonProps

```ts
interface ReportRunButtonProps {
    loading?: boolean;
    disabled?: boolean;
    onClick: () => void;
}
```

### ReportScreenFrameProps

```ts
interface ReportScreenFrameProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    children: ReactNode;
}
```

### ReportStat

```ts
interface ReportStat {
    /** Short uppercase label (e.g. "Opening balance"). */
    label: string;
    /** The value. Rendered in mono — caller pre-formats numbers. */
    value: ReactNode;
    /** One of the semantic accents. Defaults to `fg`. */
    tone?: "fg" | "positive" | "negative" | "brand" | "muted";
    /** Bolder weight, used for the "answer" cell (closing balance, total). */
    strong?: boolean;
}
```

### ReportSummaryStatsProps

```ts
interface ReportSummaryStatsProps {
    stats: ReportStat[];
}
```

### ReportToolbarProps

```ts
interface ReportToolbarProps {
    children?: ReactNode;
    actions?: ReactNode;
}
```

### UrlQueryObject

```ts
type UrlQueryObject = Record<string, UrlQueryValue>;
```

### UrlQueryValue

```ts
type UrlQueryValue = string | number | boolean | null | undefined;
```

## Functions and components (11)

### buildSearchParams

```ts
function buildSearchParams(values: UrlQueryObject): URLSearchParams;
```

### createSnapshotUrl

```ts
function createSnapshotUrl(path: string, values: UrlQueryObject): string;
```

### DateRangeField

```ts
function DateRangeField({ label, required, value, onChange, error, }: DateRangeFieldProps): import("react").JSX.Element;
```

### ReportError

```ts
function ReportError({ error }: {
    error: Error | string;
}): import("react").JSX.Element;
```

### ReportGridDataset

```ts
function ReportGridDataset<TInput = unknown>({ dataset, links, linkContext, }: ReportGridDatasetProps<TInput>): import("react").JSX.Element;
```

### ReportRunButton

```ts
function ReportRunButton({ loading, disabled, onClick, }: ReportRunButtonProps): import("react").JSX.Element;
```

### ReportScreenFrame

```ts
function ReportScreenFrame({ title, subtitle, actions, children, }: ReportScreenFrameProps): import("react").JSX.Element;
```

### ReportSummaryStats

Opt-in 4-up (or N-up) summary strip for reports — the one place a report UI "shouts".

```ts
function ReportSummaryStats({ stats }: ReportSummaryStatsProps): import("react").JSX.Element;
```

### ReportTimeZoneNote

The calendar this report's days are counted in.

```ts
function ReportTimeZoneNote(): import("react").JSX.Element;
```

### ReportToolbar

```ts
function ReportToolbar({ children, actions }: ReportToolbarProps): import("react").JSX.Element;
```

### useUrlQueryState

```ts
function useUrlQueryState<TState extends Record<string, string>>(defaults: TState): [TState, (next: Partial<TState>) => void];
```
