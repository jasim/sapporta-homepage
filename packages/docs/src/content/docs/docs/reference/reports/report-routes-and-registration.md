---
title: "Report routes and registration"
description:
  "Look up report contracts, protected handlers, parent API paths, and
  registration behavior."
---

## Public surfaces

- Browser-safe contracts: `initContract` from `@sapporta/rest-core`.
- Dataset response: `gridDatasetSchema` from `@sapporta/shared/grid-dataset`.
- Server adapter: `TsRestApi` from `@sapporta/server`.

Keep contracts and wire types in the shared package. Keep Hono context, auth,
database reads, and route registration in the API package.

## GET contract

```ts
const c = initContract();

export const projectProgressQuerySchema = z.object({
  project_id: z.coerce.number().int().positive().optional(),
});

export const projectProgressContract = c.router({
  projectProgress: c.query({
    method: "GET",
    path: "/reports/project-progress",
    summary: "Project progress",
    metadata: { tags: ["reports"] },
    query: projectProgressQuerySchema,
    responses: {
      200: gridDatasetSchema,
      400: errorBodySchema,
    },
  }),
});
```

- Use GET queries for compact URL-backed filters and POST bodies for larger
  nested report input.
- The contract path is bare. The parent API mount adds `/api`, producing
  `/api/reports/project-progress`.
- Declare feature-owned error responses in the feature contract. Shared
  authentication and ability failures use the application's common auth
  envelope.
- Date strings use the shared Temporal boundary. If `as_of` is a public filter,
  validate it in the shared contract and preserve it in URL state.

## Protected handler

The handler selects an application ability such as `read/project-progress`,
resolves the required data authority, scopes every base read, captures one
`Temporal.PlainDate`, and calls a pure mapper.

`read/project-progress` is an application convention, not a framework-required
report subject. Row predicates do not replace the ability check.

## Runtime and OpenAPI composition

For a child `TsRestApi` that has already registered its operations:

```ts
app.route("/", projectProgressApi);
app.extend(projectProgressApi);
```

- `route()` mounts the child's Hono handlers.
- `extend()` copies the documentation emitters present on the child at that
  call.
- Register child operations before `extend()`.
- Perform both calls before the application generates or mounts the combined
  OpenAPI document.

A route can therefore work at runtime but be absent from OpenAPI, or appear in
OpenAPI while its handler is not mounted. Verify discovery and invocation
separately.

## Related documentation

- [Route-based reports](/docs/guides/reports/route-based-reports/)
- [Shared contracts and request validation](/docs/guides/app-owned-features/shared-contracts-and-request-validation/)
- [Serialization and API errors](/docs/reference/contracts/serialization-and-api-errors/)
- [TsRestApi and route registration](/docs/reference/server/ts-rest-api-and-route-registration/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
