---
title: "Sapporta CLI"
description:
  "Operate the project-local CLI against a running app for discovery, table
  inspection, row changes, and SQL fallback."
---

Prefer the project-local CLI:

```bash
pnpm exec sapporta ...
```

Most commands call the selected running API server. By default, that is:

```text
http://localhost:3000
```

Set a target and token for protected apps:

```bash
export SAPPORTA_API_URL="https://app.example.com"
export SAPPORTA_API_TOKEN="spat_..."
```

Core discovery loop:

```bash
pnpm exec sapporta endpoints list
pnpm exec sapporta endpoints show "GET /api/tables/customers"
pnpm exec sapporta tables list
pnpm exec sapporta tables show customers
pnpm exec sapporta tables sample customers --limit 10 --columns id,name,email
```

Ordinary row changes:

```bash
pnpm exec sapporta rows create customers --values '{"name":"Acme Co"}'
pnpm exec sapporta rows update customers 7 --values '{"name":"Acme Ltd"}'
pnpm exec sapporta rows delete customers 7
```

Use `endpoints show` to inspect custom routes, and use `api get/post/put/delete`
or a typed client to call app-owned endpoints. Exact options and command
inventory live in [CLI Reference](/docs/reference/cli/).
