---
title: "Serialization and API errors"
description: "Look up Temporal wire values, common HTTP error bodies, and typed-client failures."
---

## Identity

Temporal helpers from `@sapporta/shared/temporal`, error schema from `@sapporta/shared/contracts`, and `ApiError` from `@sapporta/shared/client`.

## Contract

- Calendar dates use ISO `YYYY-MM-DD` strings and parse as `Temporal.PlainDate` at typed boundaries.
- Timestamps use canonical ISO instants and parse as `Temporal.Instant` where the schema declares them.
- HTTP errors carry a stable structured body declared by the contract.
- `ApiError` represents an HTTP response; network failures remain transport failures rather than fabricated HTTP statuses.
- Validation failures and domain failures remain separate declared response branches.
- Expected service/store failures use one typed error family and one route-edge
  mapping to a declared status and stable body.
- A calling frontend handles the declared `ApiError`; unexpected failures remain
  on the central error path.


## Related documentation

- [Errors, uploads, and endpoint patterns](/docs/guides/app-owned-features/errors-uploads-and-endpoint-patterns/)
