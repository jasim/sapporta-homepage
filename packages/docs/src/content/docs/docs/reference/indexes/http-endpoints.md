---
title: "HTTP endpoints"
description:
  "Find canonical owners for generated, auth, report, and application routes."
---

## Identity

Method/path index derived from the running protected application's OpenAPI
document.

## Contract

- `GET /api/openapi.json` is owned by OpenAPI Reference.
- `/api/tables/<table>` list/get/create/update/delete/lookup/count/export routes
  are owned by Table endpoints.
- Metadata and optional SQL families are owned by Metadata and SQL endpoints.
- Auth context, workspace, and token families are owned by Authentication and
  token endpoints.
- Task completion and project progress are project examples owned by the
  [domain workflow](/docs/guides/application-code/domain-workflows-and-transactions/)
  and [route-based report](/docs/guides/reports/route-based-reports/) guides.

## Related documentation

- [OpenAPI](/docs/reference/http/openapi/)
