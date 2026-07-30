---
title: "Scoped lookups and counts"
description:
  "Use row-scoped lookup modes, scalar counts, and grouped counts without
  loading complete records."
---

`scopedRows()` exposes specialized reads whose inputs contain Drizzle values,
not HTTP query grammar:

`@sapporta/server` exports `TableColumn`, `LookupRowsInput`,
`LookupRowsByIdInput`, `LookupRowsBySearchInput`, `CountRowsInput`,
`CountRowsByInput`, and `GroupCount`.

```ts
interface ScopedRows<TTable extends AnySQLiteTable> {
  lookup(input?: LookupRowsInput<TTable>): Promise<LookupEntry[]>;
  count(input?: CountRowsInput): Promise<number>;
  countBy(input: CountRowsByInput<TTable>): Promise<GroupCount[]>;
}
```

## Use one lookup mode at a time

Direct lookup separates selected-ID recovery from picker search:

```ts
await rows.lookup({ ids: ["12", "14", "19"] });

await rows.lookup({
  search: "overdue",
  fields: [invoicesTable.id, invoicesTable.reference],
  limit: 20,
});
```

ID mode accepts between `1` and `500` string `RowId` values and does not accept
`search`, `fields`, or `limit`. Numeric primary-key IDs are validated and
converted before SQL; text primary-key IDs remain strings. Search mode accepts
visible Drizzle columns from the bound table, defaults to `50` results, and
accepts at most `500`. Keeping the modes disjoint prevents a selected-value
lookup from quietly becoming a broader search.

## Scalar and grouped counts

`count()` returns one number. `countBy()` returns typed group values without
loading complete rows:

```ts
interface CountRowsInput {
  where?: SQL;
}

interface CountRowsByInput<
  TTable extends AnySQLiteTable,
> extends CountRowsInput {
  column: TableColumn<TTable>;
  order?: "asc" | "desc";
  limit?: number;
}

interface GroupCount {
  value: string | number | boolean | null;
  count: number;
}
```

Both methods add `where` to the request's row predicate. `countBy()` requires a
column belonging to the bound table. It defaults to descending count order and
`50` groups, accepts limits from `1` through `1000`, and orders equal counts by
the group value ascending. `null` remains an ordinary group value.

These server inputs are transport-free. App-owned code supplies Drizzle
expressions and a table column; the generated HTTP and CLI adapters translate
canonical filter parameters and a column name into the same operations.

## Related documentation

- [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
- [Generated query resolvers](/docs/reference/server/row-scoped-data/generated-query-resolvers/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Table endpoints](/docs/reference/http/table-endpoints/)
