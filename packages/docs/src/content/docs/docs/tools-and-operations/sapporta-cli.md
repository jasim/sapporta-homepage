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
pnpm exec sapporta describe
pnpm exec sapporta describe "GET /api/tables/customers"
pnpm exec sapporta tables
pnpm exec sapporta tables show customers
pnpm exec sapporta tables sample customers --limit 10 --fields id,name,email
```

Ordinary row changes:

```bash
pnpm exec sapporta rows insert customers --data '{"name":"Acme Co"}'
pnpm exec sapporta rows update customers 7 --data '{"name":"Acme Ltd"}'
pnpm exec sapporta rows delete customers 7
```

Use the CLI to inspect custom routes with `describe`, but call arbitrary
app-owned endpoints with `curl`, a typed client, or another HTTP client. Exact
options and command inventory live in [CLI Reference](/docs/reference/cli/).
