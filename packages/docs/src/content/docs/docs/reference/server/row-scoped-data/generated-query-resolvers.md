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
page, export, and lookup resolvers return the direct Drizzle-shaped input for
the matching `scopedRows()` operation. Count needs one more choice:

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
its Drizzle predicate directly instead of manufacturing `filter[...]`, `q`, or
numeric query strings.

The corresponding public types include `ResolvedCountQuery` and
`ResolveRowsQueryOptions`.

## Related documentation

- [Scoped CRUD and bounded reads](/docs/reference/server/row-scoped-data/scoped-crud-and-bounded-reads/)
- [Scoped lookups and counts](/docs/reference/server/row-scoped-data/lookups-and-counts/)
- [Contract helpers and wire types](/docs/reference/contracts/contract-helpers-and-wire-types/)
- [Query syntax](/docs/reference/http/query-syntax/)
