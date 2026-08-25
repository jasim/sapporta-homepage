---
title: "Table query cache keys and ownership"
description:
  "Choose generated-table invalidation scopes and keep TanStack Query, TGrid,
  authorization, and form state boundaries distinct."
---

## Cache-key hierarchy

```ts
tableQueryKeys.all;
tableQueryKeys.table(tableName);
tableQueryKeys.records(tableName);
tableQueryKeys.record(tableName, recordId);
tableQueryKeys.pages(tableName);
tableQueryKeys.page(fetchParams);
```

The hierarchy is:

```text
["sapporta", "tables"]
  -> table name
     -> "records" -> record id
     -> "pages"   -> serialized request
```

TanStack Query prefix matching makes the intended invalidation scope explicit:

```ts
await queryClient.invalidateQueries({
  queryKey: tableQueryKeys.table("tasks"),
});

await queryClient.invalidateQueries({
  queryKey: tableQueryKeys.pages("tasks"),
});
```

Invalidate the table prefix when a mutation may affect records and paginated
lists. Invalidate `pages(tableName)` when only list membership, ordering, or
aggregated page state is stale. Invalidate or update one `record()` entry only
when the mutation's effect is confined to that record.

Record and page entries are separate, non-normalized cache values. Updating a
`record()` entry does not rewrite a copy of that row already present in page
data.

TGrid sessions do not read TanStack Query's cache. `reloadTGridRows(tableName)`
sends a fire-and-forget reload command to the mounted, registered TGrid session
for that root table; it is a no-op when no such session exists. Invalidate the
relevant TanStack Query prefix separately when the same mutation affects
application cached screens. These are different server-state consumers.

## Query ownership invariants

- A generated project has one `QueryClient`. Feature modules compose query
  options; they do not mount nested providers or create parallel clients.
- Query keys describe generated table reads. Application endpoint results use an
  application key namespace.
- The server remains the authorization boundary. Query keys, decoders, fixed
  filters, and hidden columns do not enforce row access.
- A decoder validates the browser wire value. It does not replace server
  validation or authorize fields for mutation.
- Form draft state belongs to TanStack Form. Server records and lists belong to
  TanStack Query. Copying query results into form state after initialization can
  overwrite dirty input.

## Related documentation

- [Read functions and query options](/docs/reference/frontend/table-queries/read-functions-and-options/)
- [Generated record surfaces and form helpers](/docs/reference/frontend/generated-record-surfaces/)
- [TGrid](/docs/reference/frontend/tgrid/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
