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
- `errorBodySchema` is the browser-safe generic HTTP error envelope. Export a
  separate strict feature schema when exact codes drive typed client recovery.
- Project contracts, schemas, and wire types are re-exported through `.js` ESM
  barrels under `packages/shared/src/contracts/index.ts`, then from
  `packages/shared/src/index.ts`.
- Table metadata wire types and auth/report contracts remain safe for browser
  imports.
- Generated count contracts export `countQuerySchema`, `groupCountSchema`,
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

- The shared package contains no Hono handlers, Drizzle queries, database
  connections, React components, or other I/O.

Feature contracts declare feature-owned responses. Shared infrastructure
authentication responses such as `401` and `403` are documented once at their
auth boundary rather than copied into every feature response map.

## Related documentation

- [Shared contracts and request validation](/docs/guides/app-owned-features/shared-contracts-and-request-validation/)
- [Count visible rows](/docs/guides/generated-surfaces/count-visible-rows/)
- [Auth and row security](/docs/reference/server/auth-and-row-security/)
