---
title: "Table read functions and query options"
description:
  "Use generated table fetch functions, lossless query serializers, TanStack
  Query option builders, decoders, and cancellation."
---

## Identity

Table query builders are exported from `@sapporta/frontend/table/query` and from
the main `@sapporta/frontend` entry point. They compose the generated table HTTP
client with TanStack Query.

New Sapporta projects install `@tanstack/react-query`. The workspace-owned
`packages/frontend/src/query-client.ts` exports one application `QueryClient`,
and the framework entry point mounts it with `QueryClientProvider`. A feature
should reuse that provider and the public table query builders.

## Read functions

```ts
import { fetchTableRow, fetchTableRows } from "@sapporta/frontend";

await fetchTableRow(tableName, recordId, { signal });
await fetchTableRows(
  { tableName, page, limit, sort, filters, search },
  { signal },
);
```

`fetchTableRow()` returns `SingleRow`. `fetchTableRows()` returns
`PaginatedRows`. Both functions call the generated, auth-aware table routes.
Their optional `AbortSignal` reaches the underlying `fetch` request.

## Selection and page serializers

`buildTableSelectionQuery()` serializes the filter, sort, and search state
shared by paged reads and CSV exports. `buildTableRowsQuery()` starts with that
selection and adds page and limit:

```ts
import {
  buildTableRowsQuery,
  buildTableSelectionQuery,
} from "@sapporta/frontend";

const selection = buildTableSelectionQuery({
  filters,
  sort,
  search,
});

const pageQuery = buildTableRowsQuery({
  filters,
  sort,
  search,
  page: 2,
  limit: 25,
});
```

Both functions return `QueryParamRecord` from `@sapporta/shared`. Ordinary keys
remain strings, including the wire forms of numeric page and limit values. When
two typed conditions encode to the same filter key, that key becomes an ordered
string array. The typed client turns the array back into repeated URL keys, so a
pair such as `title contains launch` and `title contains checklist` reaches the
server as two AND predicates rather than one last-value-wins object property.

Page query keys use this same lossless serialized request shape. UI-only filter
IDs do not create distinct cache entries for the same HTTP query, while repeated
conditions remain distinct in the key.

`fetchTableRow()` and `fetchTableRows()` remain supported low-level primitives.
Use them when a non-React caller owns the request lifecycle directly. A React
feature screen normally composes the option builders below with `useQuery()` so
it shares cache keys, cancellation, and server state with the rest of the
application.

## Query option builders

```tsx
import { useQuery } from "@tanstack/react-query";
import {
  tableRecordQueryOptions,
  tableRecordsPageQueryOptions,
} from "@sapporta/frontend/table/query";

const record = useQuery(
  tableRecordQueryOptions({
    tableName: "tasks",
    recordId: String(taskId),
    decodeRow: decodeTask,
  }),
);

const page = useQuery(
  tableRecordsPageQueryOptions({
    tableName: "tasks",
    page: 1,
    limit: 50,
    filters,
    sort,
    search,
    decodeRow: decodeTask,
  }),
);
```

`tableRecordQueryOptions()` returns query options for one generated table
record. `tableRecordsPageQueryOptions()` returns options for one serialized
table query and preserves the response pagination metadata.

Without `decodeRow`, both builders return generic `Row` values. Supplying
`decodeRow(row)` changes the inferred query data to the application row type.
Each page row is decoded independently. Decoder failures reject the query.
Sapporta does not infer an application domain type from a generic table
response; the application declares it as a
[row projection](/docs/guides/app-owned-features/cached-table-reads-and-refresh/).
The page decoder uses ordinary array mapping, so one thrown decoder error fails
the whole query rather than publishing a shorter page. Partial results require a
separate wire contract and visible diagnostics.

Both query functions consume TanStack Query's request signal. When TanStack
Query aborts that signal, the generated table request receives the abort.

## Exported types

- `TableRecordQueryArgs` contains `tableName` and string `recordId`.
- `DecodedTableRecordQueryArgs<TRow>` adds `decodeRow`.
- `DecodedTableRecordsPageQueryArgs<TRow>` adds `decodeRow` to
  `FetchTableRowsParams`.
- `TableRowDecoder<TRow>` is `(row: Row) => TRow`.
- `TableRecordsPage<TRow>` preserves `PaginatedRows.meta` and replaces `data`
  with `TRow[]`.
- `TableRecordQueryKey` and `TableRecordsPageQueryKey` are the inferred key
  tuple types returned by the matching `tableQueryKeys` functions.
- `TableFetchOptions` is the public `{ signal?: AbortSignal }` option accepted
  by `fetchTableRow()` and `fetchTableRows()`.

The decoded overloads require `decodeRow`. Supplying a domain row generic
without a decoder is a type error.

## Related documentation

- [Cache keys and ownership](/docs/reference/frontend/table-queries/cache-keys-and-ownership/)
- [Typed client creation](/docs/reference/contracts/typed-client-creation/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Generated table APIs](/docs/guides/generated-surfaces/generated-table-apis/)
