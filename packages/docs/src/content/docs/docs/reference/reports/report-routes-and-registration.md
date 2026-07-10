---
title: "Report routes and registration"
description: "Look up report contracts, handlers, date filters, and mounted route behavior."
---

## Identity

Project shared contracts, `TsRestApi`, and report types from Sapporta shared/frontend packages.

## Contract

- Report routes are ordinary app-owned ts-rest routes mounted under `/api`.
- GET query contracts support compact URL-backed filters; POST bodies support larger nested input.
- Date ranges use Temporal-compatible shared helpers.
- Handlers resolve auth and input, call a scoped read, map a dataset, and return a declared response.
- OpenAPI includes a report only after route registration and mounting.


## Related documentation

- [Route-based reports](/docs/guides/reports/route-based-reports/)
