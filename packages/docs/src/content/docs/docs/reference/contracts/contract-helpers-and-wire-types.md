---
title: "Contract helpers and wire types"
description:
  "Look up browser-safe contracts, common schemas, and shared wire types."
---

## Identity

`@sapporta/shared/contracts`, `@sapporta/rest-core`, and project shared package
exports.

## Contract

- In a browser-safe project shared package, import `initContract` from
  `@sapporta/rest-core`. Server-only modules may use the `@sapporta/server`
  re-export, but that does not justify adding a server dependency to the shared
  leaf.
- `initContract().router(...)` groups query and mutation contracts. Each route
  declares its method, path, path parameters, query, headers, body, response
  schemas, summary, and metadata.
- Contract paths are relative to the application API mount. A project contract
  uses `/tasks/:id/complete`; the parent server mount and browser base resolver
  supply `/api`.
- `z.object({}).strict()` represents an action with a required empty JSON body
  and rejects extra caller fields.
- `errorBodySchema` is the browser-safe generic HTTP error envelope, with
  `ErrorBody` as its type. Export a separate strict feature schema when exact
  codes drive typed client recovery.
- The error envelope and `ApiError` come from the framework packages, at
  `@sapporta/shared/contracts` and `@sapporta/shared/client`. The project's own
  shared package does not re-export them, so a contract that declares a non-2xx
  response imports `errorBodySchema` from `@sapporta/shared/contracts` directly.
- Project contracts, schemas, and wire types are re-exported through `.js` ESM
  barrels under `packages/shared/src/contracts/index.ts`, then from
  `packages/shared/src/index.ts`.
- Table metadata wire types and auth/report contracts remain safe for browser
  imports.
- The shared package contains no Hono handlers, Drizzle queries, database
  connections, React components, or other I/O.

## Generated table query contracts

`@sapporta/shared/contracts` owns the transport grammar before the server
resolves table-specific columns and Drizzle expressions:

- `exportRowsQuerySchema` and `ExportRowsQuery` cover filters, `q`, and sort.
- `listRowsQuerySchema` and `ListRowsQuery` add bounded page and limit values.
- `lookupQuerySchema` and `LookupQuery` keep ID recovery separate from search.
- `countQuerySchema` and `CountQuery` cover filters and optional grouping.

Pagination and lookup numbers are strings at the URL and generated-client input.
The schemas coerce them at the boundary, so parsed `ListRowsQuery` and
`LookupQuery` values carry bounded numbers into server resolvers. Lookup ID mode
similarly turns the comma-separated `ids` string into a non-empty bounded string
array.

The accompanying constants make those defaults and bounds explicit:
`DEFAULT_PAGE`, `DEFAULT_PAGE_SIZE`, `MAX_PAGE`, `MAX_PAGE_SIZE`,
`DEFAULT_LOOKUP_LIMIT`, `MAX_LOOKUP_LIMIT`, and `MAX_LOOKUP_IDS`.

## Preserve repeated query keys

An ordinary `Record<string, string>` cannot represent the same filter key twice.
The main `@sapporta/shared` entry point therefore exports:

```ts
type QueryParamValue = string | readonly string[];
type QueryParamRecord = Record<string, QueryParamValue>;
```

`appendQueryParam()` keeps a singleton as a string and promotes it to an ordered
array only when a second value arrives. `queryParamRecordToSearchParams()`
converts that record back to repeated URL keys. Together they carry repeated
same-key filters through frontend builders, typed clients, and server adapters
without collapsing one predicate.

`isQueryParamRecord()` checks that an unknown object contains only string or
string-array values. `hasRepeatedQueryParams()` then reports whether a validated
record contains at least one repeated key.

## Count result contracts

Generated count contracts export `countQuerySchema`, `groupCountSchema`,
`countResultSchema`, and `countResponseSchema` with their `CountQuery`,
`GroupCount`, `CountResult`, and `CountResponse` types. `CountResult` is a
discriminated union:

```ts
type CountResult =
  | { kind: "total"; count: number }
  | {
      kind: "grouped";
      groups: Array<{
        value: string | number | boolean | null;
        count: number;
      }>;
    };
```

The group bound comes from `MAX_COUNT_GROUPS` in the main `@sapporta/shared`
entry point.

Feature contracts declare feature-owned responses. Shared infrastructure
authentication responses such as `401` and `403` are documented once at their
auth boundary rather than copied into every feature response map.

## Related documentation

- [Shared contracts and request validation](/docs/guides/app-owned-features/shared-contracts-and-request-validation/)
- [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
- [Query syntax](/docs/reference/http/query-syntax/)
- [Typed client creation](/docs/reference/contracts/typed-client-creation/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
