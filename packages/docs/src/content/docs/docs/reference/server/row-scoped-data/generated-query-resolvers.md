---
title: "Generated query resolvers"
description:
  "Translate parsed generated-table HTTP queries into scoped row-helper inputs."
---

Custom table adapters can reuse the same table-dependent boundary as generated
routes. The server package exports:

```ts
resolvePageQuery(query, table, { auth, searchPlan });
resolveExportQuery(query, table, { auth, searchPlan });
resolveLookupQuery(query, table);
resolveCountQuery(query, table);
```

These functions accept the matching parsed shared-contract query and validate
table-dependent column, filter, lookup, search, and ordering semantics. The
export and lookup resolvers return the direct Drizzle-shaped input for the
matching `scopedRows()` operation.

A list read resolves to one of two plans. `resolvePageQuery()` returns a
`ResolvedPageQuery`:

```ts
const resolved = resolvePageQuery(query, table, { auth, searchPlan });
if (resolved.kind === "rows") return rows.page(resolved.input);

const match = await rows.treeMatch(resolved.treeMatch);
const result = await rows.page({ ...resolved.page, where: match.where });
return {
  data: result.data,
  meta: {
    ...result.meta,
    tree: { matchCount: match.matchCount, contextIds: match.contextIds },
  },
};
```

- `{ kind: "rows", input }` is a `page()` input whose `where` combines the
  `fixed[...]` conditions, the `filter[...]` conditions, and `q`.
- `{ kind: "treeMatch", treeMatch, page }` is returned for a `tree` read with a
  filter or search on a table that declares `meta.tree`. `treeMatch` holds the
  `fixed` and `match` predicates and the `matchContext`. `page` holds the
  ordering and paging without a `where`. Pass `treeMatch` to
  `scopedRows().treeMatch()`, then page over the `where` it returns.
  `meta.total` then counts the matches together with their ancestors and
  descendants. The generated list route reports `matchCount` and `contextIds` as
  `meta.tree`, as the example does.

Count needs one more choice:

```ts
const resolved = resolveCountQuery(query, table);
const data =
  resolved.kind === "total"
    ? await rows.count(resolved.input)
    : await rows.countBy(resolved.input);
```

That `ResolvedCountQuery` discriminator selects `count()` or `countBy()` without
putting HTTP grammar into either data method. These resolvers are the right
bridge when an adapter owns that grammar. Ordinary domain code should construct
its Drizzle predicate directly instead of manufacturing `filter[...]`,
`fixed[...]`, `q`, or numeric query strings.

The corresponding public types include `ResolvedPageQuery`,
`ResolvedCountQuery`, and `ResolveRowsQueryOptions`.

## Related documentation

- [Scoped CRUD and bounded reads](/docs/reference/server/row-scoped-data/scoped-crud-and-bounded-reads/)
- [Scoped lookups and counts](/docs/reference/server/row-scoped-data/lookups-and-counts/)
- [Contract helpers and wire types](/docs/reference/contracts/contract-helpers-and-wire-types/)
- [Query syntax](/docs/reference/http/query-syntax/)
