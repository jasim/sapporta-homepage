---
title: "Scoped lookups and counts"
description:
  "Use row-scoped lookup modes, scalar counts, and grouped counts without
  loading complete records."
---

`scopedRows()` exposes specialized reads whose inputs contain Drizzle values,
not HTTP query grammar:

`@sapporta/server` exports `TableColumn`, `LookupRowsInput`,
`LookupRowsByIdInput`, `LookupRowsBySearchInput`, `LookupTreeInput`,
`CountRowsInput`, `CountRowsByInput`, `GroupCount`, and `TreeTooLargeError`.

```ts
interface ScopedRows<TTable extends AnySQLiteTable> {
  lookup(input?: LookupRowsInput<TTable>): Promise<LookupEntry[]>;
  lookupTree(input?: LookupTreeInput): Promise<LookupTreeEntry[]>;
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

Search mode also accepts `where`, a Drizzle `SQL` expression that narrows the
choices, such as accounts of one type. It is combined with the search and the
request's row predicate using AND:

```ts
await rows.lookup({
  search: "fu",
  where: eq(accountsTable.account_type, "expense"),
});
```

ID mode accepts between `1` and `500` string `RowId` values and does not accept
`search`, `fields`, `limit`, or `where`, so a selected value keeps its label
after it stops matching a narrowing. Numeric primary-key IDs are validated and
converted before SQL; text primary-key IDs remain strings. Search mode accepts
visible Drizzle columns from the bound table, defaults to `50` results, and
accepts at most `500`. Keeping the modes disjoint prevents a selected-value
lookup from quietly becoming a broader search.

## Read a tree table's choices as a tree

On a table that declares `meta.tree`, `lookupTree()` returns the choices of a
tree picker: every row that passes `where`, with the ancestors that place it, in
display order.

```ts
await rows.lookupTree({
  where: eq(accountsTable.account_type, "Expense"),
  notUnder: "12",
});
```

Each `LookupTreeEntry` is a lookup entry with `depth`, `0` for a top-level row,
and `role`:

- `"choice"`: the row passes `where` and is not under `notUnder`.
- `"context"`: an ancestor of a choice that does not pass `where` itself.
- `"editing"`: the `notUnder` row, returned where it sits. The rows below it are
  not returned.

No branch without a choice is returned. The walk is `treeMatch()` with
`matchContext: "ancestors"`, so it reads only rows the request may see. The
entries are depth-first: top-level rows in `meta.tree.rootOrder`, siblings in the
table's `defaultSort`, then by primary key. A row whose parent is not returned is
placed at the top level, and a loop of parents is placed once, from its first
row.

`lookupTree()` returns every row it selects, up to `MAX_LOOKUP_TREE_ROWS`
(`5000`). It throws `TreeTooLargeError` for a larger tree rather than cut it
short; the generated route answers `400` with code `TREE_TOO_LARGE`. It throws a
`TypeError` on a table without `meta.tree`.

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

These server inputs are transport-free. Application code supplies Drizzle
expressions and a table column; the generated HTTP and CLI adapters translate
canonical filter parameters and a column name into the same operations.

## Related documentation

- [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
- [Generated query resolvers](/docs/reference/server/row-scoped-data/generated-query-resolvers/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Table endpoints](/docs/reference/http/table-endpoints/)
